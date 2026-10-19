import { paymentService } from '../services/paymentService.js';
import { getTable } from '../utils/storage.js';
import { toast } from '../shared/notifications.js';

let allPayments = [];
let filteredPayments = [];
let allEmployees = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 20; // 20 items per page with internal scrollbar

let activeActionPaymentId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initPaymentsPage();
  setupEventListeners();
  setupActionDropdown();
});

async function initPaymentsPage() {
  try {
    allEmployees = getTable('employees') || [];
    allPayments = await paymentService.getAll();
    filteredPayments = [...allPayments];

    populateEmployeeSelect(allEmployees);
    updateKpiStats(allPayments);
    applyFiltersAndRender();
  } catch (error) {
    console.error('Error loading payroll data:', error);
    toast.error('Could not load payroll data');
  }
}

/**
 * Populate employee select from localStorage employees data
 * Stores ID_Employees as value
 */
function populateEmployeeSelect(employees) {
  const select = document.querySelector('#pay-employee');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = `<option value="">-- Select Employee --</option>` + employees.map(emp => {
    const id = emp.ID || emp.id || emp.emp_code;
    const name = emp.FULL_NAME || emp.full_name || 'Unnamed';
    return `<option value="${id}" data-name="${name}">${id} - ${name}</option>`;
  }).join('');

  if (currentVal) {
    select.value = currentVal;
  }
}

/**
 * Update top 4 KPI cards matching screenshot numbers and format
 */
function updateKpiStats(payments) {
  const totalPayments = payments.length;
  const paidCount = payments.filter(p => (p.payment_status || p.status) === 'paid').length;
  const pendingCount = payments.filter(p => (p.payment_status || p.status) === 'pending').length;
  const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const elTotal = document.querySelector('#stat-total-payments');
  const elPaid = document.querySelector('#stat-paid-payments');
  const elPending = document.querySelector('#stat-pending-payments');
  const elAmount = document.querySelector('#stat-total-amount');

  if (elTotal) elTotal.textContent = totalPayments;
  if (elPaid) elPaid.textContent = paidCount;
  if (elPending) elPending.textContent = pendingCount;
  if (elAmount) elAmount.textContent = `$${Math.round(totalAmount).toLocaleString('en-US')}`;
}

/**
 * Formats date into "Sep 30, 2026"
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '-';
  // If already in text format (e.g. "Sep 30, 2026")
  if (dateStr.includes(',') && isNaN(Date.parse(dateStr) === false)) {
    return dateStr;
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day < 10 ? '0' + day : day}, ${year}`;
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Apply search and filters then render table
 */
function applyFiltersAndRender() {
  const searchInput = document.querySelector('#search-payroll');
  const typeFilter = document.querySelector('#filter-payment-type');
  const statusFilter = document.querySelector('#filter-payment-status');
  const dateFilter = document.querySelector('#filter-payment-date');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedType = typeFilter ? typeFilter.value.toLowerCase().trim() : '';
  const selectedStatus = statusFilter ? statusFilter.value.toLowerCase().trim() : '';
  const selectedDate = dateFilter ? dateFilter.value : '';

  filteredPayments = allPayments.filter(pay => {
    // Search by employee name or ID
    const empId = String(pay.ID_Employees || pay.employee_id || '').toLowerCase();
    const empName = String(pay.employee_name || '').toLowerCase();
    const matchesQuery = !query || empId.includes(query) || empName.includes(query);

    // Filter by payment type
    const payType = String(pay.payment_type || '').toLowerCase();
    const matchesType = !selectedType || payType === selectedType;

    // Filter by payment status
    const payStatus = String(pay.payment_status || pay.status || '').toLowerCase();
    const matchesStatus = !selectedStatus || payStatus === selectedStatus;

    // Filter by date
    let matchesDate = true;
    if (selectedDate) {
      const pDate = String(pay.payment_date || pay.due_date || '');
      matchesDate = pDate.startsWith(selectedDate);
    }

    return matchesQuery && matchesType && matchesStatus && matchesDate;
  });

  // Reset to first page when filtering
  currentPage = 1;
  renderTable();
}

/**
 * Render table rows and pagination controls
 */
function renderTable() {
  const tbody = document.querySelector('#payroll-table-body');
  if (!tbody) return;

  const total = filteredPayments.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, total);
  const pagedItems = filteredPayments.slice(startIndex, endIndex);

  if (pagedItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 48px 20px; color: #64748b;">
          No payroll records found matching your filters.
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = pagedItems.map(pay => {
      const empId = pay.ID_Employees || pay.employee_id || 'EMP001';
      const empName = pay.employee_name || 'Employee';
      const type = capitalize(pay.payment_type || 'salary');
      const method = pay.payment_method || 'Bank Transfer';
      const date = formatDisplayDate(pay.payment_date || pay.due_date);
      const isPaid = (pay.payment_status || pay.status || '').toLowerCase() === 'paid';
      const statusBadge = isPaid
        ? '<span class="status-badge status-paid">Paid</span>'
        : '<span class="status-badge status-pending">Pending</span>';
      const desc = pay.description || '-';

      return `
        <tr data-id="${pay.id}">
          <td class="cell-emp-id">${empId}</td>
          <td class="cell-emp-name">${empName}</td>
          <td class="cell-type">${type}</td>
          <td class="cell-method">${method}</td>
          <td class="cell-date">${date}</td>
          <td>${statusBadge}</td>
          <td class="cell-desc" title="${desc}">${desc}</td>
          <td class="th-actions">
            <button type="button" class="btn-action-dots" data-id="${pay.id}" aria-label="Action Menu">⋮</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Update pagination info text
  const paginationInfo = document.querySelector('#pagination-info');
  if (paginationInfo) {
    if (total === 0) {
      paginationInfo.textContent = 'Showing 0 payrolls';
    } else {
      paginationInfo.textContent = `Showing ${startIndex + 1} - ${endIndex} of ${total} payrolls`;
    }
  }

  renderPaginationControls(totalPages);
  attachActionDotsListeners();
}

/**
 * Render pagination numbers and previous/next buttons
 */
function renderPaginationControls(totalPages) {
  const container = document.querySelector('#pagination-controls');
  if (!container) return;

  let html = `
    <button type="button" class="page-btn page-nav" id="btn-prev-page" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">&lt;</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button type="button" class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>
    `;
  }

  html += `
    <button type="button" class="page-btn page-nav" id="btn-next-page" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">&gt;</button>
  `;

  container.innerHTML = html;

  // Add click events to pagination buttons
  container.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.getAttribute('data-page'));
      renderTable();
    });
  });

  const btnPrev = container.querySelector('#btn-prev-page');
  const btnNext = container.querySelector('#btn-next-page');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
  }
}

/**
 * Handle three dots action button click
 */
function attachActionDotsListeners() {
  document.querySelectorAll('.btn-action-dots').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openActionDropdown(btn, id);
    });
  });
}

function openActionDropdown(triggerBtn, paymentId) {
  activeActionPaymentId = paymentId;
  const menu = document.querySelector('#action-dropdown');
  if (!menu) return;

  const payment = allPayments.find(p => p.id === paymentId);
  if (!payment) return;

  const isPaid = (payment.payment_status || payment.status) === 'paid';
  const toggleText = document.querySelector('#action-toggle-status-text');
  if (toggleText) {
    toggleText.textContent = isPaid ? 'Mark as Pending' : 'Mark as Paid';
  }

  const rect = triggerBtn.getBoundingClientRect();
  menu.style.display = 'flex';

  // Calculate coordinates (align right edge of menu to right edge of button)
  const menuWidth = 170;
  let left = rect.right - menuWidth;
  let top = rect.bottom + 6;

  if (top + 160 > window.innerHeight) {
    top = rect.top - 160;
  }
  if (left < 10) left = 10;

  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
}

function closeActionDropdown() {
  const menu = document.querySelector('#action-dropdown');
  if (menu) menu.style.display = 'none';
  activeActionPaymentId = null;
}

function setupActionDropdown() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#action-dropdown') && !e.target.closest('.btn-action-dots')) {
      closeActionDropdown();
    }
  });

  window.addEventListener('resize', closeActionDropdown);
  window.addEventListener('scroll', closeActionDropdown, true);

  // Toggle status action
  const btnToggle = document.querySelector('#action-toggle-status');
  if (btnToggle) {
    btnToggle.addEventListener('click', async () => {
      if (!activeActionPaymentId) return;
      const payment = allPayments.find(p => p.id === activeActionPaymentId);
      if (!payment) return;

      const currentStatus = (payment.payment_status || payment.status) === 'paid' ? 'paid' : 'pending';
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';

      try {
        await paymentService.updateStatus(activeActionPaymentId, newStatus);
        toast.success(`Marked as ${capitalize(newStatus)}`);
        closeActionDropdown();
        await initPaymentsPage();
      } catch (err) {
        toast.error('Failed to update status');
      }
    });
  }

  // View detail action
  const btnView = document.querySelector('#action-view-detail');
  if (btnView) {
    btnView.addEventListener('click', () => {
      if (!activeActionPaymentId) return;
      const id = activeActionPaymentId;
      closeActionDropdown();
      openPayslipModal(id);
    });
  }

  // Edit payment action
  const btnEdit = document.querySelector('#action-edit-payment');
  if (btnEdit) {
    btnEdit.addEventListener('click', () => {
      if (!activeActionPaymentId) return;
      const id = activeActionPaymentId;
      closeActionDropdown();
      openEditPaymentModal(id);
    });
  }

  // Delete payment action
  const btnDelete = document.querySelector('#action-delete-payment');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      if (!activeActionPaymentId) return;
      const id = activeActionPaymentId;
      closeActionDropdown();

      if (confirm('Are you sure you want to delete this payroll payment?')) {
        try {
          await paymentService.delete(id);
          toast.success('Payroll record deleted');
          await initPaymentsPage();
        } catch (err) {
          toast.error('Failed to delete payment');
        }
      }
    });
  }
}

/**
 * Open Modal to Add New Payment
 */
function openAddPaymentModal() {
  const modal = document.querySelector('#payment-modal');
  const form = document.querySelector('#payment-form');
  const title = document.querySelector('#modal-payment-title');
  const editIdInput = document.querySelector('#payment-edit-id');

  if (!modal || !form) return;

  form.reset();
  if (editIdInput) editIdInput.value = '';
  if (title) title.textContent = 'Add Payment';

  // Set default date to today
  const payDateInput = document.querySelector('#pay-date');
  if (payDateInput) {
    payDateInput.value = new Date().toISOString().split('T')[0];
  }

  modal.showModal();
}

/**
 * Open Modal to Edit Existing Payment
 */
function openEditPaymentModal(paymentId) {
  const payment = allPayments.find(p => p.id === paymentId);
  if (!payment) return;

  const modal = document.querySelector('#payment-modal');
  const form = document.querySelector('#payment-form');
  const title = document.querySelector('#modal-payment-title');
  const editIdInput = document.querySelector('#payment-edit-id');

  if (!modal || !form) return;

  if (title) title.textContent = 'Edit Payment';
  if (editIdInput) editIdInput.value = payment.id;

  const selectEmp = document.querySelector('#pay-employee');
  const selectType = document.querySelector('#pay-type');
  const selectMethod = document.querySelector('#pay-method');
  const inputAmount = document.querySelector('#pay-amount');
  const inputDate = document.querySelector('#pay-date');
  const selectStatus = document.querySelector('#pay-status');
  const inputDesc = document.querySelector('#pay-description');

  if (selectEmp) selectEmp.value = payment.ID_Employees || payment.employee_id || '';
  if (selectType) selectType.value = (payment.payment_type || 'salary').toLowerCase();
  if (selectMethod) selectMethod.value = payment.payment_method || 'Bank Transfer';
  if (inputAmount) inputAmount.value = payment.amount || 0;

  // Format date for date input (YYYY-MM-DD)
  if (inputDate) {
    const rawDate = payment.payment_date || payment.due_date;
    if (rawDate && rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      inputDate.value = rawDate;
    } else if (rawDate) {
      const d = new Date(rawDate);
      inputDate.value = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    }
  }

  if (selectStatus) selectStatus.value = (payment.payment_status || payment.status || 'paid').toLowerCase();
  if (inputDesc) inputDesc.value = payment.description || '';

  modal.showModal();
}

/**
 * Open Details Modal
 */
function openPayslipModal(id) {
  const pay = allPayments.find(p => p.id === id);
  if (!pay) return;

  const modal = document.querySelector('#payslip-modal');
  const content = document.querySelector('#payslip-modal-content');

  const empId = pay.ID_Employees || pay.employee_id || 'EMP001';
  const empName = pay.employee_name || 'Employee';
  const type = capitalize(pay.payment_type || 'salary');
  const method = pay.payment_method || 'Bank Transfer';
  const date = formatDisplayDate(pay.payment_date || pay.due_date);
  const status = (pay.payment_status || pay.status) === 'paid' ? 'Paid' : 'Pending';
  const badgeClass = status === 'Paid' ? 'status-paid' : 'status-pending';
  const amount = Number(pay.amount || 0);

  if (content) {
    content.innerHTML = `
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">Employee ID:</span>
          <span class="detail-value"><strong>${empId}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Employee Name:</span>
          <span class="detail-value">${empName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Type:</span>
          <span class="detail-value">${type}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${method}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value" style="font-size: 1.1rem; color: #ea580c; font-weight: 700;">$${amount.toLocaleString('en-US')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Status:</span>
          <span class="status-badge ${badgeClass}">${status}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Description:</span>
          <span class="detail-value" style="max-width: 60%; text-align: right;">${pay.description || '-'}</span>
        </div>
      </div>
    `;
  }

  if (modal) modal.showModal();
}

/**
 * Setup Event Listeners for Filters, Modals and Form Submission
 */
function setupEventListeners() {
  const searchInput = document.querySelector('#search-payroll');
  const typeFilter = document.querySelector('#filter-payment-type');
  const statusFilter = document.querySelector('#filter-payment-status');
  const dateFilter = document.querySelector('#filter-payment-date');
  const btnClearDate = document.querySelector('#btn-clear-date');

  if (searchInput) searchInput.addEventListener('input', applyFiltersAndRender);
  if (typeFilter) typeFilter.addEventListener('change', applyFiltersAndRender);
  if (statusFilter) statusFilter.addEventListener('change', applyFiltersAndRender);

  if (dateFilter) {
    dateFilter.addEventListener('change', () => {
      if (btnClearDate) {
        btnClearDate.style.display = dateFilter.value ? 'grid' : 'none';
      }
      applyFiltersAndRender();
    });
  }

  if (btnClearDate && dateFilter) {
    btnClearDate.addEventListener('click', () => {
      dateFilter.value = '';
      btnClearDate.style.display = 'none';
      applyFiltersAndRender();
    });
  }

  // Open Add Payment Modal
  const btnOpenAdd = document.querySelector('#btn-open-add-payment');
  if (btnOpenAdd) {
    btnOpenAdd.addEventListener('click', openAddPaymentModal);
  }

  // Close Payment Modal
  const modal = document.querySelector('#payment-modal');
  const btnClose = document.querySelector('#btn-close-payment-modal');
  const btnCancel = document.querySelector('#btn-cancel-payment-modal');

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Close Details Modal
  const slipModal = document.querySelector('#payslip-modal');
  const slipClose = document.querySelector('#btn-close-slip-modal');
  const slipDismiss = document.querySelector('#btn-dismiss-slip-modal');

  const closeSlipModal = () => slipModal && slipModal.close();
  if (slipClose) slipClose.addEventListener('click', closeSlipModal);
  if (slipDismiss) slipDismiss.addEventListener('click', closeSlipModal);

  // Form Submission
  const form = document.querySelector('#payment-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const editId = document.querySelector('#payment-edit-id')?.value;
      const selectEmp = document.querySelector('#pay-employee');
      const selectedOption = selectEmp?.selectedOptions[0];

      const employeeId = selectEmp?.value;
      const employeeName = selectedOption?.getAttribute('data-name') || 'Employee';
      const paymentType = document.querySelector('#pay-type')?.value || 'salary';
      const paymentMethod = document.querySelector('#pay-method')?.value || 'Bank Transfer';
      const amount = Number(document.querySelector('#pay-amount')?.value) || 0;
      const paymentDate = document.querySelector('#pay-date')?.value || new Date().toISOString().split('T')[0];
      const paymentStatus = document.querySelector('#pay-status')?.value || 'paid';
      const description = document.querySelector('#pay-description')?.value || '';

      if (!employeeId) {
        toast.warning('Please select an employee from the list');
        return;
      }

      const payload = {
        ID_Employees: employeeId,
        employee_id: employeeId,
        employee_name: employeeName,
        payment_type: paymentType,
        payment_method: paymentMethod,
        amount,
        payment_date: paymentDate,
        due_date: paymentDate,
        payment_status: paymentStatus,
        status: paymentStatus,
        description
      };

      try {
        if (editId) {
          await paymentService.update(editId, payload);
          toast.success('Payment record updated successfully!');
        } else {
          await paymentService.create(payload);
          toast.success('New payment added successfully!');
        }

        modal.close();
        await initPaymentsPage();
      } catch (err) {
        console.error('Error saving payment:', err);
        toast.error('Failed to save payment record');
      }
    });
  }
}
