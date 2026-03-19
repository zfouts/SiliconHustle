import { ASSETS, CITIES, DIFFICULTY, STARTING_STORAGE, ACHIEVEMENTS } from '../data/constants.js';
import { generatePrice } from './prices.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { syncMissionCounter } from './missions.js';

// Central mutable game state — other modules import and read/write directly
export const state = {
    cash: 0, debt: 0, interestRate: 0.1, maxDays: 30,
    day: 1, currentCity: 0, maxStorage: STARTING_STORAGE, heat: 0,
    difficulty: 'normal',
    inventory: {}, costBasis: {}, holdingSince: {},
    prices: {}, priceHistory: {}, supplyDemand: {},
    networthHistory: [],
    citiesVisited: [],
    totalTradesMade: 0, totalProfit: 0, totalLoss: 0,
    survivedRaid: false, muggingImmunity: 0,
    achievementsEarned: [],
    perks: [],
    activeMissions: [], completedMissionCount: 0,
    log: [],
    gameOver: false,
};

export let currentTab = 'all';
export function setCurrentTab(tab) { currentTab = tab; }

export let selectedDifficulty = 'normal';
export function setSelectedDifficulty(d) { selectedDifficulty = d; }

function validateSave(s) {
    // Only allow known keys with expected types to prevent injection
    const numFields = ['cash','debt','interestRate','maxDays','day','currentCity','maxStorage','heat',
                       'totalTradesMade','totalProfit','totalLoss','completedMissionCount','muggingImmunity','lossSellCount'];
    const strFields = ['difficulty'];
    const boolFields = ['survivedRaid','gameOver','unlimited'];
    const arrFields = ['networthHistory','citiesVisited','achievementsEarned','perks','activeMissions','loanSharkCities','log'];
    const objFields = ['inventory','costBasis','holdingSince','prices','priceHistory','supplyDemand'];

    if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
    for (const k of numFields) { if (k in s && typeof s[k] !== 'number') return false; }
    for (const k of strFields) { if (k in s && typeof s[k] !== 'string') return false; }
    for (const k of boolFields) { if (k in s && typeof s[k] !== 'boolean') return false; }
    for (const k of arrFields) { if (k in s && !Array.isArray(s[k])) return false; }
    for (const k of objFields) { if (k in s && (typeof s[k] !== 'object' || Array.isArray(s[k]) || s[k] === null)) return false; }

    // Validate difficulty is a known value
    if (s.difficulty && !DIFFICULTY[s.difficulty]) return false;

    // Range checks on critical numeric fields
    if (typeof s.currentCity === 'number' && (s.currentCity < 0 || s.currentCity >= CITIES.length)) return false;
    if (typeof s.day === 'number' && (s.day < 1 || s.day > 999)) return false;
    if (typeof s.maxDays === 'number' && (s.maxDays < 0 || s.maxDays > 999)) return false; // 0 = unlimited
    if (typeof s.heat === 'number') s.heat = Math.max(0, Math.min(100, s.heat));
    if (typeof s.maxStorage === 'number') s.maxStorage = Math.max(1, Math.min(10000, s.maxStorage));

    // Deep validation: inventory values must be non-negative finite integers
    if (s.inventory && typeof s.inventory === 'object') {
        for (const key of Object.keys(s.inventory)) {
            const v = s.inventory[key];
            if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
                s.inventory[key] = 0;
            } else {
                s.inventory[key] = Math.floor(v);
            }
        }
    }

    // Deep validation: costBasis and holdingSince must be non-negative finite numbers
    for (const field of ['costBasis', 'holdingSince']) {
        if (s[field] && typeof s[field] === 'object') {
            for (const key of Object.keys(s[field])) {
                const v = s[field][key];
                if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) s[field][key] = 0;
            }
        }
    }

    // Deep validation: prices must be nested objects with positive finite numbers
    if (s.prices && typeof s.prices === 'object') {
        for (const ci of Object.keys(s.prices)) {
            if (typeof s.prices[ci] !== 'object' || s.prices[ci] === null) { s.prices[ci] = {}; continue; }
            for (const aid of Object.keys(s.prices[ci])) {
                const v = s.prices[ci][aid];
                if (typeof v !== 'number' || !Number.isFinite(v) || v < 1) s.prices[ci][aid] = 1;
                else s.prices[ci][aid] = Math.min(300_000, Math.round(v));
            }
        }
    }

    // Sanitize log entries — strip any HTML from text
    if (Array.isArray(s.log)) {
        s.log = s.log.filter(e => e && typeof e === 'object').slice(-60).map(e => ({
            day: Number(e.day) || 0,
            text: String(e.text || '').replace(/<[^>]*>/g, ''),
            cls: String(e.cls || '').replace(/[^a-zA-Z0-9\-_ ]/g, ''),
        }));
    }

    // Cap networthHistory length
    if (Array.isArray(s.networthHistory)) {
        s.networthHistory = s.networthHistory.filter(v => typeof v === 'number' && Number.isFinite(v)).slice(-100);
    }

    // Validate perks are strings from known set
    if (Array.isArray(s.perks)) {
        const knownPerkIds = ['bulk_buyer','vpn_shield','insider_info','extra_storage','fast_travel','tax_lawyer','bodyguard','market_maker','global_terminal','ai_trader'];
        s.perks = s.perks.filter(p => typeof p === 'string' && knownPerkIds.includes(p));
    }

    // Validate achievementsEarned are strings from known set
    if (Array.isArray(s.achievementsEarned)) {
        const knownAchIds = ACHIEVEMENTS.map(a => a.id);
        s.achievementsEarned = s.achievementsEarned.filter(a => typeof a === 'string' && knownAchIds.includes(a));
    }

    // Validate citiesVisited are valid city indices
    if (Array.isArray(s.citiesVisited)) {
        s.citiesVisited = s.citiesVisited.filter(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < CITIES.length);
    }

    // Validate loanSharkCities are valid city indices
    if (Array.isArray(s.loanSharkCities)) {
        s.loanSharkCities = s.loanSharkCities.filter(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < CITIES.length).slice(0, 4);
    }

    // Validate activeMissions structure
    if (Array.isArray(s.activeMissions)) {
        s.activeMissions = s.activeMissions
            .filter(m => m && typeof m === 'object' && !Array.isArray(m))
            .map(m => ({
                ...m,
                id: Number(m.id) || 0,
                type: String(m.type || 'trade').replace(/[^a-z]/g, ''),
                reward: Math.max(0, Math.min(100000, Number(m.reward) || 0)),
                target: Math.max(0, Number(m.target) || 0),
                progress: Math.max(0, Number(m.progress) || 0),
                deadline: Math.max(0, Number(m.deadline) || 0),
                desc: String(m.desc || '').replace(/<[^>]*>/g, '').substring(0, 200),
                completed: !!m.completed,
                failed: !!m.failed,
            }))
            .slice(0, 5);
    }

    // Only allow known keys — strip anything unexpected
    const allowedKeys = new Set([...numFields, ...strFields, ...boolFields, ...arrFields, ...objFields]);
    for (const key of Object.keys(s)) {
        if (!allowedKeys.has(key)) delete s[key];
    }

    return true;
}

export function initGame(resumeState, updateUI, unlimitedMode) {
    if (resumeState) {
        if (!validateSave(resumeState)) {
            showToast('Corrupted save data. Starting fresh.', 'bad');
            try { localStorage.removeItem('silicon_hustle_save'); } catch {}
        } else {
            Object.assign(state, resumeState);
            syncMissionCounter();
            showScreen('game-screen');
            updateUI();
            showToast('Game resumed!', 'info');
            return;
        }
    }

    const diff = DIFFICULTY[selectedDifficulty];
    const customDays = unlimitedMode ? 0 : Math.max(5, Math.min(60, parseInt(document.getElementById('days-slider')?.value) || 30));
    const isUnlimited = unlimitedMode || customDays === 0;

    Object.assign(state, {
        difficulty: selectedDifficulty,
        cash: diff.cash,
        debt: diff.debt,
        interestRate: diff.interest,
        maxDays: customDays,
        unlimited: isUnlimited,
        day: 1,
        currentCity: 0,
        maxStorage: STARTING_STORAGE,
        heat: 0,
        inventory: {},
        costBasis: {},
        holdingSince: {},
        prices: {},
        priceHistory: {},
        supplyDemand: {},
        networthHistory: [],
        citiesVisited: [0],
        totalTradesMade: 0,
        totalProfit: 0,
        totalLoss: 0,
        survivedRaid: false,
        muggingImmunity: 0,
        lossSellCount: 0,
        achievementsEarned: [],
        perks: [],
        activeMissions: [],
        completedMissionCount: 0,
        loanSharkCities: [],
        log: [],
        gameOver: false,
    });

    // Randomly pick 2-3 cities that have loan sharks this game
    const cityIndices = Array.from({ length: CITIES.length }, (_, i) => i);
    const shuffled = cityIndices.sort(() => Math.random() - 0.5);
    state.loanSharkCities = shuffled.slice(0, 2 + Math.floor(Math.random() * 2)); // 2 or 3 cities

    ASSETS.forEach(a => {
        state.inventory[a.id] = 0;
        state.costBasis[a.id] = 0;
        state.holdingSince[a.id] = 0;
    });

    CITIES.forEach((city, ci) => {
        state.prices[ci] = {};
        state.priceHistory[ci] = {};
        state.supplyDemand[ci] = {};
        ASSETS.forEach(asset => {
            const price = generatePrice(asset, city);
            state.prices[ci][asset.id] = price;
            state.priceHistory[ci][asset.id] = [price];
            state.supplyDemand[ci][asset.id] = 0;
        });
    });

    state.networthHistory.push(calcNetWorth());

    addLog(`Welcome to Silicon Hustle [${diff.label}]. ${isUnlimited ? 'Unlimited mode — retire when you\'re ready.' : `You have ${customDays} days.`}`, 'event-info');
    addLog(`You owe the loan shark $${diff.debt.toLocaleString()}. Interest: ${(diff.interest * 100)}%/day.`, 'event-warning');
    const sharkNames = state.loanSharkCities.map(i => CITIES[i]?.name).filter(Boolean);
    addLog(`Loan sharks operate in: ${sharkNames.join(', ')}. Travel there to repay or borrow.`, 'event-warning');
    addLog(`You arrived in ${CITIES[0].name}.`, 'event-info');

    setCurrentTab('all');
    showScreen('game-screen');
    updateUI();
    autoSave();
}

export function calcNetWorth() {
    let assetValue = 0;
    ASSETS.forEach(asset => {
        let avg = 0;
        CITIES.forEach((_, ci) => avg += state.prices[ci][asset.id]);
        assetValue += state.inventory[asset.id] * Math.round(avg / CITIES.length);
    });
    return state.cash + assetValue - state.debt;
}

export function calcAssetValue() {
    let v = 0;
    ASSETS.forEach(asset => { v += state.inventory[asset.id] * state.prices[state.currentCity][asset.id]; });
    return v;
}

export function usedStorage() {
    return Object.values(state.inventory).reduce((s, q) => s + q, 0);
}

export function freeStorage() {
    return state.maxStorage - usedStorage();
}

export function addLog(text, cls = '') {
    state.log.push({ day: state.day, text, cls });
    if (state.log.length > 60) state.log.shift();
}

export function autoSave() {
    if (state.gameOver) {
        try { localStorage.removeItem('silicon_hustle_save'); } catch {}
        return;
    }
    try {
        localStorage.setItem('silicon_hustle_save', JSON.stringify(state));
    } catch(e) {
        showToast('Warning: Could not save game! Storage may be full.', 'bad');
    }
}

export function loadSave() {
    try { return JSON.parse(localStorage.getItem('silicon_hustle_save')); } catch { return null; }
}

export function checkForResume() {
    const save = loadSave();
    if (save && !save.gameOver) {
        document.getElementById('resume-notice').style.display = 'block';
        document.getElementById('resume-day').textContent = save.day;
    } else {
        document.getElementById('resume-notice').style.display = 'none';
    }
}
