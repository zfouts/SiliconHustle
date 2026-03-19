import { ASSETS, CITIES, EVENTS } from '../data/constants.js';
import { state, addLog } from './state.js';
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
        const oc = CITIES.filter((_, i) => i !== state.currentCity);
        text = text.replace('{city}', oc[Math.floor(Math.random() * oc.length)].name);
    }

    switch (event.type) {
        case 'spike':
            if (affectedAsset) {
                // Each city gets a slightly different multiplier to create price differentials
                CITIES.forEach((_, ci) => {
                    const m = event.mult[0] + Math.random() * (event.mult[1] - event.mult[0]);
                    state.prices[ci][affectedAsset.id] = Math.min(MAX_PRICE, Math.round(state.prices[ci][affectedAsset.id] * m));
                });
            }
            break;
        case 'crash':
            if (affectedAsset) {
                CITIES.forEach((_, ci) => {
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
            // Was 1.5-2.0x — now 1.15-1.4x per asset (still impactful across 10 assets)
            ASSETS.forEach(a => CITIES.forEach((_, ci) => { state.prices[ci][a.id] = Math.min(MAX_PRICE, Math.round(state.prices[ci][a.id] * (1.15 + Math.random() * 0.25))); }));
            break;
        case 'market_crash':
            // Was 0.3-0.6x — now 0.55-0.8x per asset
            ASSETS.forEach(a => CITIES.forEach((_, ci) => { state.prices[ci][a.id] = Math.max(Math.round(state.prices[ci][a.id] * (0.55 + Math.random() * 0.25)), 1); }));
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
    let confiscated = 0;
    ASSETS.forEach(a => {
        if (state.inventory[a.id] > 0) {
            const seized = Math.ceil(state.inventory[a.id] * (0.2 + Math.random() * 0.3));
            state.inventory[a.id] -= seized;
            if (state.inventory[a.id] === 0) { state.costBasis[a.id] = 0; state.holdingSince[a.id] = 0; }
            confiscated += seized;
        }
    });
    const fine = Math.min(Math.round(state.cash * (0.1 + Math.random() * 0.2)), state.cash);
    state.cash -= fine;
    state.heat = Math.max(0, state.heat - 30);
    state.survivedRaid = true;
    checkAchievement('survivor');

    const text = `The feds raided you! Confiscated ${confiscated} items and fined you $${fine.toLocaleString()}!`;
    AudioEngine.play('event_bad');
    document.getElementById('event-icon').textContent = '🚔';
    document.getElementById('event-title').textContent = 'BUSTED!';
    document.getElementById('event-text').textContent = text;
    showModal('event-modal');
    addLog('🚔 ' + text, 'event-bad');
}
