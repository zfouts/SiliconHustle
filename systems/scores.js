import { AudioEngine } from './audio.js';
import { showScreen } from '../ui/screens.js';

export function getHighScores() {
    try {
        const raw = JSON.parse(localStorage.getItem('silicon_hustle_scores') || '[]');
        if (!Array.isArray(raw)) return [];
        return raw
            .filter(s => s && typeof s === 'object' && typeof s.name === 'string')
            .slice(0, 10)
            .map(s => ({
                name: String(s.name).substring(0, 32),
                score: Number(s.score) || 0,
                diff: String(s.diff || ''),
                date: String(s.date || ''),
            }));
    } catch { return []; }
}

export function saveHighScore(name, score, diff) {
    const scores = getHighScores();
    scores.push({ name, score, diff, date: new Date().toISOString().split('T')[0] });
    scores.sort((a, b) => b.score - a.score);
    try { localStorage.setItem('silicon_hustle_scores', JSON.stringify(scores.slice(0, 10))); } catch {}
}

export function isHighScore(score) {
    const s = getHighScores();
    return s.length < 10 || score > (s[s.length - 1]?.score ?? -Infinity);
}

export function showHighScores() {
    AudioEngine.play('click');
    const scores = getHighScores();
    const list = document.getElementById('scores-list');
    list.innerHTML = '';

    if (scores.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'score-empty';
        empty.textContent = 'No scores yet. Start hustling!';
        list.appendChild(empty);
    } else {
        scores.forEach((s, i) => {
            const entry = document.createElement('div');
            entry.className = 'score-entry';

            const rankSpan = document.createElement('span');
            rankSpan.className = 'score-rank';
            rankSpan.textContent = `#${i + 1}`;
            entry.appendChild(rankSpan);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'score-name';
            nameSpan.textContent = s.name;
            entry.appendChild(nameSpan);

            const valueSpan = document.createElement('span');
            valueSpan.className = 'score-value';
            valueSpan.textContent = `$${s.score.toLocaleString()}`;
            if (s.diff) {
                const diffSpan = document.createElement('span');
                diffSpan.className = 'score-diff';
                diffSpan.textContent = s.diff.toUpperCase();
                valueSpan.appendChild(diffSpan);
            }
            entry.appendChild(valueSpan);

            list.appendChild(entry);
        });
    }
    showScreen('scores-screen');
}
