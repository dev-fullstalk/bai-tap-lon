import { getTable, saveTable } from '../utils/storage.js';

export const paymentService = {
  async getAll() {
    const payments = getTable('payments');
    const employees = getTable('employees');

    return payments.map((pay, index) => {
      const empId = pay.ID_Employees || pay.employee_id;
      let emp = employees.find(e => (e.ID || e.id || e.emp_code) === empId);

      // If emp was not found (e.g. legacy EMP001 key), map directly to employee from localStorage
      if (!emp && employees.length > 0) {
        const empIndex = typeof empId === 'string' && empId.startsWith('EMP')
          ? (parseInt(empId.replace('EMP', ''), 10) - 1)
          : index;
        if (empIndex >= 0 && empIndex < employees.length) {
          emp = employees[empIndex];
        } else {
          emp = employees[index % employees.length];
        }
      }

      const resolvedEmployeeId = emp ? (emp.ID || emp.id || emp.emp_code) : (employees[0] ? (employees[0].ID || employees[0].id) : (pay.ID_Employees || pay.employee_id || 'NV001'));
      const resolvedEmployeeName = emp ? (emp.FULL_NAME || emp.full_name) : (pay.employee_name || 'Nhân viên');
      const resolvedPaymentType = pay.payment_type || 'salary';
      const resolvedPaymentMethod = pay.payment_method || 'Bank Transfer';
      const resolvedDate = pay.payment_date || pay.due_date || '2026-09-30';
      const resolvedStatus = (pay.payment_status || pay.status || 'paid').toLowerCase();
      const resolvedAmount = Number(pay.amount !== undefined ? pay.amount : (pay.net_salary || 0));

      return {
        ...pay,
        id: pay.id,
        ID_Employees: resolvedEmployeeId,
        employee_id: resolvedEmployeeId,
        employee_name: resolvedEmployeeName,
        payment_type: resolvedPaymentType,
        payment_method: resolvedPaymentMethod,
        payment_date: resolvedDate,
        due_date: resolvedDate,
        payment_status: resolvedStatus,
        status: resolvedStatus,
        amount: resolvedAmount,
        description: pay.description || ''
      };
    });
  },

  async getById(id) {
    const all = await this.getAll();
    return all.find(p => p.id === id) || null;
  },

  async create(payData) {
    const list = getTable('payments');
    const employees = getTable('employees');
    const emp = employees.find(e => (e.ID || e.id || e.emp_code) === payData.ID_Employees);

    const payload = {
      id: `PAY-${Date.now()}`,
      created_at: new Date().toISOString(),
      ID_Employees: payData.ID_Employees,
      employee_id: payData.ID_Employees,
      employee_name: payData.employee_name || (emp ? (emp.FULL_NAME || emp.full_name) : 'Employee'),
      payment_type: payData.payment_type || 'salary',
      payment_method: payData.payment_method || 'Bank Transfer',
      payment_date: payData.payment_date || new Date().toISOString().split('T')[0],
      due_date: payData.payment_date || new Date().toISOString().split('T')[0],
      payment_status: payData.payment_status || 'paid',
      status: payData.payment_status || 'paid',
      amount: Number(payData.amount) || 0,
      description: payData.description || ''
    };

    list.unshift(payload);
    saveTable('payments', list);
    return payload;
  },

  async update(id, updateData) {
    let list = getTable('payments');
    const employees = getTable('employees');

    list = list.map(p => {
      if (p.id === id) {
        const empId = updateData.ID_Employees || p.ID_Employees || p.employee_id;
        const emp = employees.find(e => (e.ID || e.id || e.emp_code) === empId);
        const empName = updateData.employee_name || (emp ? (emp.FULL_NAME || emp.full_name) : p.employee_name);

        return {
          ...p,
          ...updateData,
          ID_Employees: empId,
          employee_id: empId,
          employee_name: empName,
          status: updateData.payment_status || updateData.status || p.payment_status || p.status,
          payment_status: updateData.payment_status || updateData.status || p.payment_status || p.status,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    saveTable('payments', list);
    return this.getById(id);
  },

  async updateStatus(id, newStatus) {
    let list = getTable('payments');
    list = list.map(p => {
      if (p.id === id) {
        return {
          ...p,
          payment_status: newStatus,
          status: newStatus,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

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
