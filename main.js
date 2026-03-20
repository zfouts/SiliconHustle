// ===== SILICON HUSTLE — Main Entry Point =====

import { DIFFICULTY } from './data/constants.js';
import { AudioEngine } from './systems/audio.js';
import { state, initGame, loadSave, checkForResume, setSelectedDifficulty, setCurrentTab, freeStorage } from './systems/state.js';
import { openTravel } from './systems/travel.js';
import { openBank, repayDebt, repayAll, borrowCash, upgradeStorage } from './systems/bank.js';
import { openBuy, openSell, executeTrade, updateTradeTotal, dumpAll, currentTrade, getEffectivePrice } from './systems/trading.js';
import { openManipulate } from './systems/manipulation.js';
import { showAchievements } from './systems/achievements.js';
import { showHighScores } from './systems/scores.js';
import { openPerks } from './systems/perks.js';
import { showScreen, showModal, closeModals } from './ui/screens.js';
import { initMatrixRain, stopMatrixRain, startMatrixRain } from './ui/matrix.js';
import { updateUI, endGame } from './ui/hud.js';
import { openAssetDetail } from './ui/market.js';
import { renderLeaderboardModal } from './systems/leaderboard.js';
import { advanceDay } from './systems/day.js';
import { addLog, autoSave } from './systems/state.js';

let selectedDifficulty = 'normal';

const UNLIMITED_VALUE = 65; // slider max — the "unlimited" position

function isUnlimitedMode() {
    return parseInt(document.getElementById('days-slider')?.value) >= UNLIMITED_VALUE;
}

function syncSliderToDifficulty() {
    const diff = DIFFICULTY[selectedDifficulty];
    const slider = document.getElementById('days-slider');
    if (slider) slider.value = diff.days;
    updateSetupSummary();
}

function updateSetupSummary() {
    const diff = DIFFICULTY[selectedDifficulty];
    const slider = document.getElementById('days-slider');
    const daysLabel = document.getElementById('days-value');
    const unlimited = isUnlimitedMode();

    if (unlimited) {
        if (daysLabel) { daysLabel.textContent = '\u221E UNLIMITED'; daysLabel.classList.add('unlimited'); }
    } else {
        const days = slider?.value || diff.days;
        if (daysLabel) { daysLabel.textContent = `${days} DAYS`; daysLabel.classList.remove('unlimited'); }
    }

    const daysText = unlimited ? '\u221E unlimited' : `${slider?.value || diff.days} days`;
    document.getElementById('setup-summary').textContent =
        `$${diff.cash.toLocaleString()} cash | $${diff.debt.toLocaleString()} debt | ${(diff.interest * 100)}% interest/day | ${daysText}`;
}

document.addEventListener('DOMContentLoaded', () => {
    let audioInit = false;
    document.addEventListener('click', () => { if (!audioInit) { AudioEngine.init(); audioInit = true; } }, { once: true });

    initMatrixRain();
    checkForResume();
    syncSliderToDifficulty();

    // Difficulty buttons — also sync slider to difficulty default
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDifficulty = btn.dataset.diff;
            setSelectedDifficulty(selectedDifficulty);
            syncSliderToDifficulty();
        });
    });

    // Days slider (rightmost position = unlimited)
    document.getElementById('days-slider')?.addEventListener('input', updateSetupSummary);

    // Start
    document.getElementById('start-btn').addEventListener('click', () => {
        AudioEngine.init(); audioInit = true;
        setSelectedDifficulty(selectedDifficulty);
        try { localStorage.removeItem('silicon_hustle_save'); } catch {}
        stopMatrixRain();
        initGame(null, updateUI, isUnlimitedMode());
    });

    // Resume
    document.getElementById('resume-btn').addEventListener('click', () => {
        AudioEngine.init(); audioInit = true;
        const save = loadSave();
        if (save) { stopMatrixRain(); initGame(save, updateUI); }
    });

    // Navigation
    document.getElementById('help-btn').addEventListener('click', () => showScreen('help-screen'));
    document.getElementById('help-back-btn').addEventListener('click', () => showScreen('title-screen'));
    document.getElementById('scores-btn').addEventListener('click', showHighScores);
    document.getElementById('scores-back-btn').addEventListener('click', () => showScreen('title-screen'));
    document.getElementById('achievements-btn').addEventListener('click', showAchievements);
    document.getElementById('achievements-back-btn').addEventListener('click', () => showScreen('title-screen'));
    document.getElementById('leaderboard-btn')?.addEventListener('click', () => {
        const container = document.getElementById('leaderboard-content');
        if (container) renderLeaderboardModal(container, (msg, type) => {
            import('./ui/toast.js').then(m => m.showToast(msg, type));
        });
        showModal('leaderboard-modal');
    });
    document.getElementById('restart-btn').addEventListener('click', () => { checkForResume(); startMatrixRain(); showScreen('title-screen'); });
    document.getElementById('wipeout-restart-btn')?.addEventListener('click', () => { checkForResume(); startMatrixRain(); showScreen('title-screen'); });

    // Game actions
    document.getElementById('travel-btn').addEventListener('click', () => openTravel(updateUI, endGame));
    document.getElementById('wait-btn').addEventListener('click', () => {
        addLog('You lay low for the day.', 'event-info');
        advanceDay(endGame);
        updateUI();
        autoSave();
    });
    document.getElementById('bank-btn').addEventListener('click', openBank);
    document.getElementById('perks-btn').addEventListener('click', openPerks);
    document.getElementById('upgrade-btn').addEventListener('click', () => upgradeStorage(updateUI));
    document.getElementById('manipulate-btn').addEventListener('click', () => openManipulate(updateUI));
    document.getElementById('insure-btn').addEventListener('click', () => {
        if (state.hasInsurance) { import('./ui/toast.js').then(m => m.showToast('Already insured!', 'info')); return; }
        const totalQty = Math.max(0, Object.values(state.inventory).reduce((s, q) => s + Math.max(0, q), 0));
        const cost = Math.min(50000, 1000 + Math.floor(totalQty * 20));
        if (state.cash < cost) { import('./ui/toast.js').then(m => m.showToast(`Insurance costs $${cost.toLocaleString()}. Not enough cash.`, 'bad')); return; }
        state.cash -= cost;
        state.hasInsurance = true;
        import('./systems/audio.js').then(m => m.AudioEngine.play('buy'));
        import('./ui/toast.js').then(m => m.showToast(`Insured! Next raid blocked. -$${cost.toLocaleString()}`, 'good'));
        addLog(`Bought cargo insurance for $${cost.toLocaleString()}. Next raid will be blocked.`, 'event-good');
        updateUI();
        autoSave();
    });
    document.getElementById('stash-btn').addEventListener('click', () => dumpAll(updateUI));
    document.getElementById('retire-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to retire and end the game?')) {
            endGame();
        }
    });

    // Bank
    document.getElementById('repay-btn').addEventListener('click', () => repayDebt(updateUI));
    document.getElementById('repay-all-btn').addEventListener('click', () => repayAll(updateUI));
    document.getElementById('borrow-btn').addEventListener('click', () => borrowCash(updateUI));

    // Trade
    document.getElementById('trade-confirm').addEventListener('click', () => executeTrade(updateUI));
    document.getElementById('trade-amount').addEventListener('input', updateTradeTotal);

    // Trade presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentTrade.assetId) return;
            const pct = parseInt(btn.dataset.pct);
            const price = getEffectivePrice(currentTrade.assetId, currentTrade.type === 'buy');
            if (!price || price <= 0) return;
            let maxAmt = currentTrade.type === 'buy'
                ? Math.min(Math.floor(state.cash / price), freeStorage())
                : state.inventory[currentTrade.assetId];
            document.getElementById('trade-amount').value = Math.max(Math.floor(maxAmt * pct / 100), pct === 100 ? maxAmt : 0);
            updateTradeTotal();
        });
    });

    // Market tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setCurrentTab(btn.dataset.tab);
            updateUI();
        });
    });

    // Market table click delegation (buy/sell + asset detail)
    document.getElementById('market-body').addEventListener('click', (e) => {
        const nameEl = e.target.closest('.asset-name');
        if (nameEl) { openAssetDetail(nameEl.dataset.asset); return; }
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        if (btn.dataset.action === 'buy') openBuy(btn.dataset.asset);
        else openSell(btn.dataset.asset);
    });

    // Modal close buttons & backdrop
    document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeModals));
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModals(); });
    });

    // Footer legal links
    document.getElementById('footer-disclaimer')?.addEventListener('click', () => showModal('disclaimer-modal'));
    document.getElementById('footer-privacy')?.addEventListener('click', () => showModal('privacy-modal'));
    document.getElementById('footer-terms')?.addEventListener('click', () => showModal('terms-modal'));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModals();
        if (!document.querySelector('.modal.active') && document.getElementById('game-screen').classList.contains('active')) {
            if (e.key === 't' || e.key === 'T') openTravel(updateUI, endGame);
            if (e.key === 'l' || e.key === 'L') openBank();
            if (e.key === 'p' || e.key === 'P') openPerks();
            if (e.key === 'm' || e.key === 'M') openManipulate(updateUI);
            if (e.key === 'w' || e.key === 'W') { addLog('You lay low for the day.', 'event-info'); advanceDay(endGame); updateUI(); autoSave(); }
        }
    });
});
