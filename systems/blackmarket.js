import { ASSETS } from '../data/constants.js';
import { state, addLog, freeStorage, autoSave } from './state.js';
import { AudioEngine } from './audio.js';
import { showModal, closeModals } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { checkAchievement } from './achievements.js';

let currentDeals = [];

export function triggerBlackMarket() {
    const numDeals = 1 + Math.floor(Math.random() * 3);
    currentDeals = [];

    const shuffled = [...ASSETS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numDeals && i < shuffled.length; i++) {
        const asset = shuffled[i];
        const cityPrices = state.prices[state.currentCity];
        if (!cityPrices) continue;
        const marketPrice = cityPrices[asset.id];
        if (!marketPrice || marketPrice <= 0) continue;
        const discount = 0.3 + Math.random() * 0.4;
        const bmPrice = Math.max(Math.round(marketPrice * (1 - discount)), 1);
        const qty = 1 + Math.floor(Math.random() * 5);

        currentDeals.push({ asset, qty, bmPrice, marketPrice, discount });
    }

    renderDeals();
    showModal('blackmarket-modal');
    addLog('A black market dealer appeared with exclusive offers...', 'event-warning');
}

function renderDeals() {
    const container = document.getElementById('blackmarket-deals');
    container.innerHTML = '';

    currentDeals.forEach((deal, i) => {
        const totalCost = deal.bmPrice * deal.qty;
        const canAfford = state.cash >= totalCost && deal.qty <= freeStorage();

        const dealDiv = document.createElement('div');
        dealDiv.className = 'bm-deal';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'bm-deal-info';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'bm-deal-name';
        nameDiv.textContent = `${deal.asset.icon} ${deal.qty}x ${deal.asset.name}`;
        infoDiv.appendChild(nameDiv);

        const pricesDiv = document.createElement('div');
        pricesDiv.className = 'bm-deal-prices';
        const origSpan = document.createElement('span');
        origSpan.className = 'bm-original';
        origSpan.textContent = `$${deal.marketPrice.toLocaleString()}/ea`;
        pricesDiv.appendChild(origSpan);
        const discSpan = document.createElement('span');
        discSpan.className = 'bm-discount';
        discSpan.textContent = ` $${deal.bmPrice.toLocaleString()}/ea (${Math.round(deal.discount * 100)}% off!)`;
        pricesDiv.appendChild(discSpan);
        infoDiv.appendChild(pricesDiv);

        const totalDiv = document.createElement('div');
        totalDiv.className = 'bm-deal-prices';
        totalDiv.textContent = `Total: $${totalCost.toLocaleString()}`;
        infoDiv.appendChild(totalDiv);

        dealDiv.appendChild(infoDiv);

        const btn = document.createElement('button');
        btn.className = 'btn btn-buy';
        btn.textContent = 'BUY';
        if (!canAfford) btn.disabled = true;
        btn.addEventListener('click', () => acceptDeal(i));
        dealDiv.appendChild(btn);

        container.appendChild(dealDiv);
    });
}

function acceptDeal(index) {
    const deal = currentDeals[index];
    if (!deal) return;

    const totalCost = deal.bmPrice * deal.qty;
    if (state.cash < totalCost || deal.qty > freeStorage()) return;

    const oldQty = state.inventory[deal.asset.id];
    const oldCost = state.costBasis[deal.asset.id];
    const newQty = oldQty + deal.qty;
    const newCostBasis = newQty > 0 ? Math.round((oldCost * oldQty + deal.bmPrice * deal.qty) / newQty) : deal.bmPrice;

    state.cash -= totalCost;
    state.costBasis[deal.asset.id] = newCostBasis;
    state.inventory[deal.asset.id] = newQty;
    if (state.holdingSince[deal.asset.id] === 0) state.holdingSince[deal.asset.id] = state.day;

    if (deal.asset.category === 'contraband') {
        state.heat = Math.min(100, state.heat + deal.qty * 5);
    }

    AudioEngine.play('buy');
    showToast(`Black market: ${deal.qty}x ${deal.asset.name} for $${totalCost.toLocaleString()}!`, 'good');
    addLog(`Bought ${deal.qty}x ${deal.asset.name} from black market @ $${deal.bmPrice.toLocaleString()}/ea`, 'event-good');

    checkAchievement('black_market');

    currentDeals.splice(index, 1);
    if (currentDeals.length === 0) {
        closeModals();
    } else {
        renderDeals();
    }
    autoSave();
}
