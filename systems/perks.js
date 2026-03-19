import { PERKS } from '../data/constants.js';
import { state, autoSave } from './state.js';
import { AudioEngine } from './audio.js';
import { showModal } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { checkAchievement } from './achievements.js';

export function hasPerk(id) {
    return state.perks.includes(id);
}

export function openPerks() {
    AudioEngine.play('click');
    renderPerks();
    showModal('perks-modal');
}

export function renderPerks() {
    const list = document.getElementById('perks-list');
    list.innerHTML = '';

    PERKS.forEach(p => {
        const owned = hasPerk(p.id);
        const canAfford = state.cash >= p.cost;

        const div = document.createElement('div');
        div.className = `perk-item ${owned ? 'owned' : ''}`;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'perk-icon';
        iconSpan.textContent = p.icon;
        div.appendChild(iconSpan);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'perk-info';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'perk-name';
        nameDiv.textContent = p.name;
        infoDiv.appendChild(nameDiv);
        const descDiv = document.createElement('div');
        descDiv.className = 'perk-desc';
        descDiv.textContent = p.desc;
        infoDiv.appendChild(descDiv);
        div.appendChild(infoDiv);

        if (owned) {
            const ownedLabel = document.createElement('span');
            ownedLabel.className = 'perk-owned-label';
            ownedLabel.textContent = 'OWNED';
            div.appendChild(ownedLabel);
        } else {
            const btn = document.createElement('button');
            btn.className = 'btn btn-small btn-buy';
            if (!canAfford) btn.disabled = true;
            const costSpan = document.createElement('span');
            costSpan.className = 'perk-cost';
            costSpan.textContent = `$${p.cost.toLocaleString()}`;
            btn.appendChild(costSpan);
            btn.addEventListener('click', () => buyPerk(p.id));
            div.appendChild(btn);
        }

        list.appendChild(div);
    });
}

export function buyPerk(id) {
    const perk = PERKS.find(p => p.id === id);
    if (!perk || hasPerk(id) || state.cash < perk.cost) return;

    state.cash -= perk.cost;
    state.perks.push(id);

    if (id === 'extra_storage') state.maxStorage += 75;
    if (id === 'tax_lawyer') state.interestRate *= 0.5;

    AudioEngine.play('buy');
    showToast(`Perk unlocked: ${perk.name}!`, 'good');

    if (state.perks.length >= 3) checkAchievement('perked_up');
    if (id === 'ai_trader') checkAchievement('ai_ascension');

    renderPerks();
    autoSave();
}
