import { toast } from '../shared/notifications.js';
import { getTable } from '../utils/storage.js';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const STORAGE_KEY = 'hr_attendance_records_v2'; // v2 forces fresh seed with 10 rows

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
let attendanceList = [];
let employeeMap    = {};   // { [empId]: { name, code } }
let employeeList   = [];   // [{ id, name }] for dropdown

// ──────────────────────────────────────────────
// Helpers – employees from storage (triggers initializeStorage automatically)
// ──────────────────────────────────────────────
function loadEmployees() {
  // getTable() calls initializeStorage() internally, seeding default data
  // if localStorage is empty – so this always returns employees.
  const employees = getTable('employees');

  employeeMap  = {};
  employeeList = [];

  employees.forEach(emp => {
    const id   = emp.ID || emp.id || emp.emp_code || '';
    const name = emp.FULL_NAME || emp.full_name || '';
    if (!id) return;
    employeeMap[id] = { name, code: id };
    employeeList.push({ id, name });
  });
}

/** Given an employee_id, return the full name stored in localStorage */
function getEmployeeName(empId) {
  if (!empId) return '—';
  return (employeeMap[empId] && employeeMap[empId].name) || empId;
}

// ──────────────────────────────────────────────
// Initial sample records – use employee IDs that
// match the default employees in storage.js
// ──────────────────────────────────────────────
function buildInitialRecords() {
  return [
    {
      id: 'att-001',
      employee_id: 'NV001',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '08:55 AM',
      checkOut: '05:32 PM',
      status: 'Present',
      note: '—'
    },
    {
      id: 'att-002',
      employee_id: 'NV002',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '09:15 AM',
      checkOut: '06:05 PM',
      status: 'Late',
      note: 'Traffic delay'
    },
    {
      id: 'att-003',
      employee_id: 'NV004',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '08:48 AM',
      checkOut: '05:18 PM',
      status: 'Present',
      note: '—'
    },
    {
      id: 'att-004',
      employee_id: 'NV005',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '—',
      checkOut: '—',
      status: 'Absent',
      note: 'Sick leave (unplanned)'
    },
    {
      id: 'att-005',
      employee_id: 'NV008',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '08:30 AM',
      checkOut: '04:50 PM',
      status: 'Leave',
      note: 'Personal leave'
    },
    {
      id: 'att-006',
      employee_id: 'NV003',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '08:02 AM',
      checkOut: '05:45 PM',
      status: 'Present',
      note: '—'
    },
    {
      id: 'att-007',
      employee_id: 'NV006',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '09:30 AM',
      checkOut: '06:00 PM',
      status: 'Late',
      note: 'Missed bus'
    },
    {
      id: 'att-008',
      employee_id: 'NV009',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '08:10 AM',
      checkOut: '05:10 PM',
      status: 'Present',
      note: '—'
    },
    {
      id: 'att-009',
      employee_id: 'NV011',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '—',
      checkOut: '—',
      status: 'Leave',
      note: 'Annual leave'
    },
    {
      id: 'att-010',
      employee_id: 'NV015',
      date: '20 Oct 2026',
      rawDate: '2026-10-20',
      checkIn: '08:45 AM',
      checkOut: '05:30 PM',
      status: 'Present',
      note: 'WFH approved'
    }
  ];
}

// ──────────────────────────────────────────────
// Persistence
// ──────────────────────────────────────────────
function loadAttendance() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        attendanceList = parsed;
        return;
      }
    } catch { /* fall through */ }
  }
  attendanceList = buildInitialRecords();
  saveAttendance();
}

function saveAttendance() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceList));
}

// ──────────────────────────────────────────────
// Utility
// ──────────────────────────────────────────────
function getInitials(name) {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '20 Oct 2026';
  // already formatted
  const months3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (months3.some(m => dateStr.includes(m))) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months3[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatDisplayTime(timeStr) {
  if (!timeStr || timeStr === '—') return '—';
  if (/AM|PM/i.test(timeStr)) return timeStr;
  const [hourStr, minStr] = timeStr.split(':');
  if (!hourStr || !minStr) return timeStr;
  let h = parseInt(hourStr, 10);
  const m   = minStr.padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

function timeTo24h(timeStr) {
  if (!timeStr || timeStr === '—') return '';
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m    = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

// ──────────────────────────────────────────────
// KPI Cards
// ──────────────────────────────────────────────
function renderKPIs() {
  const present = attendanceList.filter(r => r.status === 'Present').length;
  const absent  = attendanceList.filter(r => r.status === 'Absent').length;
  const late    = attendanceList.filter(r => r.status === 'Late').length;
  const leave   = attendanceList.filter(r => r.status === 'Leave').length;

  const setEl = (id, val) => {
    const el = document.querySelector(id);
    if (el) el.textContent = val;
  };
  setEl('#kpi-present-count', present);
  setEl('#kpi-absent-count',  absent);
  setEl('#kpi-late-count',    late);
  setEl('#kpi-leave-count',   leave);
}

// ──────────────────────────────────────────────
// Status Badge HTML
// ──────────────────────────────────────────────
function getStatusBadge(status) {
  const map = {
    present: ['att-badge-present', 'Present'],
    late:    ['att-badge-late',    'Late'],
    absent:  ['att-badge-absent',  'Absent'],
    leave:   ['att-badge-leave',   'Leave'],
  };
  const key  = (status || '').toLowerCase();
  const [cls, label] = map[key] || ['att-badge-present', status];
  return `<span class="att-badge ${cls}"><span class="att-badge-dot"></span>${label}</span>`;
}

// ──────────────────────────────────────────────
// Table Rendering
// ──────────────────────────────────────────────
function renderTable(records) {
  const tbody = document.querySelector('#att-table-body');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="att-empty-state">
            <svg class="att-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <div class="att-empty-title">No attendance records found</div>
            <div class="att-empty-desc">Try adjusting your search or status filter.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = records.map(record => {
    // ── Resolve name & ID from employee map ──
    const empName    = getEmployeeName(record.employee_id);
    const empCode    = record.employee_id || '—';
    const initials   = getInitials(empName);

    const displayCI  = (!record.checkIn  || record.checkIn  === '—')
      ? `<span class="att-empty-val">—</span>`
      : `<span class="att-time-val">${record.checkIn}</span>`;

    const displayCO  = (!record.checkOut || record.checkOut === '—')
      ? `<span class="att-empty-val">—</span>`
      : `<span class="att-time-val">${record.checkOut}</span>`;

    const displayNote = (record.note && record.note !== '—')
      ? `<span class="att-note-val">${record.note}</span>`
      : `<span class="att-empty-val">—</span>`;

    return `
      <tr data-id="${record.id}">
        <td>
          <div class="att-emp-cell">
            <div class="att-emp-avatar" aria-hidden="true">${initials}</div>
            <div class="att-emp-meta">
              <span class="att-emp-name">${empName}</span>
              <span class="att-emp-code">${empCode}</span>
            </div>
          </div>
        </td>
        <td><span class="att-date-val">${record.date}</span></td>
        <td>${displayCI}</td>
        <td>${displayCO}</td>
        <td>${getStatusBadge(record.status)}</td>
        <td>${displayNote}</td>
      </tr>`;
  }).join('');
}

// ──────────────────────────────────────────────
// Filter
// ──────────────────────────────────────────────
function filterRecords() {
  const query     = (document.querySelector('#att-search-input')?.value  || '').toLowerCase().trim();
  const statusVal = (document.querySelector('#att-status-filter')?.value || 'all');

  const filtered = attendanceList.filter(item => {
    const empName = getEmployeeName(item.employee_id).toLowerCase();
    const empCode = (item.employee_id || '').toLowerCase();
    const note    = (item.note || '').toLowerCase();

    const matchSearch = !query ||
      empName.includes(query) ||
      empCode.includes(query) ||
      note.includes(query);

    const matchStatus = statusVal === 'all' ||
      item.status.toLowerCase() === statusVal.toLowerCase();

    return matchSearch && matchStatus;
  });

  renderTable(filtered);
}

// ──────────────────────────────────────────────
// Modal – Employee dropdown population
// ──────────────────────────────────────────────
function populateEmployeeDropdown(selectedId = '') {
  const sel = document.querySelector('#form-employee-select');
  if (!sel) return;

  sel.innerHTML = `<option value="">-- Select employee --</option>`;

  employeeList.forEach(emp => {
    const opt = document.createElement('option');
    opt.value       = emp.id;
    opt.textContent = `${emp.name} (${emp.id})`;
    if (emp.id === selectedId) opt.selected = true;
    sel.appendChild(opt);
  });
}

// ──────────────────────────────────────────────
// Modal – Add
// ──────────────────────────────────────────────
function openAddModal() {
  const modal = document.querySelector('#att-modal');
  const form  = document.querySelector('#att-form');
  if (!modal || !form) return;

  form.reset();
  document.querySelector('#form-record-id').value  = '';
  document.querySelector('#form-work-date').value  = '2026-10-20';
  document.querySelector('#form-status').value     = 'Present';
  document.querySelector('#modal-title').textContent = 'Add Attendance Record';

  populateEmployeeDropdown('');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.querySelector('#form-employee-select')?.focus();
}

// ──────────────────────────────────────────────
// Modal – Edit
// ──────────────────────────────────────────────
function openEditModal(recordId) {
  const record = attendanceList.find(r => r.id === recordId);
  if (!record) return;

  const modal = document.querySelector('#att-modal');
  if (!modal) return;

  populateEmployeeDropdown(record.employee_id || '');

  document.querySelector('#form-record-id').value  = record.id;
  document.querySelector('#form-work-date').value  = record.rawDate || '2026-10-20';
  document.querySelector('#form-status').value     = record.status  || 'Present';
  document.querySelector('#form-checkin').value    = timeTo24h(record.checkIn);
  document.querySelector('#form-checkout').value   = timeTo24h(record.checkOut);
  document.querySelector('#form-note').value       = record.note === '—' ? '' : (record.note || '');
  document.querySelector('#modal-title').textContent = 'Edit Attendance Record';

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = document.querySelector('#att-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// ──────────────────────────────────────────────
// Modal – View
// ──────────────────────────────────────────────
function openViewModal(recordId) {
  const record = attendanceList.find(r => r.id === recordId);
  if (!record) return;

  const modal   = document.querySelector('#att-view-modal');
  const details = document.querySelector('#att-view-details');
  if (!modal || !details) return;

  const empName  = getEmployeeName(record.employee_id);
  const empCode  = record.employee_id || '—';
  const initials = getInitials(empName);

  details.innerHTML = `
    <div class="att-view-header">
      <div class="att-view-avatar">${initials}</div>
      <div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:2px;">${empName}</h3>
        <span style="font-size:0.85rem;color:#64748b;font-weight:500;">${empCode}</span>
      </div>
    </div>
    <div class="att-view-grid">
      <div class="att-view-item">
        <span class="att-view-item-label">Work Date</span>
        <span class="att-view-item-value">${record.date}</span>
      </div>
      <div class="att-view-item">
        <span class="att-view-item-label">Status</span>
        <span class="att-view-item-value">${getStatusBadge(record.status)}</span>
      </div>
      <div class="att-view-item">
        <span class="att-view-item-label">Check In</span>
        <span class="att-view-item-value">${record.checkIn || '—'}</span>
      </div>
      <div class="att-view-item">
        <span class="att-view-item-label">Check Out</span>
        <span class="att-view-item-value">${record.checkOut || '—'}</span>
      </div>
      <div class="att-view-item full-width">
        <span class="att-view-item-label">Note</span>
        <span class="att-view-item-value">${record.note || '—'}</span>
      </div>
    </div>`;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeViewModal() {
  const modal = document.querySelector('#att-view-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// ──────────────────────────────────────────────
// Form Submit (Add / Edit)
// ──────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();

  const recordId   = document.querySelector('#form-record-id').value;
  const employeeId = document.querySelector('#form-employee-select').value;
  const rawDate    = document.querySelector('#form-work-date').value || '2026-10-20';
  const status     = document.querySelector('#form-status').value;
  const checkInRaw = document.querySelector('#form-checkin').value;
  const checkOutRaw= document.querySelector('#form-checkout').value;
  const note       = document.querySelector('#form-note').value.trim();

  if (!employeeId) {
    toast.warning('Please select an employee.');
    return;
  }

  const empName = getEmployeeName(employeeId);
  const formattedDate = formatDisplayDate(rawDate);

  // For Absent/Leave: if user leaves times empty → show '—'
  const isAbsentOrLeave = status === 'Absent' || status === 'Leave';
  const formattedCI = checkInRaw
    ? formatDisplayTime(checkInRaw)
    : (isAbsentOrLeave ? '—' : '—');
  const formattedCO = checkOutRaw
    ? formatDisplayTime(checkOutRaw)
    : (isAbsentOrLeave ? '—' : '—');
  const formattedNote = note || '—';

  if (recordId) {
    // ── Edit existing ──
    const idx = attendanceList.findIndex(r => r.id === recordId);
    if (idx >= 0) {
      attendanceList[idx] = {
        ...attendanceList[idx],
        employee_id: employeeId,
        rawDate,
        date:     formattedDate,
        status,
        checkIn:  formattedCI,
        checkOut: formattedCO,
        note:     formattedNote
      };
      toast.success(`Updated attendance for ${empName}`);
    }
  } else {
    // ── Add new ──
    attendanceList.unshift({
      id:          `att-${Date.now()}`,
      employee_id: employeeId,
      rawDate,
      date:     formattedDate,
      status,
      checkIn:  formattedCI,
      checkOut: formattedCO,
      note:     formattedNote
    });
    toast.success(`Added attendance for ${empName}`);
  }

  saveAttendance();
  renderKPIs();
  filterRecords();
  closeModal();
}

// ──────────────────────────────────────────────
// Event Listeners
// ──────────────────────────────────────────────
function initEventListeners() {
  document.querySelector('#att-search-input')?.addEventListener('input',  filterRecords);
  document.querySelector('#att-status-filter')?.addEventListener('change', filterRecords);

  document.querySelector('#btn-top-date')?.addEventListener('click',   () => toast.info('Date selected: October 20, 2026'));
  document.querySelector('#btn-top-month')?.addEventListener('click',  () => toast.info('Filter range: This Month'));
  document.querySelector('#btn-table-date')?.addEventListener('click', () => toast.info('Showing records for October 20, 2026'));

  document.querySelector('#btn-open-add-modal')?.addEventListener('click', openAddModal);
  document.querySelector('#modal-close-btn')?.addEventListener('click',    closeModal);
  document.querySelector('#modal-cancel-btn')?.addEventListener('click',   closeModal);

  document.querySelector('#view-modal-close-btn')?.addEventListener('click', closeViewModal);
  document.querySelector('#view-modal-done-btn')?.addEventListener('click',  closeViewModal);

  document.querySelector('#att-form')?.addEventListener('submit', handleFormSubmit);

  // Table row click to view details (since Actions column was removed)
  document.querySelector('#att-table-body')?.addEventListener('click', e => {
    const row = e.target.closest('tr[data-id]');
    if (row && row.dataset.id) {
      openViewModal(row.dataset.id);
    }
  });

  // Close on backdrop click
  window.addEventListener('click', e => {
    if (e.target === document.querySelector('#att-modal'))      closeModal();
    if (e.target === document.querySelector('#att-view-modal')) closeViewModal();
  });

  // Close on Escape
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeViewModal(); }
  });
}

// ──────────────────────────────────────────────
// Bootstrap
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadEmployees();
  loadAttendance();
  renderKPIs();
  renderTable(attendanceList);
  initEventListeners();
});
