import { ASSETS, CONTRABAND_HEAT } from '../data/constants.js';
import { state, usedStorage, freeStorage, addLog, autoSave } from './state.js';
import { applySupplyDemand } from './prices.js';
import { AudioEngine } from './audio.js';
import { showModal, closeModals } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { checkAchievement } from './achievements.js';
import { hasPerk } from './perks.js';

export let currentTrade = { type: null, assetId: null };

export function openBuy(assetId) {
    AudioEngine.play('click');
    currentTrade = { type: 'buy', assetId };
    const asset = ASSETS.find(a => a.id === assetId);
    let price = state.prices[state.currentCity][assetId];
    if (hasPerk('bulk_buyer')) price = Math.round(price * 0.95);
    const maxBuy = Math.min(Math.floor(state.cash / price), freeStorage());

    document.getElementById('trade-title').textContent = 'BUY';
    document.getElementById('trade-title').style.color = 'var(--green)';
    document.getElementById('trade-asset').textContent = `${asset.icon} ${asset.name}`;
    document.getElementById('trade-price').textContent = price.toLocaleString() + (hasPerk('bulk_buyer') ? ' (5% off)' : '');
    document.getElementById('trade-owned').textContent = state.inventory[assetId];
    document.getElementById('trade-cash').textContent = state.cash.toLocaleString();
    document.getElementById('trade-storage').textContent = `${usedStorage()}/${state.maxStorage}`;
    document.getElementById('trade-avgcost').textContent = state.costBasis[assetId] > 0 ? state.costBasis[assetId].toLocaleString() : '--';
    document.getElementById('trade-amount').value = maxBuy > 0 ? 1 : 0;
    document.getElementById('trade-amount').max = maxBuy;
    document.getElementById('trade-confirm').className = 'btn btn-buy btn-full';
    document.getElementById('trade-confirm').textContent = 'BUY';
    updateTradeTotal();
    showModal('trade-modal');
}

export function openSell(assetId) {
    const owned = state.inventory[assetId];
    if (owned <= 0) return;
    AudioEngine.play('click');
    currentTrade = { type: 'sell', assetId };
    const asset = ASSETS.find(a => a.id === assetId);
    const price = state.prices[state.currentCity][assetId];

    document.getElementById('trade-title').textContent = 'SELL';
    document.getElementById('trade-title').style.color = 'var(--red)';
    document.getElementById('trade-asset').textContent = `${asset.icon} ${asset.name}`;
    document.getElementById('trade-price').textContent = price.toLocaleString();
    document.getElementById('trade-owned').textContent = owned;
    document.getElementById('trade-cash').textContent = state.cash.toLocaleString();
    document.getElementById('trade-storage').textContent = `${usedStorage()}/${state.maxStorage}`;
    document.getElementById('trade-avgcost').textContent = state.costBasis[assetId] > 0 ? state.costBasis[assetId].toLocaleString() : '--';
    document.getElementById('trade-amount').value = 1;
    document.getElementById('trade-amount').max = owned;
    document.getElementById('trade-confirm').className = 'btn btn-sell btn-full';
    document.getElementById('trade-confirm').textContent = 'SELL';
    updateTradeTotal();
    showModal('trade-modal');
}

export function getEffectivePrice(assetId, isBuy) {
    const cityPrices = state.prices[state.currentCity];
    if (!cityPrices) return 0;
    let price = cityPrices[assetId] || 0;
    if (isBuy) {
        if (hasPerk('bulk_buyer')) price = Math.round(price * 0.95);
        if (state.cityContacts?.[state.currentCity] > 0) price = Math.round(price * 0.90);
    }
    return price;
}

export function updateTradeTotal() {
    const amount = parseInt(document.getElementById('trade-amount').value) || 0;
    if (!currentTrade.assetId) return;
    const price = getEffectivePrice(currentTrade.assetId, currentTrade.type === 'buy');
    document.getElementById('trade-total').textContent = (amount * price).toLocaleString();
}

export function executeTrade(updateUI) {
    const amount = parseInt(document.getElementById('trade-amount').value) || 0;
    if (amount <= 0) return;
    const asset = ASSETS.find(a => a.id === currentTrade.assetId);
    const price = getEffectivePrice(currentTrade.assetId, currentTrade.type === 'buy');

    if (currentTrade.type === 'buy') {
        // Lucky trade chance: 8% to get 15% discount
        let effectivePrice = price;
        const isLucky = Math.random() < 0.08;
        if (isLucky) {
            effectivePrice = Math.max(1, Math.round(price * 0.85));
        }

        const totalCost = amount * effectivePrice;
        if (totalCost > state.cash || amount > freeStorage()) return;

        const oldQty = state.inventory[asset.id];
        state.costBasis[asset.id] = oldQty > 0 ? Math.round((state.costBasis[asset.id] * oldQty + effectivePrice * amount) / (oldQty + amount)) : effectivePrice;
        state.cash -= totalCost;
        state.inventory[asset.id] += amount;
        if (state.holdingSince[asset.id] === 0) state.holdingSince[asset.id] = state.day;

        if (asset.category === 'contraband') {
            const heatPerUnit = CONTRABAND_HEAT[asset.id] || 5;
            state.heat = Math.min(100, state.heat + amount * heatPerUnit);
        }

        applySupplyDemand(asset.id, state.currentCity, amount, true);

        state.totalTradesMade++;
        if (isLucky) {
            state.luckyTrades++;
            AudioEngine.play('event_good');
            showToast(`LUCKY BUY! ${amount}x ${asset.name} @ $${effectivePrice.toLocaleString()} (15% off!)`, 'good');
            addLog(`LUCKY BUY! ${amount}x ${asset.name} @ $${effectivePrice.toLocaleString()} instead of $${price.toLocaleString()}!`, 'event-good');
            if (state.luckyTrades >= 5) checkAchievement('lucky_trader');
        } else {
            AudioEngine.play('buy');
            showToast(`Bought ${amount}x ${asset.name} @ $${effectivePrice.toLocaleString()}`, 'good');
            addLog(`Bought ${amount}x ${asset.name} @ $${effectivePrice.toLocaleString()} (total: $${totalCost.toLocaleString()})`, 'event-good');
        }

        // Achievement checks
        const history = state.priceHistory[state.currentCity]?.[asset.id] || [];
        const avg = history.length > 0 ? history.reduce((s, v) => s + v, 0) / history.length : price;
        if (avg > 0 && ((price - avg) / avg * 100) <= -30) checkAchievement('deal_hunter');
        if (asset.id === 'zero' && state.inventory.zero >= 10) checkAchievement('contraband');
        if (state.totalTradesMade === 1) checkAchievement('first_trade');
    } else {
        if (amount > state.inventory[asset.id]) return;

        // Lucky trade chance: 8% to get 15% premium
        let effectiveSellPrice = price;
        const isLuckySell = Math.random() < 0.08;
        if (isLuckySell) {
            effectiveSellPrice = Math.round(price * 1.15);
        }

        const totalGain = amount * effectiveSellPrice;
        const pnl = (effectiveSellPrice - state.costBasis[asset.id]) * amount;

        state.cash += totalGain;
        state.inventory[asset.id] -= amount;
        if (state.inventory[asset.id] === 0) { state.costBasis[asset.id] = 0; state.holdingSince[asset.id] = 0; }

        applySupplyDemand(asset.id, state.currentCity, amount, false);

        state.totalTradesMade++;
        if (pnl >= 0) {
            state.totalProfit += pnl;
            state.tradeStreak++;
            if (state.tradeStreak > state.bestStreak) state.bestStreak = state.tradeStreak;
            // Track profits during bull markets
            if (state.marketCycle === 'bull') state.bullProfits += pnl;
            // Streak bonus: kicks in at 3+, escalates (capped at $3,000)
            if (state.tradeStreak >= 3) {
                const streakBonus = Math.min(state.tradeStreak * 150, 3000);
                state.cash += streakBonus;
                showToast(`${state.tradeStreak}x STREAK! +$${streakBonus.toLocaleString()} bonus`, 'good');
                addLog(`${state.tradeStreak}x trade streak bonus: +$${streakBonus.toLocaleString()}`, 'event-good');
            }
            if (state.tradeStreak >= 5) checkAchievement('hot_streak');
            if (state.bullProfits >= 10000) checkAchievement('bull_rider');
            if (state.volatileAssets?.[asset.id] > 0) checkAchievement('chaos_trader');
        }
        else { state.totalLoss += Math.abs(pnl); state.lossSellCount++; if (state.tradeStreak >= 3) { addLog(`Trade streak of ${state.tradeStreak} broken!`, 'event-bad'); } state.tradeStreak = 0; }

        // Achievement checks
        if (state.totalTradesMade >= 50) checkAchievement('degen');
        if (state.lossSellCount >= 5) checkAchievement('paper_hands');

        const pnlStr = pnl >= 0 ? `+$${pnl.toLocaleString()}` : `-$${Math.abs(pnl).toLocaleString()}`;
        if (isLuckySell) {
            state.luckyTrades++;
            AudioEngine.play('event_good');
            showToast(`LUCKY SELL! ${amount}x ${asset.name} @ $${effectiveSellPrice.toLocaleString()} (15% premium!) (${pnlStr})`, 'good');
            addLog(`LUCKY SELL! ${amount}x ${asset.name} @ $${effectiveSellPrice.toLocaleString()} instead of $${price.toLocaleString()}! (P&L: ${pnlStr})`, 'event-good');
            if (state.luckyTrades >= 5) checkAchievement('lucky_trader');
        } else {
            AudioEngine.play('sell');
            showToast(`Sold ${amount}x ${asset.name} (${pnlStr})`, pnl >= 0 ? 'good' : 'bad');
            addLog(`Sold ${amount}x ${asset.name} @ $${effectiveSellPrice.toLocaleString()} (P&L: ${pnlStr})`, pnl >= 0 ? 'event-good' : 'event-bad');
        }
        if (state.totalTradesMade === 1) checkAchievement('first_trade');
    }

    closeModals();
    updateUI();
    autoSave();
}

export function dumpAll(updateUI) {
    let totalGain = 0, totalPnl = 0, tradeCount = 0;
    ASSETS.forEach(asset => {
        const qty = state.inventory[asset.id];
        if (qty > 0) {
            const price = state.prices[state.currentCity][asset.id];
            const gain = qty * price;
            const pnl = (price - state.costBasis[asset.id]) * qty;
            totalGain += gain;
            totalPnl += pnl;
            tradeCount++;
            if (pnl >= 0) state.totalProfit += pnl; else state.totalLoss += Math.abs(pnl);
            applySupplyDemand(asset.id, state.currentCity, qty, false);
            state.inventory[asset.id] = 0;
            state.costBasis[asset.id] = 0;
            state.holdingSince[asset.id] = 0;
        }
    });
    if (tradeCount === 0) { showToast('Nothing to sell.', 'info'); return; }
    state.totalTradesMade += tradeCount;
    state.cash += totalGain;
    AudioEngine.play('sell');
    const pnlStr = totalPnl >= 0 ? `+$${totalPnl.toLocaleString()}` : `-$${Math.abs(totalPnl).toLocaleString()}`;
    showToast(`Sold everything for $${totalGain.toLocaleString()} (${pnlStr})`, totalPnl >= 0 ? 'good' : 'bad');
    addLog(`Sold everything for $${totalGain.toLocaleString()} (P&L: ${pnlStr})`, totalPnl >= 0 ? 'event-good' : 'event-bad');
    updateUI();
    autoSave();
}
