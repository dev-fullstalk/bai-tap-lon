import { departmentService } from '../services/departmentService.js';
import { employeeService } from '../services/employeeService.js';
import { toast } from '../shared/notifications.js';
import { isEmpty } from '../utils/validation.js';

let allDepartments = [];
let allEmployees = [];
let filteredDepartments = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

// SVG Icons for Department categories
const DEPT_ICONS = {
  code: `
    <div class="dept-icon-box dept-icon-code">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    </div>
  `,
  marketing: `
    <div class="dept-icon-box dept-icon-marketing">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 11 18-5v12L3 13v-2z"></path>
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
      </svg>
    </div>
  `,
  business: `
    <div class="dept-icon-box dept-icon-business">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    </div>
  `,
  hr: `
    <div class="dept-icon-box dept-icon-hr">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    </div>
  `,
  finance: `
    <div class="dept-icon-box dept-icon-finance">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    </div>
  `,
  content: `
    <div class="dept-icon-box dept-icon-content">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    </div>
  `,
  general: `
    <div class="dept-icon-box dept-icon-general">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 21V7l8-4 8 4v14M8 10h2M14 10h2M8 14h2M14 14h2M10 21v-4h4v4M2 21h20"></path>
      </svg>
    </div>
  `
};

document.addEventListener('DOMContentLoaded', async () => {
  await initDepartmentsPage();
  setupEventListeners();
});

async function initDepartmentsPage() {
  try {
    const [departments, employees] = await Promise.all([
      departmentService.getAll(),
      employeeService.getAll()
    ]);
    allDepartments = departments;
    allEmployees = employees;
    filteredDepartments = [...allDepartments];

    populateFilterDropdowns(allDepartments);
    populateManagerDropdown(allEmployees);
    updateKpiStats(allDepartments, allEmployees);
    renderTable();
  } catch (error) {
    console.error('Error initializing departments page:', error);
    toast.error('Could not load department data');
  }
}

function updateKpiStats(departments, employees) {
  const totalDepts = departments.length;
  const totalEmp = employees.length;
  const deptsWithMgr = departments.filter(d => d.DIRECT_MANAGER && d.DIRECT_MANAGER.trim() !== '').length;
  const avgEmp = totalDepts > 0 ? Math.round(totalEmp / totalDepts) : 0;

  const elTotalDepts = document.querySelector('#stat-total-depts');
  const elTotalEmp = document.querySelector('#stat-total-emp');
  const elDeptsWithMgr = document.querySelector('#stat-depts-with-mgr');
  const elAvgEmp = document.querySelector('#stat-avg-emp');

  if (elTotalDepts) elTotalDepts.textContent = totalDepts;
  if (elTotalEmp) elTotalEmp.textContent = totalEmp;
  if (elDeptsWithMgr) elDeptsWithMgr.textContent = deptsWithMgr;
  if (elAvgEmp) elAvgEmp.textContent = avgEmp;
}

function populateFilterDropdowns(departments) {
  const filterSelect = document.querySelector('#filter-department-select');
  if (filterSelect) {
    const options = departments.map(d => `<option value="${d.ID_DEPARTMENT || d.id}">${d.NAME || d.name}</option>`).join('');
    filterSelect.innerHTML = `<option value="">All Departments</option>` + options;
  }

  const managerFilter = document.querySelector('#filter-manager-select');
  if (managerFilter) {
    const mgrIds = [...new Set(departments.map(d => d.DIRECT_MANAGER).filter(Boolean))];
    const options = mgrIds.map(mgrId => {
      const emp = allEmployees.find(e => (e.ID || e.id || e.emp_code) === mgrId);
      const name = emp ? (emp.FULL_NAME || emp.full_name) : mgrId;
      return `<option value="${mgrId}">${name}</option>`;
    }).join('');
    managerFilter.innerHTML = `<option value="">All Managers</option>` + options;
  }
}

function populateManagerDropdown(employees) {
  const mgrSelect = document.querySelector('#dept-manager');
  if (!mgrSelect) return;

  const options = employees.map(emp => {
    const id = emp.ID || emp.id || emp.emp_code;
    const name = emp.FULL_NAME || emp.full_name || 'Staff';
    return `<option value="${id}">${id} - ${name}</option>`;
  }).join('');

  mgrSelect.innerHTML = `<option value="">-- Select Direct Manager --</option>` + options;
}

function getInitials(name) {
  if (!name) return 'NV';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getIconMarkup(iconKey, deptName) {
  if (iconKey && DEPT_ICONS[iconKey]) {
    return DEPT_ICONS[iconKey];
  }
  const lower = (deptName || '').toLowerCase();
  if (lower.includes('engineer') || lower.includes('tech') || lower.includes('software')) return DEPT_ICONS.code;
  if (lower.includes('market')) return DEPT_ICONS.marketing;
  if (lower.includes('business') || lower.includes('sale')) return DEPT_ICONS.business;
  if (lower.includes('hr') || lower.includes('human')) return DEPT_ICONS.hr;
  if (lower.includes('financ') || lower.includes('account')) return DEPT_ICONS.finance;
  if (lower.includes('content') || lower.includes('media')) return DEPT_ICONS.content;
  return DEPT_ICONS.general;
}

function renderTable() {
  const tbody = document.querySelector('#departments-table-body');
  if (!tbody) return;

  const total = filteredDepartments.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, total);
  const pageItems = filteredDepartments.slice(startIdx, endIdx);

  if (total === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 48px; color: #94a3b8;">
          No departments found matching your criteria.
        </td>
      </tr>
    `;
    updatePagination(0, 0, 0, 1);
    return;
  }

  tbody.innerHTML = pageItems.map(dept => {
    const id = dept.ID_DEPARTMENT || dept.id;
    const name = dept.NAME || dept.name || 'Unnamed';
    const code = dept.CODE || dept.code || 'DEPT';
    const desc = dept.DESCRIPTION || dept.description || 'No description available.';
    const managerId = dept.DIRECT_MANAGER || dept.manager_id;
    const status = dept.STATUS || dept.status || 'Active';
    const statusClass = status === 'Active' ? 'status-active' : 'status-inactive';
    const iconKey = dept.ICON || dept.icon;

    // Count employees in this department
    const empCount = allEmployees.filter(e => {
      const eDept = e.ID_DEPARTMENT || e.department_id;
      return eDept === id || eDept === name;
    }).length;

    // Find direct manager details using managerId -> employee.ID
    const manager = allEmployees.find(e => (e.ID || e.id || e.emp_code) === managerId);
    
    let managerMarkup = `<span style="color: #94a3b8; font-size: 0.88rem;">Unassigned</span>`;
    if (manager) {
      const mgrName = manager.FULL_NAME || manager.full_name;
      const mgrAvatar = manager.AVATAR || manager.avatar;
      
      const avatarHtml = mgrAvatar
        ? `<img src="${mgrAvatar}" alt="${mgrName}" class="dept-manager-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
           <div class="dept-manager-fallback" style="display:none;">${getInitials(mgrName)}</div>`
        : `<div class="dept-manager-fallback">${getInitials(mgrName)}</div>`;

      managerMarkup = `
        <div class="dept-manager-cell">
          ${avatarHtml}
          <span class="dept-manager-name">${mgrName}</span>
        </div>
      `;
    }

    const iconBox = getIconMarkup(iconKey, name);

    return `
      <tr class="dept-table-row" data-id="${id}" title="Click to view/edit details" style="cursor: pointer;">
        <td><span class="dept-code-text">${id}</span></td>
        <td><span class="dept-name">${name}</span></td>
        <td><span class="dept-code-text">${code}</span></td>
        <td>
          <div class="dept-desc-text" title="${desc}">${desc}</div>
        </td>
        <td>${managerMarkup}</td>
        <td><span class="dept-emp-count">${empCount}</span></td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
      </tr>
    `;
  }).join('');

  updatePagination(total === 0 ? 0 : startIdx + 1, endIdx, total, totalPages);
  attachRowListeners();
}

function updatePagination(start, end, total, totalPages) {
  const infoEl = document.querySelector('#pagination-info');
  const controlsEl = document.querySelector('#pagination-controls');

  if (infoEl) {
    infoEl.textContent = `Showing ${start} - ${end} of ${total} departments`;
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

function attachRowListeners() {
  document.querySelectorAll('.dept-table-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-id');
      if (id) openEditModal(id);
    });
  });
}

function setupEventListeners() {
  const searchInput = document.querySelector('#search-department');
  const deptFilter = document.querySelector('#filter-department-select');
  const managerFilter = document.querySelector('#filter-manager-select');
  const statusFilter = document.querySelector('#filter-status');

  const handleFilter = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const deptId = deptFilter ? deptFilter.value : '';
    const managerId = managerFilter ? managerFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';

    filteredDepartments = allDepartments.filter(dept => {
      const name = (dept.NAME || dept.name || '').toLowerCase();
      const code = (dept.CODE || dept.code || '').toLowerCase();
      const desc = (dept.DESCRIPTION || dept.description || '').toLowerCase();
      const id = (dept.ID_DEPARTMENT || dept.id || '').toLowerCase();
      const deptStatus = dept.STATUS || dept.status;
      const deptManagerId = dept.DIRECT_MANAGER || dept.manager_id || '';

      // Also search by manager's name if applicable
      const manager = allEmployees.find(e => (e.ID || e.id || e.emp_code) === deptManagerId);
      const managerName = (manager ? (manager.FULL_NAME || manager.full_name) : '').toLowerCase();

      const matchQuery = !query || 
        name.includes(query) || 
        code.includes(query) || 
        desc.includes(query) || 
        id.includes(query) ||
        managerName.includes(query);

      const matchDept = !deptId || (dept.ID_DEPARTMENT || dept.id) === deptId;
      const matchManager = !managerId || deptManagerId === managerId;
      const matchStatus = !status || deptStatus === status;

      return matchQuery && matchDept && matchManager && matchStatus;
    });

    currentPage = 1;
    renderTable();
  };

  if (searchInput) searchInput.addEventListener('input', handleFilter);
  if (deptFilter) deptFilter.addEventListener('change', handleFilter);
  if (managerFilter) managerFilter.addEventListener('change', handleFilter);
  if (statusFilter) statusFilter.addEventListener('change', handleFilter);

  // Modal handlers
  const modal = document.querySelector('#dept-modal');
  const btnOpenAdd = document.querySelector('#btn-open-add-dept');
  const btnClose = document.querySelector('#btn-close-dept-modal');
  const btnCancel = document.querySelector('#btn-cancel-dept-modal');
  const form = document.querySelector('#dept-form');

  if (btnOpenAdd && modal) {
    btnOpenAdd.addEventListener('click', () => {
      form.reset();
      document.querySelector('#dept-edit-id').value = '';
      
      const nextId = `dept-${allDepartments.length + 1}`;
      document.querySelector('#dept-id').value = nextId;
      document.querySelector('#dept-id').disabled = false;
      document.querySelector('#modal-dept-title').textContent = 'Add New Department';
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Form submit handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const editId = document.querySelector('#dept-edit-id').value;
      const deptId = document.querySelector('#dept-id').value.trim();
      const name = document.querySelector('#dept-name').value.trim();
      const code = document.querySelector('#dept-code').value.trim();
      const managerId = document.querySelector('#dept-manager').value;
      const status = document.querySelector('#dept-status').value;
      const icon = document.querySelector('#dept-icon').value;
      const desc = document.querySelector('#dept-desc').value.trim();

      if (isEmpty(deptId) || isEmpty(name)) {
        toast.error('Please enter department ID and Name (*)');
        return;
      }

      // Exact structure in localStorage:
      // Direct Manager links with employee ID, ID_DEPARTMENT connects department
      const payload = {
        ID_DEPARTMENT: deptId,
        NAME: name,
        CODE: code || 'DEPT',
        DESCRIPTION: desc,
        DIRECT_MANAGER: managerId || '',
        STATUS: status,
        ICON: icon
      };

      try {
        if (editId) {
          await departmentService.update(editId, payload);
          toast.success('Updated department successfully');
        } else {
          const exists = allDepartments.some(d => (d.ID_DEPARTMENT || d.id) === deptId);
          if (exists) {
            toast.error(`Department ID ${deptId} already exists`);
            return;
          }
          await departmentService.create(payload);
          toast.success('Added new department successfully');
        }
        modal.close();
        await initDepartmentsPage();
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while saving department');
      }
    });
  }
}

function openEditModal(id) {
  const dept = allDepartments.find(d => (d.ID_DEPARTMENT || d.id) === id);
  if (!dept) return;

  const modal = document.querySelector('#dept-modal');
  document.querySelector('#dept-edit-id').value = dept.ID_DEPARTMENT || dept.id;
  document.querySelector('#dept-id').value = dept.ID_DEPARTMENT || dept.id;
  document.querySelector('#dept-id').disabled = true; // Keep ID stable on edit
  document.querySelector('#dept-name').value = dept.NAME || dept.name || '';
  document.querySelector('#dept-code').value = dept.CODE || dept.code || '';
  document.querySelector('#dept-manager').value = dept.DIRECT_MANAGER || dept.manager_id || '';
  document.querySelector('#dept-status').value = dept.STATUS || dept.status || 'Active';
  document.querySelector('#dept-icon').value = dept.ICON || dept.icon || 'code';
  document.querySelector('#dept-desc').value = dept.DESCRIPTION || dept.description || '';

  document.querySelector('#modal-dept-title').textContent = 'Edit Department';
  if (modal) modal.showModal();
}
