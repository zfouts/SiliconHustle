// ── Private Leaderboard Client ──
// Shared session-based leaderboard backed by Hustle API

const API_URL = 'https://hustle-backend.zach.workers.dev';
const GAME_ID = 'silicon';

const KEY_CODE  = 'hustle_board_code';
const KEY_TOKEN = 'hustle_board_token';

function fallbackCopy(text, showToastFn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToastFn('Link copied!', 'good');
    } catch {
        showToastFn('Copy failed — link: ' + text, 'info');
    }
    document.body.removeChild(ta);
}

// ── Session state ──

export function getSessionCode() {
    try { return localStorage.getItem(KEY_CODE) || null; } catch { return null; }
}

export function isInSession() { return !!getSessionCode(); }

export function isSessionCreator() {
    try { return !!localStorage.getItem(KEY_TOKEN); } catch { return false; }
}

export function leaveSession() {
    try { localStorage.removeItem(KEY_CODE); localStorage.removeItem(KEY_TOKEN); } catch {}
}

// ── API calls ──

async function api(path, opts = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', ...opts.headers },
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}

export async function createSession() {
    const data = await api('/api/sessions', { method: 'POST' });
    try {
        localStorage.setItem(KEY_CODE, data.code);
        localStorage.setItem(KEY_TOKEN, data.token);
    } catch {}
    return data;
}

export async function joinSession(code) {
    code = String(code).toUpperCase().trim();
    if (!/^[A-Z0-9]{4,8}$/.test(code)) throw new Error('Invalid code format');
    const data = await api(`/api/sessions/${code}`);
    try {
        localStorage.setItem(KEY_CODE, code);
        localStorage.removeItem(KEY_TOKEN);
    } catch {}
    return data;
}

export async function fetchLeaderboard() {
    const code = getSessionCode();
    if (!code) return null;
    try {
        return await api(`/api/sessions/${code}`);
    } catch (e) {
        if (e.message.includes('not found') || e.message.includes('expired')) leaveSession();
        throw e;
    }
}

export async function submitScore(name, score, difficulty, days) {
    const code = getSessionCode();
    if (!code) return null;
    return api(`/api/sessions/${code}/scores`, {
        method: 'POST',
        body: JSON.stringify({ game: GAME_ID, name, score, difficulty, days }),
    });
}

export async function deleteSession() {
    const code = getSessionCode();
    const token = localStorage.getItem(KEY_TOKEN);
    if (!code || !token) throw new Error('Not session creator');
    await api(`/api/sessions/${code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    leaveSession();
}

// ── UI rendering ──

export function renderLeaderboardModal(container, showToastFn) {
    container.innerHTML = '';

    if (!isInSession()) {
        renderJoinCreate(container, showToastFn);
    } else {
        renderBoard(container, showToastFn);
    }
}

function renderJoinCreate(container, showToastFn) {
    // Create button
    const createBtn = document.createElement('button');
    createBtn.className = 'btn btn-primary btn-full';
    createBtn.textContent = 'CREATE NEW BOARD';
    createBtn.addEventListener('click', async () => {
        createBtn.disabled = true;
        createBtn.textContent = 'CREATING...';
        try {
            await createSession();
            renderLeaderboardModal(container, showToastFn);
            showToastFn('Board created!', 'good');
        } catch (e) {
            showToastFn('Failed: ' + e.message, 'bad');
            createBtn.disabled = false;
            createBtn.textContent = 'CREATE NEW BOARD';
        }
    });
    container.appendChild(createBtn);

    // Divider
    const divider = document.createElement('div');
    divider.style.cssText = 'text-align:center;color:var(--text-dim,#888);margin:1rem 0;font-size:0.75rem;letter-spacing:0.1em;';
    divider.textContent = '\u2500\u2500\u2500 OR JOIN EXISTING \u2500\u2500\u2500';
    container.appendChild(divider);

    // Join row
    const joinRow = document.createElement('div');
    joinRow.style.cssText = 'display:flex;gap:0.5rem;';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'BOARD CODE';
    input.maxLength = 8;
    input.style.cssText = 'flex:1;text-transform:uppercase;font-family:inherit;font-size:0.85rem;padding:0.5rem;background:var(--bg-dark,#111);color:var(--text,#eee);border:1px solid var(--border,#333);';
    joinRow.appendChild(input);

    const joinBtn = document.createElement('button');
    joinBtn.className = 'btn btn-primary';
    joinBtn.textContent = 'JOIN';
    joinBtn.addEventListener('click', async () => {
        const code = input.value.trim();
        if (!code) return;
        joinBtn.disabled = true;
        try {
            await joinSession(code);
            renderLeaderboardModal(container, showToastFn);
            showToastFn('Joined board!', 'good');
        } catch (e) {
            showToastFn('Failed: ' + e.message, 'bad');
            joinBtn.disabled = false;
        }
    });
    joinRow.appendChild(joinBtn);
    container.appendChild(joinRow);

    // URL param check
    const params = new URLSearchParams(window.location.search);
    const boardParam = params.get('board');
    if (boardParam) {
        input.value = boardParam;
        joinBtn.click();
    }
}

async function renderBoard(container, showToastFn) {
    const code = getSessionCode();

    // Share code header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding:0.5rem 0.75rem;background:var(--bg-dark,#111);border:1px solid var(--border,#333);border-radius:4px;';

    const codeLabel = document.createElement('span');
    codeLabel.style.cssText = 'font-size:0.7rem;color:var(--text-dim,#888);letter-spacing:0.1em;';
    codeLabel.textContent = 'SHARE CODE: ';

    const codeSpan = document.createElement('span');
    codeSpan.style.cssText = 'font-size:1.1rem;font-weight:700;letter-spacing:0.15em;color:var(--accent,#0ff);';
    codeSpan.textContent = code;
    codeLabel.appendChild(codeSpan);
    header.appendChild(codeLabel);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-small';
    copyBtn.textContent = 'COPY LINK';
    copyBtn.addEventListener('click', () => {
        const link = `${window.location.origin}${window.location.pathname}?board=${code}`;
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(link).then(
                () => showToastFn('Link copied!', 'good'),
                () => fallbackCopy(link, showToastFn)
            );
        } else {
            fallbackCopy(link, showToastFn);
        }
    });
    header.appendChild(copyBtn);
    container.appendChild(header);

    // Loading indicator
    const loading = document.createElement('div');
    loading.style.cssText = 'text-align:center;color:var(--text-dim,#888);padding:2rem;';
    loading.textContent = 'Loading scores...';
    container.appendChild(loading);

    // Fetch scores
    try {
        const data = await fetchLeaderboard();
        container.removeChild(loading);

        if (!data || data.scores.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'text-align:center;color:var(--text-dim,#888);padding:2rem;';
            empty.textContent = 'No scores yet. Play a game and post your score!';
            container.appendChild(empty);
        } else {
            const table = document.createElement('div');
            table.style.cssText = 'max-height:300px;overflow-y:auto;';
            data.scores.forEach((s, i) => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.5rem;border-bottom:1px solid var(--border,#222);font-size:0.8rem;';

                const rank = document.createElement('span');
                rank.style.cssText = 'width:2rem;color:var(--text-dim,#888);';
                rank.textContent = `#${i + 1}`;
                row.appendChild(rank);

                const gameTag = document.createElement('span');
                gameTag.style.cssText = 'font-size:0.6rem;padding:0.1rem 0.3rem;border-radius:2px;background:' +
                    (s.game === 'silicon' ? '#003344' : '#332200') + ';color:' +
                    (s.game === 'silicon' ? '#00e5ff' : '#ffb74d') + ';';
                gameTag.textContent = s.game === 'silicon' ? 'SILICON' : 'GASTRO';
                row.appendChild(gameTag);

                const name = document.createElement('span');
                name.style.cssText = 'flex:1;';
                name.textContent = s.name;
                row.appendChild(name);

                const score = document.createElement('span');
                score.style.cssText = 'font-weight:700;color:' + (s.score >= 0 ? 'var(--green,#0e6)' : 'var(--red,#f14)') + ';';
                score.textContent = '$' + s.score.toLocaleString();
                row.appendChild(score);

                const meta = document.createElement('span');
                meta.style.cssText = 'font-size:0.6rem;color:var(--text-dim,#888);';
                meta.textContent = `${s.difficulty} \u00B7 ${s.days}d`;
                row.appendChild(meta);

                table.appendChild(row);
            });
            container.appendChild(table);
        }
    } catch (e) {
        loading.textContent = 'Failed to load: ' + e.message;
    }

    // Actions row
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:0.5rem;margin-top:1rem;';

    const leaveBtn = document.createElement('button');
    leaveBtn.className = 'btn btn-secondary btn-full';
    leaveBtn.textContent = 'LEAVE BOARD';
    leaveBtn.addEventListener('click', () => {
        leaveSession();
        renderLeaderboardModal(container, showToastFn);
        showToastFn('Left board.', 'info');
    });
    actions.appendChild(leaveBtn);

    if (isSessionCreator()) {
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger';
        delBtn.textContent = 'DELETE';
        delBtn.addEventListener('click', async () => {
            if (!confirm('Delete this board and all its scores?')) return;
            try {
                await deleteSession();
                renderLeaderboardModal(container, showToastFn);
                showToastFn('Board deleted.', 'info');
            } catch (e) {
                showToastFn('Failed: ' + e.message, 'bad');
            }
        });
        actions.appendChild(delBtn);
    }

    container.appendChild(actions);
}
