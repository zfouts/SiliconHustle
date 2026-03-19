import { ENCOUNTERS } from '../data/constants.js';
import { state, addLog, freeStorage } from './state.js';
import { AudioEngine } from './audio.js';
import { showModal, closeModals } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';

export function triggerEncounter() {
    const enc = ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)];

    document.getElementById('enc-icon').textContent = enc.icon;
    document.getElementById('enc-title').textContent = enc.title;
    document.getElementById('enc-text').textContent = enc.text;

    const choicesDiv = document.getElementById('enc-choices');
    choicesDiv.innerHTML = '';

    enc.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'enc-choice';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'enc-choice-label';
        labelDiv.textContent = choice.label;
        btn.appendChild(labelDiv);

        const riskDiv = document.createElement('div');
        riskDiv.className = 'enc-choice-risk';
        riskDiv.textContent = choice.risk;
        btn.appendChild(riskDiv);

        btn.addEventListener('click', () => resolveChoice(enc, i));
        choicesDiv.appendChild(btn);
    });

    showModal('encounter-modal');
}

function resolveChoice(encounter, choiceIndex) {
    const choice = encounter.choices[choiceIndex];
    const result = choice.execute(state, freeStorage);

    closeModals();

    const isGood = result.includes('+') || result.includes('reward') || result.includes('Score') || result.includes('profit') || result.includes('legit');
    AudioEngine.play(isGood ? 'event_good' : 'event_bad');
    showToast(result, isGood ? 'good' : 'bad');
    addLog(`${encounter.icon} ${result}`, isGood ? 'event-good' : 'event-bad');
}
