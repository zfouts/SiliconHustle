import { ASSETS, ALL_CITIES, FIXED_CITY_IDS, GAME_CITY_COUNT, DIFFICULTY, STARTING_STORAGE, ACHIEVEMENTS } from '../data/constants.js';
import { generatePrice } from './prices.js';
import { showScreen } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { syncMissionCounter } from './missions.js';

// Central mutable game state — other modules import and read/write directly
export const state = {
    cash: 0, debt: 0, interestRate: 0.1, maxDays: 30,
    day: 1, currentCity: 0, maxStorage: STARTING_STORAGE, heat: 0,
    difficulty: 'normal',
    gameCities: [],
    inventory: {}, costBasis: {}, holdingSince: {},
    prices: {}, priceHistory: {}, supplyDemand: {},
    networthHistory: [],
    citiesVisited: [],
    totalTradesMade: 0, totalProfit: 0, totalLoss: 0,
    survivedRaid: false, muggingImmunity: 0,
    achievementsEarned: [],
    perks: [],
    activeMissions: [], completedMissionCount: 0,
    tradeStreak: 0, bestStreak: 0,
    marketCycle: 'neutral', cycleDaysLeft: 0,
    bullProfits: 0,
    volatileAssets: {},
    activeRumor: null,
    rumorsActedOn: 0,
    bountyDays: 0,
    bountiesCollected: 0,
    dividendsEarned: 0,
    luckyTrades: 0,
    manipulationsCount: 0,
    smuggleCount: 0,
    hasInsurance: false,
    cityContacts: {},
    rival: null,
    smugglingRoutes: [],
    flashEvent: null,
    log: [],
    gameOver: false,
};

// Returns the active city objects for the current game (subset of ALL_CITIES)
export function getGameCities() {
    if (!state.gameCities || state.gameCities.length === 0) {
        // Fallback: use first GAME_CITY_COUNT cities from ALL_CITIES
        return ALL_CITIES.slice(0, GAME_CITY_COUNT);
    }
    return state.gameCities.map(i => ALL_CITIES[i]).filter(Boolean);
}

export let currentTab = 'all';
export function setCurrentTab(tab) { currentTab = tab; }

export let selectedDifficulty = 'normal';
export function setSelectedDifficulty(d) { selectedDifficulty = d; }

function validateSave(s) {
    // Only allow known keys with expected types to prevent injection
    const numFields = ['cash','debt','interestRate','maxDays','day','currentCity','maxStorage','heat',
                       'totalTradesMade','totalProfit','totalLoss','completedMissionCount','muggingImmunity','lossSellCount',
                       'tradeStreak','bestStreak','cycleDaysLeft','bullProfits','rumorsActedOn',
                       'bountyDays','bountiesCollected','dividendsEarned','luckyTrades','manipulationsCount','smuggleCount'];
    const strFields = ['difficulty','marketCycle'];
    const boolFields = ['survivedRaid','gameOver','unlimited','hasInsurance'];
    const arrFields = ['networthHistory','citiesVisited','achievementsEarned','perks','activeMissions','loanSharkCities','gameCities','smugglingRoutes','log'];
    const objFields = ['inventory','costBasis','holdingSince','prices','priceHistory','supplyDemand','volatileAssets','cityContacts'];
    // activeRumor is validated separately (nullable object)

    if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
    // Validate types and reject NaN/Infinity for numerics
    for (const k of numFields) { if (k in s && (typeof s[k] !== 'number' || !Number.isFinite(s[k]))) return false; }
    for (const k of strFields) { if (k in s && typeof s[k] !== 'string') return false; }
    for (const k of boolFields) { if (k in s && typeof s[k] !== 'boolean') return false; }
    for (const k of arrFields) { if (k in s && !Array.isArray(s[k])) return false; }
    for (const k of objFields) { if (k in s && (typeof s[k] !== 'object' || Array.isArray(s[k]) || s[k] === null)) return false; }

    // Validate difficulty is a known value
    if (s.difficulty && !DIFFICULTY[s.difficulty]) return false;
    // Validate marketCycle is a known value
    if (s.marketCycle && !['bull','bear','neutral'].includes(s.marketCycle)) s.marketCycle = 'neutral';

    // Validate gameCities: must be valid indices into ALL_CITIES
    if (Array.isArray(s.gameCities)) {
        s.gameCities = s.gameCities.filter(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < ALL_CITIES.length).slice(0, GAME_CITY_COUNT);
    }
    // Backward compat: old saves won't have gameCities — default to original 8 cities
    if (!Array.isArray(s.gameCities) || s.gameCities.length === 0) {
        s.gameCities = Array.from({ length: Math.min(GAME_CITY_COUNT, ALL_CITIES.length) }, (_, i) => i);
    }
    const cityCount = s.gameCities.length;

    // Range checks on critical numeric fields
    if (typeof s.currentCity === 'number' && (s.currentCity < 0 || s.currentCity >= cityCount)) return false;
    if (typeof s.day === 'number' && (s.day < 1 || s.day > 999)) return false;
    if (typeof s.maxDays === 'number' && (s.maxDays < 0 || s.maxDays > 999)) return false; // 0 = unlimited
    if (typeof s.heat === 'number') s.heat = Math.max(0, Math.min(100, s.heat));
    if (typeof s.maxStorage === 'number') s.maxStorage = Math.max(1, Math.min(10000, s.maxStorage));

    // Range bounds on financial / counter fields to prevent overflow and cheating
    if (typeof s.cash === 'number') s.cash = Math.max(0, Math.min(100_000_000, s.cash));
    if (typeof s.debt === 'number') s.debt = Math.max(0, Math.min(10_000_000, s.debt));
    if (typeof s.interestRate === 'number') s.interestRate = Math.max(0, Math.min(1, s.interestRate));
    if (typeof s.totalProfit === 'number') s.totalProfit = Math.max(0, Math.min(100_000_000, s.totalProfit));
    if (typeof s.totalLoss === 'number') s.totalLoss = Math.max(0, Math.min(100_000_000, s.totalLoss));
    if (typeof s.totalTradesMade === 'number') s.totalTradesMade = Math.max(0, Math.min(100_000, s.totalTradesMade));
    if (typeof s.completedMissionCount === 'number') s.completedMissionCount = Math.max(0, Math.min(1000, s.completedMissionCount));
    if (typeof s.muggingImmunity === 'number') s.muggingImmunity = Math.max(0, Math.min(100, s.muggingImmunity));
    if (typeof s.lossSellCount === 'number') s.lossSellCount = Math.max(0, Math.min(100_000, s.lossSellCount));
    if (typeof s.tradeStreak === 'number') s.tradeStreak = Math.max(0, Math.min(1000, s.tradeStreak));
    if (typeof s.bestStreak === 'number') s.bestStreak = Math.max(0, Math.min(1000, s.bestStreak));
    if (typeof s.cycleDaysLeft === 'number') s.cycleDaysLeft = Math.max(0, Math.min(30, s.cycleDaysLeft));
    if (typeof s.bullProfits === 'number') s.bullProfits = Math.max(0, Math.min(100_000_000, s.bullProfits));
    if (typeof s.rumorsActedOn === 'number') s.rumorsActedOn = Math.max(0, Math.min(1000, s.rumorsActedOn));
    if (typeof s.bountyDays === 'number') s.bountyDays = Math.max(0, Math.min(100, s.bountyDays));
    if (typeof s.bountiesCollected === 'number') s.bountiesCollected = Math.max(0, Math.min(1000, s.bountiesCollected));
    if (typeof s.dividendsEarned === 'number') s.dividendsEarned = Math.max(0, Math.min(100_000_000, s.dividendsEarned));
    if (typeof s.luckyTrades === 'number') s.luckyTrades = Math.max(0, Math.min(100_000, s.luckyTrades));
    if (typeof s.manipulationsCount === 'number') s.manipulationsCount = Math.max(0, Math.min(100_000, s.manipulationsCount));
    if (typeof s.smuggleCount === 'number') s.smuggleCount = Math.max(0, Math.min(100_000, s.smuggleCount));

    // Validate cityContacts: keys should be valid game city indices, values should be positive integers (days remaining)
    if (s.cityContacts && typeof s.cityContacts === 'object') {
        for (const key of Object.keys(s.cityContacts)) {
            const v = s.cityContacts[key];
            if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) delete s.cityContacts[key];
            else s.cityContacts[key] = Math.min(30, Math.floor(v));
        }
    }

    // Validate volatileAssets: keys should be valid asset IDs, values should be positive integers
    if (s.volatileAssets && typeof s.volatileAssets === 'object') {
        const validAssetIds = ASSETS.map(a => a.id);
        for (const key of Object.keys(s.volatileAssets)) {
            if (!validAssetIds.includes(key)) { delete s.volatileAssets[key]; continue; }
            const v = s.volatileAssets[key];
            if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) delete s.volatileAssets[key];
            else s.volatileAssets[key] = Math.min(30, Math.floor(v));
        }
    }

    // Validate activeRumor: must be null or a valid rumor object
    if (s.activeRumor !== null && s.activeRumor !== undefined) {
        if (typeof s.activeRumor !== 'object' || Array.isArray(s.activeRumor)) { s.activeRumor = null; }
        else {
            const r = s.activeRumor;
            const validAssetIds = ASSETS.map(a => a.id);
            if (!validAssetIds.includes(r.assetId) || typeof r.cityIndex !== 'number' ||
                r.cityIndex < 0 || r.cityIndex >= cityCount ||
                !['spike','crash'].includes(r.type) ||
                typeof r.fireDay !== 'number' || !Number.isFinite(r.fireDay)) {
                s.activeRumor = null;
            }
        }
    }

    // Validate smugglingRoutes: array of [a, b] pairs with valid city indices
    if (Array.isArray(s.smugglingRoutes)) {
        s.smugglingRoutes = s.smugglingRoutes
            .filter(r => Array.isArray(r) && r.length === 2 && r.every(v => typeof v === 'number' && v >= 0 && v < cityCount))
            .slice(0, 5);
    }

    // Validate rival: nullable object with city and cash
    if (s.rival !== null && s.rival !== undefined) {
        if (typeof s.rival !== 'object' || Array.isArray(s.rival)) { s.rival = null; }
        else {
            if (typeof s.rival.city !== 'number' || s.rival.city < 0 || s.rival.city >= cityCount) s.rival = null;
            else {
                s.rival.cash = Math.max(0, Math.min(10_000_000, Number(s.rival.cash) || 0));
                s.rival.name = String(s.rival.name || 'ShadowTrader').replace(/<[^>]*>/g, '').substring(0, 20);
            }
        }
    }

    // Validate flashEvent: nullable object
    if (s.flashEvent !== null && s.flashEvent !== undefined) {
        if (typeof s.flashEvent !== 'object' || Array.isArray(s.flashEvent)) { s.flashEvent = null; }
        else {
            if (typeof s.flashEvent.cityIndex !== 'number' || s.flashEvent.cityIndex < 0 || s.flashEvent.cityIndex >= cityCount ||
                !['sale', 'boom', 'crackdown'].includes(s.flashEvent.type)) {
                s.flashEvent = null;
            }
        }
    }

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

    // Deep validation: priceHistory must be nested objects with arrays of bounded numbers
    if (s.priceHistory && typeof s.priceHistory === 'object') {
        for (const ci of Object.keys(s.priceHistory)) {
            if (typeof s.priceHistory[ci] !== 'object' || s.priceHistory[ci] === null) { s.priceHistory[ci] = {}; continue; }
            for (const aid of Object.keys(s.priceHistory[ci])) {
                const arr = s.priceHistory[ci][aid];
                if (!Array.isArray(arr)) { s.priceHistory[ci][aid] = []; continue; }
                s.priceHistory[ci][aid] = arr
                    .filter(v => typeof v === 'number' && Number.isFinite(v) && v >= 1)
                    .map(v => Math.min(300_000, Math.round(v)))
                    .slice(-90);
            }
        }
    }

    // Deep validation: supplyDemand must be nested objects with bounded finite numbers
    if (s.supplyDemand && typeof s.supplyDemand === 'object') {
        for (const ci of Object.keys(s.supplyDemand)) {
            if (typeof s.supplyDemand[ci] !== 'object' || s.supplyDemand[ci] === null) { s.supplyDemand[ci] = {}; continue; }
            for (const aid of Object.keys(s.supplyDemand[ci])) {
                const v = s.supplyDemand[ci][aid];
                if (typeof v !== 'number' || !Number.isFinite(v)) s.supplyDemand[ci][aid] = 0;
                else s.supplyDemand[ci][aid] = Math.max(-1000, Math.min(1000, v));
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

    // Validate citiesVisited are valid game city indices
    if (Array.isArray(s.citiesVisited)) {
        s.citiesVisited = s.citiesVisited.filter(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < cityCount);
    }

    // Validate loanSharkCities are valid game city indices
    if (Array.isArray(s.loanSharkCities)) {
        s.loanSharkCities = s.loanSharkCities.filter(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < cityCount).slice(0, 4);
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
    const allowedKeys = new Set([...numFields, ...strFields, ...boolFields, ...arrFields, ...objFields, 'activeRumor', 'rival', 'flashEvent']);
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

    // Select cities for this game: fixed cities + random from pool
    const fixedIndices = FIXED_CITY_IDS.map(id => ALL_CITIES.findIndex(c => c.id === id)).filter(i => i >= 0);
    const poolIndices = ALL_CITIES.map((_, i) => i).filter(i => !fixedIndices.includes(i));
    // Shuffle pool with Fisher-Yates
    for (let i = poolIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [poolIndices[i], poolIndices[j]] = [poolIndices[j], poolIndices[i]];
    }
    const randomCount = GAME_CITY_COUNT - fixedIndices.length;
    const selectedCities = [...fixedIndices, ...poolIndices.slice(0, randomCount)];

    Object.assign(state, {
        difficulty: selectedDifficulty,
        cash: diff.cash,
        debt: diff.debt,
        interestRate: diff.interest,
        maxDays: customDays,
        unlimited: isUnlimited,
        day: 1,
        currentCity: 0,
        gameCities: selectedCities,
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
        tradeStreak: 0,
        bestStreak: 0,
        marketCycle: 'neutral',
        cycleDaysLeft: 3 + Math.floor(Math.random() * 3),
        bullProfits: 0,
        volatileAssets: {},
        activeRumor: null,
        rumorsActedOn: 0,
        bountyDays: 0,
        bountiesCollected: 0,
        dividendsEarned: 0,
        luckyTrades: 0,
        manipulationsCount: 0,
        smuggleCount: 0,
        hasInsurance: false,
        cityContacts: {},
        rival: { city: 1, cash: 3000, name: 'ShadowTrader' },
        smugglingRoutes: [],
        flashEvent: null,
        loanSharkCities: [],
        log: [],
        gameOver: false,
    });

    const gameCities = getGameCities();

    // Randomly pick 2-3 game-city indices that have loan sharks this game
    const gameCityIndices = Array.from({ length: gameCities.length }, (_, i) => i);
    for (let i = gameCityIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameCityIndices[i], gameCityIndices[j]] = [gameCityIndices[j], gameCityIndices[i]];
    }
    state.loanSharkCities = gameCityIndices.slice(0, 2 + Math.floor(Math.random() * 2));

    // Generate 3 random smuggling routes between city pairs
    const routePairs = [];
    const routeAttempts = gameCities.length * 2;
    for (let attempt = 0; attempt < routeAttempts && routePairs.length < 3; attempt++) {
        const a = Math.floor(Math.random() * gameCities.length);
        const b = Math.floor(Math.random() * gameCities.length);
        if (a !== b && !routePairs.some(r => (r[0] === a && r[1] === b) || (r[0] === b && r[1] === a))) {
            routePairs.push([a, b]);
        }
    }
    state.smugglingRoutes = routePairs;

    // Initialize rival trader
    state.rival = { city: 1 + Math.floor(Math.random() * (gameCities.length - 1)), cash: 3000, name: 'ShadowTrader' };

    ASSETS.forEach(a => {
        state.inventory[a.id] = 0;
        state.costBasis[a.id] = 0;
        state.holdingSince[a.id] = 0;
    });

    gameCities.forEach((city, ci) => {
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
    const sharkNames = state.loanSharkCities.map(i => gameCities[i]?.name).filter(Boolean);
    addLog(`Loan sharks operate in: ${sharkNames.join(', ')}. Travel there to repay or borrow.`, 'event-warning');
    addLog(`You arrived in ${gameCities[0].name}.`, 'event-info');

    setCurrentTab('all');
    showScreen('game-screen');
    updateUI();
    autoSave();
}

export function calcNetWorth() {
    const cities = getGameCities();
    if (cities.length === 0) return state.cash - state.debt;
    let assetValue = 0;
    ASSETS.forEach(asset => {
        let avg = 0;
        cities.forEach((_, ci) => avg += state.prices[ci]?.[asset.id] || 0);
        assetValue += state.inventory[asset.id] * Math.round(avg / cities.length);
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
