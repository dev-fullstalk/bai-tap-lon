import { getTable, saveTable } from '../utils/storage.js';

export const employeeService = {
  async getAll() {
    const employees = getTable('employees');
    const departments = getTable('departments');
    return employees.map(emp => {
      const dept = departments.find(d => d.id === emp.department_id);
      return {
        ...emp,
        departments: dept ? { name: dept.name, code: dept.code } : null
      };
    });
  },

  async getById(id) {
    const employees = getTable('employees');
    const departments = getTable('departments');
    const emp = employees.find(e => e.id === id);
    if (!emp) return null;
    const dept = departments.find(d => d.id === emp.department_id);
    return {
      ...emp,
      departments: dept ? { name: dept.name, code: dept.code } : null
    };
  },

  async create(employeeData) {
    const list = getTable('employees');
    const newEmp = {
      id: `emp-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...employeeData
    };
    list.unshift(newEmp);
    saveTable('employees', list);
    return newEmp;
  },

  async update(id, employeeData) {
    let list = getTable('employees');
    list = list.map(e => e.id === id ? { ...e, ...employeeData, updated_at: new Date().toISOString() } : e);
    saveTable('employees', list);
    return list.find(e => e.id === id);
  },

  async delete(id) {
    let list = getTable('employees');
    list = list.filter(e => e.id !== id);
    saveTable('employees', list);
    return true;
  }
};
