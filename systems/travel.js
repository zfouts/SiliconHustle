import { ASSETS, TRAVEL_BASE_FARE, TRAVEL_KM_RATE, TRAVEL_SURGE_RANGE } from '../data/constants.js';
import { state, addLog, autoSave, getGameCities } from './state.js';
import { AudioEngine } from './audio.js';
import { showModal, closeModals } from '../ui/screens.js';
import { checkAchievement } from './achievements.js';
import { hasPerk } from './perks.js';
import { advanceDay } from './day.js';
import { isLoanSharkCity } from './bank.js';

let isTraveling = false;

// Great-circle distance in km between two [lat, lon] pairs (Haversine)
function haversineKm(a, b) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const s = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Deterministic daily surcharge so every destination shares the same "fuel price"
// for a given game-day, but it changes day to day.
function dailySurge() {
    // simple hash of day to get a stable -1..1 value
    const x = Math.sin(state.day * 9301 + 4927) * 49297;
    return (x - Math.floor(x)) * 2 - 1; // -1 .. 1
}

// Calculate the fare from the current city to destination index
export function getTravelFare(destIndex) {
    if (destIndex === state.currentCity) return 0;
    const cities = getGameCities();
    const from = cities[state.currentCity];
    const to   = cities[destIndex];
    if (!from?.coords || !to?.coords) return TRAVEL_BASE_FARE;
    const km   = haversineKm(from.coords, to.coords);
    const base = TRAVEL_BASE_FARE + km * TRAVEL_KM_RATE;
    const surge = 1 + dailySurge() * TRAVEL_SURGE_RANGE; // 0.70 .. 1.30
    return Math.max(TRAVEL_BASE_FARE, Math.round(base * surge));
}

export function openTravel(updateUI, endGameFn) {
    if (isTraveling) return;
    AudioEngine.play('click');
    const container = document.getElementById('city-list');
    container.innerHTML = '';

    const heldAssets = ASSETS.filter(a => state.inventory[a.id] > 0);

    const cities = getGameCities();
    cities.forEach((city, i) => {
        const div = document.createElement('div');
        div.className = `city-option${i === state.currentCity ? ' current' : ''}`;

        const inner = document.createElement('div');

        const nameDiv = document.createElement('div');
        nameDiv.className = 'city-name';
        nameDiv.textContent = city.name + (i === state.currentCity ? ' (HERE)' : '');
        inner.appendChild(nameDiv);

        const vibeDiv = document.createElement('div');
        vibeDiv.className = 'city-vibe';
        vibeDiv.textContent = city.vibe;
        inner.appendChild(vibeDiv);

        const specDiv = document.createElement('div');
        specDiv.className = 'city-specialty';
        specDiv.textContent = city.specialty;
        inner.appendChild(specDiv);

        // Best sell info
        const bestSells = [];
        heldAssets.forEach(asset => {
            const diff = state.prices[i][asset.id] - state.prices[state.currentCity][asset.id];
            if (diff > 0) bestSells.push(`${asset.icon} ${asset.name} +$${diff.toLocaleString()}/ea`);
        });
        if (bestSells.length > 0) {
            const sellDiv = document.createElement('div');
            sellDiv.className = 'city-best-sell';
            sellDiv.textContent = 'Sell: ' + bestSells.slice(0, 2).join(', ');
            inner.appendChild(sellDiv);
        }

        // Insider Info perk — show price trend prediction
        if (hasPerk('insider_info') && i !== state.currentCity) {
            const trendHints = [];
            ASSETS.slice(0, 5).forEach(asset => {
                const history = state.priceHistory[i]?.[asset.id] || [];
                if (history.length >= 3) {
                    const recent = history.slice(-3);
                    const trend = recent[2] - recent[0];
                    if (Math.abs(trend) > asset.basePrice * 0.1) {
                        trendHints.push(`${asset.icon} ${trend > 0 ? '\u2191' : '\u2193'}`);
                    }
                }
            });
            if (trendHints.length > 0) {
                const trendDiv = document.createElement('div');
                trendDiv.className = 'city-vibe';
                trendDiv.style.color = '#d500f9';
                trendDiv.textContent = 'Trends: ' + trendHints.join(' ');
                inner.appendChild(trendDiv);
            }
        }

        // Show contact indicator if this city has an active contact
        if (state.cityContacts?.[i] > 0) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'city-vibe';
            contactDiv.style.color = '#00e676';
            contactDiv.textContent = `\uD83E\uDD1D Contact: 10% buy discount (${state.cityContacts[i]}d left)`;
            inner.appendChild(contactDiv);
        }

        // Show rumor indicator if this city has an active rumor
        if (state.activeRumor && state.activeRumor.cityIndex === i) {
            const rumorAsset = ASSETS.find(a => a.id === state.activeRumor.assetId);
            const rumorDiv = document.createElement('div');
            rumorDiv.className = 'city-vibe';
            rumorDiv.style.color = state.activeRumor.type === 'spike' ? '#00e676' : '#ff1744';
            rumorDiv.textContent = `\uD83D\uDCCA Rumor: ${rumorAsset?.name || '???'} may ${state.activeRumor.type === 'spike' ? 'surge' : 'crash'} here`;
            inner.appendChild(rumorDiv);
        }

        // Show smuggling route indicator
        const hasSmuggleRoute = (state.smugglingRoutes || []).some(r =>
            (r[0] === state.currentCity && r[1] === i) || (r[0] === i && r[1] === state.currentCity)
        );
        if (hasSmuggleRoute && i !== state.currentCity) {
            const routeDiv = document.createElement('div');
            routeDiv.className = 'city-vibe';
            routeDiv.style.color = '#d500f9';
            routeDiv.textContent = '\uD83D\uDEE4\uFE0F Smuggling route — heat reduced on arrival';
            inner.appendChild(routeDiv);
        }

        // Show flash event
        if (state.flashEvent && state.flashEvent.cityIndex === i) {
            const flashLabels = { sale: 'FLASH SALE -25%', boom: 'TECH BOOM +30%', crackdown: 'CRACKDOWN' };
            const flashColors = { sale: '#00e676', boom: '#ffea00', crackdown: '#ff1744' };
            const flashDiv = document.createElement('div');
            flashDiv.className = 'city-vibe';
            flashDiv.style.cssText = `color:${flashColors[state.flashEvent.type]};font-weight:700`;
            flashDiv.textContent = flashLabels[state.flashEvent.type];
            inner.appendChild(flashDiv);
        }

        // Show rival trader location
        if (state.rival && state.rival.city === i) {
            const rivalDiv = document.createElement('div');
            rivalDiv.className = 'city-vibe';
            rivalDiv.style.color = '#ff9100';
            rivalDiv.textContent = `\uD83D\uDC64 ${state.rival.name} is here`;
            inner.appendChild(rivalDiv);
        }

        // Show loan shark availability
        if (isLoanSharkCity(i)) {
            const sharkDiv = document.createElement('div');
            sharkDiv.className = 'city-vibe';
            sharkDiv.style.color = '#ff9100';
            sharkDiv.textContent = '\u2620 Loan shark available';
            inner.appendChild(sharkDiv);
        }

        // Show dynamic travel fare
        if (i !== state.currentCity) {
            const fare = getTravelFare(i);
            const km = Math.round(haversineKm(cities[state.currentCity].coords, city.coords));
            const costDiv = document.createElement('div');
            costDiv.className = 'city-vibe';
            const jetNote = hasPerk('fast_travel') ? ' (50% free)' : '';
            costDiv.textContent = `\u2708 $${fare.toLocaleString()}${jetNote} \u00B7 ${km.toLocaleString()} km`;
            costDiv.style.color = state.cash < fare ? '#ff1744' : '#8888a0';
            inner.appendChild(costDiv);
        }

        div.appendChild(inner);

        if (i !== state.currentCity) {
            const fare = getTravelFare(i);
            if (state.cash < fare) {
                div.classList.add('disabled');
                div.style.opacity = '0.5';
                div.style.pointerEvents = 'none';
            } else {
                div.addEventListener('click', () => travelTo(i, updateUI, endGameFn));
            }
        }
        container.appendChild(div);
    });
    showModal('travel-modal');
}

function travelTo(cityIndex, updateUI, endGameFn) {
    if (isTraveling) return;
    isTraveling = true;
    closeModals();
    AudioEngine.play('travel');

    // Lock in fare before the transition (so day doesn't change the surge mid-flight)
    const fare = getTravelFare(cityIndex);

    const transition = document.getElementById('travel-transition');
    document.getElementById('travel-text').textContent = `Traveling to ${getGameCities()[cityIndex].name}...`;
    transition.classList.add('active');

    setTimeout(() => {
        transition.classList.remove('active');
        isTraveling = false;

        const previousCity = state.currentCity;
        state.currentCity = cityIndex;
        const isFirstVisit = !state.citiesVisited.includes(cityIndex);
        if (isFirstVisit) state.citiesVisited.push(cityIndex);
        if (state.citiesVisited.length >= 5) checkAchievement('explorer');
        if (state.citiesVisited.length >= getGameCities().length) checkAchievement('globe_trotter');

        // Smuggling route bonus: halve heat decay if on a smuggling route
        const fromCity = state.currentCity; // already updated above, but we saved old one... actually no.
        // We need the previous city. Let me check — currentCity was already changed. Use the closure.
        const isSmuggleRoute = (state.smugglingRoutes || []).some(r =>
            (r[0] === previousCity && r[1] === cityIndex) || (r[0] === cityIndex && r[1] === previousCity)
        );
        if (isSmuggleRoute) {
            if (state.heat > 0) {
                const heatReduction = Math.floor(state.heat * 0.3);
                state.heat = Math.max(0, state.heat - heatReduction);
                addLog(`Smuggling route! -${heatReduction} heat from underground connections.`, 'event-good');
            }
            state.smuggleCount = (state.smuggleCount || 0) + 1;
            if (state.smuggleCount >= 3) checkAchievement('smuggler');
        }

        // City contact chance: 15% chance to make a contact when arriving
        if (Math.random() < 0.15 && !(state.cityContacts?.[cityIndex] > 0)) {
            if (!state.cityContacts) state.cityContacts = {};
            state.cityContacts[cityIndex] = 4 + Math.floor(Math.random() * 4); // 4-7 days
            addLog(`You made a local contact! 10% buy discount here for ${state.cityContacts[cityIndex]} days.`, 'event-good');
        }

        // Explorer bonus: first time visiting a city
        if (isFirstVisit) {
            const bonus = 200 + Math.floor(Math.random() * 600);
            state.cash += bonus;
            addLog(`New city discovered! Explorer bonus: +$${bonus.toLocaleString()}`, 'event-good');
        }

        const freeFlight = hasPerk('fast_travel') && Math.random() < 0.5;
        if (freeFlight) {
            addLog('Private jet! Free flight, no airfare cost.', 'event-good');
        } else {
            state.cash = Math.max(0, state.cash - fare);
        }
        // Always advance the day when traveling (free flight only saves the fare)
        advanceDay(endGameFn);

        addLog(`Arrived in ${getGameCities()[cityIndex].name}. (-$${freeFlight ? '0' : fare.toLocaleString()})`, 'event-info');
        updateUI();
        autoSave();
    }, 800);
}
