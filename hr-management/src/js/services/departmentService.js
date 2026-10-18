import { getTable, saveTable } from '../utils/storage.js';

export const departmentService = {
  async getAll() {
    return getTable('departments');
  },

  async getById(id) {
    const list = getTable('departments');
    return list.find(d => d.id === id) || null;
  },

  async create(deptData) {
    const list = getTable('departments');
    const newDept = {
      id: `dept-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...deptData
    };
    list.unshift(newDept);
    saveTable('departments', list);
    return newDept;
  },

  async update(id, deptData) {
    let list = getTable('departments');
    list = list.map(d => d.id === id ? { ...d, ...deptData, updated_at: new Date().toISOString() } : d);
    saveTable('departments', list);
    return list.find(d => d.id === id);
  },

  async delete(id) {
    let list = getTable('departments');
    list = list.filter(d => d.id !== id);
    saveTable('departments', list);
    return true;
  }
};
