/**
 * Application Main Controller
 * Kết nối các thành phần: Âm thanh, Pháo hoa, Vòng quay, Bảng Admin và Tương tác người dùng
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Khởi tạo các phần tử DOM
    const canvas = document.getElementById('wheelCanvas');
    const pointer = document.getElementById('wheelPointer');
    const centerSpinBtn = document.getElementById('centerSpinBtn');
    const largeSpinBtn = document.getElementById('largeSpinBtn');
    const appStatusText = document.getElementById('appStatusText');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
    const quickActiveCount = document.getElementById('quickActiveCount');

    // Right Side Panel Elements
    const sidePrizesList = document.getElementById('sidePrizesList');
    const panelPrizeCount = document.getElementById('panelPrizeCount');
    const quickOpenSettingsBtn = document.getElementById('quickOpenSettingsBtn');
    const linkToSettings = document.getElementById('linkToSettings');
    const quickAddBtn = document.getElementById('quickAddBtn');
    const quickAddLabel = document.getElementById('quickAddLabel');
    const quickAddIcon = document.getElementById('quickAddIcon');
    const quickAddColor = document.getElementById('quickAddColor');

    // Admin Elements
    const openAdminBtn = document.getElementById('openAdminBtn');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const adminModal = document.getElementById('adminModal');
    const prizesTableBody = document.getElementById('prizesTableBody');
    const totalProbIndicator = document.getElementById('totalProbIndicator');
    const autoBalanceBtn = document.getElementById('autoBalanceBtn');
    const addNewPrizeBtn = document.getElementById('addNewPrizeBtn');
    const resetDefaultBtn = document.getElementById('resetDefaultBtn');
    const savePrizesBtn = document.getElementById('savePrizesBtn');
    const adminTabBtns = document.querySelectorAll('.tab-btn');
    const adminTabPanes = document.querySelectorAll('.tab-pane');

    // Simulation Elements
    const sim1000Btn = document.getElementById('sim1000Btn');
    const sim10000Btn = document.getElementById('sim10000Btn');
    const simResultsContainer = document.getElementById('simResultsContainer');

    // History Elements
    const historyListContainer = document.getElementById('historyListContainer');
    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Settings Elements
    const spinDurationSelect = document.getElementById('spinDurationSelect');
    const autoDeductCheckbox = document.getElementById('autoDeductCheckbox');
    const exportConfigBtn = document.getElementById('exportConfigBtn');
    const importConfigTriggerBtn = document.getElementById('importConfigTriggerBtn');
    const importConfigFileInput = document.getElementById('importConfigFileInput');

    // Winner Modal Elements
    const winnerModal = document.getElementById('winnerModal');
    const winnerPrizeIcon = document.getElementById('winnerPrizeIcon');
    const winnerPrizeName = document.getElementById('winnerPrizeName');
    const winnerPrizeDesc = document.getElementById('winnerPrizeDesc');
    const claimPrizeBtn = document.getElementById('claimPrizeBtn');

    // Toast Container
    const toastContainer = document.getElementById('toastContainer');

    // 2. Khởi tạo Pháo hoa
    const confettiCanvas = document.getElementById('confettiCanvas');
    window.confettiSystem.init(confettiCanvas);

    // 3. Khởi tạo Vòng quay
    let wheel = new LuckyWheel(canvas, pointer, {
        duration: (window.adminManager.settings.spinDuration || 6.5) * 1000,
        onStart: () => {
            setSpinButtonsState(false);
            appStatusText.textContent = 'Đang quay hồi hộp...';
        },
        onFinished: (wonPrize) => {
            handleSpinFinished(wonPrize);
        }
    });
    let currentSpinOutcome = null;

    // Cập nhật danh sách ban đầu lên vòng quay
    updateWheelFromData();

    // 4. Đồng bộ thiết lập ban đầu
    if (spinDurationSelect) {
        spinDurationSelect.value = (window.adminManager.settings.spinDuration || 6.5).toString();
    }
    if (autoDeductCheckbox) {
        autoDeductCheckbox.checked = window.adminManager.settings.autoDeductStock;
    }

    // ==========================================================================
    // LOGIC QUAY THƯỞNG
    // ==========================================================================
    function triggerSpin() {
        if (wheel.isSpinning) return;

        // Bật Audio Context khi user tương tác đầu tiên
        window.soundController?.init();

        const activePrizes = window.adminManager.getActivePrizes();
        if (activePrizes.length < 2) {
            showToast('Cần ít nhất 2 phần thưởng đang bật để quay!', 'warning');
            return;
        }

        // Chọn phần quà theo tỉ lệ
        const outcome = window.adminManager.pickWinningPrize();
        if (!outcome || outcome.indexInActive < 0) {
            showToast('Không tìm thấy phần thưởng khả dụng (có thể đã hết số lượng)', 'danger');
            return;
        }

        // Khóa kết quả ngay khi bắt đầu; animation chỉ đưa kim tới đúng ô đã chọn.
        currentSpinOutcome = outcome;
        wheel.spinTo(outcome.indexInActive);
    }

    function handleSpinFinished(wonPrize) {
        // Không phụ thuộc vào danh sách giao diện có thể đã được chỉnh trong lúc quay.
        wonPrize = currentSpinOutcome?.prize || wonPrize;
        currentSpinOutcome = null;
        setSpinButtonsState(true);
        appStatusText.textContent = 'Đã trúng thưởng!';

        // Âm thanh ăn mừng và bắn pháo hoa rực rỡ
        window.soundController?.playWin();
        window.confettiSystem?.fire(160);

        // Trừ tồn kho nếu có
        window.adminManager.deductStock(wonPrize.id);

        // Lưu vào lịch sử
        window.adminManager.addHistory(wonPrize);

        // Hiển thị modal chúc mừng
        showWinnerModal(wonPrize);

        // Cập nhật lại giao diện và thông số
        updateWheelFromData();
        renderAdminPrizesTable();
        renderHistoryList();
    }

    function setSpinButtonsState(enabled) {
        centerSpinBtn.disabled = !enabled;
        largeSpinBtn.disabled = !enabled;
    }

    function showWinnerModal(prize) {
        winnerPrizeIcon.textContent = prize.icon || '🎁';
        winnerPrizeName.textContent = prize.label;
        if (prize.quantity === 0) {
            winnerPrizeDesc.textContent = 'Chúc mừng bạn! Đây là phần quà giới hạn cuối cùng trong kho.';
        } else {
            winnerPrizeDesc.textContent = 'Chúc mừng bạn đã may mắn nhận được phần thưởng này!';
        }
        winnerModal.classList.add('active');
    }

    function hideWinnerModal() {
        winnerModal.classList.remove('active');
        window.confettiSystem?.stop();
        appStatusText.textContent = 'Sẵn sàng quay thưởng';
    }

    // ==========================================================================
    // RENDER & SYNC GIAO DIỆN
    // ==========================================================================
    function updateWheelFromData() {
        const activePrizes = window.adminManager.getActivePrizes();
        wheel.setItems(activePrizes);

        // Cập nhật thanh thông số nhanh
        quickActiveCount.textContent = activePrizes.length;

        renderSidePanelPrizes();
    }

    // ==========================================================================
    // RENDER DANH SÁCH BÊN PHẢI VÒNG QUAY (APPLE SIDE PANEL)
    // ==========================================================================
    function renderSidePanelPrizes() {
        if (!sidePrizesList) return;
        sidePrizesList.innerHTML = '';
        const prizes = window.adminManager.prizes;

        if (panelPrizeCount) {
            const activeCount = prizes.filter(p => p.active).length;
            panelPrizeCount.textContent = `${activeCount}/${prizes.length} mục`;
        }

        if (prizes.length === 0) {
            sidePrizesList.innerHTML = `
                <div style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:0.85rem;">
                    Chưa có phần thưởng nào. Hãy nhập tên ở trên và bấm Thêm!
                </div>
            `;
            return;
        }

        prizes.forEach((prize, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = `side-prize-item ${prize.active ? '' : 'disabled'}`;
            itemEl.dataset.id = prize.id;

            itemEl.innerHTML = `
                <div class="side-prize-left">
                    <span class="prize-color-dot" style="background-color: ${prize.color};"></span>
                    <span class="side-prize-icon">${escapeHtml(prize.icon || '🎁')}</span>
                    <div class="side-prize-info">
                        <span class="side-prize-name" title="${escapeHtml(prize.label)}">${escapeHtml(prize.label)}</span>
                        <div class="side-prize-meta">
                            <span>${prize.quantity === -1 ? 'Vô hạn' : 'Còn ' + prize.quantity}</span>
                        </div>
                    </div>
                </div>
                <div class="side-prize-right">
                    <label class="apple-switch" title="Bật/Tắt ô này trên vòng quay">
                        <input type="checkbox" class="side-toggle-active" ${prize.active ? 'checked' : ''}>
                        <span class="apple-slider"></span>
                    </label>
                    <button class="btn-item-del side-delete-btn" title="Xóa phần quà này">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;

            // Gán sự kiện Toggle Switch Bật/Tắt
            const toggleInput = itemEl.querySelector('.side-toggle-active');
            toggleInput.addEventListener('change', () => {
                prize.active = toggleInput.checked;
                window.adminManager.savePrizes(window.adminManager.prizes);
                updateWheelFromData();
                renderAdminPrizesTable();
            });

            // Gán sự kiện Xóa
            const delBtn = itemEl.querySelector('.side-delete-btn');
            delBtn.addEventListener('click', () => {
                if (window.adminManager.prizes.length <= 2) {
                    showToast('Cần giữ ít nhất 2 phần thưởng trên vòng quay!', 'warning');
                    return;
                }
                const removedName = prize.label;
                window.adminManager.prizes.splice(index, 1);
                window.adminManager.savePrizes(window.adminManager.prizes);
                updateWheelFromData();
                renderAdminPrizesTable();
                showToast(`Đã xóa "${removedName}"`, 'info');
            });

            sidePrizesList.appendChild(itemEl);
        });
    }

    // Xử lý thêm nhanh phần thưởng ngay từ cột bên phải
    function handleQuickAdd() {
        if (!quickAddLabel) return;
        const label = quickAddLabel.value.trim();
        if (!label) {
            showToast('Vui lòng nhập tên phần thưởng!', 'warning');
            quickAddLabel.focus();
            return;
        }

        const icon = quickAddIcon ? (quickAddIcon.value.trim() || '🎁') : '🎁';
        const color = quickAddColor ? (quickAddColor.value || '#0071e3') : '#0071e3';

        const newPrize = {
            id: Date.now().toString(),
            label: label,
            probability: 5,
            quantity: -1,
            color: color,
            textColor: '#ffffff',
            icon: icon,
            active: true
        };

        window.adminManager.prizes.push(newPrize);
        window.adminManager.savePrizes(window.adminManager.prizes);

        quickAddLabel.value = '';

        // Tự đổi sang 1 màu đẹp khác cho lần thêm tiếp theo
        const appleColors = ['#0071e3', '#34c759', '#ff9500', '#e05688', '#af52de', '#0284c7', '#059669', '#1d1d1f'];
        if (quickAddColor) {
            quickAddColor.value = appleColors[Math.floor(Math.random() * appleColors.length)];
        }

        updateWheelFromData();
        renderAdminPrizesTable();
        showToast(`Đã thêm "${label}" vào vòng quay!`, 'success');
        quickAddLabel.focus();
    }

    function renderAdminPrizesTable() {
        prizesTableBody.innerHTML = '';
        const prizes = window.adminManager.prizes;

        prizes.forEach((prize, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = prize.id;

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="prize-active-input" ${prize.active ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;">
                </td>
                <td>
                    <input type="text" class="input-text prize-label-input" value="${escapeHtml(prize.label)}">
                </td>
                <td>
                    <input type="text" class="input-emoji prize-icon-input" value="${escapeHtml(prize.icon || '🎁')}" maxlength="2">
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:4px;">
                        <input type="number" step="0.1" min="0" max="100" class="input-number prize-prob-input" value="${prize.probability}">
                        <span style="font-size:0.8rem;color:var(--text-muted);">%</span>
                    </div>
                </td>
                <td>
                    <input type="number" step="1" min="-1" class="input-number prize-qty-input" value="${prize.quantity}" title="-1 là không giới hạn">
                </td>
                <td>
                    <input type="color" class="input-color prize-color-input" value="${prize.color}">
                </td>
                <td>
                    <input type="color" class="input-color prize-text-color-input" value="${prize.textColor || '#ffffff'}">
                </td>
                <td style="text-align: center;">
                    <button class="btn-del delete-prize-btn" title="Xóa phần quà này">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;

            // Gán sự kiện cho từng dòng
            const activeInput = tr.querySelector('.prize-active-input');
            const labelInput = tr.querySelector('.prize-label-input');
            const iconInput = tr.querySelector('.prize-icon-input');
            const probInput = tr.querySelector('.prize-prob-input');
            const qtyInput = tr.querySelector('.prize-qty-input');
            const colorInput = tr.querySelector('.prize-color-input');
            const textColorInput = tr.querySelector('.prize-text-color-input');
            const deleteBtn = tr.querySelector('.delete-prize-btn');

            activeInput.addEventListener('change', () => {
                prize.active = activeInput.checked;
                updateTotalProbIndicator();
            });

            labelInput.addEventListener('input', () => {
                prize.label = labelInput.value;
            });

            iconInput.addEventListener('input', () => {
                prize.icon = iconInput.value;
            });

            probInput.addEventListener('input', () => {
                prize.probability = parseFloat(probInput.value) || 0;
                updateTotalProbIndicator();
            });

            qtyInput.addEventListener('input', () => {
                prize.quantity = parseInt(qtyInput.value, 10);
            });

            colorInput.addEventListener('input', () => {
                prize.color = colorInput.value;
            });

            textColorInput.addEventListener('input', () => {
                prize.textColor = textColorInput.value;
            });

            deleteBtn.addEventListener('click', () => {
                if (window.adminManager.prizes.length <= 2) {
                    showToast('Cần giữ ít nhất 2 phần thưởng trên vòng quay!', 'warning');
                    return;
                }
                window.adminManager.prizes.splice(index, 1);
                renderAdminPrizesTable();
                updateTotalProbIndicator();
            });

            prizesTableBody.appendChild(tr);
        });

        updateTotalProbIndicator();
    }

    function updateTotalProbIndicator() {
        const total = window.adminManager.getTotalProbability();
        totalProbIndicator.textContent = `${total.toFixed(1)}%`;

        if (Math.abs(total - 100) < 0.1) {
            totalProbIndicator.className = 'prob-tag valid';
            totalProbIndicator.title = 'Tổng tỉ lệ vừa vặn 100%';
        } else {
            totalProbIndicator.className = 'prob-tag invalid';
            totalProbIndicator.title = 'Tổng tỉ lệ chưa bằng 100%! Bấm "Cân Bằng 100%" để tự động làm tròn.';
        }
    }

    function renderHistoryList() {
        if (!historyListContainer) return;
        const list = window.adminManager.history;
        if (list.length === 0) {
            historyListContainer.innerHTML = `
                <div style="text-align:center;padding:30px;color:var(--text-muted);">
                    <i class="fa-solid fa-box-open" style="font-size:2rem;margin-bottom:8px;display:block;"></i>
                    Chưa có lượt quay trúng thưởng nào được ghi nhận.
                </div>
            `;
            return;
        }

        historyListContainer.innerHTML = list.map(item => `
            <div class="history-item">
                <div class="history-item-left">
                    <span class="history-icon">${escapeHtml(item.prizeIcon)}</span>
                    <div>
                        <div class="history-name">${escapeHtml(item.prizeName)}</div>
                        <div class="history-time">${escapeHtml(item.timestamp)}</div>
                    </div>
                </div>
                <span class="badge-tag badge-success">Đã trao</span>
            </div>
        `).join('');
    }

    // ==========================================================================
    // SỰ KIỆN NÚT BẤM VÀ CÁC THAO TÁC
    // ==========================================================================
    centerSpinBtn.addEventListener('click', triggerSpin);
    largeSpinBtn.addEventListener('click', triggerSpin);
    claimPrizeBtn.addEventListener('click', hideWinnerModal);

    function openSettingsModal() {
        renderAdminPrizesTable();
        renderHistoryList();
        adminModal.classList.add('active');
    }

    openAdminBtn.addEventListener('click', openSettingsModal);
    quickOpenSettingsBtn?.addEventListener('click', openSettingsModal);
    linkToSettings?.addEventListener('click', (e) => {
        e.preventDefault();
        openSettingsModal();
    });

    // Thêm nhanh phần thưởng từ ô nhập liệu bên phải vòng quay
    quickAddBtn?.addEventListener('click', handleQuickAdd);
    quickAddLabel?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleQuickAdd();
        }
    });

    closeAdminBtn.addEventListener('click', () => {
        adminModal.classList.remove('active');
    });

    // Đóng khi click ngoài hộp modal
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('active');
        }
    });

    winnerModal.addEventListener('click', (e) => {
        if (e.target === winnerModal) {
            hideWinnerModal();
        }
    });

    // Chuyển Tab trong Admin
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(btn.dataset.tab);
            if (targetPane) targetPane.classList.add('active');

            if (btn.dataset.tab === 'historyTab') {
                renderHistoryList();
            }
        });
    });

    // Cân bằng tỉ lệ 100%
    autoBalanceBtn.addEventListener('click', () => {
        window.adminManager.normalizeProbabilities();
        renderAdminPrizesTable();
        showToast('Đã tự động cân bằng các tỉ lệ về tổng 100%!', 'success');
    });

    // Thêm quà mới
    addNewPrizeBtn.addEventListener('click', () => {
        const appleColors = ['#0071e3', '#34c759', '#ff9500', '#e05688', '#af52de', '#0284c7', '#059669', '#1d1d1f'];
        const randomColor = appleColors[Math.floor(Math.random() * appleColors.length)];
        const newPrize = {
            id: Date.now().toString(),
            label: `Phần Quà ${window.adminManager.prizes.length + 1}`,
            probability: 5,
            quantity: -1,
            color: randomColor,
            textColor: '#ffffff',
            icon: '🎁',
            active: true
        };
        window.adminManager.prizes.push(newPrize);
        renderAdminPrizesTable();
        showToast('Đã thêm 1 ô phần thưởng mới.', 'success');
    });

    // Đặt lại mặc định
    resetDefaultBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đặt lại tất cả phần quà về danh sách mặc định ban đầu?')) {
            window.adminManager.resetDefault();
            renderAdminPrizesTable();
            updateWheelFromData();
            showToast('Đã khôi phục cài đặt mặc định!', 'success');
        }
    });

    // Lưu thay đổi
    savePrizesBtn.addEventListener('click', () => {
        window.adminManager.savePrizes(window.adminManager.prizes);
        updateWheelFromData();
        showToast('Đã lưu dữ liệu phần quà & tỉ lệ thành công!', 'success');
        adminModal.classList.remove('active');
    });

    // Tùy chọn cài đặt
    spinDurationSelect?.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value) || 6.5;
        window.adminManager.settings.spinDuration = val;
        wheel.spinDuration = val * 1000;
        window.adminManager.saveSettings(window.adminManager.settings);
        showToast(`Đã đổi thời gian quay thành ${val} giây.`, 'success');
    });

    autoDeductCheckbox?.addEventListener('change', (e) => {
        window.adminManager.settings.autoDeductStock = e.target.checked;
        window.adminManager.saveSettings(window.adminManager.settings);
        showToast('Đã cập nhật tùy chọn trừ tồn kho.', 'success');
    });

    // Bật/tắt âm thanh
    soundToggleBtn.addEventListener('click', () => {
        const muted = window.soundController.toggleMute();
        soundToggleBtn.innerHTML = muted 
            ? '<i class="fa-solid fa-volume-xmark" style="color:#ef4444;"></i>' 
            : '<i class="fa-solid fa-volume-high"></i>';
        showToast(muted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh', 'warning');
    });

    // Toàn màn hình
    fullscreenToggleBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(err);
            });
            fullscreenToggleBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            fullscreenToggleBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
        }
    });

    // Xuất CSV Lịch Sử
    exportHistoryBtn?.addEventListener('click', () => {
        const history = window.adminManager.history;
        if (history.length === 0) {
            showToast('Chưa có lịch sử để xuất!', 'warning');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM UTF-8 cho Excel
        csvContent += "Mã,Tên Phần Thưởng,Thời Gian\n";
        history.forEach(row => {
            csvContent += `"${row.id}","${row.prizeName}","${row.timestamp}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `lich_su_trung_thuong_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    clearHistoryBtn?.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn xóa sạch toàn bộ lịch sử trúng thưởng?')) {
            window.adminManager.clearHistory();
            renderHistoryList();
            showToast('Đã xóa toàn bộ lịch sử!', 'success');
        }
    });

    // Xuất/Nhập file cấu hình JSON
    exportConfigBtn?.addEventListener('click', () => {
        const data = {
            prizes: window.adminManager.prizes,
            settings: window.adminManager.settings
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cau_hinh_vong_quay_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    importConfigTriggerBtn?.addEventListener('click', () => {
        importConfigFileInput.click();
    });

    importConfigFileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed.prizes && Array.isArray(parsed.prizes)) {
                    window.adminManager.savePrizes(parsed.prizes);
                    if (parsed.settings) {
                        window.adminManager.saveSettings(parsed.settings);
                    }
                    renderAdminPrizesTable();
                    updateWheelFromData();
                    showToast('Nhập cấu hình JSON thành công!', 'success');
                } else {
                    showToast('Định dạng file cấu hình không hợp lệ!', 'danger');
                }
            } catch (err) {
                showToast('Lỗi đọc file JSON: ' + err.message, 'danger');
            }
        };
        reader.readAsText(file);
    });

    // Chạy mô phỏng (Simulation)
    function runSim(iterations) {
        simResultsContainer.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size:1.8rem;margin-bottom:8px;display:block;color:var(--primary);"></i>
                Đang chạy mô phỏng ${iterations.toLocaleString()} lượt quay ảo...
            </div>
        `;

        setTimeout(() => {
            const results = window.adminManager.runSimulation(iterations);
            let html = `
                <table class="sim-results-table">
                    <thead>
                        <tr>
                            <th>Phần Thưởng</th>
                            <th style="width:110px;">Thiết Lập (%)</th>
                            <th style="width:110px;">Số Lần Trúng</th>
                            <th style="width:110px;">Thực Tế (%)</th>
                            <th style="width:110px;">Sai Số (+/-)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            results.forEach(r => {
                const diffColor = Math.abs(r.diff) <= 0.6 ? '#34d399' : (Math.abs(r.diff) <= 1.2 ? '#fbbf24' : '#f87171');
                html += `
                    <tr>
                        <td style="font-weight:600;color:#ffffff;">${escapeHtml(r.label)}</td>
                        <td>${r.configuredPercent}%</td>
                        <td>${r.hits.toLocaleString()}</td>
                        <td style="font-weight:700;color:var(--primary);">${r.actualPercent}%</td>
                        <td style="color:${diffColor};font-weight:700;">${r.diff > 0 ? '+' : ''}${r.diff}%</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
                <div style="margin-top:12px;font-size:0.8rem;color:var(--text-muted);text-align:right;">
                    Mô phỏng hoàn tất: ${iterations.toLocaleString()} lượt. Định luật số lớn (Law of Large Numbers) chứng minh xác suất đạt độ tin cậy tuyệt đối.
                </div>
            `;

            simResultsContainer.innerHTML = html;
        }, 100);
    }

    sim1000Btn?.addEventListener('click', () => runSim(1000));
    sim10000Btn?.addEventListener('click', () => runSim(10000));

    // Phím tắt bàn phím: Phím Cách (Space) để quay, Esc để đóng modal
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            triggerSpin();
        } else if (e.code === 'Escape') {
            adminModal.classList.remove('active');
            hideWinnerModal();
        }
    });

    // Helper: Toast Notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-circle-check' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info');
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
