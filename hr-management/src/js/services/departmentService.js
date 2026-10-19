import { getTable, saveTable } from '../utils/storage.js';

export const departmentService = {
  async getAll() {
    const list = getTable('departments');
    return list.map(d => ({
      ...d,
      ID_DEPARTMENT: d.ID_DEPARTMENT || d.id,
      id: d.ID_DEPARTMENT || d.id,
      NAME: d.NAME || d.name,
      name: d.NAME || d.name,
      CODE: d.CODE || d.code || 'DEPT',
      code: d.CODE || d.code || 'DEPT',
      DESCRIPTION: d.DESCRIPTION || d.description || '',
      description: d.DESCRIPTION || d.description || '',
      DIRECT_MANAGER: d.DIRECT_MANAGER || d.manager_id || '',
      STATUS: d.STATUS || d.status || 'Active',
      status: d.STATUS || d.status || 'Active',
      ICON: d.ICON || d.icon || 'dept'
    }));
  },

  async getById(id) {
    const list = await this.getAll();
    return list.find(d => d.ID_DEPARTMENT === id || d.id === id) || null;
  },

  async create(deptData) {
    const list = getTable('departments');
    const newDept = {
      ID_DEPARTMENT: deptData.ID_DEPARTMENT || `dept-${Date.now()}`,
      id: deptData.ID_DEPARTMENT || `dept-${Date.now()}`,
      NAME: deptData.NAME || deptData.name || '',
      name: deptData.NAME || deptData.name || '',
      CODE: deptData.CODE || deptData.code || 'DEPT',
      code: deptData.CODE || deptData.code || 'DEPT',
      DESCRIPTION: deptData.DESCRIPTION || deptData.description || '',
      description: deptData.DESCRIPTION || deptData.description || '',
      DIRECT_MANAGER: deptData.DIRECT_MANAGER || deptData.manager_id || '',
      STATUS: deptData.STATUS || deptData.status || 'Active',
      status: deptData.STATUS || deptData.status || 'Active',
      ICON: deptData.ICON || deptData.icon || 'dept',
      created_at: new Date().toISOString()
    };
    list.push(newDept);
    saveTable('departments', list);
    return newDept;
  },

  async update(id, deptData) {
    let list = getTable('departments');
    list = list.map(d => {
      if (d.ID_DEPARTMENT === id || d.id === id) {
        return {
          ...d,
          ID_DEPARTMENT: deptData.ID_DEPARTMENT || d.ID_DEPARTMENT || id,
          id: deptData.ID_DEPARTMENT || d.id || id,
          NAME: deptData.NAME !== undefined ? deptData.NAME : (deptData.name || d.NAME),
          name: deptData.NAME !== undefined ? deptData.NAME : (deptData.name || d.name),
          CODE: deptData.CODE !== undefined ? deptData.CODE : (deptData.code || d.CODE),
          code: deptData.CODE !== undefined ? deptData.CODE : (deptData.code || d.code),
          DESCRIPTION: deptData.DESCRIPTION !== undefined ? deptData.DESCRIPTION : (deptData.description || d.DESCRIPTION),
          description: deptData.DESCRIPTION !== undefined ? deptData.DESCRIPTION : (deptData.description || d.description),
          DIRECT_MANAGER: deptData.DIRECT_MANAGER !== undefined ? deptData.DIRECT_MANAGER : (deptData.manager_id || d.DIRECT_MANAGER),
          STATUS: deptData.STATUS !== undefined ? deptData.STATUS : (deptData.status || d.STATUS),
          status: deptData.STATUS !== undefined ? deptData.STATUS : (deptData.status || d.status),
          ICON: deptData.ICON !== undefined ? deptData.ICON : (deptData.icon || d.ICON),
          updated_at: new Date().toISOString()
        };
      }
      return d;
    });
    saveTable('departments', list);
    return list.find(d => d.ID_DEPARTMENT === id || d.id === id);
  },

  async delete(id) {
    let list = getTable('departments');
    list = list.filter(d => d.ID_DEPARTMENT !== id && d.id !== id);
    saveTable('departments', list);
    return true;
  }
};
