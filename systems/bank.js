import { STORAGE_UPGRADE_COST, STORAGE_UPGRADE_AMOUNT } from '../data/constants.js';
import { state, addLog, autoSave, getGameCities } from './state.js';
import { AudioEngine } from './audio.js';
import { showModal, closeModals } from '../ui/screens.js';
import { showToast } from '../ui/toast.js';
import { checkAchievement } from './achievements.js';

export function isLoanSharkCity(cityIdx) {
    return (state.loanSharkCities || []).includes(cityIdx ?? state.currentCity);
}

export function getLoanSharkCityNames() {
    return (state.loanSharkCities || []).map(i => getGameCities()[i]?.name).filter(Boolean);
}

export function openBank() {
    if (!isLoanSharkCity()) {
        const names = getLoanSharkCityNames();
        showToast(`No loan shark here. Try: ${names.join(', ')}`, 'bad');
        AudioEngine.play('event_bad');
        return;
    }
    AudioEngine.play('click');
    document.getElementById('bank-debt').textContent = state.debt.toLocaleString();
    document.getElementById('bank-cash').textContent = state.cash.toLocaleString();
    document.getElementById('bank-rate').textContent = (state.interestRate * 100).toFixed(0) + '%';
    document.getElementById('repay-amount').value = '';
    document.getElementById('borrow-amount').value = '';
    showModal('bank-modal');
}

export function repayDebt(updateUI) {
    const a = parseInt(document.getElementById('repay-amount').value) || 0;
    if (a <= 0 || a > state.cash || a > state.debt) return;
    state.cash -= a; state.debt -= a;
    AudioEngine.play('buy');
    showToast(`Repaid $${a.toLocaleString()}`, 'good');
    addLog(`Repaid $${a.toLocaleString()}. Remaining: $${state.debt.toLocaleString()}`, 'event-good');
    if (state.debt <= 0) checkAchievement('debt_free');
    closeModals(); updateUI(); autoSave();
}

export function repayAll(updateUI) {
    const a = Math.min(state.cash, state.debt);
    if (a <= 0) return;
    state.cash -= a; state.debt -= a;
    AudioEngine.play('buy');
    showToast(`Repaid $${a.toLocaleString()}`, 'good');
    addLog(`Repaid $${a.toLocaleString()}. Remaining: $${state.debt.toLocaleString()}`, 'event-good');
    if (state.debt <= 0) checkAchievement('debt_free');
    closeModals(); updateUI(); autoSave();
}

const MAX_DEBT = 50000;

export function borrowCash(updateUI) {
    const a = parseInt(document.getElementById('borrow-amount').value) || 0;
    if (a <= 0 || a > 10000) return;
    if (state.debt + a > MAX_DEBT) {
        showToast(`Loan shark won't lend more than $${MAX_DEBT.toLocaleString()} total.`, 'bad');
        return;
    }
    state.cash += a; state.debt += a;
    AudioEngine.play('event_bad');
    showToast(`Borrowed $${a.toLocaleString()}`, 'warning');
    addLog(`Borrowed $${a.toLocaleString()}. Total debt: $${state.debt.toLocaleString()}`, 'event-warning');
    closeModals(); updateUI(); autoSave();
}

export function upgradeStorage(updateUI) {
    if (state.cash < STORAGE_UPGRADE_COST) {
        showToast(`Need $${STORAGE_UPGRADE_COST.toLocaleString()}`, 'bad');
        return;
    }
    state.cash -= STORAGE_UPGRADE_COST;
    state.maxStorage += STORAGE_UPGRADE_AMOUNT;
    AudioEngine.play('buy');
    showToast(`Storage upgraded to ${state.maxStorage}!`, 'good');
    addLog(`Storage upgraded! Capacity: ${state.maxStorage} (+${STORAGE_UPGRADE_AMOUNT})`, 'event-good');
    updateUI(); autoSave();
}
