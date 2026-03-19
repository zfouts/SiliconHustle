import { ASSETS } from '../data/constants.js';
import { state, calcNetWorth, calcAssetValue, usedStorage, addLog } from './state.js';
import { regeneratePrices, snapshotPrices } from './prices.js';
import { triggerRandomEvent, triggerRaid } from './events.js';
import { triggerEncounter } from './encounters.js';
import { triggerBlackMarket } from './blackmarket.js';
import { checkMissionProgress, offerMission } from './missions.js';
import { checkAchievement } from './achievements.js';
import { hasPerk } from './perks.js';

export function advanceDay(endGameFn) {
    state.day++;

    // Interest on debt (capped to prevent UI-breaking numbers)
    if (state.debt > 0) {
        const interest = Math.round(state.debt * state.interestRate);
        state.debt = Math.min(state.debt + interest, 10_000_000);
        addLog(`Loan shark charged $${interest.toLocaleString()} interest. Debt: $${state.debt.toLocaleString()}`, 'event-bad');
    }

    // Heat cooldown (2x if VPN Shield perk)
    const heatDecay = hasPerk('vpn_shield') ? 16 : 8;
    state.heat = Math.max(0, state.heat - heatDecay);

    // Mugging immunity countdown
    if (state.muggingImmunity > 0) state.muggingImmunity--;

    // Regenerate prices (includes supply/demand decay)
    regeneratePrices();

    // Random events (40% chance, higher with heat)
    const eventRoll = Math.random();
    const eventChance = 0.4 + (state.heat > 50 ? 0.15 : 0);
    if (eventRoll < eventChance) {
        triggerRandomEvent();
    } else if (eventRoll < eventChance + 0.18) {
        // 18% chance for an encounter (only if no regular event)
        triggerEncounter();
    }

    // Black market (8% chance)
    if (Math.random() < 0.08) {
        triggerBlackMarket();
    }

    // Heat-based raid check
    if (state.heat >= 60 && Math.random() < (state.heat / 200)) {
        triggerRaid();
    }

    // Missions: check progress and maybe offer new ones
    checkMissionProgress();
    offerMission();

    // Snapshot prices AFTER all events
    snapshotPrices();

    // Track net worth + achievement checks
    const nw = calcNetWorth();
    state.networthHistory.push(nw);
    if (nw >= 10000) checkAchievement('net_10k');
    if (nw >= 50000) checkAchievement('net_50k');
    if (nw >= 100000) checkAchievement('net_100k');
    if (state.day <= 10 && nw >= 25000) checkAchievement('speed_run');
    if (state.debt <= 0) checkAchievement('debt_free');
    if (calcAssetValue() >= 50000) checkAchievement('whale');

    ASSETS.forEach(a => {
        if (state.inventory[a.id] > 0 && state.holdingSince[a.id] > 0 && (state.day - state.holdingSince[a.id]) >= 15) {
            checkAchievement('diamond_hands');
        }
    });

    // Bankruptcy check — wiped out if $0 cash, 0 inventory, and can't borrow
    if (state.cash <= 0 && usedStorage() === 0 && state.debt >= 50000) {
        // Truly broke — no cash, nothing to sell, maxed out debt
        endGameFn('wipeout');
        return;
    }

    // Game over check — skip in unlimited mode
    if (!state.unlimited && state.day > state.maxDays) {
        endGameFn();
    }
}
