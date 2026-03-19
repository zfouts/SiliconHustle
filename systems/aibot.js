import { ASSETS, CITIES } from '../data/constants.js';
import { state, freeStorage } from './state.js';
import { hasPerk } from './perks.js';
import { isLoanSharkCity } from './bank.js';
import { getTravelFare } from './travel.js';

// The AI Trading Bot analyzes ALL markets and generates prioritized recommendations.
// It sees global prices (like the player) but thinks in terms of optimal moves.

export function renderAIBot() {
    const panel = document.getElementById('ai-bot-panel');
    const container = document.getElementById('ai-bot-recommendations');
    if (!panel || !container) return;

    if (!hasPerk('ai_trader')) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = '';
    container.innerHTML = '';

    const recs = generateRecommendations();

    if (recs.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'ai-rec rec-hold';
        const action = document.createElement('div');
        action.className = 'ai-rec-action hold';
        action.textContent = 'STAND BY';
        empty.appendChild(action);
        const detail = document.createElement('div');
        detail.className = 'ai-rec-detail';
        detail.textContent = 'No strong opportunities detected. Hold position.';
        empty.appendChild(detail);
        container.appendChild(empty);
    } else {
        recs.slice(0, 5).forEach(rec => {
            const div = document.createElement('div');
            div.className = `ai-rec rec-${rec.type}`;

            const action = document.createElement('div');
            action.className = `ai-rec-action ${rec.type}`;
            action.textContent = rec.action;
            div.appendChild(action);

            const detail = document.createElement('div');
            detail.className = 'ai-rec-detail';
            detail.textContent = rec.detail;
            div.appendChild(detail);

            if (rec.profit) {
                const profit = document.createElement('div');
                profit.className = 'ai-rec-profit';
                profit.style.color = rec.profit > 0 ? '#00e676' : '#ff1744';
                profit.textContent = `Est. profit: ${rec.profit > 0 ? '+' : ''}$${rec.profit.toLocaleString()}`;
                div.appendChild(profit);
            }

            container.appendChild(div);
        });
    }

    // Summary
    const summary = document.createElement('div');
    summary.className = 'ai-summary';
    summary.textContent = `Analyzing ${ASSETS.length} assets across ${CITIES.length} cities`;
    container.appendChild(summary);
}

function generateRecommendations() {
    const recs = [];
    const ci = state.currentCity;
    const cash = state.cash;
    const storage = freeStorage();

    // 1. Find best BUY opportunities: local price is cheap vs global or vs best sell city
    ASSETS.forEach(asset => {
        const localPrice = state.prices[ci]?.[asset.id] || 0;
        if (localPrice <= 0) return;

        // Find global average
        let globalTotal = 0;
        let bestSellPrice = 0;
        let bestSellCity = '';
        CITIES.forEach((city, i) => {
            const p = state.prices[i]?.[asset.id] || 0;
            globalTotal += p;
            if (p > bestSellPrice) { bestSellPrice = p; bestSellCity = city.name; }
        });
        const globalAvg = Math.round(globalTotal / CITIES.length);

        // Arbitrage: buy here, sell in best city
        const spread = bestSellPrice - localPrice;
        const spreadPct = localPrice > 0 ? (spread / localPrice * 100) : 0;

        if (spreadPct >= 15 && cash >= localPrice && storage > 0) {
            const maxBuy = Math.min(Math.floor(cash / localPrice), storage);
            const estProfit = spread * maxBuy;
            recs.push({
                type: 'buy',
                action: `BUY ${asset.icon} ${asset.name}`,
                detail: `$${localPrice.toLocaleString()} here \u2192 $${bestSellPrice.toLocaleString()} in ${bestSellCity} (+${spreadPct.toFixed(0)}%)`,
                profit: estProfit,
                score: estProfit,
            });
        }

        // Global trend: is the global price rising?
        const globalHist = getGlobalHistoryQuick(asset.id);
        if (globalHist.length >= 3) {
            const recent = globalHist[globalHist.length - 1];
            const older = globalHist[Math.max(0, globalHist.length - 4)];
            const trend = older > 0 ? ((recent - older) / older * 100) : 0;

            if (trend >= 8 && localPrice <= globalAvg && cash >= localPrice && storage > 0) {
                const maxBuy = Math.min(Math.floor(cash / localPrice), storage, 10);
                recs.push({
                    type: 'buy',
                    action: `BUY ${asset.icon} ${asset.name} (trending)`,
                    detail: `Global trend +${trend.toFixed(0)}% and local price is at/below average`,
                    profit: Math.round(localPrice * (trend / 100) * maxBuy),
                    score: trend * maxBuy,
                });
            }
        }
    });

    // 2. Find SELL opportunities for held assets
    ASSETS.forEach(asset => {
        const owned = state.inventory[asset.id];
        if (owned <= 0) return;

        const localPrice = state.prices[ci]?.[asset.id] || 0;
        const avgCost = state.costBasis[asset.id] || 0;

        // Global average
        let globalTotal = 0;
        let bestSellPrice = 0;
        let bestSellCity = '';
        let bestSellCityIdx = ci;
        CITIES.forEach((city, i) => {
            const p = state.prices[i]?.[asset.id] || 0;
            globalTotal += p;
            if (p > bestSellPrice) { bestSellPrice = p; bestSellCity = city.name; bestSellCityIdx = i; }
        });
        const globalAvg = Math.round(globalTotal / CITIES.length);

        // Sell here if local price is 10%+ above global (overpriced)
        if (localPrice > globalAvg * 1.1 && avgCost > 0) {
            const pnl = (localPrice - avgCost) * owned;
            recs.push({
                type: 'sell',
                action: `SELL ${asset.icon} ${asset.name} (${owned}x)`,
                detail: `Local $${localPrice.toLocaleString()} is ${((localPrice / globalAvg - 1) * 100).toFixed(0)}% above global avg`,
                profit: pnl,
                score: pnl > 0 ? pnl : pnl + 1000, // still recommend selling even at a loss if overpriced locally
            });
        }

        // Sell if we have profit and the trend is turning down
        const localHist = state.priceHistory[ci]?.[asset.id] || [];
        if (localHist.length >= 3 && avgCost > 0) {
            const recent = localHist.slice(-3);
            if (recent[2] < recent[1] && recent[1] < recent[0] && localPrice > avgCost) {
                // Three consecutive drops but still in profit — sell before it drops more
                const pnl = (localPrice - avgCost) * owned;
                recs.push({
                    type: 'sell',
                    action: `SELL ${asset.icon} ${asset.name} (take profit)`,
                    detail: `Price declining for 3 days. Lock in profit before reversal.`,
                    profit: pnl,
                    score: pnl * 0.8,
                });
            }
        }

        // Suggest traveling to a better sell city if spread is significant (net of airfare)
        if (bestSellCityIdx !== ci && bestSellPrice > localPrice * 1.15) {
            const fare = getTravelFare(bestSellCityIdx);
            const extraProfit = (bestSellPrice - localPrice) * owned - fare;
            if (extraProfit > 0) {
                recs.push({
                    type: 'travel',
                    action: `TRAVEL \u2192 ${bestSellCity}`,
                    detail: `Sell ${asset.icon} ${asset.name} there for $${bestSellPrice.toLocaleString()}/ea (+${((bestSellPrice / localPrice - 1) * 100).toFixed(0)}%) | Fare: $${fare.toLocaleString()}`,
                    profit: extraProfit,
                    score: extraProfit * 0.9, // slightly lower priority than immediate trades
                });
            }
        }
    });

    // 3. Suggest repaying debt if in a loan shark city and debt is costing more than trading gains
    if (state.debt > 0 && isLoanSharkCity() && cash > state.debt * 0.3) {
        const dailyInterest = Math.round(state.debt * state.interestRate);
        if (dailyInterest > 200) {
            recs.push({
                type: 'hold',
                action: 'REPAY DEBT',
                detail: `Debt costing $${dailyInterest.toLocaleString()}/day in interest. Consider repaying.`,
                profit: dailyInterest * 5, // value of 5 days saved interest
                score: dailyInterest * 3,
            });
        }
    }

    // 4. If holding nothing and have cash, find cheapest asset relative to global
    if (storage > 0 && cash > 100) {
        const owned = ASSETS.filter(a => state.inventory[a.id] > 0);
        if (owned.length === 0) {
            let bestDeal = null;
            let bestDealPct = 0;
            ASSETS.forEach(asset => {
                const localPrice = state.prices[ci]?.[asset.id] || 0;
                if (localPrice <= 0 || localPrice > cash) return;
                let globalTotal = 0;
                CITIES.forEach((_, i) => { globalTotal += (state.prices[i]?.[asset.id] || 0); });
                const globalAvg = Math.round(globalTotal / CITIES.length);
                const discount = globalAvg > 0 ? ((globalAvg - localPrice) / globalAvg * 100) : 0;
                if (discount > bestDealPct) { bestDealPct = discount; bestDeal = asset; }
            });
            if (bestDeal && bestDealPct > 5) {
                const lp = state.prices[ci]?.[bestDeal.id] || 0;
                recs.push({
                    type: 'buy',
                    action: `BUY ${bestDeal.icon} ${bestDeal.name} (best deal)`,
                    detail: `${bestDealPct.toFixed(0)}% below global average. Start building a position.`,
                    profit: null,
                    score: bestDealPct * 100,
                });
            }
        }
    }

    // Sort by estimated profit/score, highest first
    recs.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Deduplicate — only one rec per asset
    const seen = new Set();
    return recs.filter(r => {
        const key = r.action;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function getGlobalHistoryQuick(assetId) {
    const maxLen = Math.max(...CITIES.map((_, ci) => (state.priceHistory[ci]?.[assetId]?.length || 0)));
    const result = [];
    for (let d = Math.max(0, maxLen - 10); d < maxLen; d++) {
        let sum = 0, count = 0;
        CITIES.forEach((_, ci) => {
            const h = state.priceHistory[ci]?.[assetId];
            if (h && d < h.length) { sum += h[d]; count++; }
        });
        if (count > 0) result.push(Math.round(sum / count));
    }
    return result;
}
