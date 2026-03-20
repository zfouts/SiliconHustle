import { ASSETS } from '../data/constants.js';
import { state, addLog, autoSave, getGameCities } from './state.js';
import { MAX_PRICE } from './prices.js';
import { AudioEngine } from './audio.js';
import { showModal } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { checkAchievement } from './achievements.js';

const MANIPULATE_COST = 2000;
const MANIPULATE_HEAT = 15;

export function openManipulate(updateUI) {
    if (state.cash < MANIPULATE_COST) {
        showToast(`Need $${MANIPULATE_COST.toLocaleString()} to manipulate the market.`, 'bad');
        AudioEngine.play('event_bad');
        return;
    }

    AudioEngine.play('click');
    const container = document.getElementById('manipulate-list');
    container.innerHTML = '';

    ASSETS.forEach(asset => {
        const price = state.prices[state.currentCity][asset.id];
        const div = document.createElement('div');
        div.className = 'manipulate-row';
        div.style.cssText = 'display:flex;gap:0.5rem;align-items:center;margin-bottom:0.4rem;padding:0.3rem;border-bottom:1px solid var(--border);';

        const label = document.createElement('span');
        label.style.cssText = 'flex:1;font-size:0.7rem;';
        label.textContent = `${asset.icon} ${asset.name} ($${price.toLocaleString()})`;
        div.appendChild(label);

        const pumpBtn = document.createElement('button');
        pumpBtn.className = 'btn btn-buy';
        pumpBtn.style.fontSize = '0.6rem';
        pumpBtn.textContent = 'PUMP';
        pumpBtn.addEventListener('click', () => executeManipulation(asset, 'pump', updateUI));
        div.appendChild(pumpBtn);

        const crashBtn = document.createElement('button');
        crashBtn.className = 'btn btn-sell';
        crashBtn.style.fontSize = '0.6rem';
        crashBtn.textContent = 'CRASH';
        crashBtn.addEventListener('click', () => executeManipulation(asset, 'crash', updateUI));
        div.appendChild(crashBtn);

        container.appendChild(div);
    });

    showModal('manipulate-modal');
}

function executeManipulation(asset, action, updateUI) {
    if (state.cash < MANIPULATE_COST) return;

    state.cash -= MANIPULATE_COST;
    state.heat = Math.min(100, state.heat + MANIPULATE_HEAT);

    const ci = state.currentCity;
    const oldPrice = state.prices[ci][asset.id];

    if (action === 'pump') {
        const mult = 1.25 + Math.random() * 0.15; // 25-40% pump
        state.prices[ci][asset.id] = Math.min(MAX_PRICE, Math.round(oldPrice * mult));
        const pct = Math.round((mult - 1) * 100);
        AudioEngine.play('event_good');
        showToast(`Pumped ${asset.name} +${pct}% in this city!`, 'good');
        addLog(`Market manipulation: ${asset.name} pumped +${pct}% locally. -$${MANIPULATE_COST.toLocaleString()}, +${MANIPULATE_HEAT} heat.`, 'event-warning');
    } else {
        const mult = 0.6 + Math.random() * 0.15; // 25-40% crash
        state.prices[ci][asset.id] = Math.max(1, Math.round(oldPrice * mult));
        const pct = Math.round((1 - mult) * 100);
        AudioEngine.play('event_bad');
        showToast(`Crashed ${asset.name} -${pct}% in this city!`, 'bad');
        addLog(`Market manipulation: ${asset.name} crashed -${pct}% locally. -$${MANIPULATE_COST.toLocaleString()}, +${MANIPULATE_HEAT} heat.`, 'event-warning');
    }

    if (!state.manipulationsCount) state.manipulationsCount = 0;
    state.manipulationsCount++;
    if (state.manipulationsCount >= 5) checkAchievement('market_manipulator');

    import('../ui/screens.js').then(m => m.closeModals());
    updateUI();
    autoSave();
}
