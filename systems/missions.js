import { ASSETS, MISSION_TEMPLATES } from '../data/constants.js';
import { state, addLog, autoSave, getGameCities } from './state.js';
import { AudioEngine } from './audio.js';
import { showToast } from '../ui/toast.js';
import { checkAchievement } from './achievements.js';

let missionIdCounter = 0;

export function syncMissionCounter() {
    if (state.activeMissions.length > 0) {
        missionIdCounter = Math.max(missionIdCounter, ...state.activeMissions.map(m => Number(m.id) || 0));
    }
}

export function generateMission() {
    const template = MISSION_TEMPLATES[Math.floor(Math.random() * MISSION_TEMPLATES.length)];
    const reward = Math.round(template.rewardBase * (0.8 + Math.random() * 0.6));
    const id = ++missionIdCounter;

    const mission = { id, type: template.type, reward, progress: 0, target: 0, desc: '', completed: false, failed: false, deadline: state.day + 8 + Math.floor(Math.random() * 7) };

    const randomAsset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
    const gameCities = getGameCities();
    const randomCityIdx = Math.floor(Math.random() * gameCities.length);
    const randomCity = gameCities[randomCityIdx];

    switch (template.type) {
        case 'deliver':
            mission.target = 3 + Math.floor(Math.random() * 8);
            mission.assetId = randomAsset.id;
            mission.cityIdx = randomCityIdx;
            mission.desc = `Deliver ${mission.target} ${randomAsset.name} to ${randomCity.name}`;
            break;
        case 'profit':
            mission.target = 2000 + Math.floor(Math.random() * 8000);
            mission.desc = `Earn $${mission.target.toLocaleString()} in total sell profit`;
            mission.snapshotProfit = state.totalProfit;
            break;
        case 'collect':
            mission.target = 4 + Math.floor(Math.random() * 4);
            mission.desc = `Own ${mission.target} different asset types at once`;
            break;
        case 'visit':
            mission.target = 3 + Math.floor(Math.random() * 4);
            mission.snapshotVisits = [...state.citiesVisited];
            mission.desc = `Visit ${mission.target} cities (from now)`;
            break;
        case 'trade':
            mission.target = 5 + Math.floor(Math.random() * 10);
            mission.snapshotTrades = state.totalTradesMade;
            mission.desc = `Complete ${mission.target} trades`;
            break;
        case 'hoard':
            mission.target = 5 + Math.floor(Math.random() * 15);
            mission.assetId = randomAsset.id;
            mission.desc = `Accumulate ${mission.target} units of ${randomAsset.name}`;
            break;
    }

    return mission;
}

export function offerMission() {
    if (state.activeMissions.length >= 2) return;
    if (Math.random() > 0.6) return; // 60% chance to get offered

    const mission = generateMission();
    state.activeMissions.push(mission);
    addLog(`New mission: ${mission.desc} (Reward: $${mission.reward.toLocaleString()})`, 'event-info');
    showToast(`New mission available!`, 'info');
}

export function checkMissionProgress() {
    state.activeMissions.forEach(m => {
        if (m.completed || m.failed) return;

        // Check deadline
        if (state.day > m.deadline) {
            m.failed = true;
            addLog(`Mission failed: ${m.desc}`, 'event-bad');
            return;
        }

        switch (m.type) {
            case 'deliver':
                if (state.currentCity === m.cityIdx && state.inventory[m.assetId] >= m.target) {
                    m.progress = m.target;
                    completeMission(m);
                } else {
                    m.progress = Math.min(state.inventory[m.assetId], m.target);
                }
                break;
            case 'profit':
                m.progress = state.totalProfit - (m.snapshotProfit || 0);
                if (m.progress >= m.target) completeMission(m);
                break;
            case 'collect': {
                const count = ASSETS.filter(a => state.inventory[a.id] > 0).length;
                m.progress = count;
                if (count >= m.target) completeMission(m);
                break;
            }
            case 'visit': {
                const newVisits = state.citiesVisited.filter(c => !(m.snapshotVisits || []).includes(c));
                m.progress = newVisits.length;
                if (newVisits.length >= m.target) completeMission(m);
                break;
            }
            case 'trade':
                m.progress = state.totalTradesMade - (m.snapshotTrades || 0);
                if (m.progress >= m.target) completeMission(m);
                break;
            case 'hoard':
                m.progress = state.inventory[m.assetId] || 0;
                if (m.progress >= m.target) completeMission(m);
                break;
        }
    });

    // Clean up completed/failed missions after a while
    state.activeMissions = state.activeMissions.filter(m => !m.failed);
}

function completeMission(m) {
    m.completed = true;
    state.cash += m.reward;
    state.completedMissionCount++;

    // Deduct delivered items for deliver missions (clamped to actual inventory)
    if (m.type === 'deliver') {
        const deduct = Math.min(m.target, state.inventory[m.assetId] || 0);
        state.inventory[m.assetId] = Math.max(0, (state.inventory[m.assetId] || 0) - deduct);
        if (state.inventory[m.assetId] === 0) {
            state.costBasis[m.assetId] = 0;
            state.holdingSince[m.assetId] = 0;
        }
    }

    AudioEngine.play('achievement');
    showToast(`Mission complete! +$${m.reward.toLocaleString()}`, 'good');
    addLog(`Mission complete: ${m.desc} (+$${m.reward.toLocaleString()})`, 'event-good');

    if (state.completedMissionCount >= 5) checkAchievement('mission_master');

    // Remove from active after showing briefly
    setTimeout(() => {
        state.activeMissions = state.activeMissions.filter(x => x.id !== m.id);
        autoSave();
    }, 2000);
}

export function renderMissions() {
    const list = document.getElementById('missions-list');
    list.innerHTML = '';

    if (state.activeMissions.length === 0) {
        const dim = document.createElement('span');
        dim.className = 'text-dim';
        dim.textContent = 'No active missions. Travel to find work.';
        list.appendChild(dim);
        return;
    }

    state.activeMissions.forEach(m => {
        const pct = Math.min(100, Math.max(0, m.target > 0 ? (m.progress / m.target) * 100 : 0));
        const daysLeft = (Number(m.deadline) || 0) - state.day;

        const item = document.createElement('div');
        item.className = `mission-item ${m.completed ? 'completed' : m.failed ? 'failed' : ''}`;

        const title = document.createElement('div');
        title.className = 'mission-title';
        title.textContent = (m.completed ? '\u2713 ' : '') + String(m.type || '').toUpperCase();
        item.appendChild(title);

        const desc = document.createElement('div');
        desc.className = 'mission-desc';
        desc.textContent = String(m.desc || '');
        item.appendChild(desc);

        const reward = document.createElement('div');
        reward.className = 'mission-reward';
        reward.textContent = `Reward: $${(Number(m.reward) || 0).toLocaleString()} | ${daysLeft > 0 ? daysLeft + ' days left' : 'EXPIRED'}`;
        item.appendChild(reward);

        const progress = document.createElement('div');
        progress.className = 'mission-progress';
        progress.textContent = `${Math.floor(Number(m.progress) || 0)}/${Number(m.target) || 0}`;
        item.appendChild(progress);

        const bar = document.createElement('div');
        bar.className = 'mission-progress-bar';
        const fill = document.createElement('div');
        fill.className = 'mission-progress-fill';
        fill.style.width = `${pct}%`;
        bar.appendChild(fill);
        item.appendChild(bar);

        list.appendChild(item);
    });
}
