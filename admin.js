/**
 * Admin Panel & Data Management
 * Quản lý danh sách phần thưởng, chỉnh tỉ lệ %, kiểm tra mô phỏng xác suất (Simulation),
 * lịch sử quay và lưu trữ vào LocalStorage.
 */

const STORAGE_KEYS = {
    PRIZES: 'lucky_wheel_prizes_v2_apple',
    SETTINGS: 'lucky_wheel_settings_v2',
    HISTORY: 'lucky_wheel_history_v2'
};

const DEFAULT_PRIZES = [
    { id: '1', label: 'iPhone 16 Pro', probability: 1, quantity: 1, color: '#1d1d1f', textColor: '#ffffff', icon: '📱', active: true },
    { id: '2', label: 'AirPods Max', probability: 4, quantity: 2, color: '#0071e3', textColor: '#ffffff', icon: '🎧', active: true },
    { id: '3', label: 'Apple Watch', probability: 8, quantity: 5, color: '#e05688', textColor: '#ffffff', icon: '⌚', active: true },
    { id: '4', label: 'Voucher 500K', probability: 12, quantity: 15, color: '#6366f1', textColor: '#ffffff', icon: '💳', active: true },
    { id: '5', label: 'AirTag 2026', probability: 15, quantity: 20, color: '#0284c7', textColor: '#ffffff', icon: '🏷️', active: true },
    { id: '6', label: 'Cốc Giữ Nhiệt', probability: 18, quantity: 25, color: '#059669', textColor: '#ffffff', icon: '☕', active: true },
    { id: '7', label: 'Voucher 50K', probability: 20, quantity: -1, color: '#f59e0b', textColor: '#ffffff', icon: '🎟️', active: true },
    { id: '8', label: 'Chúc May Mắn', probability: 22, quantity: -1, color: '#64748b', textColor: '#ffffff', icon: '✨', active: true }
];

const DEFAULT_SETTINGS = {
    spinDuration: 6.5,
    autoDeductStock: true,
    soundEnabled: true,
    adminPin: '' // Mã PIN bảo mật nếu muốn khóa admin (mặc định để trống)
};

class AdminManager {
    constructor() {
        this.prizes = this.loadPrizes();
        this.settings = this.loadSettings();
        this.history = this.loadHistory();
    }

    loadPrizes() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Error loading prizes:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_PRIZES));
    }

    savePrizes(prizes) {
        this.prizes = prizes;
        localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        } catch (e) {}
        return { ...DEFAULT_SETTINGS };
    }

    saveSettings(settings) {
        this.settings = settings;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }

    loadHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return [];
    }

    addHistory(prize) {
        const entry = {
            id: Date.now().toString(),
            prizeName: prize.label,
            prizeIcon: prize.icon || '🎁',
            color: prize.color,
            timestamp: new Date().toLocaleString('vi-VN')
        };
        this.history.unshift(entry);
        if (this.history.length > 100) this.history.pop();
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(this.history));
        return entry;
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
    }

    resetDefault() {
        this.savePrizes(JSON.parse(JSON.stringify(DEFAULT_PRIZES)));
        return this.prizes;
    }

    // Lấy danh sách ô đang kích hoạt trên vòng quay
    getActivePrizes() {
        return this.prizes.filter(p => p.active);
    }

    // Chỉ các giải đang bật, còn hàng và có trọng số dương mới được tham gia quay.
    // Ép kiểu tại đây giúp dữ liệu import từ JSON (ví dụ "10" hoặc "-1") vẫn đúng.
    getEligiblePrizes() {
        return this.getActivePrizes().filter(p => {
            const quantity = Number(p.quantity);
            const weight = Number(p.probability);
            const hasStock = quantity === -1 || quantity > 0;
            return hasStock && Number.isFinite(weight) && weight > 0;
        });
    }

    getRandomUnit() {
        // Dùng bộ sinh số ngẫu nhiên của trình duyệt khi có; kết quả luôn thuộc [0, 1).
        if (window.crypto?.getRandomValues) {
            const value = new Uint32Array(1);
            window.crypto.getRandomValues(value);
            return value[0] / 4294967296;
        }
        return Math.random();
    }

    // Tính tổng tỉ lệ % của các ô đang hoạt động
    getTotalProbability() {
        const active = this.getActivePrizes();
        return active.reduce((sum, p) => sum + (parseFloat(p.probability) || 0), 0);
    }

    // Tự động chuẩn hóa tỉ lệ của tất cả các ô active về đúng tổng 100%
    normalizeProbabilities() {
        const active = this.getActivePrizes();
        if (active.length === 0) return;

        const currentTotal = this.getTotalProbability();
        if (currentTotal <= 0) {
            const equalShare = parseFloat((100 / active.length).toFixed(1));
            active.forEach(p => p.probability = equalShare);
        } else {
            let runningSum = 0;
            active.forEach((p, idx) => {
                if (idx === active.length - 1) {
                    // Ô cuối cùng nhận phần bù trừ để tổng vừa tròn 100%
                    p.probability = Math.max(0, parseFloat((100 - runningSum).toFixed(2)));
                } else {
                    const norm = parseFloat(((p.probability / currentTotal) * 100).toFixed(2));
                    p.probability = norm;
                    runningSum += norm;
                }
            });
        }
        this.savePrizes(this.prizes);
    }

    /**
     * Thuật toán chọn phần thưởng trúng giải theo trọng số xác suất
     * @returns {Object} { winningPrize, winningIndexInActive }
     */
    pickWinningPrize(randomFn = () => this.getRandomUnit()) {
        const activePrizes = this.getActivePrizes();
        if (activePrizes.length === 0) return null;

        const candidatePrizes = this.getEligiblePrizes();
        if (candidatePrizes.length === 0) return null;

        const totalWeight = candidatePrizes.reduce((sum, p) => sum + Number(p.probability), 0);

        // Khoảng nửa mở [0, totalWeight) bảo đảm ô 0% tuyệt đối không thể trúng.
        const unit = Math.min(Math.max(Number(randomFn()), 0), 1 - Number.EPSILON);
        const randomVal = unit * totalWeight;
        let cumulative = 0;

        for (const prize of candidatePrizes) {
            cumulative += Number(prize.probability);
            if (randomVal < cumulative) {
                return {
                    prize,
                    indexInActive: activePrizes.indexOf(prize)
                };
            }
        }

        // Fallback ô cuối cùng
        const fallbackPrize = candidatePrizes[candidatePrizes.length - 1];
        return {
            prize: fallbackPrize,
            indexInActive: activePrizes.indexOf(fallbackPrize)
        };
    }

    // Giảm số lượng còn lại khi trúng thưởng (nếu có giới hạn số lượng)
    deductStock(prizeId) {
        if (!this.settings.autoDeductStock) return;
        const prize = this.prizes.find(p => p.id === prizeId);
        if (prize && prize.quantity > 0) {
            prize.quantity -= 1;
            this.savePrizes(this.prizes);
        }
    }

    /**
     * Chạy mô phỏng N lượt quay ảo để kiểm tra tỉ lệ thực tế có chuẩn với % đã cài đặt không
     */
    runSimulation(iterations = 10000) {
        const activePrizes = this.getActivePrizes();
        const counts = {};
        activePrizes.forEach(p => counts[p.id] = 0);

        for (let i = 0; i < iterations; i++) {
            const result = this.pickWinningPrize();
            if (result && result.prize) {
                counts[result.prize.id] = (counts[result.prize.id] || 0) + 1;
            }
        }

        return activePrizes.map(p => {
            const count = counts[p.id] || 0;
            const actualPercent = parseFloat(((count / iterations) * 100).toFixed(2));
            return {
                id: p.id,
                label: p.label,
                configuredPercent: p.probability,
                hits: count,
                actualPercent: actualPercent,
                diff: parseFloat((actualPercent - p.probability).toFixed(2))
            };
        });
    }
}

window.adminManager = new AdminManager();
