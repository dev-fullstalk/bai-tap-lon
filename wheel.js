/**
 * Lucky Wheel Canvas & Physics Engine - Apple Minimalist Edition
 * Thiết kế tinh tế phong cách Apple: Viền Titanium xước mạ bạc, vạch chia laser chính xác,
 * chuyển động vật lý mượt mà và không có đèn nhấp nháy rẻ tiền.
 */

class LuckyWheel {
    constructor(canvas, pointerElement, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pointer = pointerElement;

        this.items = []; // Danh sách phần thưởng
        this.currentAngle = 0; // Góc quay hiện tại
        this.isSpinning = false;
        this.spinDuration = options.duration || 6500;
        this.totalSpins = 7;

        this.lastTickSegment = -1;
        this.onFinished = options.onFinished || null;
        this.onStart = options.onStart || null;

        this.setupDPI();
        window.addEventListener('resize', () => {
            this.setupDPI();
            this.draw();
        });
    }

    setupDPI() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const size = Math.min(rect.width || 560, window.innerWidth - 32, 560);
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.ctx.resetTransform?.();
        this.ctx.scale(dpr, dpr);
        this.size = size;
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.radius = (size / 2) - 18; // Viền hợp kim nhôm siêu mỏng
    }

    setItems(items) {
        // Không đổi số lượng/thứ tự nan giữa lúc quay vì sẽ làm kim và kết quả lệch nhau.
        if (this.isSpinning) {
            this.pendingItems = items;
            return;
        }
        this.items = items;
        this.draw();
    }

    // Vẽ toàn bộ vòng quay
    draw() {
        const ctx = this.ctx;
        const centerX = this.centerX;
        const centerY = this.centerY;
        const radius = this.radius;

        ctx.clearRect(0, 0, this.size, this.size);

        if (!this.items || this.items.length === 0) {
            this.drawEmptyState();
            return;
        }

        const count = this.items.length;
        const arc = (Math.PI * 2) / count;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.currentAngle);

        // 1. Vẽ các nan ô (Slices) với màu sắc phối chuẩn Apple
        for (let i = 0; i < count; i++) {
            const item = this.items[i];
            const startAngle = i * arc;
            const endAngle = startAngle + arc;

            // Nan ô
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = item.color || '#0071e3';
            ctx.fill();

            // Đường phân cách hairline siêu tinh tế
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.stroke();

            // 2. Chữ và icon (Typography phong cách Apple SF Pro)
            ctx.save();
            ctx.rotate(startAngle + arc / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = item.textColor || '#ffffff';

            const fontSize = count > 12 ? 12 : (count > 8 ? 14 : 16);
            ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", sans-serif`;

            const textRadius = radius - 32;
            const maxTextWidth = radius * 0.48;

            let displayText = item.label;
            if (ctx.measureText(displayText).width > maxTextWidth) {
                displayText = this.truncateText(displayText, maxTextWidth, ctx);
            }

            ctx.fillText(displayText, textRadius, 0);

            // Icon / Emoji
            if (item.icon) {
                ctx.font = `${fontSize + 6}px -apple-system, sans-serif`;
                ctx.fillText(item.icon, textRadius - ctx.measureText(displayText).width - 10, 0);
            }

            ctx.restore();
        }

        // 3. Chốt chặn viền Titanium (Precision Micro-pins)
        const pegRadius = radius - 4;
        for (let i = 0; i < count; i++) {
            const pegAngle = i * arc;
            const px = Math.cos(pegAngle) * pegRadius;
            const py = Math.sin(pegAngle) * pegRadius;

            // Chốt hợp kim nhôm
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f5f5f7';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#c7c7cc';
            ctx.stroke();

            // Điểm bóng phản quang
            ctx.beginPath();
            ctx.arc(px - 1, py - 1, 1, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore(); // Kết thúc xoay nan ô

        // 4. Viền Bezel Titanium chuẩn Apple Watch / iPad
        this.drawTitaniumBezel();

        // 5. Trục trung tâm Ceramic & Bạc
        this.drawCenterHub();
    }

    /**
     * Viền Titanium mạ bạc với vạch chia độ Laser siêu chính xác
     */
    drawTitaniumBezel() {
        const ctx = this.ctx;
        const centerX = this.centerX;
        const centerY = this.centerY;
        const outerR = this.radius + 15;
        const innerR = this.radius;

        // Vành Bezel Titanium sang trọng
        const bezelGrad = ctx.createLinearGradient(
            centerX - outerR, centerY - outerR, 
            centerX + outerR, centerY + outerR
        );
        bezelGrad.addColorStop(0, '#f2f2f7');
        bezelGrad.addColorStop(0.3, '#ffffff');
        bezelGrad.addColorStop(0.7, '#e5e5ea');
        bezelGrad.addColorStop(1, '#d1d1d6');

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerR, 0, Math.PI * 2);
        ctx.arc(centerX, centerY, innerR, 0, Math.PI * 2, true);
        ctx.fillStyle = bezelGrad;
        ctx.fill();

        // Viền ngoài kim loại sắc sảo
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#d2d2d7';
        ctx.stroke();

        // Vạch khắc laser viền ngoài (60 vạch như mặt đồng hồ cao cấp)
        const ticks = 60;
        for (let t = 0; t < ticks; t++) {
            const angle = (t * Math.PI * 2) / ticks;
            const isMajor = t % 5 === 0;
            const tLen = isMajor ? 5 : 2.5;

            const x1 = centerX + Math.cos(angle) * (outerR - 2);
            const y1 = centerY + Math.sin(angle) * (outerR - 2);
            const x2 = centerX + Math.cos(angle) * (outerR - 2 - tLen);
            const y2 = centerY + Math.sin(angle) * (outerR - 2 - tLen);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = isMajor ? 1.5 : 0.8;
            ctx.strokeStyle = isMajor ? '#8e8e93' : '#c7c7cc';
            ctx.stroke();
        }

        // Viền bên trong
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerR, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.stroke();
    }

    /**
     * Trục trung tâm Ceramic & Nút bấm phong cách Apple
     */
    drawCenterHub() {
        const ctx = this.ctx;
        const centerX = this.centerX;
        const centerY = this.centerY;
        const hubRadius = 42;

        // Đổ bóng mềm mịn Apple Soft Shadow
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, hubRadius + 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.filter = 'blur(4px)';
        ctx.fill();
        ctx.restore();

        // Vành Ceramic trắng ngọc trai
        const ceramicGrad = ctx.createRadialGradient(
            centerX - 10, centerY - 10, 2,
            centerX, centerY, hubRadius
        );
        ceramicGrad.addColorStop(0, '#ffffff');
        ceramicGrad.addColorStop(0.85, '#f5f5f7');
        ceramicGrad.addColorStop(1, '#e5e5ea');

        ctx.beginPath();
        ctx.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
        ctx.fillStyle = ceramicGrad;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#d2d2d7';
        ctx.stroke();

        // Vòng tròn lõi kim loại hairline
        ctx.beginPath();
        ctx.arc(centerX, centerY, hubRadius - 6, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.stroke();
    }

    drawEmptyState() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f5f5f7';
        ctx.fill();
        ctx.strokeStyle = '#d2d2d7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#86868b';
        ctx.font = '600 15px -apple-system, sans-serif';
        ctx.fillText('Chưa có phần thưởng', this.centerX, this.centerY - 8);
        ctx.font = '13px -apple-system, sans-serif';
        ctx.fillText('Mở Cài Đặt để thiết lập', this.centerX, this.centerY + 16);
    }

    truncateText(text, maxWidth, ctx) {
        let truncated = text;
        while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 2) {
            truncated = truncated.slice(0, -1);
        }
        return truncated + '…';
    }

    spinTo(winningIndex) {
        if (this.isSpinning) return;
        if (!this.items || this.items.length === 0) return;

        const count = this.items.length;
        if (!Number.isInteger(winningIndex) || winningIndex < 0 || winningIndex >= count) {
            return;
        }
        const winningItem = this.items[winningIndex];

        this.isSpinning = true;
        if (this.onStart) this.onStart();

        window.soundController?.playStart();

        const arc = (Math.PI * 2) / count;

        // Vị trí kim đỉnh 12h: góc 270 độ = 3*PI/2
        const pointerWorldAngle = (3 * Math.PI) / 2;

        const randomOffsetInWedge = (0.25 + Math.random() * 0.5) * arc;
        const targetLocalAngle = winningIndex * arc + randomOffsetInWedge;

        const currentMod = this.currentAngle % (Math.PI * 2);
        let delta = (pointerWorldAngle - targetLocalAngle - currentMod) % (Math.PI * 2);
        if (delta < 0) {
            delta += Math.PI * 2;
        }

        const fullSpins = this.totalSpins + Math.floor(Math.random() * 2);
        const totalDelta = delta + fullSpins * Math.PI * 2;

        const startAngle = this.currentAngle;
        const startTime = performance.now();
        const duration = this.spinDuration;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing Quintic Out: Vô cùng mượt và tự nhiên như animation trên iOS
            const easeProgress = this.easeOutQuint(progress);

            const prevAngle = this.currentAngle;
            this.currentAngle = startAngle + totalDelta * easeProgress;

            this.checkPegTick(prevAngle, this.currentAngle, arc, count);

            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                this.draw();
                if (this.pointer) {
                    this.pointer.style.transform = 'translateX(-50%) rotate(0deg)';
                }
                const pendingItems = this.pendingItems;
                this.pendingItems = null;
                if (this.onFinished) {
                    this.onFinished(winningItem, winningIndex);
                } else if (pendingItems) {
                    this.setItems(pendingItems);
                }
            }
        };

        requestAnimationFrame(animate);
    }

    easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }

    checkPegTick(prevAngle, currentAngle, arc, count) {
        const pointerAngle = (3 * Math.PI) / 2;
        const localPointerAngle = ((pointerAngle - currentAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const segmentIndex = Math.floor(localPointerAngle / arc);

        if (segmentIndex !== this.lastTickSegment) {
            this.lastTickSegment = segmentIndex;
            window.soundController?.playTick(0.25, 1 + (Math.random() * 0.15 - 0.07));

            if (this.pointer) {
                const kickAngle = -14 + Math.random() * 4;
                this.pointer.style.transform = `translateX(-50%) rotate(${kickAngle}deg)`;
                setTimeout(() => {
                    if (this.pointer) {
                        this.pointer.style.transform = 'translateX(-50%) rotate(0deg)';
                    }
                }, 50);
            }
        }
    }
}

window.LuckyWheel = LuckyWheel;
