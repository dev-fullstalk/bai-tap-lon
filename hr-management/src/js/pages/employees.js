import { employeeService } from '../services/employeeService.js';
import { departmentService } from '../services/departmentService.js';
import { toast } from '../shared/notifications.js';
import { isEmpty, isValidEmail } from '../utils/validation.js';

let allEmployees = [];
let allDepartments = [];
let filteredEmployees = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 20;

document.addEventListener('DOMContentLoaded', async () => {
  await initEmployeesPage();
  setupEventListeners();
});

async function initEmployeesPage() {
  try {
    const [employees, departments] = await Promise.all([
      employeeService.getAll(),
      departmentService.getAll()
    ]);
    allEmployees = employees;
    allDepartments = departments;
    filteredEmployees = [...allEmployees];

    populateDepartmentSelects(departments);
    populatePositionSelect(allEmployees);
    updateKpiStats(allEmployees, allDepartments);
    renderTable();
  } catch (error) {
    console.error('Error initializing employees page:', error);
    toast.error('Could not load employees data');
  }
}

function updateKpiStats(employees, departments) {
  const total = employees.length;
  const active = employees.filter(e => (e.STATUS || e.status) === 'Active').length;
  const inactive = employees.filter(e => (e.STATUS || e.status) === 'Inactive').length;
  const totalDepts = departments ? departments.length : 6;

  const elTotal = document.querySelector('#stat-total-emp');
  const elActive = document.querySelector('#stat-active-emp');
  const elInactive = document.querySelector('#stat-inactive-emp');
  const elTotalDepts = document.querySelector('#stat-total-depts');

  if (elTotal) elTotal.textContent = total;
  if (elActive) elActive.textContent = active;
  if (elInactive) elInactive.textContent = inactive;
  if (elTotalDepts) elTotalDepts.textContent = totalDepts;
}

function populateDepartmentSelects(departments) {
  const filterSelect = document.querySelector('#filter-department');
  const formSelect = document.querySelector('#emp-department');

  const options = departments.map(d => `<option value="${d.id || d.ID_DEPARTMENT}">${d.name || d.NAME}</option>`).join('');

  if (filterSelect) {
    filterSelect.innerHTML = `<option value="">All Departments</option>` + options;
  }
  if (formSelect) {
    formSelect.innerHTML = `<option value="">-- Select Department --</option>` + options;
  }
}

function populatePositionSelect(employees) {
  const posFilter = document.querySelector('#filter-position');
  if (!posFilter) return;

  const positions = [...new Set(employees.map(e => (e.POSITION || e.position || '').trim()).filter(Boolean))].sort();
  const options = positions.map(pos => `<option value="${pos}">${pos}</option>`).join('');
  posFilter.innerHTML = `<option value="">All Positions</option>` + options;
}

function getDepartmentName(deptId) {
  if (!deptId) return 'General';
  const found = allDepartments.find(d => d.id === deptId || d.ID_DEPARTMENT === deptId || d.name === deptId || d.NAME === deptId || d.code === deptId);
  return found ? (found.NAME || found.name) : deptId;
}

function getStatusBadgeClass(status) {
  return status === 'Active' ? 'status-active' : 'status-inactive';
}

function getInitials(name) {
  if (!name) return 'NV';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function renderTable() {
  const tbody = document.querySelector('#employees-table-body');
  if (!tbody) return;

  const total = filteredEmployees.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, total);
  const pageItems = filteredEmployees.slice(startIdx, endIdx);

  if (total === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 48px; color: #94a3b8;">
          No employees found matching the current filters.
        </td>
      </tr>
    `;
    updatePagination(0, 0, 0, 1);
    return;
  }

  tbody.innerHTML = pageItems.map(emp => {
    const code = emp.ID || emp.emp_code || '-';
    const fullName = emp.FULL_NAME || emp.full_name || 'Unnamed';
    const email = emp.EMAIL || emp.email || '-';
    const phone = emp.SDT || emp.phone || '-';
    const deptId = emp.ID_DEPARTMENT || emp.department_id;
    const deptName = getDepartmentName(deptId);
    const position = emp.POSITION || emp.position || 'Staff';
    const status = (emp.STATUS || emp.status) === 'Inactive' ? 'Inactive' : 'Active';
    const statusClass = getStatusBadgeClass(status);
    const avatarUrl = emp.AVATAR || emp.avatar;

    const avatarMarkup = avatarUrl
      ? `<img src="${avatarUrl}" alt="${fullName}" class="emp-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
         <div class="emp-avatar-fallback" style="display:none;">${getInitials(fullName)}</div>`
      : `<div class="emp-avatar-fallback">${getInitials(fullName)}</div>`;

    return `
      <tr class="emp-table-row" data-id="${code}" title="Click to view/edit details" style="cursor: pointer;">
        <td><span class="emp-code-text">${code}</span></td>
        <td>
          <div class="emp-user-cell">
            ${avatarMarkup}
            <span class="emp-name">${fullName}</span>
          </div>
        </td>
        <td><span class="emp-email-text">${email}</span></td>
        <td><span class="emp-phone-text">${phone}</span></td>
        <td><span class="emp-dept-text">${deptName}</span></td>
        <td><span class="emp-position-text">${position}</span></td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
      </tr>
    `;
  }).join('');

  updatePagination(total === 0 ? 0 : startIdx + 1, endIdx, total, totalPages);
  attachRowActionListeners();
}

function updatePagination(start, end, total, totalPages) {
  const infoEl = document.querySelector('#pagination-info');
  const controlsEl = document.querySelector('#pagination-controls');

  if (infoEl) {
    infoEl.textContent = `Showing ${start} - ${end} of ${total} employees`;
  }

  if (!controlsEl) return;

  if (totalPages <= 1) {
    controlsEl.innerHTML = '';
    return;
  }

  let buttons = [];

  // Prev button
  buttons.push(`
    <button type="button" class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
      &lt;
    </button>
  `);

  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentPage;
    buttons.push(`
      <button type="button" class="page-btn ${isActive ? 'active' : ''}" data-page="${i}" aria-label="Page ${i}">
        ${i}
      </button>
    `);
  }

  buttons.push(`
    <button type="button" class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
      &gt;
    </button>
  `);

  controlsEl.innerHTML = buttons.join('');

  controlsEl.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = Number(btn.getAttribute('data-page'));
      if (page && page !== currentPage) {
        currentPage = page;
        renderTable();
      }
    });
  });
}

function attachRowActionListeners() {
  document.querySelectorAll('.emp-table-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-id');
      if (id) {
        window.location.href = `employee-detail.html?id=${encodeURIComponent(id)}`;
      }
    });
  });
}

function setupEventListeners() {
  const searchInput = document.querySelector('#search-employee');
  const deptFilter = document.querySelector('#filter-department');
  const posFilter = document.querySelector('#filter-position');
  const statusFilter = document.querySelector('#filter-status');

  const handleFilter = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const deptId = deptFilter ? deptFilter.value : '';
    const position = posFilter ? posFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';

    filteredEmployees = allEmployees.filter(emp => {
      const name = (emp.FULL_NAME || emp.full_name || '').toLowerCase();
      const code = (emp.ID || emp.emp_code || '').toLowerCase();
      const email = (emp.EMAIL || emp.email || '').toLowerCase();

      const matchQuery = !query || name.includes(query) || code.includes(query) || email.includes(query);
      
      const empDept = emp.ID_DEPARTMENT || emp.department_id;
      const matchDept = !deptId || empDept === deptId || getDepartmentName(empDept) === deptId;
      
      const empPos = emp.POSITION || emp.position;
      const matchPos = !position || empPos === position;

      const empStatus = (emp.STATUS || emp.status) === 'Inactive' ? 'Inactive' : 'Active';
      const matchStatus = !status || empStatus === status;

      return matchQuery && matchDept && matchPos && matchStatus;
    });

    currentPage = 1;
    renderTable();
  };

  if (searchInput) searchInput.addEventListener('input', handleFilter);
  if (deptFilter) deptFilter.addEventListener('change', handleFilter);
  if (posFilter) posFilter.addEventListener('change', handleFilter);
  if (statusFilter) statusFilter.addEventListener('change', handleFilter);

  // Modal handlers
  const modal = document.querySelector('#emp-modal');
  const btnOpenAdd = document.querySelector('#btn-open-add-emp');
  const btnClose = document.querySelector('#btn-close-emp-modal');
  const btnCancel = document.querySelector('#btn-cancel-emp-modal');
  const form = document.querySelector('#emp-form');

  if (btnOpenAdd && modal) {
    btnOpenAdd.addEventListener('click', () => {
      form.reset();
      document.querySelector('#emp-edit-id').value = '';
      
      const nextCode = `NV${String(allEmployees.length + 1).padStart(3, '0')}`;
      document.querySelector('#emp-code').value = nextCode;
      document.querySelector('#emp-code').disabled = false;
      document.querySelector('#modal-emp-title').textContent = 'Add Employee';
      const sub = document.querySelector('#modal-emp-subtitle');
      if (sub) sub.textContent = 'Create a new employee profile in your organization';
      document.querySelector('#btn-save-emp').textContent = 'Save Employee';
      document.querySelector('#emp-status').value = 'Active';
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Close when clicking outside drawer on backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const clickedInside = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!clickedInside) {
        modal.close();
      }
    });
  }

  // Submit form handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const editId = document.querySelector('#emp-edit-id').value;
      const empCode = document.querySelector('#emp-code').value.trim();
      const fullName = document.querySelector('#emp-name').value.trim();
      const email = document.querySelector('#emp-email').value.trim();
      const phone = document.querySelector('#emp-phone').value.trim();
      const departmentId = document.querySelector('#emp-department').value;
      const position = document.querySelector('#emp-position').value.trim();
      const status = document.querySelector('#emp-status').value || 'Active';
      const avatar = document.querySelector('#emp-avatar').value.trim();

      if (isEmpty(empCode) || isEmpty(fullName) || isEmpty(email)) {
        toast.error('Please fill in all required fields (*)');
        return;
      }

      if (!isValidEmail(email)) {
        toast.error('Invalid email address format');
        return;
      }

      const payload = {
        ID: empCode,
        FULL_NAME: fullName,
        EMAIL: email,
        SDT: phone,
        ID_DEPARTMENT: departmentId,
        STATUS: status,
        POSITION: position || 'Staff',
        AVATAR: avatar || ''
      };

      try {
        if (editId) {
          await employeeService.update(editId, payload);
          toast.success('Updated employee successfully');
        } else {
          const exists = allEmployees.some(e => (e.ID || e.emp_code) === empCode);
          if (exists) {
            toast.error(`Employee code ${empCode} already exists`);
            return;
          }
          await employeeService.create(payload);
          toast.success('Added new employee successfully');
        }
        modal.close();
        await initEmployeesPage();
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while saving employee');
      }
    });
  }
}

function openEditModal(code) {
  const emp = allEmployees.find(e => (e.ID || e.emp_code) === code);
  if (!emp) return;

  const modal = document.querySelector('#emp-modal');
  document.querySelector('#emp-edit-id').value = emp.ID || emp.emp_code;
  document.querySelector('#emp-code').value = emp.ID || emp.emp_code || '';
  document.querySelector('#emp-code').disabled = true; // Keep ID stable on edit
  document.querySelector('#emp-name').value = emp.FULL_NAME || emp.full_name || '';
  document.querySelector('#emp-email').value = emp.EMAIL || emp.email || '';
  document.querySelector('#emp-phone').value = emp.SDT || emp.phone || '';
  document.querySelector('#emp-department').value = emp.ID_DEPARTMENT || emp.department_id || '';
  document.querySelector('#emp-position').value = emp.POSITION || emp.position || '';
  document.querySelector('#emp-status').value = (emp.STATUS || emp.status) === 'Inactive' ? 'Inactive' : 'Active';
  document.querySelector('#emp-avatar').value = emp.AVATAR || emp.avatar || '';

  document.querySelector('#modal-emp-title').textContent = 'Edit Employee';
  const sub = document.querySelector('#modal-emp-subtitle');
  if (sub) sub.textContent = 'Modify employee details, contact info, and status';
  document.querySelector('#btn-save-emp').textContent = 'Save Employee';
  if (modal) modal.showModal();
}
