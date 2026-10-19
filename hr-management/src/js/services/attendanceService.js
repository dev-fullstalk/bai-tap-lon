import { getTable, saveTable } from '../utils/storage.js';

export const attendanceService = {
  async getAll() {
    const attendance = getTable('attendance');
    const employees = getTable('employees');
    const departments = getTable('departments');

    return attendance.map(att => {
      const emp = employees.find(e => e.id === att.employee_id);
      const dept = emp ? departments.find(d => d.id === emp.department_id) : null;
      return {
        ...att,
        employees: emp ? {
          full_name: emp.full_name,
          emp_code: emp.emp_code,
          position: emp.position,
          departments: dept ? { name: dept.name } : null
        } : null
      };
    });
  },

  async recordCheckIn(employeeId, note = 'Check-in đúng giờ') {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const status = (now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30)) ? 'late' : 'on_time';

    const record = {
      employee_id: employeeId,
      date: today,
      check_in: timeStr,
      check_out: '',
      status: status,
      note: note
    };

    let list = getTable('attendance');
    const existingIndex = list.findIndex(a => a.employee_id === employeeId && a.date === today);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record };
    } else {
      list.unshift({ id: `att-${Date.now()}`, ...record });
    }
    saveTable('attendance', list);
    return record;
  },

  async recordCheckOut(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let list = getTable('attendance');
    list = list.map(a => (a.employee_id === employeeId && a.date === today) ? { ...a, check_out: timeStr } : a);
    saveTable('attendance', list);
    return true;
  }
};
