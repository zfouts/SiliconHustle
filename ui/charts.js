import { state } from '../systems/state.js';

export function drawSparkline(canvas, data, color) {
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);

    ctx.beginPath();
    ctx.moveTo(0, h);
    data.forEach((v, i) => ctx.lineTo(i * step, h - ((v - min) / range) * (h - 4) - 2));
    ctx.lineTo(w, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color === '#00e676' ? 'rgba(0,230,118,0.15)' : 'rgba(255,23,68,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => { const x = i * step, y = h - ((v - min) / range) * (h - 4) - 2; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const lx = (data.length - 1) * step, ly = h - ((data[data.length - 1] - min) / range) * (h - 4) - 2;
    ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
}

export function drawDetailChart(canvas, allCityData, currentCityIdx) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    const padding = { top: 10, bottom: 15, left: 45, right: 10 };
    const cw = w - padding.left - padding.right;
    const ch = h - padding.top - padding.bottom;

    let allMin = Infinity, allMax = -Infinity;
    allCityData.forEach(data => data.forEach(v => { allMin = Math.min(allMin, v); allMax = Math.max(allMax, v); }));
    const range = allMax - allMin || 1;

    allCityData.forEach((data, ci) => {
        if (ci === currentCityIdx || data.length < 2) return;
        const step = cw / (data.length - 1);
        ctx.beginPath();
        data.forEach((v, i) => { const x = padding.left + i * step, y = padding.top + ch - ((v - allMin) / range) * ch; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
    });

    const data = allCityData[currentCityIdx];
    if (data.length >= 2) {
        const step = cw / (data.length - 1);
        ctx.beginPath();
        data.forEach((v, i) => { const x = padding.left + i * step, y = padding.top + ch - ((v - allMin) / range) * ch; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.fillStyle = '#8888a0'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
    ctx.fillText('$' + allMax.toLocaleString(), padding.left - 4, padding.top + 8);
    ctx.fillText('$' + allMin.toLocaleString(), padding.left - 4, h - padding.bottom);
}

export function drawFinalNetworthChart() {
    const canvas = document.getElementById('final-networth-chart');
    if (!canvas || state.networthHistory.length < 2) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height, data = state.networthHistory;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    const min = Math.min(...data, 0), max = Math.max(...data);
    const range = max - min || 1;
    const pad = { top: 15, bottom: 20, left: 50, right: 10 };
    const cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;
    const step = cw / (data.length - 1);

    const zeroY = pad.top + ch - ((-min) / range) * ch;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad.left, zeroY); ctx.lineTo(w - pad.right, zeroY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(pad.left, zeroY);
    data.forEach((v, i) => ctx.lineTo(pad.left + i * step, pad.top + ch - ((v - min) / range) * ch));
    ctx.lineTo(pad.left + (data.length - 1) * step, zeroY);
    ctx.closePath();
    const lastVal = data[data.length - 1];
    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, lastVal >= 0 ? 'rgba(0,230,118,0.25)' : 'rgba(255,23,68,0)');
    grad.addColorStop(1, lastVal >= 0 ? 'rgba(0,230,118,0)' : 'rgba(255,23,68,0.25)');
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => { const x = pad.left + i * step, y = pad.top + ch - ((v - min) / range) * ch; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.strokeStyle = lastVal >= 0 ? '#00e676' : '#ff1744';
    ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = '#8888a0'; ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('$' + max.toLocaleString(), pad.left - 5, pad.top + 8);
    ctx.fillText('$' + min.toLocaleString(), pad.left - 5, h - pad.bottom);
    ctx.fillText('$0', pad.left - 5, zeroY + 3);
    ctx.textAlign = 'center';
    ctx.fillText('Day 1', pad.left, h - 4);
    ctx.fillText('Day ' + data.length, pad.left + (data.length - 1) * step, h - 4);
}
