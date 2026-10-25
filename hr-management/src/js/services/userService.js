import { getTable, saveTable } from '../utils/storage.js';

export const userService = {
  async getAll() {
    const employees = getTable('employees');
    return getTable('users').map((user, index) => {
      const legacyName = (user.full_name || '').replace(/\s*\([^)]*\)$/, '').trim().toLowerCase();
      const linkedEmployee = employees.find(employee => {
        const name = (employee.FULL_NAME || employee.full_name || '').trim().toLowerCase();
        return (user.employee_id && (employee.ID || employee.id) === user.employee_id) || (legacyName && name === legacyName);
      });
      return {
      id: user.id || `user-${index + 1}`,
      employee_id: user.employee_id || linkedEmployee?.ID || linkedEmployee?.id || '',
      username: user.username || (user.email || '').split('@')[0] || `user${index + 1}`,
      password_hash: user.password_hash || '',
      role: ['admin', 'manager', 'employee'].includes(user.role) ? user.role : (user.role === 'hr' ? 'manager' : 'employee'),
      account_status: user.account_status || (user.status === 'inactive' ? 'locked' : 'active'),
      last_login: user.last_login || 'Never',
      created_at: user.created_at
      };
    });
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

  async update(id, userData) {
    let list = getTable('users');
    list = list.map(u => u.id === id ? { ...u, ...userData } : u);
    saveTable('users', list);
    return list.find(u => u.id === id);
  },

  async updateStatus(id, account_status) {
    let list = getTable('users');
    list = list.map(u => u.id === id ? { ...u, account_status } : u);
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
