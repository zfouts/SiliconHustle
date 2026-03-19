import { ASSETS, CITIES, DIFFICULTY, ACHIEVEMENTS } from '../data/constants.js';
import { state, calcNetWorth, calcAssetValue, usedStorage, autoSave } from '../systems/state.js';
import { drawSparkline, drawFinalNetworthChart } from './charts.js';
import { renderMarketTable } from './market.js';
import { renderLog } from './log.js';
import { renderMissions } from '../systems/missions.js';
import { showScreen, closeModals } from './screens.js';
import { AudioEngine } from '../systems/audio.js';
import { isHighScore, saveHighScore } from '../systems/scores.js';
import { isLoanSharkCity } from '../systems/bank.js';
import { renderAIBot } from '../systems/aibot.js';
import { checkAchievement } from '../systems/achievements.js';

let prevHudValues = {};

function animateHudValue(elId, newText) {
    const el = document.getElementById(elId);
    if (!el) return;
    const old = prevHudValues[elId];
    if (old !== undefined && old !== newText) {
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
    }
    el.textContent = newText;
    prevHudValues[elId] = newText;
}

export function updateUI() {
    const nw = calcNetWorth();

    animateHudValue('hud-cash', `$${state.cash.toLocaleString()}`);
    animateHudValue('hud-debt', `$${state.debt.toLocaleString()}`);
    animateHudValue('hud-networth', `$${nw.toLocaleString()}`);

    document.getElementById('hud-debt').style.color = state.debt > 0 ? 'var(--red)' : 'var(--green)';
    document.getElementById('hud-networth').className = `hud-value ${nw >= 0 ? 'cash' : 'debt'}`;

    document.getElementById('hud-day').textContent = state.day;
    document.getElementById('hud-max-days').textContent = state.unlimited ? '\u221E' : state.maxDays;
    document.getElementById('hud-city').textContent = CITIES[state.currentCity].name;
    animateHudValue('hud-storage', `${usedStorage()}/${state.maxStorage}`);

    // Day progress bar
    const dayFill = document.getElementById('day-bar-fill');
    if (state.unlimited) {
        // In unlimited mode, bar pulses gently instead of filling
        dayFill.style.width = '100%';
        dayFill.className = 'day-bar-fill';
        dayFill.style.opacity = '0.3';
    } else {
        const dayPct = (state.day / state.maxDays) * 100;
        dayFill.style.width = dayPct + '%';
        dayFill.style.opacity = '';
        dayFill.className = `day-bar-fill${dayPct > 75 ? ' danger' : ''}`;
    }

    // Show/hide retire button based on unlimited mode
    const retireBtn = document.getElementById('retire-btn');
    if (retireBtn) retireBtn.style.display = state.unlimited ? '' : 'none';

    document.getElementById('heat-bar-fill').style.width = state.heat + '%';
    const hl = document.getElementById('hud-heat');
    if (state.heat >= 80) { hl.textContent = 'WANTED'; hl.className = 'hud-value heat-wanted'; }
    else if (state.heat >= 50) { hl.textContent = 'HOT'; hl.className = 'hud-value heat-hot'; }
    else if (state.heat >= 25) { hl.textContent = 'WARM'; hl.className = 'hud-value heat-warm'; }
    else { hl.textContent = 'COOL'; hl.className = 'hud-value heat-cool'; }

    const nwCanvas = document.getElementById('networth-spark');
    if (nwCanvas && state.networthHistory.length >= 2) {
        const d = state.networthHistory;
        drawSparkline(nwCanvas, d, d[d.length - 1] >= d[0] ? '#00e676' : '#ff1744');
    }

    // Update loan shark button — show availability based on current city
    const bankBtn = document.getElementById('bank-btn');
    const bankLabel = document.getElementById('bank-btn-label');
    if (bankBtn && bankLabel) {
        const hasShark = isLoanSharkCity();
        bankBtn.disabled = !hasShark;
        bankLabel.textContent = hasShark ? 'LOAN SHARK [L]' : 'NO LOAN SHARK HERE';
    }

    renderMarketTable();
    renderLog();
    renderMissions();
    renderAIBot();
}

export function endGame(reason) {
    if (reason === 'wipeout') {
        triggerWipeout();
        return;
    }

    state.gameOver = true;

    // End-of-game achievement checks
    const heldTypes = ASSETS.filter(a => state.inventory[a.id] > 0).length;
    if (heldTypes >= 8) checkAchievement('hodler');
    if (state.totalTradesMade >= 50) checkAchievement('degen');

    autoSave();
    AudioEngine.play('gameover');

    const assetValue = calcAssetValue();
    const netWorth = state.cash + assetValue - state.debt;
    const diff = DIFFICULTY[state.difficulty] || {};

    // Build gameover stats with DOM APIs
    const statsEl = document.getElementById('gameover-stats');
    statsEl.innerHTML = '';

    function addStatRow(parent, label, value, cls, color, style) {
        const row = document.createElement('div');
        row.className = 'stat-row';
        if (style) row.style.cssText = style;
        const lbl = document.createElement('span');
        lbl.className = 'stat-label';
        if (style) lbl.style.fontWeight = '700';
        lbl.textContent = label;
        const val = document.createElement('span');
        val.className = `stat-value ${cls}`;
        if (color) val.style.color = color;
        val.textContent = value;
        row.appendChild(lbl);
        row.appendChild(val);
        parent.appendChild(row);
    }

    const daysLabel = state.unlimited ? `${state.day} days played` : `${Number(state.maxDays) || 30} days`;
    addStatRow(statsEl, 'Difficulty', `${diff.label || 'CUSTOM'} (${daysLabel})`, '', diff.color || '');
    addStatRow(statsEl, 'Cash', `$${state.cash.toLocaleString()}`, 'positive', '');
    addStatRow(statsEl, 'Asset Value', `$${assetValue.toLocaleString()}`, 'positive', '');
    addStatRow(statsEl, 'Debt', `-$${state.debt.toLocaleString()}`, 'negative', '');
    addStatRow(statsEl, 'Trades', `${state.totalTradesMade}`, '', '');
    addStatRow(statsEl, 'Missions Done', `${state.completedMissionCount}`, '', '');
    addStatRow(statsEl, 'Profit', `$${state.totalProfit.toLocaleString()}`, 'positive', '');
    addStatRow(statsEl, 'Loss', `$${state.totalLoss.toLocaleString()}`, 'negative', '');
    addStatRow(statsEl, 'NET WORTH', `$${netWorth.toLocaleString()}`, netWorth >= 0 ? 'positive' : 'negative', '', 'border-top:2px solid var(--accent);margin-top:0.5rem;padding-top:0.5rem;');

    // Rank
    let rank, rankColor;
    if (netWorth >= 100000) { rank = 'SILICON VALLEY LEGEND'; rankColor = '#ffd700'; }
    else if (netWorth >= 50000) { rank = 'TECH MOGUL'; rankColor = '#00e5ff'; }
    else if (netWorth >= 25000) { rank = 'STARTUP FOUNDER'; rankColor = '#00e676'; }
    else if (netWorth >= 10000) { rank = 'CRYPTO BRO'; rankColor = '#d500f9'; }
    else if (netWorth >= 5000) { rank = 'JUNIOR DEV'; rankColor = '#ffea00'; }
    else if (netWorth >= 0) { rank = 'BROKE INTERN'; rankColor = '#ff9100'; }
    else { rank = 'BANKRUPT DEGEN'; rankColor = '#ff1744'; }

    const rankEl = document.getElementById('gameover-rank');
    rankEl.textContent = '';
    const rankSpan = document.createElement('span');
    rankSpan.style.color = rankColor;
    rankSpan.textContent = rank;
    rankEl.appendChild(rankSpan);
    rankEl.style.borderColor = rankColor;

    // Achievements earned this game
    const achDiv = document.getElementById('gameover-achievements');
    if (state.achievementsEarned.length > 0) {
        achDiv.style.display = 'block';
        achDiv.innerHTML = '';
        const header = document.createElement('div');
        header.style.cssText = 'color:var(--yellow);font-size:0.7rem;letter-spacing:0.1em;margin-bottom:0.3rem;';
        header.textContent = 'ACHIEVEMENTS EARNED';
        achDiv.appendChild(header);
        state.achievementsEarned.forEach(id => {
            const a = ACHIEVEMENTS.find(x => x.id === id);
            if (!a) return;
            const item = document.createElement('div');
            item.className = 'gameover-ach-item';
            item.textContent = `${a.icon} ${a.name}`;
            achDiv.appendChild(item);
        });
    } else { achDiv.style.display = 'none'; }

    const hsNotice = document.getElementById('gameover-highscore');
    const nameInput = document.getElementById('gameover-name');
    const saveBtn = document.getElementById('save-score-btn');

    if (isHighScore(netWorth)) {
        hsNotice.style.display = 'block';
        nameInput.style.display = 'block';
        saveBtn.style.display = 'inline-block';
        nameInput.value = '';
        saveBtn.onclick = () => {
            // Sanitize name: trim, remove control chars / HTML, cap length
            const rawName = nameInput.value.trim().replace(/[<>&"'/\\]/g, '').replace(/[\x00-\x1f\x7f]/g, '');
            saveHighScore((rawName || 'Anonymous').substring(0, 16), netWorth, state.difficulty);
            hsNotice.style.display = 'none';
            nameInput.style.display = 'none';
            saveBtn.style.display = 'none';
        };
    } else {
        hsNotice.style.display = 'none';
        nameInput.style.display = 'none';
        saveBtn.style.display = 'none';
    }

    setTimeout(drawFinalNetworthChart, 100);
    closeModals();
    showScreen('gameover-screen');
}

// Wipeout messages — the sad funny endings
const WIPEOUT_MESSAGES = [
    { icon: '🍔', msg: 'Time to try a new hustle. May I recommend delivering food?', sub: 'DoorDash is hiring. Flexible hours. No loan sharks.' },
    { icon: '🚗', msg: 'Maybe rideshare is more your speed.', sub: 'At least Uber doesn\'t charge 15% daily interest.' },
    { icon: '📦', msg: 'Have you considered a career in warehouse fulfillment?', sub: 'Amazon is always hiring. Benefits on day one. No feds.' },
    { icon: '☕', msg: 'Time to become a barista. At least the coffee is free.', sub: '"One venti caramel macchiato for... bankruptcy?"' },
    { icon: '🐕', msg: 'Dog walking pays surprisingly well these days.', sub: 'No SEC regulations. No rug pulls. Just good boys.' },
    { icon: '🎸', msg: 'Maybe follow your real passion. Start a SoundCloud.', sub: 'Your crypto losses could make great lyrics.' },
    { icon: '📚', msg: 'Time to go back to school.', sub: '"I\'d like to change my major from Crypto Twitter to Accounting."' },
    { icon: '🧹', msg: 'The janitor at your co-working space is hiring an assistant.', sub: 'Ironic? Yes. Stable income? Also yes.' },
    { icon: '🍕', msg: 'Pizza delivery is honest work.', sub: 'Unlike that Ponzi scheme you fell for on day 3.' },
    { icon: '🏠', msg: 'Time to move back in with your parents.', sub: '"It\'s just temporary, Mom. I\'m restructuring my portfolio."' },
    { icon: '💈', msg: 'Learn a trade. Barbers always have work.', sub: 'Nobody\'s cutting hair with a blockchain. Yet.' },
    { icon: '🎪', msg: 'The circus is hiring. You already have clown experience.', sub: 'Your trading history qualifies as performance art.' },
    { icon: '🌮', msg: 'Taco truck operator is a respected profession.', sub: 'Cash business. No margin calls. Only margins on tacos.' },
    { icon: '🧘', msg: 'Maybe it\'s time for a spiritual retreat.', sub: '"I lost everything in fake internet money and all I got was enlightenment."' },
    { icon: '🎮', msg: 'At least you\'re good at video games. Oh wait.', sub: 'You literally just lost at one.' },
];

export function triggerWipeout() {
    state.gameOver = true;
    checkAchievement('wiped_out');
    autoSave();
    AudioEngine.play('event_bad');

    const msg = WIPEOUT_MESSAGES[Math.floor(Math.random() * WIPEOUT_MESSAGES.length)];

    document.getElementById('wipeout-icon').textContent = msg.icon;
    document.getElementById('wipeout-message').textContent = msg.msg;
    document.getElementById('wipeout-suggestion').textContent = msg.sub;

    // Stats
    const statsEl = document.getElementById('wipeout-stats');
    statsEl.innerHTML = '';

    function addRow(label, value, cls) {
        const row = document.createElement('div');
        row.className = 'stat-row';
        const lbl = document.createElement('span');
        lbl.className = 'stat-label';
        lbl.textContent = label;
        const val = document.createElement('span');
        val.className = `stat-value ${cls || ''}`;
        val.textContent = value;
        row.appendChild(lbl);
        row.appendChild(val);
        statsEl.appendChild(row);
    }

    addRow('Survived', `${state.day} days`);
    addRow('Final Cash', '$0', 'negative');
    addRow('Final Debt', `$${state.debt.toLocaleString()}`, 'negative');
    addRow('Trades Made', `${state.totalTradesMade}`);
    addRow('Total Profit', `$${state.totalProfit.toLocaleString()}`, 'positive');
    addRow('Total Loss', `$${state.totalLoss.toLocaleString()}`, 'negative');
    addRow('Cause of Death', 'Bankruptcy', 'negative');

    // Show achievements if any were earned
    const achDiv = document.getElementById('wipeout-achievements');
    if (state.achievementsEarned.length > 0) {
        achDiv.style.display = 'block';
        achDiv.innerHTML = '';
        const header = document.createElement('div');
        header.style.cssText = 'color:var(--yellow);font-size:0.7rem;letter-spacing:0.1em;margin-bottom:0.3rem;';
        header.textContent = 'ACHIEVEMENTS EARNED';
        achDiv.appendChild(header);
        state.achievementsEarned.forEach(id => {
            const a = ACHIEVEMENTS.find(x => x.id === id);
            if (!a) return;
            const item = document.createElement('div');
            item.className = 'gameover-ach-item';
            item.textContent = `${a.icon} ${a.name}`;
            achDiv.appendChild(item);
        });
    } else { achDiv.style.display = 'none'; }

    closeModals();
    showScreen('wipeout-screen');
}
