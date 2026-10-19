import { getTable, saveTable } from '../utils/storage.js';

export const requestService = {
  async getAll() {
    const requests = getTable('requests');
    const employees = getTable('employees');
    const departments = getTable('departments');

    return requests.map(req => {
      const emp = employees.find(e => e.id === req.employee_id);
      const dept = emp ? departments.find(d => d.id === emp.department_id) : null;
      return {
        ...req,
        employees: emp ? {
          full_name: emp.full_name,
          emp_code: emp.emp_code,
          position: emp.position,
          departments: dept ? { name: dept.name } : null
        } : null
      };
    });
  },

  async create(reqData) {
    const list = getTable('requests');
    const newReq = {
      id: `req-${Date.now()}`,
      status: 'pending',
      approver_note: '',
      created_at: new Date().toISOString(),
      ...reqData
    };
    list.unshift(newReq);
    saveTable('requests', list);
    return newReq;
  },

  async updateStatus(id, status, approverNote = '') {
    let list = getTable('requests');
    list = list.map(r => r.id === id ? { ...r, status, approver_note: approverNote, updated_at: new Date().toISOString() } : r);
    saveTable('requests', list);
    return list.find(r => r.id === id);
  },

  async delete(id) {
    let list = getTable('requests');
    list = list.filter(r => r.id !== id);
    saveTable('requests', list);
    return true;
  }
};
