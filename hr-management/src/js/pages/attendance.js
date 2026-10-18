import { attendanceService } from '../services/attendanceService.js';
import { employeeService } from '../services/employeeService.js';
import { toast } from '../shared/notifications.js';

let allAttendance = [];
let allEmployees = [];

document.addEventListener('DOMContentLoaded', async () => {
  initClock();
  await initAttendancePage();
  setupEventListeners();
});

function initClock() {
  const clockEl = document.querySelector('#live-clock');
  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('vi-VN', { hour12: false });
    }
  };
  update();
  setInterval(update, 1000);
}

async function initAttendancePage() {
  try {
    const [attendance, employees] = await Promise.all([
      attendanceService.getAll(),
      employeeService.getAll()
    ]);
    allAttendance = attendance;
    allEmployees = employees;

    populateEmployeeSelect(employees);
    updateAttendanceKPIs(attendance, employees);
    renderAttendanceTable(allAttendance);
  } catch (error) {
    console.error('Lỗi tải chấm công:', error);
    toast.error('Không thể tải dữ liệu chấm công');
  }
}

function populateEmployeeSelect(employees) {
  const select = document.querySelector('#select-checkin-emp');
  if (select) {
    select.innerHTML = employees.map(e => `<option value="${e.id}">${e.full_name} (${e.emp_code})</option>`).join('');
  }
}

function updateAttendanceKPIs(attendance, employees) {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(a => a.date === today);

  const present = todayRecords.length;
  const onTime = todayRecords.filter(a => a.status === 'on_time').length;
  const late = todayRecords.filter(a => a.status === 'late').length;
  const total = employees.length || 1;
  const absent = Math.max(0, total - present);

  const elPresent = document.querySelector('#kpi-att-present');
  const elOnTime = document.querySelector('#kpi-att-ontime');
  const elLate = document.querySelector('#kpi-att-late');
  const elAbsent = document.querySelector('#kpi-att-absent');

  if (elPresent) elPresent.textContent = present;
  if (elOnTime) elOnTime.textContent = onTime;
  if (elLate) elLate.textContent = late;
  if (elAbsent) elAbsent.textContent = absent;
}

function renderAttendanceTable(records) {
  const tbody = document.querySelector('#attendance-table-body');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Không có bản ghi chấm công nào phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  const statusMap = {
    on_time: '<span class="badge badge-success"><span class="badge-dot"></span>Đúng giờ</span>',
    late: '<span class="badge badge-warning"><span class="badge-dot"></span>Đi muộn</span>',
    early_leave: '<span class="badge badge-warning"><span class="badge-dot"></span>Về sớm</span>',
    absent: '<span class="badge badge-danger"><span class="badge-dot"></span>Vắng mặt</span>',
    on_leave: '<span class="badge badge-info"><span class="badge-dot"></span>Nghỉ phép</span>'
  };

  tbody.innerHTML = records.map(record => {
    const emp = record.employees;
    const empName = emp ? emp.full_name : 'Nhân viên';
    const empCode = emp ? emp.emp_code : 'NV';
    const deptName = emp && emp.departments ? emp.departments.name : 'Chưa phân bổ';

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${empName.slice(0, 2).toUpperCase()}</div>
            <div class="user-cell-meta">
              <span class="user-cell-name">${empName}</span>
              <span class="user-cell-sub">${empCode} • ${deptName}</span>
            </div>
          </div>
        </td>
        <td><strong>${record.date}</strong></td>
        <td><span class="time-pill">${record.check_in || '--:--'}</span></td>
        <td><span class="time-pill">${record.check_out || '--:--'}</span></td>
        <td>${statusMap[record.status] || record.status}</td>
        <td><span style="font-size: 0.85rem; color: var(--text-muted);">${record.note || '-'}</span></td>
      </tr>
    `;
  }).join('');
}

function setupEventListeners() {
  const btnCheckIn = document.querySelector('#btn-quick-checkin');
  const btnCheckOut = document.querySelector('#btn-quick-checkout');
  const selectEmp = document.querySelector('#select-checkin-emp');

  if (btnCheckIn) {
    btnCheckIn.addEventListener('click', async () => {
      const empId = selectEmp ? selectEmp.value : (allEmployees[0] ? allEmployees[0].id : null);
      if (!empId) {
        toast.warning('Chưa có nhân viên nào được chọn');
        return;
      }
      try {
        await attendanceService.recordCheckIn(empId);
        toast.success('Ghi nhận Check-in thành công!');
        await initAttendancePage();
      } catch (err) {
        toast.error('Không thể thực hiện check-in');
      }
    });
  }

  if (btnCheckOut) {
    btnCheckOut.addEventListener('click', async () => {
      const empId = selectEmp ? selectEmp.value : (allEmployees[0] ? allEmployees[0].id : null);
      if (!empId) return;
      try {
        await attendanceService.recordCheckOut(empId);
        toast.success('Ghi nhận Check-out thành công!');
        await initAttendancePage();
      } catch (err) {
        toast.error('Không thể thực hiện check-out');
      }
    });
  }

  // Filter
  const statusFilter = document.querySelector('#filter-att-status');
  const searchInput = document.querySelector('#search-att');

  const filterRecords = () => {
    const status = statusFilter ? statusFilter.value : '';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = allAttendance.filter(r => {
      const matchStatus = !status || r.status === status;
      const emp = r.employees;
      const matchQuery = !query || 
        (emp && emp.full_name.toLowerCase().includes(query)) ||
        (emp && emp.emp_code.toLowerCase().includes(query));
      return matchStatus && matchQuery;
    });

    renderAttendanceTable(filtered);
  };

  if (statusFilter) statusFilter.addEventListener('change', filterRecords);
  if (searchInput) searchInput.addEventListener('input', filterRecords);
}
