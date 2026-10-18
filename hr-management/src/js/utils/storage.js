const STORAGE_KEYS = {
  departments: 'hr_departments_data',
  employees: 'hr_employees_data',
  users: 'hr_users_data',
  attendance: 'hr_attendance_data',
  requests: 'hr_requests_data',
  payments: 'hr_payments_data'
};

const today = new Date().toISOString().split('T')[0];

const DEFAULT_DATA = {
  departments: [
    { id: 'dept-1', code: 'TECH', name: 'Phòng Kỹ thuật & CNTT', manager_name: 'Nguyễn Văn An', budget: 500000000, location: 'Tầng 4, Tòa nhà A', description: 'Phát triển và bảo trì hệ thống phần mềm' },
    { id: 'dept-2', code: 'HR', name: 'Phòng Nhân sự & Hành chính', manager_name: 'Trần Thị Bình', budget: 200000000, location: 'Tầng 3, Tòa nhà A', description: 'Tuyển dụng, đào tạo và chính sách nhân sự' },
    { id: 'dept-3', code: 'MKT', name: 'Phòng Marketing', manager_name: 'Lê Hoàng Cường', budget: 350000000, location: 'Tầng 5, Tòa nhà B', description: 'Quảng bá sản phẩm và thương hiệu' },
    { id: 'dept-4', code: 'FIN', name: 'Phòng Kế toán & Tài chính', manager_name: 'Phạm Minh Đức', budget: 250000000, location: 'Tầng 2, Tòa nhà A', description: 'Quản lý tài chính và bảng lương' }
  ],
  employees: [
    { id: 'emp-1', emp_code: 'NV001', full_name: 'Nguyễn Văn An', email: 'an.nguyen@company.com', phone: '0912345678', department_id: 'dept-1', position: 'Trưởng phòng Kỹ thuật', status: 'active', base_salary: 35000000, join_date: '2022-03-15' },
    { id: 'emp-2', emp_code: 'NV002', full_name: 'Trần Thị Bình', email: 'binh.tran@company.com', phone: '0987654321', department_id: 'dept-2', position: 'Trưởng phòng Nhân sự', status: 'active', base_salary: 30000000, join_date: '2022-05-10' },
    { id: 'emp-3', emp_code: 'NV003', full_name: 'Lê Hoàng Cường', email: 'cuong.le@company.com', phone: '0934567890', department_id: 'dept-3', position: 'Trưởng phòng Marketing', status: 'active', base_salary: 28000000, join_date: '2023-01-05' },
    { id: 'emp-4', emp_code: 'NV004', full_name: 'Phạm Minh Đức', email: 'duc.pham@company.com', phone: '0901234567', department_id: 'dept-4', position: 'Kế toán trưởng', status: 'active', base_salary: 27000000, join_date: '2023-02-20' },
    { id: 'emp-5', emp_code: 'NV005', full_name: 'Hoàng Thị Dung', email: 'dung.hoang@company.com', phone: '0978123456', department_id: 'dept-1', position: 'Kỹ sư Fullstack', status: 'active', base_salary: 22000000, join_date: '2023-06-12' },
    { id: 'emp-6', emp_code: 'NV006', full_name: 'Vũ Quốc Huy', email: 'huy.vu@company.com', phone: '0945678901', department_id: 'dept-1', position: 'Kỹ sư Frontend', status: 'probation', base_salary: 15000000, join_date: '2024-09-01' }
  ],
  users: [
    { id: 'user-1', email: 'admin@company.com', full_name: 'Quản trị viên Hệ thống', role: 'admin', status: 'active', last_login: '2025-01-15 08:30' },
    { id: 'user-2', email: 'hr@company.com', full_name: 'Trần Thị Bình (HR)', role: 'hr', status: 'active', last_login: '2025-01-15 08:45' },
    { id: 'user-3', email: 'tech.lead@company.com', full_name: 'Nguyễn Văn An (Manager)', role: 'manager', status: 'active', last_login: '2025-01-14 17:15' },
    { id: 'user-4', email: 'dung.hoang@company.com', full_name: 'Hoàng Thị Dung', role: 'employee', status: 'active', last_login: '2025-01-15 08:00' }
  ],
  attendance: [
    { id: 'att-1', employee_id: 'emp-1', date: today, check_in: '08:25', check_out: '17:35', status: 'on_time', note: 'Đúng giờ' },
    { id: 'att-2', employee_id: 'emp-2', date: today, check_in: '08:30', check_out: '17:40', status: 'on_time', note: 'Đúng giờ' },
    { id: 'att-3', employee_id: 'emp-5', date: today, check_in: '08:45', check_out: '', status: 'late', note: 'Kẹt xe' },
    { id: 'att-4', employee_id: 'emp-6', date: today, check_in: '08:20', check_out: '17:30', status: 'on_time', note: 'Đúng giờ' }
  ],
  requests: [
    { id: 'req-1', employee_id: 'emp-5', type: 'leave', start_date: '2025-02-01', end_date: '2025-02-03', reason: 'Nghỉ việc gia đình', status: 'approved', approver_note: 'Đã duyệt' },
    { id: 'req-2', employee_id: 'emp-6', type: 'overtime', start_date: '2025-01-20', end_date: '2025-01-20', reason: 'Triển khai phiên bản mới', status: 'pending', approver_note: '' },
    { id: 'req-3', employee_id: 'emp-3', type: 'business_trip', start_date: '2025-02-10', end_date: '2025-02-12', reason: 'Tham gia hội thảo tại TP.HCM', status: 'pending', approver_note: '' }
  ],
  payments: [
    { id: 'pay-1', employee_id: 'emp-1', month: 1, year: 2025, base_salary: 35000000, work_days: 22, bonus: 5000000, deductions: 3500000, net_salary: 36500000, status: 'paid', payment_date: '2025-01-25' },
    { id: 'pay-2', employee_id: 'emp-2', month: 1, year: 2025, base_salary: 30000000, work_days: 22, bonus: 3000000, deductions: 3000000, net_salary: 30000000, status: 'paid', payment_date: '2025-01-25' },
    { id: 'pay-3', employee_id: 'emp-5', month: 1, year: 2025, base_salary: 22000000, work_days: 21.5, bonus: 2000000, deductions: 2200000, net_salary: 21800000, status: 'pending', payment_date: '' }
  ]
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function initializeStorage() {
  Object.entries(STORAGE_KEYS).forEach(([table, key]) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_DATA[table]));
    }
  });
}

export function getTable(table) {
  const key = STORAGE_KEYS[table];
  if (!key) return [];

  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    const fallback = clone(DEFAULT_DATA[table]);
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

export function saveTable(table, data) {
  const key = STORAGE_KEYS[table];
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function resetToDefault() {
  Object.entries(STORAGE_KEYS).forEach(([table, key]) => {
    localStorage.setItem(key, JSON.stringify(clone(DEFAULT_DATA[table])));
  });
}
