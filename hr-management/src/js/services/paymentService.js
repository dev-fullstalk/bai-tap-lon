import { getTable, saveTable } from '../utils/storage.js';

export const paymentService = {
  async getAll() {
    const payments = getTable('payments');
    const employees = getTable('employees');
    const departments = getTable('departments');

    return payments.map(pay => {
      const emp = employees.find(e => e.id === pay.employee_id);
      const dept = emp ? departments.find(d => d.id === emp.department_id) : null;
      return {
        ...pay,
        employees: emp ? {
          full_name: emp.full_name,
          emp_code: emp.emp_code,
          position: emp.position,
          base_salary: emp.base_salary,
          departments: dept ? { name: dept.name } : null
        } : null
      };
    });
  },

  async create(payData) {
    const netSalary = Number(payData.base_salary) + Number(payData.bonus || 0) - Number(payData.deductions || 0);
    const payload = {
      id: `pay-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...payData,
      net_salary: netSalary,
      status: payData.status || 'pending'
    };

    const list = getTable('payments');
    list.unshift(payload);
    saveTable('payments', list);
    return payload;
  },

  async updateStatus(id, status, paymentDate = null) {
    const payDate = status === 'paid' ? (paymentDate || new Date().toISOString().split('T')[0]) : null;

    let list = getTable('payments');
    list = list.map(p => p.id === id ? { ...p, status, payment_date: payDate } : p);
    saveTable('payments', list);
    return list.find(p => p.id === id);
  },

  async delete(id) {
    let list = getTable('payments');
    list = list.filter(p => p.id !== id);
    saveTable('payments', list);
    return true;
  }
};
