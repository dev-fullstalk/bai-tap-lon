import { getTable, saveTable } from '../utils/storage.js';

export const userService = {
  async getAll() {
    return getTable('users');
  },

  async create(userData) {
    const list = getTable('users');
    const newUser = {
      id: `user-${Date.now()}`,
      last_login: 'Chưa đăng nhập',
      created_at: new Date().toISOString(),
      ...userData
    };
    list.unshift(newUser);
    saveTable('users', list);
    return newUser;
  },

  async updateRole(id, role) {
    let list = getTable('users');
    list = list.map(u => u.id === id ? { ...u, role } : u);
    saveTable('users', list);
    return list.find(u => u.id === id);
  },

  async toggleStatus(id) {
    let list = getTable('users');
    const user = list.find(u => u.id === id);
    const newStatus = user && user.status === 'active' ? 'inactive' : 'active';
    list = list.map(u => u.id === id ? { ...u, status: newStatus } : u);
    saveTable('users', list);
    return list.find(u => u.id === id);
  },

  async delete(id) {
    let list = getTable('users');
    list = list.filter(u => u.id !== id);
    saveTable('users', list);
    return true;
  }
};
