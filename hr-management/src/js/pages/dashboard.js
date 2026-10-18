import { employeeService } from '../services/employeeService.js';
import { departmentService } from '../services/departmentService.js';
import { attendanceService } from '../services/attendanceService.js';
import { paymentService } from '../services/paymentService.js';
import { requestService } from '../services/requestService.js';
import { formatCurrency } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardMetrics();
});

async function loadDashboardMetrics() {
  try {
    const [employees, departments, attendance, payments, requests] = await Promise.all([
      employeeService.getAll(),
      departmentService.getAll(),
      attendanceService.getAll(),
      paymentService.getAll(),
      requestService.getAll()
    ]);

    // 1. Thống kê số lượng
    const totalEmployees = employees.length;
    const totalDepartments = departments.length;
    
    // Tỷ lệ chấm công hôm nay
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    const onTimeCount = todayAttendance.filter(a => a.status === 'on_time').length;
    const attendanceRate = totalEmployees > 0 
      ? Math.round((todayAttendance.length / totalEmployees) * 100) 
      : 0;

    // Tổng quỹ lương tháng
    const totalPayroll = payments.reduce((acc, curr) => acc + Number(curr.net_salary || 0), 0);

    // Cập nhật DOM
    const elTotalEmp = document.querySelector('#kpi-total-employees');
    const elTotalDept = document.querySelector('#kpi-total-departments');
    const elAttendanceRate = document.querySelector('#kpi-attendance-rate');
    const elTotalPayroll = document.querySelector('#kpi-total-payroll');

    if (elTotalEmp) elTotalEmp.textContent = totalEmployees;
    if (elTotalDept) elTotalDept.textContent = totalDepartments;
    if (elAttendanceRate) elAttendanceRate.textContent = `${attendanceRate}%`;
    if (elTotalPayroll) elTotalPayroll.textContent = formatCurrency(totalPayroll);

    // 2. Render Biểu đồ nhân sự theo phòng ban
    renderDepartmentBars(departments, employees);

    // 3. Render Hoạt động gần đây
    renderRecentActivities(requests, attendance);

  } catch (error) {
    console.error('Lỗi tải dữ liệu dashboard:', error);
  }
}

function renderDepartmentBars(departments, employees) {
  const container = document.querySelector('#dept-bars-container');
  if (!container) return;

  if (departments.length === 0) {
    container.innerHTML = '<p class="text-muted">Chưa có phòng ban nào.</p>';
    return;
  }

  const totalEmployees = employees.length || 1;

  container.innerHTML = departments.map(dept => {
    const count = employees.filter(e => e.department_id === dept.id).length;
    const percent = Math.round((count / totalEmployees) * 100);

    return `
      <div class="dept-bar-item">
        <div class="dept-bar-meta">
          <span>${dept.name}</span>
          <span><strong>${count}</strong> nhân sự (${percent}%)</span>
        </div>
        <div class="dept-bar-track">
          <div class="dept-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentActivities(requests, attendance) {
  const container = document.querySelector('#activity-list-container');
  if (!container) return;

  const activities = [];

  // Thêm đơn từ gần đây
  requests.slice(0, 3).forEach(req => {
    const empName = req.employees ? req.employees.full_name : 'Nhân viên';
    activities.push({
      icon: '📝',
      title: `${empName} đã gửi đơn ${req.type === 'leave' ? 'nghỉ phép' : 'tăng ca'}`,
      time: 'Gần đây',
      status: req.status
    });
  });

  // Thêm chấm công gần đây
  attendance.slice(0, 3).forEach(att => {
    const empName = att.employees ? att.employees.full_name : 'Nhân viên';
    activities.push({
      icon: '⏱️',
      title: `${empName} đã chấm công (${att.check_in || 'Chưa ghi nhận'})`,
      time: att.date,
      status: att.status
    });
  });

  if (activities.length === 0) {
    container.innerHTML = '<p class="text-muted">Chưa có hoạt động nào được ghi nhận.</p>';
    return;
  }

  container.innerHTML = activities.slice(0, 5).map(act => `
    <div class="activity-item">
      <div class="activity-icon">${act.icon}</div>
      <div class="activity-content">
        <div class="activity-title">${act.title}</div>
        <div class="activity-time">${act.time}</div>
      </div>
    </div>
  `).join('');
}
