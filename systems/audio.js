export const AudioEngine = {
    ctx: null,
    muted: false,
    init() {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    },
    play(type) {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.value = 0.07;

        switch(type) {
            case 'buy':
                osc.type = 'sine'; osc.frequency.value = 520;
                osc.frequency.exponentialRampToValueAtTime(780, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now); osc.stop(now + 0.15);
                break;
            case 'sell':
                osc.type = 'sine'; osc.frequency.value = 680;
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now); osc.stop(now + 0.15);
                break;
            case 'travel':
                osc.type = 'triangle'; osc.frequency.value = 300;
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
                break;
            case 'event_good':
                osc.type = 'sine'; osc.frequency.value = 440;
                osc.frequency.setValueAtTime(554, now + 0.08);
                osc.frequency.setValueAtTime(659, now + 0.16);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
                break;
            case 'event_bad':
                osc.type = 'sawtooth'; osc.frequency.value = 200;
                gain.gain.value = 0.04;
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
                break;
            case 'click':
                osc.type = 'square'; osc.frequency.value = 800;
                gain.gain.value = 0.025;
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.start(now); osc.stop(now + 0.04);
                break;
            case 'achievement':
                osc.type = 'sine'; osc.frequency.value = 523;
                gain.gain.value = 0.06;
                [523, 659, 784, 1047].forEach((f, i) => osc.frequency.setValueAtTime(f, now + i * 0.12));
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                osc.start(now); osc.stop(now + 0.6);
                break;
            case 'gameover':
                osc.type = 'triangle'; osc.frequency.value = 440;
                gain.gain.value = 0.05;
                [440, 554, 659, 880].forEach((f, i) => osc.frequency.setValueAtTime(f, now + i * 0.15));
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
                osc.start(now); osc.stop(now + 0.7);
                break;
        }
    }
};
