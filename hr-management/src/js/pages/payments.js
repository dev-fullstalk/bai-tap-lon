import { paymentService } from '../services/paymentService.js';
import { employeeService } from '../services/employeeService.js';
import { toast } from '../shared/notifications.js';
import { formatCurrency } from '../utils/validation.js';

let allPayments = [];
let allEmployees = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initPaymentsPage();
  setupEventListeners();
});

async function initPaymentsPage() {
  try {
    const [payments, employees] = await Promise.all([
      paymentService.getAll(),
      employeeService.getAll()
    ]);
    allPayments = payments;
    allEmployees = employees;

    populateEmployeeSelect(employees);
    updatePayrollKPIs(allPayments);
    renderPaymentsTable(allPayments);
  } catch (error) {
    console.error('Lỗi tải bảng lương:', error);
    toast.error('Không thể tải dữ liệu bảng lương');
  }
}

function populateEmployeeSelect(employees) {
  const select = document.querySelector('#pay-employee');
  if (select) {
    select.innerHTML = employees.map(e => `
      <option value="${e.id}" data-salary="${e.base_salary || 0}">
        ${e.full_name} (${e.emp_code}) - ${formatCurrency(e.base_salary || 0)}
      </option>
    `).join('');
  }
}

function updatePayrollKPIs(payments) {
  const total = payments.reduce((acc, curr) => acc + Number(curr.net_salary || 0), 0);
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const elTotal = document.querySelector('#kpi-pay-total');
  const elPaid = document.querySelector('#kpi-pay-paid-count');
  const elPending = document.querySelector('#kpi-pay-pending-count');

  if (elTotal) elTotal.textContent = formatCurrency(total);
  if (elPaid) elPaid.textContent = `${paidCount} kỳ lương`;
  if (elPending) elPending.textContent = `${pendingCount} kỳ lương`;
}

function renderPaymentsTable(payments) {
  const tbody = document.querySelector('#payments-table-body');
  if (!tbody) return;

  if (payments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Không tìm thấy kỳ lương nào.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = payments.map(pay => {
    const emp = pay.employees;
    const empName = emp ? emp.full_name : 'Nhân viên';
    const deptName = emp && emp.departments ? emp.departments.name : '-';

    const statusBadge = pay.status === 'paid'
      ? '<span class="badge badge-success"><span class="badge-dot"></span>Đã chi trả</span>'
      : '<span class="badge badge-warning"><span class="badge-dot"></span>Chờ chi trả</span>';

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${empName.slice(0, 2).toUpperCase()}</div>
            <div class="user-cell-meta">
              <span class="user-cell-name">${empName}</span>
              <span class="user-cell-sub">${deptName}</span>
            </div>
          </div>
        </td>
        <td><strong>Tháng ${pay.month}/${pay.year}</strong></td>
        <td><span class="salary-amount">${formatCurrency(pay.base_salary)}</span></td>
        <td>${pay.work_days || 22} ngày</td>
        <td><span style="color: var(--success); font-weight: 600;">+${formatCurrency(pay.bonus || 0)}</span></td>
        <td><span style="color: var(--danger); font-weight: 600;">-${formatCurrency(pay.deductions || 0)}</span></td>
        <td><span class="salary-amount salary-net">${formatCurrency(pay.net_salary)}</span></td>
        <td>${statusBadge}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-outline btn-view-slip" data-id="${pay.id}">📄 Phiếu</button>
            ${pay.status === 'pending' ? `
              <button class="btn btn-sm btn-primary btn-mark-paid" data-id="${pay.id}">💵 Chi lương</button>
            ` : ''}
            <button class="action-icon-btn danger btn-delete-pay" data-id="${pay.id}" title="Xóa">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachPaymentActions();
}

function attachPaymentActions() {
  document.querySelectorAll('.btn-mark-paid').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        await paymentService.updateStatus(id, 'paid');
        toast.success('Đã xác nhận thanh toán lương!');
        await initPaymentsPage();
      } catch (err) {
        toast.error('Không thể cập nhật trạng thái');
      }
    });
  });

  document.querySelectorAll('.btn-view-slip').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openPaySlipModal(id);
    });
  });

  document.querySelectorAll('.btn-delete-pay').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Bạn có chắc muốn xóa bản ghi lương này?')) {
        try {
          await paymentService.delete(id);
          toast.success('Đã xóa bản ghi lương');
          await initPaymentsPage();
        } catch (err) {
          toast.error('Không thể xóa bản ghi');
        }
      }
    });
  });
}

function openPaySlipModal(id) {
  const pay = allPayments.find(p => p.id === id);
  if (!pay) return;

  const emp = pay.employees;
  const empName = emp ? emp.full_name : 'Nhân viên';
  const deptName = emp && emp.departments ? emp.departments.name : '-';

  const modal = document.querySelector('#payslip-modal');
  const content = document.querySelector('#payslip-modal-content');

  if (content) {
    content.innerHTML = `
      <div class="payslip-card">
        <div style="text-align: center; margin-bottom: 12px;">
          <h3 style="margin-bottom: 4px;">PHIẾU LƯƠNG NHÂN VIÊN</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Kỳ lương: Tháng ${pay.month} năm ${pay.year}</p>
        </div>
        <div class="payslip-row">
          <span>Họ và tên:</span>
          <strong>${empName}</strong>
        </div>
        <div class="payslip-row">
          <span>Phòng ban:</span>
          <span>${deptName}</span>
        </div>
        <div class="payslip-row">
          <span>Số ngày công thực tế:</span>
          <span>${pay.work_days || 22} ngày</span>
        </div>
        <hr style="border: none; border-top: 1px dashed var(--border-color); margin: 6px 0;">
        <div class="payslip-row">
          <span>Lương cơ bản:</span>
          <span>${formatCurrency(pay.base_salary)}</span>
        </div>
        <div class="payslip-row">
          <span>Thưởng & Phụ cấp:</span>
          <span style="color: var(--success);">+${formatCurrency(pay.bonus || 0)}</span>
        </div>
        <div class="payslip-row">
          <span>Khấu trừ (Bảo hiểm, thuế):</span>
          <span style="color: var(--danger);">-${formatCurrency(pay.deductions || 0)}</span>
        </div>
        <div class="payslip-row total">
          <span>THỰC LĨNH:</span>
          <span>${formatCurrency(pay.net_salary)}</span>
        </div>
        <div class="payslip-row" style="margin-top: 8px;">
          <span>Trạng thái:</span>
          <span><strong>${pay.status === 'paid' ? 'Đã nhận chuyển khoản' : 'Đang xử lý thanh toán'}</strong></span>
        </div>
      </div>
    `;
  }

  if (modal) modal.showModal();
}

function setupEventListeners() {
  const filterStatus = document.querySelector('#filter-pay-status');
  const searchInput = document.querySelector('#search-pay');

  const filter = () => {
    const status = filterStatus ? filterStatus.value : '';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = allPayments.filter(p => {
      const matchStatus = !status || p.status === status;
      const emp = p.employees;
      const matchQuery = !query || (emp && emp.full_name.toLowerCase().includes(query));
      return matchStatus && matchQuery;
    });

    renderPaymentsTable(filtered);
  };

  if (filterStatus) filterStatus.addEventListener('change', filter);
  if (searchInput) searchInput.addEventListener('input', filter);

  // Modal tạo lương
  const btnOpenAdd = document.querySelector('#btn-open-add-pay');
  const modal = document.querySelector('#pay-modal');
  const btnClose = document.querySelector('#btn-close-pay-modal');
  const btnCancel = document.querySelector('#btn-cancel-pay-modal');
  const form = document.querySelector('#pay-form');
  const selectEmp = document.querySelector('#pay-employee');
  const inputBaseSalary = document.querySelector('#pay-base-salary');

  if (selectEmp && inputBaseSalary) {
    selectEmp.addEventListener('change', () => {
      const opt = selectEmp.selectedOptions[0];
      if (opt) {
        inputBaseSalary.value = opt.getAttribute('data-salary') || 0;
      }
    });
  }

  if (btnOpenAdd && modal) {
    btnOpenAdd.addEventListener('click', () => {
      form.reset();
      const now = new Date();
      document.querySelector('#pay-month').value = now.getMonth() + 1;
      document.querySelector('#pay-year').value = now.getFullYear();
      if (selectEmp && selectEmp.selectedOptions[0]) {
        inputBaseSalary.value = selectEmp.selectedOptions[0].getAttribute('data-salary') || 0;
      }
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Close payslip modal
  const slipModal = document.querySelector('#payslip-modal');
  const slipClose = document.querySelector('#btn-close-slip-modal');
  if (slipClose && slipModal) {
    slipClose.addEventListener('click', () => slipModal.close());
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const employeeId = document.querySelector('#pay-employee').value;
      const month = Number(document.querySelector('#pay-month').value);
      const year = Number(document.querySelector('#pay-year').value);
      const baseSalary = Number(document.querySelector('#pay-base-salary').value) || 0;
      const workDays = Number(document.querySelector('#pay-work-days').value) || 22;
      const bonus = Number(document.querySelector('#pay-bonus').value) || 0;
      const deductions = Number(document.querySelector('#pay-deductions').value) || 0;
      const status = document.querySelector('#pay-status').value;

      try {
        await paymentService.create({
          employee_id: employeeId,
          month,
          year,
          base_salary: baseSalary,
          work_days: workDays,
          bonus,
          deductions,
          status
        });
        toast.success('Tạo kỳ lương thành công!');
        modal.close();
        await initPaymentsPage();
      } catch (err) {
        toast.error('Không thể tạo kỳ lương');
      }
    });
  }
}
