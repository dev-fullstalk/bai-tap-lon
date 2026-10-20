import { paymentService } from '../services/paymentService.js';
import { getTable, saveTable } from '../utils/storage.js';
import { toast } from '../shared/notifications.js';

let currentPayment = null;
let currentEmployee = null;
let currentDepartment = null;
let allPayments = [];
let allEmployees = [];
let allDepartments = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initPaymentDetailPage();
  setupTabs();
  setupActionButtons();
  setupEditModal();
});

async function initPaymentDetailPage() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const payId = urlParams.get('id') || 'PAY-001';

    allPayments = await paymentService.getAll();
    allEmployees = getTable('employees') || [];
    allDepartments = getTable('departments') || [];

    // Find requested payment or fallback to the first one
    currentPayment = allPayments.find(p => p.id === payId) || allPayments[0];

    if (!currentPayment) {
      toast.error('Payment record not found');
      return;
    }

    // Resolve employee and department
    const empId = currentPayment.ID_Employees || currentPayment.employee_id;
    currentEmployee = allEmployees.find(e => (e.ID || e.id || e.emp_code) === empId) || allEmployees[0];

    if (currentEmployee) {
      const deptId = currentEmployee.ID_DEPARTMENT || currentEmployee.department_id;
      currentDepartment = allDepartments.find(d => (d.ID_DEPARTMENT || d.id || d.code) === deptId) || null;
    }

    renderRegion1PaymentDetails(currentPayment, currentEmployee);
    renderRegion2RelatedTables(currentPayment, currentEmployee, currentDepartment);

  } catch (err) {
    console.error('Error loading payment detail page:', err);
    toast.error('Failed to load payment details');
  }
}

/**
 * Format date into "Sep 30, 2026"
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '-';
  if (dateStr.includes(',') && !isNaN(Date.parse(dateStr))) return dateStr;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day < 10 ? '0' + day : day}, ${year}`;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * REGION 1: Render Payment Details (Left Side)
 */
function renderRegion1PaymentDetails(payment, employee) {
  const isPaid = (payment.payment_status || payment.status || '').toLowerCase() === 'paid';
  const statusBadge = document.querySelector('#detail-payment-status-badge');
  const toggleBtnText = document.querySelector('#btn-toggle-status-text');

  // Top info
  document.querySelector('#detail-payment-id').textContent = payment.id;
  document.querySelector('#page-payment-title').textContent = `Payment Details (${payment.id})`;

  if (statusBadge) {
    statusBadge.className = `status-badge ${isPaid ? 'status-paid' : 'status-pending'}`;
    statusBadge.textContent = isPaid ? 'Paid' : 'Pending';
  }

  if (toggleBtnText) {
    toggleBtnText.textContent = isPaid ? 'Mark as Pending' : 'Mark as Paid';
  }

  // Hero amount
  const amount = Number(payment.amount || 0);
  document.querySelector('#detail-payment-amount').textContent = Math.round(amount).toLocaleString('en-US');
  document.querySelector('#detail-type-tag').textContent = capitalize(payment.payment_type || 'salary');

  // Key-value list
  document.querySelector('#info-payment-id').textContent = payment.id;
  document.querySelector('#info-employee-id').textContent = payment.ID_Employees || (employee ? (employee.ID || employee.id) : 'NV001');
  document.querySelector('#info-employee-name').textContent = employee ? (employee.FULL_NAME || employee.full_name) : (payment.employee_name || 'Nhân viên');
  document.querySelector('#info-payment-type').textContent = capitalize(payment.payment_type || 'salary');
  document.querySelector('#info-payment-method').textContent = payment.payment_method || 'Bank Transfer';
  document.querySelector('#info-payment-date').textContent = formatDisplayDate(payment.payment_date || payment.due_date);
  document.querySelector('#info-payment-status').textContent = isPaid ? 'Paid (Completed)' : 'Pending (Awaiting Payout)';
  
  // Random reference code based on ID
  const refCode = payment.id.replace('PAY-', '#TXN-2026-');
  document.querySelector('#info-payment-ref').textContent = refCode;

  // Description
  document.querySelector('#info-payment-desc').textContent = payment.description || 'No description provided for this payment record.';
}

/**
 * REGION 2: Render Related Module Tables (Right Side)
 */
function renderRegion2RelatedTables(payment, employee, department) {
  const empId = payment.ID_Employees || (employee ? (employee.ID || employee.id) : 'NV001');

  // --- 1. Employee & Department Tab ---
  if (employee) {
    document.querySelector('#rel-emp-name').textContent = employee.FULL_NAME || employee.full_name || 'Unnamed';
    document.querySelector('#rel-emp-id').textContent = employee.ID || employee.id || empId;
    document.querySelector('#rel-emp-position').textContent = employee.POSITION || employee.position || 'Staff';
    document.querySelector('#rel-emp-email').textContent = employee.EMAIL || employee.email || 'N/A';
    document.querySelector('#rel-emp-phone').textContent = employee.SDT || employee.phone || 'N/A';
    document.querySelector('#rel-emp-basesalary').textContent = `$${Math.round(payment.amount || 2500).toLocaleString('en-US')}`;

    const empStatus = (employee.STATUS || employee.status || 'Active');
    const empStatusEl = document.querySelector('#rel-emp-status');
    if (empStatusEl) {
      empStatusEl.className = `status-badge ${empStatus.toLowerCase() === 'active' ? 'status-paid' : 'status-pending'}`;
      empStatusEl.textContent = empStatus;
    }

    // Avatar
    const avatarImg = document.querySelector('#rel-emp-avatar');
    const avatarFallback = document.querySelector('#rel-emp-avatar-fallback');
    const avatarUrl = employee.AVATAR || employee.avatar;

    if (avatarUrl && avatarImg) {
      avatarImg.src = avatarUrl;
      avatarImg.style.display = 'block';
      if (avatarFallback) avatarFallback.style.display = 'none';
    } else if (avatarFallback) {
      const initials = (employee.FULL_NAME || 'NV').slice(0, 2).toUpperCase();
      avatarFallback.textContent = initials;
      avatarFallback.style.display = 'grid';
      if (avatarImg) avatarImg.style.display = 'none';
    }

    // Link to employee profile
    const linkFullEmp = document.querySelector('#link-view-full-employee');
    if (linkFullEmp) {
      linkFullEmp.href = `employee-detail.html?id=${employee.ID || employee.id || empId}`;
    }
  }

  // Department
  if (department) {
    document.querySelector('#rel-dept-name').textContent = department.NAME || department.name || 'General';
    document.querySelector('#rel-dept-code').textContent = department.CODE || department.code || 'GEN';
    document.querySelector('#rel-dept-manager').textContent = department.DIRECT_MANAGER || department.manager_id || 'NV001';
    document.querySelector('#rel-dept-desc').textContent = department.DESCRIPTION || department.description || 'Department operations and team activities.';

    const deptStatus = department.STATUS || department.status || 'Active';
    const deptStatusEl = document.querySelector('#rel-dept-status');
    if (deptStatusEl) {
      deptStatusEl.className = `status-badge ${deptStatus.toLowerCase() === 'active' ? 'status-paid' : 'status-pending'}`;
      deptStatusEl.textContent = deptStatus;
    }
  }

  // --- 2. Attendance Table ---
  renderAttendanceTable(empId);

  // --- 3. Requests Table ---
  renderRequestsTable(empId);

  // --- 4. Other Payments Table ---
  renderOtherPaymentsTable(empId, payment.id);
}

/**
 * Render Related Attendance logs for this employee
 */
function renderAttendanceTable(employeeId) {
  const attendanceData = getTable('attendance') || [];
  let userAttendance = attendanceData.filter(a => a.employee_id === employeeId);

  // If no attendance records in localStorage, provide realistic logs for this employee
  if (userAttendance.length === 0) {
    userAttendance = [
      { id: 'att-1', date: '2026-10-18', check_in: '08:25', check_out: '17:35', status: 'on_time', note: 'Standard working day' },
      { id: 'att-2', date: '2026-10-17', check_in: '08:29', check_out: '17:30', status: 'on_time', note: 'Standard working day' },
      { id: 'att-3', date: '2026-10-16', check_in: '08:45', check_out: '17:40', status: 'late', note: 'Late 15 mins (traffic)' },
      { id: 'att-4', date: '2026-10-15', check_in: '08:20', check_out: '17:30', status: 'on_time', note: 'Standard working day' },
      { id: 'att-5', date: '2026-10-14', check_in: '08:22', check_out: '17:32', status: 'on_time', note: 'Standard working day' }
    ];
  }

  const badgeCount = document.querySelector('#badge-attendance-count');
  if (badgeCount) badgeCount.textContent = `${userAttendance.length} records`;

  const tbody = document.querySelector('#related-attendance-body');
  if (!tbody) return;

  tbody.innerHTML = userAttendance.map(att => {
    const isOnTime = att.status === 'on_time';
    const statusBadge = isOnTime
      ? '<span class="status-badge status-paid">On Time</span>'
      : '<span class="status-badge status-pending">Late</span>';

    return `
      <tr>
        <td><strong>${formatDisplayDate(att.date)}</strong></td>
        <td>${att.check_in || '08:30'}</td>
        <td>${att.check_out || '17:30'}</td>
        <td>${statusBadge}</td>
        <td class="text-muted">${att.note || '-'}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Related Requests for this employee
 */
function renderRequestsTable(employeeId) {
  const requestsData = getTable('requests') || [];
  let userRequests = requestsData.filter(r => r.employee_id === employeeId);

  if (userRequests.length === 0) {
    userRequests = [
      { id: 'REQ-101', type: 'Annual Leave', start_date: '2026-09-10', end_date: '2026-09-12', reason: 'Personal vacation with family', status: 'approved' },
      { id: 'REQ-088', type: 'Overtime', start_date: '2026-08-20', end_date: '2026-08-20', reason: 'Sprint release deployment support', status: 'approved' }
    ];
  }

  const badgeCount = document.querySelector('#badge-requests-count');
  if (badgeCount) badgeCount.textContent = `${userRequests.length} records`;

  const tbody = document.querySelector('#related-requests-body');
  if (!tbody) return;

  tbody.innerHTML = userRequests.map(req => {
    const isApproved = (req.status || '').toLowerCase() === 'approved';
    const statusBadge = isApproved
      ? '<span class="status-badge status-paid">Approved</span>'
      : '<span class="status-badge status-pending">Pending</span>';

    return `
      <tr>
        <td><span class="badge-code">${req.id}</span></td>
        <td><strong>${req.type}</strong></td>
        <td>${formatDisplayDate(req.start_date)} - ${formatDisplayDate(req.end_date)}</td>
        <td class="text-muted">${req.reason || '-'}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Payment History (other payments of this employee)
 */
function renderOtherPaymentsTable(employeeId, currentPayId) {
  const empPayments = allPayments.filter(p => {
    const id = p.ID_Employees || p.employee_id;
    return id === employeeId;
  });

  const badgeCount = document.querySelector('#badge-payments-count');
  if (badgeCount) badgeCount.textContent = `${empPayments.length} payments`;

  const tbody = document.querySelector('#related-payments-body');
  if (!tbody) return;

  if (empPayments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted" style="text-align: center; padding: 24px;">No other payment records found for this employee.</td></tr>`;
    return;
  }

  tbody.innerHTML = empPayments.map(p => {
    const isCurrent = p.id === currentPayId;
    const isPaid = (p.payment_status || p.status) === 'paid';
    const statusBadge = isPaid
      ? '<span class="status-badge status-paid">Paid</span>'
      : '<span class="status-badge status-pending">Pending</span>';

    return `
      <tr style="${isCurrent ? 'background: #fff7ed; font-weight: 600;' : ''}">
        <td><span class="badge-code">${p.id}</span> ${isCurrent ? '<small style="color: #ea580c;">(Current)</small>' : ''}</td>
        <td class="capitalize">${p.payment_type || 'salary'}</td>
        <td>${p.payment_method || 'Bank Transfer'}</td>
        <td>${formatDisplayDate(p.payment_date || p.due_date)}</td>
        <td style="color: #ea580c; font-weight: 700;">$${Math.round(p.amount || 0).toLocaleString('en-US')}</td>
        <td>${statusBadge}</td>
        <td>
          ${!isCurrent ? `<a href="payment-detail.html?id=${p.id}" class="card-action-link" style="font-size: 0.8rem;">View &rarr;</a>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Tabs navigation handler
 */
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.querySelector(`#${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/**
 * Setup Toggle Status action
 */
function setupActionButtons() {
  const btnToggle = document.querySelector('#btn-toggle-payment-status');
  if (btnToggle) {
    btnToggle.addEventListener('click', async () => {
      if (!currentPayment) return;
      const currentStatus = (currentPayment.payment_status || currentPayment.status) === 'paid' ? 'paid' : 'pending';
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';

      try {
        await paymentService.updateStatus(currentPayment.id, newStatus);
        currentPayment.payment_status = newStatus;
        currentPayment.status = newStatus;
        toast.success(`Payment marked as ${capitalize(newStatus)}`);
        
        renderRegion1PaymentDetails(currentPayment, currentEmployee);
        renderOtherPaymentsTable(currentPayment.ID_Employees, currentPayment.id);
      } catch (err) {
        toast.error('Failed to update payment status');
      }
    });
  }
}

/**
 * Setup Edit Modal on Detail Page
 */
function setupEditModal() {
  const modal = document.querySelector('#payment-edit-modal');
  const btnOpenEdit = document.querySelector('#btn-edit-current-payment');
  const btnClose = document.querySelector('#btn-close-edit-modal');
  const btnCancel = document.querySelector('#btn-cancel-edit-modal');
  const form = document.querySelector('#payment-edit-form');

  if (btnOpenEdit) {
    btnOpenEdit.addEventListener('click', () => {
      if (!currentPayment) return;

      const empName = currentEmployee ? (currentEmployee.FULL_NAME || currentEmployee.full_name) : (currentPayment.employee_name || 'Employee');
      const empId = currentPayment.ID_Employees || (currentEmployee ? currentEmployee.ID : 'NV001');

      document.querySelector('#edit-pay-emp').value = `${empId} - ${empName}`;
      document.querySelector('#edit-pay-type').value = (currentPayment.payment_type || 'salary').toLowerCase();
      document.querySelector('#edit-pay-method').value = currentPayment.payment_method || 'Bank Transfer';
      document.querySelector('#edit-pay-amount').value = currentPayment.amount || 0;

      const rawDate = currentPayment.payment_date || currentPayment.due_date;
      if (rawDate && rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        document.querySelector('#edit-pay-date').value = rawDate;
      } else if (rawDate) {
        const d = new Date(rawDate);
        document.querySelector('#edit-pay-date').value = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
      }

      document.querySelector('#edit-pay-status').value = (currentPayment.payment_status || currentPayment.status || 'paid').toLowerCase();
      document.querySelector('#edit-pay-desc').value = currentPayment.description || '';

      if (modal) modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentPayment) return;

      const updatedPayload = {
        payment_type: document.querySelector('#edit-pay-type').value,
        payment_method: document.querySelector('#edit-pay-method').value,
        amount: Number(document.querySelector('#edit-pay-amount').value) || 0,
        payment_date: document.querySelector('#edit-pay-date').value,
        due_date: document.querySelector('#edit-pay-date').value,
        payment_status: document.querySelector('#edit-pay-status').value,
        status: document.querySelector('#edit-pay-status').value,
        description: document.querySelector('#edit-pay-desc').value
      };

      try {
        await paymentService.update(currentPayment.id, updatedPayload);
        toast.success('Payment updated successfully');
        modal.close();

        // Refresh state
        Object.assign(currentPayment, updatedPayload);
        allPayments = await paymentService.getAll();
        renderRegion1PaymentDetails(currentPayment, currentEmployee);
        renderOtherPaymentsTable(currentPayment.ID_Employees, currentPayment.id);
      } catch (err) {
        toast.error('Failed to update payment');
      }
    });
  }
}
