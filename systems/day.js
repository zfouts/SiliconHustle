import { ASSETS } from '../data/constants.js';
import { state, calcNetWorth, calcAssetValue, usedStorage, addLog, getGameCities } from './state.js';
import { regeneratePrices, snapshotPrices, MAX_PRICE } from './prices.js';
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

    // City contacts countdown
    if (state.cityContacts) {
        for (const key of Object.keys(state.cityContacts)) {
            state.cityContacts[key]--;
            if (state.cityContacts[key] <= 0) {
                delete state.cityContacts[key];
                addLog('Your contact in this area has moved on.', 'event-info');
            }
        }
    }

    // Market cycle transition
    if (state.cycleDaysLeft > 0) state.cycleDaysLeft--;
    if (state.cycleDaysLeft <= 0) {
        const oldCycle = state.marketCycle;
        const roll = Math.random();
        if (roll < 0.3) state.marketCycle = 'bull';
        else if (roll < 0.6) state.marketCycle = 'bear';
        else state.marketCycle = 'neutral';
        state.cycleDaysLeft = 3 + Math.floor(Math.random() * 5); // 3-7 days
        if (state.marketCycle !== oldCycle) {
            const labels = { bull: 'BULL MARKET — prices trending up!', bear: 'BEAR MARKET — prices trending down!', neutral: 'Market stabilizing. Normal conditions.' };
            const cls = state.marketCycle === 'bull' ? 'event-good' : state.marketCycle === 'bear' ? 'event-bad' : 'event-info';
            addLog(labels[state.marketCycle], cls);
        }
    }

    // Volatile asset countdown
    if (state.volatileAssets) {
        for (const assetId of Object.keys(state.volatileAssets)) {
            state.volatileAssets[assetId]--;
            if (state.volatileAssets[assetId] <= 0) {
                delete state.volatileAssets[assetId];
                const asset = ASSETS.find(a => a.id === assetId);
                if (asset) addLog(`${asset.icon} ${asset.name} volatility has settled down.`, 'event-info');
            }
        }
    }

    // Chance to make a random asset volatile (15% per day)
    if (Math.random() < 0.15) {
        const candidates = ASSETS.filter(a => !(state.volatileAssets?.[a.id] > 0));
        if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            if (!state.volatileAssets) state.volatileAssets = {};
            state.volatileAssets[pick.id] = 3 + Math.floor(Math.random() * 3); // 3-5 days
            addLog(`${pick.icon} ${pick.name} has entered VOLATILE mode! Wild price swings ahead.`, 'event-warning');
        }
    }

    // Fire scheduled rumor
    if (state.activeRumor && state.day >= state.activeRumor.fireDay) {
        const rumor = state.activeRumor;
        const asset = ASSETS.find(a => a.id === rumor.assetId);
        const city = getGameCities()[rumor.cityIndex];
        if (asset && city) {
            if (rumor.type === 'spike') {
                const mult = 1.4 + Math.random() * 0.6;
                state.prices[rumor.cityIndex][rumor.assetId] = Math.min(MAX_PRICE, Math.round(state.prices[rumor.cityIndex][rumor.assetId] * mult));
                addLog(`The rumor was true! ${asset.name} spiked in ${city.name}!`, 'event-good');
            } else {
                const mult = 0.35 + Math.random() * 0.25;
                state.prices[rumor.cityIndex][rumor.assetId] = Math.max(1, Math.round(state.prices[rumor.cityIndex][rumor.assetId] * mult));
                addLog(`The rumor was true! ${asset.name} crashed in ${city.name}!`, 'event-bad');
            }
        }
        state.activeRumor = null;
    }

    // Chance to generate a new rumor (20% per day, only if no active rumor)
    if (!state.activeRumor && Math.random() < 0.20) {
        const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
        const gameCities = getGameCities();
        const otherCities = gameCities.map((_, i) => i).filter(i => i !== state.currentCity);
        if (otherCities.length > 0) {
            const cityIdx = otherCities[Math.floor(Math.random() * otherCities.length)];
            const city = gameCities[cityIdx];
            const type = Math.random() < 0.5 ? 'spike' : 'crash';
            const daysAhead = 1 + Math.floor(Math.random() * 2); // fires in 1-2 days
            state.activeRumor = { assetId: asset.id, cityIndex: cityIdx, type, fireDay: state.day + daysAhead };
            const verb = type === 'spike' ? 'surge' : 'crash';
            addLog(`Rumor: ${asset.name} might ${verb} in ${city.name} soon...`, 'event-info');
        }
    }

    // Wanted bounty system — survive at 80+ heat for 5 days to collect a reward
    if (state.heat >= 80) {
        state.bountyDays++;
        if (state.bountyDays === 1) {
            addLog('BOUNTY ACTIVE: Survive 5 days at WANTED level for a big reward!', 'event-warning');
        }
        if (state.bountyDays >= 5) {
            const bountyReward = 3000 + Math.floor(Math.random() * 5000);
            state.cash += bountyReward;
            state.bountiesCollected++;
            state.bountyDays = 0;
            addLog(`BOUNTY COLLECTED! +$${bountyReward.toLocaleString()} for surviving the heat!`, 'event-good');
            if (state.bountiesCollected >= 3) checkAchievement('bounty_hunter');
        }
    } else {
        if (state.bountyDays > 0) {
            addLog('Heat dropped below WANTED. Bounty progress reset.', 'event-info');
        }
        state.bountyDays = 0;
    }

    // Passive dividends — assets held 3+ days generate daily income (capped at $2,000/day)
    const MAX_DAILY_DIVIDEND = 2000;
    let dailyDividend = 0;
    ASSETS.forEach(a => {
        if (state.inventory[a.id] > 0 && state.holdingSince[a.id] > 0 && (state.day - state.holdingSince[a.id]) >= 3) {
            const qty = state.inventory[a.id];
            const price = state.prices[state.currentCity][a.id];
            // Category-based yield rates (daily % of held value)
            const yields = { crypto: 0.008, nft: 0.005, hardware: 0.003, data: 0.01, contraband: 0, software: 0.006, digital: 0.007, service: 0.009 };
            const rate = yields[a.category] || 0.005;
            const income = Math.floor(price * qty * rate);
            if (income > 0) dailyDividend += income;
        }
    });
    dailyDividend = Math.min(dailyDividend, MAX_DAILY_DIVIDEND);
    if (dailyDividend > 0) {
        state.cash += dailyDividend;
        state.dividendsEarned += dailyDividend;
        addLog(`Passive income: +$${dailyDividend.toLocaleString()} from held assets.${dailyDividend >= MAX_DAILY_DIVIDEND ? ' (daily cap reached)' : ''}`, 'event-good');
        if (state.dividendsEarned >= 5000) checkAchievement('passive_income');
    }

    // Rival trader AI — moves between cities and trades, affecting supply/demand
    if (state.rival) {
        const gameCitiesForRival = getGameCities();
        // 60% chance rival moves to a new city
        if (Math.random() < 0.6) {
            const otherCities = gameCitiesForRival.map((_, i) => i).filter(i => i !== state.rival.city);
            if (otherCities.length > 0) {
                state.rival.city = otherCities[Math.floor(Math.random() * otherCities.length)];
            }
        }
        // Rival buys 1-3 random assets in their city (affects supply/demand)
        const tradeCount = 1 + Math.floor(Math.random() * 3);
        for (let t = 0; t < tradeCount; t++) {
            const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
            if (asset.category === 'contraband') continue; // rival avoids contraband
            const qty = 2 + Math.floor(Math.random() * 5);
            const price = state.prices[state.rival.city]?.[asset.id] || 0;
            if (!state.supplyDemand[state.rival.city]) state.supplyDemand[state.rival.city] = {};
            if (Math.random() < 0.5 && state.rival.cash >= price * qty) {
                // Rival buys — pushes price up
                state.rival.cash -= price * qty;
                state.supplyDemand[state.rival.city][asset.id] = (state.supplyDemand[state.rival.city][asset.id] || 0) + qty;
            } else {
                // Rival sells — pushes price down
                state.rival.cash += price * qty;
                state.supplyDemand[state.rival.city][asset.id] = (state.supplyDemand[state.rival.city][asset.id] || 0) - qty;
            }
        }
        // Clamp rival cash
        state.rival.cash = Math.max(0, Math.min(10_000_000, state.rival.cash));
        // Log rival activity if in same city
        if (state.rival.city === state.currentCity) {
            addLog(`${state.rival.name} is trading in this city. Prices may shift.`, 'event-warning');
        }
    }

    // Flash city events — one random city gets a temporary modifier each day
    state.flashEvent = null; // clear yesterday's event
    if (Math.random() < 0.25) {
        const gameCitiesForFlash = getGameCities();
        const flashCity = Math.floor(Math.random() * gameCitiesForFlash.length);
        const flashTypes = ['sale', 'boom', 'crackdown'];
        const flashType = flashTypes[Math.floor(Math.random() * flashTypes.length)];
        state.flashEvent = { cityIndex: flashCity, type: flashType };
        const cityName = gameCitiesForFlash[flashCity]?.name || 'Unknown';
        if (flashType === 'sale') {
            // Flash sale: all prices -25% in that city
            ASSETS.forEach(a => {
                state.prices[flashCity][a.id] = Math.max(1, Math.round(state.prices[flashCity][a.id] * 0.75));
            });
            addLog(`FLASH SALE in ${cityName}! All prices -25% today!`, 'event-good');
        } else if (flashType === 'boom') {
            // Tech boom: all prices +30% in that city
            ASSETS.forEach(a => {
                state.prices[flashCity][a.id] = Math.min(MAX_PRICE, Math.round(state.prices[flashCity][a.id] * 1.3));
            });
            addLog(`TECH BOOM in ${cityName}! All prices +30% today!`, 'event-good');
        } else {
            // Crackdown: contraband prices crash, heat +10 if you're there
            ASSETS.filter(a => a.category === 'contraband').forEach(a => {
                state.prices[flashCity][a.id] = Math.max(1, Math.round(state.prices[flashCity][a.id] * 0.5));
            });
            if (flashCity === state.currentCity) {
                state.heat = Math.min(100, state.heat + 10);
                addLog(`POLICE CRACKDOWN here! Contraband prices crashed. +10 heat!`, 'event-bad');
            } else {
                addLog(`POLICE CRACKDOWN in ${cityName}! Contraband prices crashed there.`, 'event-warning');
            }
        }
    }

    // Regenerate prices (includes supply/demand decay + market cycle effects)
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
