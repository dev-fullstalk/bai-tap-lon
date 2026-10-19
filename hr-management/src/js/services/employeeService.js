import { getTable, saveTable } from '../utils/storage.js';

export const employeeService = {
  async getAll() {
    const employees = getTable('employees');
    const departments = getTable('departments');
    return employees.map(emp => {
      const deptId = emp.ID_DEPARTMENT || emp.department_id;
      const dept = departments.find(d => d.id === deptId || d.name === deptId || d.code === deptId);
      const deptName = dept ? dept.name : (deptId || 'Other');
      
      return {
        ...emp,
        // User requested keys
        ID: emp.ID || emp.id || emp.emp_code,
        FULL_NAME: emp.FULL_NAME || emp.full_name,
        EMAIL: emp.EMAIL || emp.email,
        SDT: emp.SDT || emp.phone,
        ID_DEPARTMENT: emp.ID_DEPARTMENT || emp.department_id,
        STATUS: emp.STATUS || emp.status,
        POSITION: emp.POSITION || emp.position,
        AVATAR: emp.AVATAR || emp.avatar || '',
        
        // Compatibility fallbacks
        id: emp.ID || emp.id || emp.emp_code,
        emp_code: emp.ID || emp.emp_code,
        full_name: emp.FULL_NAME || emp.full_name,
        email: emp.EMAIL || emp.email,
        phone: emp.SDT || emp.phone,
        department_id: emp.ID_DEPARTMENT || emp.department_id,
        status: emp.STATUS || emp.status,
        position: emp.POSITION || emp.position,
        departments: { name: deptName, code: dept ? dept.code : 'N/A' }
      };
    });
  },

  async getById(id) {
    const all = await this.getAll();
    return all.find(e => e.ID === id || e.id === id) || null;
  },

  async create(employeeData) {
    const list = getTable('employees');
    const newEmp = {
      ID: employeeData.ID || employeeData.emp_code || `NV${String(list.length + 1).padStart(3, '0')}`,
      FULL_NAME: employeeData.FULL_NAME || employeeData.full_name || '',
      EMAIL: employeeData.EMAIL || employeeData.email || '',
      SDT: employeeData.SDT || employeeData.phone || '',
      ID_DEPARTMENT: employeeData.ID_DEPARTMENT || employeeData.department_id || '',
      STATUS: employeeData.STATUS || employeeData.status || 'Active',
      POSITION: employeeData.POSITION || employeeData.position || 'Nhân viên',
      AVATAR: employeeData.AVATAR || employeeData.avatar || '',
      created_at: new Date().toISOString()
    };
    list.unshift(newEmp);
    saveTable('employees', list);
    return newEmp;
  },

  async update(id, employeeData) {
    let list = getTable('employees');
    list = list.map(e => {
      const match = (e.ID && e.ID === id) || (e.id && e.id === id);
      if (match) {
        return {
          ...e,
          ID: employeeData.ID !== undefined ? employeeData.ID : (e.ID || id),
          FULL_NAME: employeeData.FULL_NAME !== undefined ? employeeData.FULL_NAME : (employeeData.full_name || e.FULL_NAME),
          EMAIL: employeeData.EMAIL !== undefined ? employeeData.EMAIL : (employeeData.email || e.EMAIL),
          SDT: employeeData.SDT !== undefined ? employeeData.SDT : (employeeData.phone || e.SDT),
          ID_DEPARTMENT: employeeData.ID_DEPARTMENT !== undefined ? employeeData.ID_DEPARTMENT : (employeeData.department_id || e.ID_DEPARTMENT),
          STATUS: employeeData.STATUS !== undefined ? employeeData.STATUS : (employeeData.status || e.STATUS),
          POSITION: employeeData.POSITION !== undefined ? employeeData.POSITION : (employeeData.position || e.POSITION),
          AVATAR: employeeData.AVATAR !== undefined ? employeeData.AVATAR : (employeeData.avatar || e.AVATAR),
          updated_at: new Date().toISOString()
        };
      }
      return e;
    });
    saveTable('employees', list);
    return list.find(e => e.ID === id || e.id === id);
  },

  async delete(id) {
    let list = getTable('employees');
    list = list.filter(e => e.ID !== id && e.id !== id);
    saveTable('employees', list);
    return true;
  }
};
