import { ASSETS, EVENTS } from '../data/constants.js';
import { state, addLog, getGameCities } from './state.js';
import { AudioEngine } from './audio.js';
import { showModal } from '../ui/screens.js';
import { checkAchievement } from './achievements.js';
import { hasPerk } from './perks.js';
import { MAX_PRICE } from './prices.js';

export function triggerRandomEvent() {
    const pool = EVENTS.filter(e => e.type !== 'raid');
    const event = pool[Math.floor(Math.random() * pool.length)];
    let text = event.text;
    let affectedAsset = null;

    if (text.includes('{asset}')) {
        const ap = event.assetFilter ? ASSETS.filter(a => event.assetFilter.includes(a.id)) : ASSETS;
        affectedAsset = ap[Math.floor(Math.random() * ap.length)];
        text = text.replace('{asset}', affectedAsset.name);
    }
    if (text.includes('{city}')) {
        const oc = getGameCities().filter((_, i) => i !== state.currentCity);
        text = text.replace('{city}', oc.length > 0 ? oc[Math.floor(Math.random() * oc.length)].name : 'another city');
    }

    switch (event.type) {
        case 'spike':
            if (affectedAsset) {
                getGameCities().forEach((_, ci) => {
                    if (!state.prices[ci]?.[affectedAsset.id]) return;
                    const m = event.mult[0] + Math.random() * (event.mult[1] - event.mult[0]);
                    state.prices[ci][affectedAsset.id] = Math.min(MAX_PRICE, Math.round(state.prices[ci][affectedAsset.id] * m));
                });
            }
            break;
        case 'crash':
            if (affectedAsset) {
                getGameCities().forEach((_, ci) => {
                    if (!state.prices[ci]?.[affectedAsset.id]) return;
                    const m = event.mult[0] + Math.random() * (event.mult[1] - event.mult[0]);
                    state.prices[ci][affectedAsset.id] = Math.max(Math.round(state.prices[ci][affectedAsset.id] * m), 1);
                });
            }
            break;
        case 'cash_gain': {
            const a = Math.round(event.amount[0] + Math.random() * (event.amount[1] - event.amount[0]));
            text = text.replace('{amount}', a.toLocaleString()); state.cash += a; break;
        }
        case 'cash_loss': {
            const a = Math.min(Math.round(event.amount[0] + Math.random() * (event.amount[1] - event.amount[0])), state.cash);
            text = text.replace('{amount}', a.toLocaleString()); state.cash = Math.max(state.cash - a, 0); break;
        }
        case 'mugging': {
            if (hasPerk('bodyguard') || (state.muggingImmunity || 0) > 0) {
                text = '🥷 Someone tried to mug you, but your protection held!';
                break;
            }
            const owned = ASSETS.filter(a => state.inventory[a.id] > 0);
            if (owned.length === 0) { text = 'Someone tried to mug you, but you had nothing to steal!'; break; }
            const t = owned[Math.floor(Math.random() * owned.length)];
            const s = Math.max(1, Math.floor(state.inventory[t.id] * (0.1 + Math.random() * 0.3)));
            state.inventory[t.id] -= s;
            if (state.inventory[t.id] === 0) { state.costBasis[t.id] = 0; state.holdingSince[t.id] = 0; }
            text = text.replace('{stolen}', s).replace('{asset}', t.name); break;
        }
        case 'market_boom':
            ASSETS.forEach(a => getGameCities().forEach((_, ci) => { if (state.prices[ci]?.[a.id]) state.prices[ci][a.id] = Math.min(MAX_PRICE, Math.round(state.prices[ci][a.id] * (1.15 + Math.random() * 0.25))); }));
            break;
        case 'market_crash':
            ASSETS.forEach(a => getGameCities().forEach((_, ci) => { if (state.prices[ci]?.[a.id]) state.prices[ci][a.id] = Math.max(Math.round(state.prices[ci][a.id] * (0.55 + Math.random() * 0.25)), 1); }));
            break;
        case 'storage_up': state.maxStorage += 25; break;
        case 'tip': break;
    }

    const isGood = event.class === 'event-good' || event.class === 'event-info';
    AudioEngine.play(isGood ? 'event_good' : 'event_bad');
    document.getElementById('event-icon').textContent = event.icon || '';
    document.getElementById('event-title').textContent = isGood ? 'NEWS FLASH' : 'BAD NEWS';
    document.getElementById('event-text').textContent = text;
    showModal('event-modal');
    addLog(text, event.class);
}

export function triggerRaid() {
    // Insurance blocks the raid entirely
    if (state.hasInsurance) {
        state.hasInsurance = false;
        state.heat = Math.max(0, state.heat - 15);
        state.survivedRaid = true;
        checkAchievement('survivor');
        checkAchievement('insured');
        const text = 'The feds tried to raid you, but your insurance lawyers shut it down! Insurance consumed.';
        AudioEngine.play('event_good');
        document.getElementById('event-icon').textContent = '🛡️';
        document.getElementById('event-title').textContent = 'INSURED!';
        document.getElementById('event-text').textContent = text;
        showModal('event-modal');
        addLog('🛡️ ' + text, 'event-good');
        return;
    }

    // Double damage if bounty is active (surviving at WANTED heat level)
    const bountyActive = state.bountyDays > 0;
    const seizeRate = bountyActive ? [0.35, 0.5] : [0.2, 0.3];
    const fineRate = bountyActive ? [0.2, 0.3] : [0.1, 0.2];

    let confiscated = 0;
    ASSETS.forEach(a => {
        if (state.inventory[a.id] > 0) {
            const seized = Math.ceil(state.inventory[a.id] * (seizeRate[0] + Math.random() * (seizeRate[1] - seizeRate[0])));
            state.inventory[a.id] -= seized;
            if (state.inventory[a.id] === 0) { state.costBasis[a.id] = 0; state.holdingSince[a.id] = 0; }
            confiscated += seized;
        }
    });
    const fine = Math.min(Math.round(state.cash * (fineRate[0] + Math.random() * (fineRate[1] - fineRate[0]))), state.cash);
    state.cash -= fine;
    state.heat = Math.max(0, state.heat - 30);
    state.survivedRaid = true;
    if (bountyActive) state.bountyDays = 0;
    checkAchievement('survivor');

    const bountyNote = bountyActive ? ' BOUNTY RAID — double penalties!' : '';
    const text = `The feds raided you! Confiscated ${confiscated} items and fined you $${fine.toLocaleString()}!${bountyNote}`;
    AudioEngine.play('event_bad');
    document.getElementById('event-icon').textContent = '🚔';
    document.getElementById('event-title').textContent = bountyActive ? 'BOUNTY BUST!' : 'BUSTED!';
    document.getElementById('event-text').textContent = text;
    showModal('event-modal');
    addLog('🚔 ' + text, 'event-bad');
}
