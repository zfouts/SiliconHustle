import { state } from '../systems/state.js';

export function renderLog() {
    const logDiv = document.getElementById('event-log');
    logDiv.innerHTML = '';
    [...state.log].reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = `log-entry ${entry.cls || ''}`;
        const daySpan = document.createElement('span');
        daySpan.className = 'log-day';
        daySpan.textContent = `DAY ${Number(entry.day) || 0}`;
        div.appendChild(daySpan);
        div.appendChild(document.createTextNode(' ' + (entry.text || '')));
        logDiv.appendChild(div);
    });
}
