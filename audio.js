/**
 * Web Audio API Sound Synthesizer
 * Không cần bất kỳ file mp3 bên ngoài nào, hoạt động 100% offline, không bao giờ bị lỗi load!
 */

class SoundController {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.initialized = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.initialized = true;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    setMute(state) {
        this.isMuted = state;
    }

    // Âm thanh 'tách' khi kim gõ qua từng nan ô của vòng quay
    playTick(volume = 0.35, pitchMultiplier = 1) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            // Tần số thay đổi nhẹ tạo cảm giác cơ học chân thực
            osc.frequency.setValueAtTime(580 * pitchMultiplier, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.045);
        } catch (e) {
            console.warn('Audio tick error:', e);
        }
    }

    // Âm thanh bắt đầu quay (vút lên)
    playStart() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.35);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.36);
        } catch (e) {
            console.warn('Audio start error:', e);
        }
    }

    // Âm thanh chiến thắng hào hứng (fanfare chimes)
    playWin() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const notes = [
                { f: 523.25, d: 0.15 }, // C5
                { f: 659.25, d: 0.15 }, // E5
                { f: 783.99, d: 0.15 }, // G5
                { f: 1046.50, d: 0.45 } // C6
            ];

            let start = this.ctx.currentTime;
            notes.forEach((note) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(note.f, start);

                gain.gain.setValueAtTime(0.35, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(start);
                osc.stop(start + note.d);

                start += note.d * 0.75;
            });
        } catch (e) {
            console.warn('Audio win error:', e);
        }
    }
}

window.soundController = new SoundController();
