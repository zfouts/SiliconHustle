export function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

export function showModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

export function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}
