/**
 * Particle & Confetti System
 * Pháo hoa và giấy màu mừng chiến thắng trên canvas
 */

class ConfettiSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.colors = ['#0071e3', '#34c759', '#ff9500', '#ff2d55', '#af52de', '#5ac8fa', '#ffd60a', '#00c7be', '#5856d6'];
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire(count = 150) {
        if (!this.canvas) return;
        this.resize();

        // Tạo chùm hạt từ 2 bên hoặc ở tâm
        const originX = this.canvas.width / 2;
        const originY = this.canvas.height * 0.45;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 12 + 6;
            this.particles.push({
                x: originX + (Math.random() - 0.5) * 100,
                y: originY + (Math.random() - 0.5) * 60,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 4,
                size: Math.random() * 8 + 6,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                decay: Math.random() * 0.008 + 0.006,
                shape: Math.random() > 0.4 ? 'rect' : 'circle',
                wobble: Math.random() * 10
            });
        }

        // Thêm loạt từ 2 góc dưới bay lên
        for (let i = 0; i < 40; i++) {
            // Góc trái
            this.particles.push({
                x: 20,
                y: this.canvas.height - 20,
                vx: Math.random() * 8 + 5,
                vy: -(Math.random() * 14 + 10),
                size: Math.random() * 9 + 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                opacity: 1,
                decay: 0.008,
                shape: 'rect',
                wobble: Math.random() * 10
            });
            // Góc phải
            this.particles.push({
                x: this.canvas.width - 20,
                y: this.canvas.height - 20,
                vx: -(Math.random() * 8 + 5),
                vy: -(Math.random() * 14 + 10),
                size: Math.random() * 9 + 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                opacity: 1,
                decay: 0.008,
                shape: 'rect',
                wobble: Math.random() * 10
            });
        }

        if (!this.animationId) {
            this.animate();
        }
    }

    animate() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.28; // Gravity
            p.vx *= 0.985; // Air drag
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    stop() {
        this.particles = [];
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

window.confettiSystem = new ConfettiSystem();
