import { ACHIEVEMENTS } from '../data/constants.js';
import { state } from './state.js';
import { AudioEngine } from './audio.js';
import { showScreen } from '../ui/screens.js';

export function getUnlockedAchievements() {
    try { return JSON.parse(localStorage.getItem('silicon_hustle_achievements') || '[]'); } catch { return []; }
}

function saveUnlockedAchievements(list) {
    try { localStorage.setItem('silicon_hustle_achievements', JSON.stringify(list)); } catch {}
}

export function checkAchievement(id) {
    if (state.achievementsEarned.includes(id)) return;
    state.achievementsEarned.push(id);

    const all = getUnlockedAchievements();
    if (!all.includes(id)) {
        all.push(id);
        saveUnlockedAchievements(all);
    }

    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;

    AudioEngine.play('achievement');

    const popup = document.getElementById('achievement-popup');
    document.getElementById('ach-popup-icon').textContent = ach.icon;
    document.getElementById('ach-popup-name').textContent = ach.name;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 3000);
}

export function showAchievements() {
    AudioEngine.play('click');
    const unlocked = getUnlockedAchievements();
    const listEl = document.getElementById('achievements-list');
    listEl.innerHTML = '';

    ACHIEVEMENTS.forEach(a => {
        const isUnlocked = unlocked.includes(a.id);
        const entry = document.createElement('div');
        entry.className = `ach-entry ${isUnlocked ? '' : 'locked'}`;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'ach-icon';
        iconSpan.textContent = a.icon;
        entry.appendChild(iconSpan);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'ach-info';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'ach-name';
        nameDiv.textContent = a.name;
        infoDiv.appendChild(nameDiv);
        const descDiv = document.createElement('div');
        descDiv.className = 'ach-desc';
        descDiv.textContent = a.desc;
        infoDiv.appendChild(descDiv);
        entry.appendChild(infoDiv);

        if (isUnlocked) {
            const checkSpan = document.createElement('span');
            checkSpan.className = 'ach-check';
            checkSpan.textContent = '\u2713';
            entry.appendChild(checkSpan);
        }

        listEl.appendChild(entry);
    });

    showScreen('achievements-screen');
}
