import { ASSETS, CITIES } from '../data/constants.js';
import { state } from './state.js';
import { hasPerk } from './perks.js';

// Cap at 50x the most expensive base price (ZeroDayExploit=$6000 -> $300,000 max)
export const MAX_PRICE = 300_000;
const MAX_HISTORY = 90;

export function generatePrice(asset, city) {
    const mod = city.priceMod[asset.category] || 1;
    const variance = asset.basePrice * asset.volatility;
    return Math.max(Math.round(asset.basePrice * mod + (Math.random() * variance * 2 - variance)), 1);
}

export function regeneratePrices() {
    CITIES.forEach((city, ci) => {
        ASSETS.forEach(asset => {
            const current = state.prices[ci][asset.id];
            const fairValue = asset.basePrice * (city.priceMod[asset.category] || 1);

            // Random drift — proportional to price but dampened
            const drift = current * asset.volatility * (Math.random() * 2 - 1) * 0.3;

            // Mean reversion — stronger the further from fair value
            // Uses percentage deviation so it scales properly at any price level
            const deviation = (current - fairValue) / fairValue;
            // Pull strength: 15% base, ramping up to 40% when price is 3x+ away
            const pullStrength = Math.min(0.4, 0.15 + Math.abs(deviation) * 0.08);
            const pull = (fairValue - current) * pullStrength;

            // Supply/demand pressure
            const sd = state.supplyDemand[ci]?.[asset.id] || 0;
            const sdEffect = current * sd * 0.02;

            // Decay supply/demand toward 0
            if (state.supplyDemand[ci]?.[asset.id]) {
                state.supplyDemand[ci][asset.id] *= 0.7;
                if (Math.abs(state.supplyDemand[ci][asset.id]) < 0.5) state.supplyDemand[ci][asset.id] = 0;
            }

            state.prices[ci][asset.id] = Math.min(MAX_PRICE, Math.max(Math.round(current + drift + pull + sdEffect), 1));
        });
    });
}

export function snapshotPrices() {
    CITIES.forEach((_, ci) => {
        ASSETS.forEach(asset => {
            const arr = state.priceHistory[ci][asset.id];
            arr.push(state.prices[ci][asset.id]);
            if (arr.length > MAX_HISTORY) arr.splice(0, arr.length - MAX_HISTORY);
        });
    });
}

// Called after a trade to shift local supply/demand
export function applySupplyDemand(assetId, cityIndex, qty, isBuy) {
    if (!state.supplyDemand[cityIndex]) state.supplyDemand[cityIndex] = {};
    const current = state.supplyDemand[cityIndex][assetId] || 0;
    const impact = hasPerk('market_maker') ? qty * 0.5 : qty;
    state.supplyDemand[cityIndex][assetId] = current + (isBuy ? impact : -impact);
}
