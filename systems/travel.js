import { ASSETS, CITIES } from '../data/constants.js';
import { state, addLog, autoSave } from './state.js';
import { AudioEngine } from './audio.js';
import { showModal, closeModals } from '../ui/screens.js';
import { checkAchievement } from './achievements.js';
import { hasPerk } from './perks.js';
import { advanceDay } from './day.js';
import { isLoanSharkCity } from './bank.js';

let isTraveling = false;

export function openTravel(updateUI, endGameFn) {
    if (isTraveling) return;
    AudioEngine.play('click');
    const container = document.getElementById('city-list');
    container.innerHTML = '';

    const heldAssets = ASSETS.filter(a => state.inventory[a.id] > 0);

    CITIES.forEach((city, i) => {
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
                        trendHints.push(`${asset.icon} ${trend > 0 ? '↑' : '↓'}`);
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

        // Show loan shark availability
        if (isLoanSharkCity(i)) {
            const sharkDiv = document.createElement('div');
            sharkDiv.className = 'city-vibe';
            sharkDiv.style.color = '#ff9100';
            sharkDiv.textContent = '\u2620 Loan shark available';
            inner.appendChild(sharkDiv);
        }

        div.appendChild(inner);

        if (i !== state.currentCity) {
            div.addEventListener('click', () => travelTo(i, updateUI, endGameFn));
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

    const transition = document.getElementById('travel-transition');
    document.getElementById('travel-text').textContent = `Traveling to ${CITIES[cityIndex].name}...`;
    transition.classList.add('active');

    setTimeout(() => {
        transition.classList.remove('active');
        isTraveling = false;

        state.currentCity = cityIndex;
        if (!state.citiesVisited.includes(cityIndex)) state.citiesVisited.push(cityIndex);
        if (state.citiesVisited.length >= CITIES.length) checkAchievement('globe_trotter');

        const freeFlight = hasPerk('fast_travel') && Math.random() < 0.5;
        if (!freeFlight) {
            advanceDay(endGameFn);
        } else {
            addLog('Private jet! No day lost.', 'event-good');
        }

        addLog(`Arrived in ${CITIES[cityIndex].name}.`, 'event-info');
        updateUI();
        autoSave();
    }, 800);
}
