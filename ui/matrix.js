let matrixInterval = null;
let matrixCtx = null;
let matrixCanvas = null;
let drops = [];
const chars = '01₿ΞΔ$¥€£∞≠±×÷αβγ<>{}[]|\\/%#@!?;:';
const fontSize = 14;

function draw() {
    if (!matrixCtx || !matrixCanvas) return;
    matrixCtx.fillStyle = 'rgba(10, 10, 15, 0.06)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    matrixCtx.fillStyle = 'rgba(0, 229, 255, 0.25)';
    matrixCtx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        matrixCtx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}

export function initMatrixRain() {
    matrixCanvas = document.getElementById('matrix-bg');
    if (!matrixCanvas) return;
    matrixCtx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;

    const columns = Math.floor(matrixCanvas.width / fontSize);
    drops = Array(columns).fill(1);

    window.addEventListener('resize', () => {
        if (!matrixCanvas) return;
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
    });

    startMatrixRain();
}

export function startMatrixRain() {
    if (!matrixInterval && matrixCtx) {
        matrixInterval = setInterval(draw, 50);
    }
}

export function stopMatrixRain() {
    if (matrixInterval) {
        clearInterval(matrixInterval);
        matrixInterval = null;
    }
}
