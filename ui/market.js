import { ASSETS, CITIES } from '../data/constants.js';
import { state, currentTab } from '../systems/state.js';
import { drawSparkline, drawDetailChart } from './charts.js';
import { showModal } from './screens.js';
import { AudioEngine } from '../systems/audio.js';
import { hasPerk } from '../systems/perks.js';

let sparklineRafId = null;

// DOM helpers — avoid innerHTML with dynamic data to prevent XSS
function mkTd(content, className) {
    const td = document.createElement('td');
    if (className) td.className = className;
    if (content !== undefined) td.textContent = content;
    return td;
}

function mkSpan(content, className, style) {
    const el = document.createElement('span');
    if (className) el.className = className;
    if (style) el.style.cssText = style;
    if (content !== undefined) el.textContent = content;
    return el;
}

function buildAssetNameCell(asset, dealTagEl) {
    const td = document.createElement('td');
    td.appendChild(mkSpan(asset.icon, 'asset-icon'));
    const name = mkSpan(asset.name, 'asset-name');
    name.dataset.asset = asset.id;
    td.appendChild(name);
    if (dealTagEl) td.appendChild(dealTagEl);
    td.appendChild(document.createElement('br'));
    td.appendChild(mkSpan(asset.category, 'asset-category'));
    return td;
}

function buildActionButtons(assetId, owned) {
    const td = document.createElement('td');
    td.className = 'asset-actions';
    const buy = document.createElement('button');
    buy.className = 'btn btn-buy';
    buy.dataset.action = 'buy';
    buy.dataset.asset = assetId;
    buy.textContent = 'BUY';
    td.appendChild(buy);
    const sell = document.createElement('button');
    sell.className = 'btn btn-sell';
    sell.dataset.action = 'sell';
    sell.dataset.asset = assetId;
    sell.textContent = 'SELL';
    if (owned <= 0) sell.disabled = true;
    td.appendChild(sell);
    return td;
}

export function openAssetDetail(assetId) {
    AudioEngine.play('click');
    const asset = ASSETS.find(a => a.id === assetId);
    const ci = state.currentCity;
    const price = state.prices[ci][assetId];
    const history = state.priceHistory[ci][assetId];
    const avg = history.length > 0 ? history.reduce((s, v) => s + v, 0) / history.length : price;
    const allTimeHigh = Math.max(...history, price);
    const allTimeLow = Math.min(...history, price);
    const owned = state.inventory[assetId];
    const avgCost = state.costBasis[assetId];

    document.getElementById('detail-title').textContent = `${asset.icon} ${asset.name}`;

    const detailStats = document.getElementById('detail-stats');
    detailStats.innerHTML = '';

    function addDetailRow(label, text, color) {
        const row = document.createElement('div');
        row.className = 'detail-stat-row';
        const lbl = document.createElement('span');
        lbl.className = 'detail-stat-label';
        lbl.textContent = label;
        const val = document.createElement('span');
        val.textContent = text;
        if (color) val.style.color = color;
        row.appendChild(lbl);
        row.appendChild(val);
        detailStats.appendChild(row);
    }

    const hasAI = hasPerk('ai_trader');

    addDetailRow('Local Price', `$${price.toLocaleString()}`);

    // Global data — always show global avg, but detailed arb % and signal only with AI
    const globalPrice = getGlobalPrice(assetId);
    addDetailRow('Global Avg', `$${globalPrice.toLocaleString()}`, '#00e5ff');

    if (hasAI) {
        const arbPct = globalPrice > 0 ? ((price - globalPrice) / globalPrice * 100) : 0;
        addDetailRow('vs Global', `${arbPct >= 0 ? '+' : ''}${arbPct.toFixed(1)}%`, arbPct <= -5 ? '#00e676' : arbPct >= 5 ? '#ff1744' : '');
    }

    addDetailRow('Hist Avg', `$${Math.round(avg).toLocaleString()}`);
    addDetailRow('High', `$${allTimeHigh.toLocaleString()}`, '#00e676');
    addDetailRow('Low', `$${allTimeLow.toLocaleString()}`, '#ff1744');
    addDetailRow('Owned', `${owned}`);
    addDetailRow('Avg Cost', avgCost > 0 ? `$${avgCost.toLocaleString()}` : '--');

    if (owned > 0 && avgCost > 0) {
        const pnl = (price - avgCost) * owned;
        addDetailRow('P&L', `$${pnl.toLocaleString()}`, pnl >= 0 ? '#00e676' : '#ff1744');
    } else {
        addDetailRow('P&L', '--');
    }

    // Trading signal — AI only
    if (hasAI) {
        const globalHist = getGlobalHistory(assetId);
        const sig = getSignal(price, globalPrice, globalHist);
        addDetailRow('Signal', `${sig.signal} — ${sig.reason}`, sig.signal === 'BUY' ? '#00e676' : sig.signal === 'SELL' ? '#ff1744' : '');
    }

    const allCityData = CITIES.map((_, i) => [...state.priceHistory[i][assetId], state.prices[i][assetId]]);
    setTimeout(() => drawDetailChart(document.getElementById('detail-chart'), allCityData, ci), 50);

    const cityPrices = CITIES.map((c, i) => ({ name: c.name, price: state.prices[i][assetId], idx: i }));
    const cheapest = Math.min(...cityPrices.map(c => c.price));
    const priciest = Math.max(...cityPrices.map(c => c.price));

    const citiesEl = document.getElementById('detail-cities');
    citiesEl.innerHTML = '';
    cityPrices.forEach(c => {
        const div = document.createElement('div');
        let cls = 'detail-city';
        if (c.idx === ci) cls += ' current';
        if (c.price === cheapest) cls += ' cheapest';
        if (c.price === priciest) cls += ' priciest';
        div.className = cls;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'detail-city-name';
        nameSpan.textContent = c.name + (c.idx === ci ? ' *' : '');
        div.appendChild(nameSpan);

        const priceSpan = document.createElement('span');
        priceSpan.className = `detail-city-price ${c.price === cheapest ? 'price-up' : c.price === priciest ? 'price-down' : ''}`;
        priceSpan.textContent = `$${c.price.toLocaleString()}`;
        if (c.price === cheapest) {
            const tag = document.createElement('span');
            tag.className = 'detail-city-tag';
            tag.style.color = '#00e676';
            tag.textContent = 'CHEAPEST';
            priceSpan.appendChild(tag);
        } else if (c.price === priciest) {
            const tag = document.createElement('span');
            tag.className = 'detail-city-tag';
            tag.style.color = '#ff1744';
            tag.textContent = 'PRICIEST';
            priceSpan.appendChild(tag);
        }
        div.appendChild(priceSpan);

        citiesEl.appendChild(div);
    });

    showModal('detail-modal');
}

// Compute global average price for an asset across all cities
function getGlobalPrice(assetId) {
    let total = 0;
    CITIES.forEach((_, ci) => { total += (state.prices[ci]?.[assetId] || 0); });
    return Math.round(total / CITIES.length);
}

// Compute global price history (average across cities per day)
function getGlobalHistory(assetId) {
    const maxLen = Math.max(...CITIES.map((_, ci) => (state.priceHistory[ci]?.[assetId]?.length || 0)));
    const result = [];
    for (let d = 0; d < maxLen; d++) {
        let sum = 0, count = 0;
        CITIES.forEach((_, ci) => {
            const h = state.priceHistory[ci]?.[assetId];
            if (h && d < h.length) { sum += h[d]; count++; }
        });
        result.push(count > 0 ? Math.round(sum / count) : 0);
    }
    return result;
}

// Generate a trading signal based on local vs global price
function getSignal(localPrice, globalPrice, globalHistory) {
    const arbPct = globalPrice > 0 ? ((localPrice - globalPrice) / globalPrice * 100) : 0;

    // Trend: compare latest global to 3-day-ago global
    let trend = 0;
    if (globalHistory.length >= 4) {
        const recent = globalHistory[globalHistory.length - 1];
        const older = globalHistory[globalHistory.length - 4];
        trend = older > 0 ? ((recent - older) / older * 100) : 0;
    }

    // Signal logic:
    // BUY if local price is 10%+ below global (arbitrage opportunity)
    // BUY if global trend is up 5%+ and local is at or below global
    // SELL if local price is 10%+ above global (overpriced locally)
    // SELL if global trend is down 5%+ and local is at or above global
    if (arbPct <= -10) return { signal: 'BUY', reason: `${Math.abs(arbPct).toFixed(0)}% below global` };
    if (arbPct >= 10) return { signal: 'SELL', reason: `${arbPct.toFixed(0)}% above global` };
    if (trend >= 5 && arbPct <= 0) return { signal: 'BUY', reason: `global trending up ${trend.toFixed(0)}%` };
    if (trend <= -5 && arbPct >= 0) return { signal: 'SELL', reason: `global trending down ${Math.abs(trend).toFixed(0)}%` };
    return { signal: 'HOLD', reason: 'fair price' };
}

export function renderMarketTable() {
    const tbody = document.getElementById('market-body');
    const thead = document.getElementById('market-thead-row');
    tbody.innerHTML = '';

    const ci = state.currentCity;
    const isGlobal = currentTab === 'global';
    const hasAI = hasPerk('ai_trader');
    const hasTerminal = hasPerk('global_terminal') || hasAI; // AI includes terminal

    // Global tab requires a perk to access
    if (isGlobal && !hasTerminal) {
        document.getElementById('market-city-name').textContent = '-- GLOBAL';
        thead.innerHTML = '<th></th><th></th><th></th><th></th><th></th><th></th><th></th>';
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:2rem;">Requires <strong style="color:var(--accent)">Global Terminal</strong> perk ($25,000) from the Perk Shop to access global market data.</td></tr>';
        return;
    }

    // Update header based on tab
    if (isGlobal) {
        if (hasAI) {
            document.getElementById('market-city-name').textContent = '-- AI GLOBAL ANALYSIS';
            thead.innerHTML = '<th>Asset</th><th>Local</th><th>Global Avg</th><th>Arb %</th><th>Global Chart</th><th>Signal</th><th>Actions</th>';
        } else {
            document.getElementById('market-city-name').textContent = '-- GLOBAL OVERVIEW';
            thead.innerHTML = '<th>Asset</th><th>Local</th><th>Global Avg</th><th>Spread</th><th>Owned</th><th>Actions</th><th></th>';
        }
    } else {
        document.getElementById('market-city-name').textContent = `-- ${CITIES[ci]?.name || ''}`;
        thead.innerHTML = '<th>Asset</th><th>Price</th><th>7d Chart</th><th>Trend</th><th>Owned</th><th>P&L</th><th>Actions</th>';
    }

    const assetsToShow = currentTab === 'portfolio'
        ? ASSETS.filter(a => state.inventory[a.id] > 0)
        : ASSETS;

    if (assetsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:2rem;">No assets in portfolio.</td></tr>';
        return;
    }

    assetsToShow.forEach(asset => {
        const localPrice = state.prices[ci]?.[asset.id] || 0;
        const owned = state.inventory[asset.id];
        const avgCost = state.costBasis[asset.id];
        const tr = document.createElement('tr');

        if (isGlobal && hasAI) {
            // FULL AI GLOBAL VIEW: arb %, sparkline, signal
            const globalPrice = getGlobalPrice(asset.id);
            const globalHist = getGlobalHistory(asset.id);
            const arbPct = globalPrice > 0 ? ((localPrice - globalPrice) / globalPrice * 100) : 0;
            const sig = getSignal(localPrice, globalPrice, globalHist);

            const arbClass = arbPct <= -5 ? 'arb-positive' : arbPct >= 5 ? 'arb-negative' : 'arb-neutral';
            const sigClass = sig.signal === 'BUY' ? 'signal-buy' : sig.signal === 'SELL' ? 'signal-sell' : 'signal-hold';

            tr.appendChild(buildAssetNameCell(asset));
            tr.appendChild(mkTd('$' + localPrice.toLocaleString()));
            tr.appendChild(mkTd('$' + globalPrice.toLocaleString(), 'global-price'));

            const arbTd = mkTd(undefined);
            arbTd.appendChild(mkSpan((arbPct >= 0 ? '+' : '') + arbPct.toFixed(1) + '%', arbClass));
            tr.appendChild(arbTd);

            const sparkTd = mkTd(undefined, 'sparkline-cell');
            const sparkCanvas = document.createElement('canvas');
            sparkCanvas.className = 'sparkline-global';
            sparkCanvas.dataset.asset = asset.id;
            sparkCanvas.width = 70;
            sparkCanvas.height = 24;
            sparkTd.appendChild(sparkCanvas);
            tr.appendChild(sparkTd);

            const sigTd = mkTd(undefined);
            sigTd.appendChild(mkSpan(sig.signal, sigClass));
            sigTd.appendChild(document.createElement('br'));
            sigTd.appendChild(mkSpan(sig.reason, undefined, 'color:var(--text-dim);font-size:0.55rem'));
            tr.appendChild(sigTd);

            tr.appendChild(buildActionButtons(asset.id, owned));
        } else if (isGlobal) {
            // LIMITED GLOBAL VIEW (no AI): just local, global avg, and a vague spread indicator
            const globalPrice = getGlobalPrice(asset.id);
            const arbPct = globalPrice > 0 ? ((localPrice - globalPrice) / globalPrice * 100) : 0;

            let spreadLabel = 'FAIR';
            let spreadClass = 'arb-neutral';
            if (arbPct <= -12) { spreadLabel = 'CHEAP HERE'; spreadClass = 'arb-positive'; }
            else if (arbPct <= -5) { spreadLabel = 'BELOW AVG'; spreadClass = 'arb-positive'; }
            else if (arbPct >= 12) { spreadLabel = 'PRICEY HERE'; spreadClass = 'arb-negative'; }
            else if (arbPct >= 5) { spreadLabel = 'ABOVE AVG'; spreadClass = 'arb-negative'; }

            tr.appendChild(buildAssetNameCell(asset));
            tr.appendChild(mkTd('$' + localPrice.toLocaleString()));
            tr.appendChild(mkTd('$' + globalPrice.toLocaleString(), 'global-price'));

            const spreadTd = mkTd(undefined);
            spreadTd.appendChild(mkSpan(spreadLabel, spreadClass, 'font-size:0.65rem'));
            tr.appendChild(spreadTd);

            tr.appendChild(mkTd(owned > 0 ? String(owned) : '--'));
            tr.appendChild(buildActionButtons(asset.id, owned));
            tr.appendChild(mkTd(undefined));
        } else {
            // LOCAL VIEW (ALL / PORTFOLIO tabs)
            const history = state.priceHistory[ci]?.[asset.id] || [];
            const prevSnapshot = history.length >= 2 ? history[history.length - 2] : (history[0] ?? localPrice);
            const pctChange = prevSnapshot > 0 ? ((localPrice - prevSnapshot) / prevSnapshot * 100) : 0;
            const isUp = pctChange >= 0;

            const avg = history.length > 0 ? history.reduce((s, v) => s + v, 0) / history.length : localPrice;
            const vsAvg = avg > 0 ? ((localPrice - avg) / avg * 100) : 0;

            // Build deal tag as DOM element instead of HTML string
            let dealTagEl = null;
            if (hasAI) {
                const globalPrice = getGlobalPrice(asset.id);
                const arbPct = globalPrice > 0 ? ((localPrice - globalPrice) / globalPrice * 100) : 0;
                if (arbPct <= -15) dealTagEl = mkSpan('CHEAP vs GLOBAL', 'deal-tag cheap');
                else if (arbPct >= 15) dealTagEl = mkSpan('PRICEY vs GLOBAL', 'deal-tag expensive');
            }
            if (!dealTagEl) {
                if (vsAvg <= -30) dealTagEl = mkSpan('DEAL', 'deal-tag cheap');
                else if (vsAvg >= 40) dealTagEl = mkSpan('PEAK', 'deal-tag expensive');
            }

            tr.appendChild(buildAssetNameCell(asset, dealTagEl));
            tr.appendChild(mkTd('$' + localPrice.toLocaleString(), isUp ? 'price-up' : 'price-down'));

            const sparkTd = mkTd(undefined, 'sparkline-cell');
            const sparkCanvas = document.createElement('canvas');
            sparkCanvas.className = 'sparkline';
            sparkCanvas.dataset.asset = asset.id;
            sparkCanvas.width = 70;
            sparkCanvas.height = 24;
            sparkTd.appendChild(sparkCanvas);
            tr.appendChild(sparkTd);

            const trendTd = mkTd(undefined);
            trendTd.appendChild(mkSpan((isUp ? '\u25B2' : '\u25BC') + ' ' + Math.abs(pctChange).toFixed(1) + '%', 'trend-indicator ' + (isUp ? 'price-up' : 'price-down')));
            tr.appendChild(trendTd);

            // Owned cell
            const ownedTd = mkTd(undefined);
            if (owned > 0) {
                ownedTd.appendChild(document.createTextNode(String(owned) + ' '));
                ownedTd.appendChild(mkSpan('@$' + avgCost.toLocaleString(), undefined, 'color:var(--text-dim);font-size:0.6rem'));
            } else {
                ownedTd.textContent = '--';
            }
            tr.appendChild(ownedTd);

            // P&L cell
            const pnlTd = mkTd(undefined);
            if (owned > 0 && avgCost > 0) {
                const pnl = (localPrice - avgCost) * owned;
                const pnlPct = ((localPrice - avgCost) / avgCost * 100).toFixed(1);
                if (pnl >= 0) {
                    pnlTd.appendChild(mkSpan('+$' + pnl.toLocaleString() + ' (' + pnlPct + '%)', 'pnl-positive'));
                } else {
                    pnlTd.appendChild(mkSpan('-$' + Math.abs(pnl).toLocaleString() + ' (' + pnlPct + '%)', 'pnl-negative'));
                }
            } else {
                pnlTd.appendChild(mkSpan('--', 'pnl-neutral'));
            }
            tr.appendChild(pnlTd);

            tr.appendChild(buildActionButtons(asset.id, owned));
        }

        tbody.appendChild(tr);
    });

    // Draw sparklines after DOM update
    if (sparklineRafId) cancelAnimationFrame(sparklineRafId);
    sparklineRafId = requestAnimationFrame(() => {
        sparklineRafId = null;

        // Local sparklines
        document.querySelectorAll('.sparkline').forEach(canvas => {
            const id = canvas.dataset.asset;
            const h = state.priceHistory[ci]?.[id];
            if (!h) return;
            const data = [...h.slice(-9), state.prices[ci][id]];
            drawSparkline(canvas, data, data[data.length - 1] >= data[0] ? '#00e676' : '#ff1744');
        });

        // Global sparklines (AI only — on global tab)
        document.querySelectorAll('.sparkline-global').forEach(canvas => {
            const id = canvas.dataset.asset;
            const globalHist = getGlobalHistory(id);
            const data = [...globalHist.slice(-9), getGlobalPrice(id)];
            drawSparkline(canvas, data, data[data.length - 1] >= data[0] ? '#00e676' : '#ff1744');
        });
    });
}
