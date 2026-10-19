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
    {
      ID_DEPARTMENT: 'dept-1',
      id: 'dept-1',
      NAME: 'Engineering',
      name: 'Engineering',
      CODE: 'ENG',
      code: 'ENG',
      DESCRIPTION: 'Develop and maintain software products and systems.',
      description: 'Develop and maintain software products and systems.',
      DIRECT_MANAGER: 'NV001',
      manager_id: 'NV001',
      STATUS: 'Active',
      status: 'Active',
      ICON: 'code'
    },
    {
      ID_DEPARTMENT: 'dept-2',
      id: 'dept-2',
      NAME: 'Marketing',
      name: 'Marketing',
      CODE: 'MKT',
      code: 'MKT',
      DESCRIPTION: 'Build brand, grow audience and drive business growth.',
      description: 'Build brand, grow audience and drive business growth.',
      DIRECT_MANAGER: 'NV002',
      manager_id: 'NV002',
      STATUS: 'Active',
      status: 'Active',
      ICON: 'marketing'
    },
    {
      ID_DEPARTMENT: 'dept-3',
      id: 'dept-3',
      NAME: 'Business',
      name: 'Business',
      CODE: 'BUS',
      code: 'BUS',
      DESCRIPTION: 'Manage operations and customer relationships.',
      description: 'Manage operations and customer relationships.',
      DIRECT_MANAGER: 'NV003',
      manager_id: 'NV003',
      STATUS: 'Active',
      status: 'Active',
      ICON: 'business'
    },
    {
      ID_DEPARTMENT: 'dept-4',
      id: 'dept-4',
      NAME: 'HR',
      name: 'HR',
      CODE: 'HR',
      code: 'HR',
      DESCRIPTION: 'Manage people, culture and talent development.',
      description: 'Manage people, culture and talent development.',
      DIRECT_MANAGER: 'NV004',
      manager_id: 'NV004',
      STATUS: 'Active',
      status: 'Active',
      ICON: 'hr'
    },
    {
      ID_DEPARTMENT: 'dept-5',
      id: 'dept-5',
      NAME: 'Finance',
      name: 'Finance',
      CODE: 'FIN',
      code: 'FIN',
      DESCRIPTION: 'Handle financial planning and accounting operations.',
      description: 'Handle financial planning and accounting operations.',
      DIRECT_MANAGER: 'NV005',
      manager_id: 'NV005',
      STATUS: 'Active',
      status: 'Active',
      ICON: 'finance'
    },
    {
      ID_DEPARTMENT: 'dept-6',
      id: 'dept-6',
      NAME: 'Content',
      name: 'Content',
      CODE: 'CNT',
      code: 'CNT',
      DESCRIPTION: 'Create and manage content for marketing and communication.',
      description: 'Create and manage content for marketing and communication.',
      DIRECT_MANAGER: 'NV006',
      manager_id: 'NV006',
      STATUS: 'Inactive',
      status: 'Inactive',
      ICON: 'content'
    }
  ],
  employees: [
    { ID: 'NV001', FULL_NAME: 'Nguyễn Văn An', EMAIL: 'an.nguyen@company.com', SDT: '0901234567', ID_DEPARTMENT: 'dept-1', STATUS: 'Active', POSITION: 'Frontend Developer', AVATAR: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV002', FULL_NAME: 'Trần Thị Bích', EMAIL: 'bich.tran@company.com', SDT: '0987654321', ID_DEPARTMENT: 'dept-2', STATUS: 'Active', POSITION: 'Marketing Specialist', AVATAR: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV003', FULL_NAME: 'Lê Minh Cường', EMAIL: 'cuong.le@company.com', SDT: '0912345678', ID_DEPARTMENT: 'dept-3', STATUS: 'Inactive', POSITION: 'Sales Executive', AVATAR: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV004', FULL_NAME: 'Phạm Thị Dung', EMAIL: 'dung.pham@company.com', SDT: '0965432187', ID_DEPARTMENT: 'dept-4', STATUS: 'Active', POSITION: 'HR Specialist', AVATAR: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV005', FULL_NAME: 'Hoàng Văn Em', EMAIL: 'em.hoang@company.com', SDT: '0978123456', ID_DEPARTMENT: 'dept-5', STATUS: 'Active', POSITION: 'Accountant', AVATAR: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV006', FULL_NAME: 'Vũ Thị Hà', EMAIL: 'ha.vu@company.com', SDT: '0909878543', ID_DEPARTMENT: 'dept-6', STATUS: 'Active', POSITION: 'Content Lead', AVATAR: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV007', FULL_NAME: 'Đặng Văn Hùng', EMAIL: 'hung.dang@company.com', SDT: '0983217654', ID_DEPARTMENT: 'dept-1', STATUS: 'Inactive', POSITION: 'Backend Developer', AVATAR: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV008', FULL_NAME: 'Ngô Thị Mai', EMAIL: 'mai.ngo@company.com', SDT: '0918765432', ID_DEPARTMENT: 'dept-2', STATUS: 'Active', POSITION: 'Content Creator', AVATAR: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV009', FULL_NAME: 'Đoàn Quốc Bảo', EMAIL: 'bao.doan@company.com', SDT: '0911223344', ID_DEPARTMENT: 'dept-1', STATUS: 'Active', POSITION: 'DevOps Engineer', AVATAR: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV010', FULL_NAME: 'Nguyễn Ngọc Lan', EMAIL: 'lan.nguyen@company.com', SDT: '0933445566', ID_DEPARTMENT: 'dept-4', STATUS: 'Active', POSITION: 'Recruiter', AVATAR: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV011', FULL_NAME: 'Trần Quang Khải', EMAIL: 'khai.tran@company.com', SDT: '0944556677', ID_DEPARTMENT: 'dept-1', STATUS: 'Active', POSITION: 'Mobile Developer', AVATAR: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV012', FULL_NAME: 'Lê Thị Thu Hà', EMAIL: 'ha.le@company.com', SDT: '0955667788', ID_DEPARTMENT: 'dept-5', STATUS: 'Active', POSITION: 'Financial Analyst', AVATAR: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV013', FULL_NAME: 'Phan Minh Trí', EMAIL: 'tri.phan@company.com', SDT: '0966778899', ID_DEPARTMENT: 'dept-3', STATUS: 'Active', POSITION: 'Account Executive', AVATAR: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV014', FULL_NAME: 'Vũ Thùy Linh', EMAIL: 'linh.vu@company.com', SDT: '0977889900', ID_DEPARTMENT: 'dept-2', STATUS: 'Active', POSITION: 'SEO Specialist', AVATAR: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV015', FULL_NAME: 'Bùi Đức Long', EMAIL: 'long.bui@company.com', SDT: '0988990011', ID_DEPARTMENT: 'dept-1', STATUS: 'Active', POSITION: 'QA Automation Lead', AVATAR: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV016', FULL_NAME: 'Hoàng Khánh Vân', EMAIL: 'van.hoang@company.com', SDT: '0999001122', ID_DEPARTMENT: 'dept-4', STATUS: 'Active', POSITION: 'HR Business Partner', AVATAR: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV017', FULL_NAME: 'Cao Văn Sơn', EMAIL: 'son.cao@company.com', SDT: '0912233445', ID_DEPARTMENT: 'dept-1', STATUS: 'Active', POSITION: 'Fullstack Engineer', AVATAR: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV018', FULL_NAME: 'Đinh Mỹ Duyên', EMAIL: 'duyen.dinh@company.com', SDT: '0923344556', ID_DEPARTMENT: 'dept-2', STATUS: 'Active', POSITION: 'Brand Designer', AVATAR: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV019', FULL_NAME: 'Lương Thanh Tùng', EMAIL: 'tung.luong@company.com', SDT: '0934455667', ID_DEPARTMENT: 'dept-6', STATUS: 'Active', POSITION: 'Copywriter', AVATAR: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV020', FULL_NAME: 'Mai Quốc Huy', EMAIL: 'huy.mai@company.com', SDT: '0945566778', ID_DEPARTMENT: 'dept-5', STATUS: 'Active', POSITION: 'Auditor', AVATAR: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV021', FULL_NAME: 'Nghiêm Thùy Trang', EMAIL: 'trang.nghiem@company.com', SDT: '0956677889', ID_DEPARTMENT: 'dept-6', STATUS: 'Active', POSITION: 'Content Editor', AVATAR: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV022', FULL_NAME: 'Phạm Gia Huy', EMAIL: 'huy.pham@company.com', SDT: '0967788990', ID_DEPARTMENT: 'dept-1', STATUS: 'Active', POSITION: 'UI/UX Designer', AVATAR: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV023', FULL_NAME: 'Quách Anh Tuấn', EMAIL: 'tuan.quach@company.com', SDT: '0978899001', ID_DEPARTMENT: 'dept-1', STATUS: 'Active', POSITION: 'Security Engineer', AVATAR: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=face' },
    { ID: 'NV024', FULL_NAME: 'Tạ Ngọc Ánh', EMAIL: 'anh.ta@company.com', SDT: '0989900112', ID_DEPARTMENT: 'dept-3', STATUS: 'Active', POSITION: 'Sales Representative', AVATAR: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face' }
  ],
  users: [
    { id: 'user-1', email: 'admin@company.com', full_name: 'Thang Phan (Admin)', role: 'admin', status: 'active', last_login: '2025-01-15 08:30' },
    { id: 'user-2', email: 'hr@company.com', full_name: 'Phạm Thị Dung (HR)', role: 'hr', status: 'active', last_login: '2025-01-15 08:45' },
    { id: 'user-3', email: 'tech.lead@company.com', full_name: 'Nguyễn Văn An (Manager)', role: 'manager', status: 'active', last_login: '2025-01-14 17:15' }
  ],
  attendance: [
    { id: 'att-1', employee_id: 'NV001', date: today, check_in: '08:25', check_out: '17:35', status: 'on_time', note: 'Đúng giờ' },
    { id: 'att-2', employee_id: 'NV002', date: today, check_in: '08:30', check_out: '17:40', status: 'on_time', note: 'Đúng giờ' }
  ],
  requests: [
    { id: 'req-1', employee_id: 'NV005', type: 'leave', start_date: '2025-02-01', end_date: '2025-02-03', reason: 'Nghỉ việc gia đình', status: 'approved', approver_note: 'Đã duyệt' }
  ],
  payments: [
    { id: 'PAY-001', ID_Employees: 'NV001', employee_id: 'NV001', employee_name: 'Nguyễn Văn An', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 2500, description: 'September salary' },
    { id: 'PAY-002', ID_Employees: 'NV002', employee_id: 'NV002', employee_name: 'Trần Thị Bích', payment_type: 'bonus', payment_method: 'Cash', payment_date: '2026-10-20', due_date: '2026-10-20', payment_status: 'pending', status: 'pending', amount: 1200, description: 'Q3 performance bonus' },
    { id: 'PAY-003', ID_Employees: 'NV003', employee_id: 'NV003', employee_name: 'Lê Minh Cường', payment_type: 'allowance', payment_method: 'Bank Transfer', payment_date: '2026-10-22', due_date: '2026-10-22', payment_status: 'pending', status: 'pending', amount: 450, description: 'Transportation allowance' },
    { id: 'PAY-004', ID_Employees: 'NV004', employee_id: 'NV004', employee_name: 'Phạm Thị Dung', payment_type: 'other', payment_method: 'Cash', payment_date: '2026-09-28', due_date: '2026-09-28', payment_status: 'paid', status: 'paid', amount: 350, description: 'Reimbursement for office supplies' },
    { id: 'PAY-005', ID_Employees: 'NV005', employee_id: 'NV005', employee_name: 'Hoàng Văn Em', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-10-25', due_date: '2026-10-25', payment_status: 'paid', status: 'paid', amount: 2800, description: 'September salary' },
    { id: 'PAY-006', ID_Employees: 'NV006', employee_id: 'NV006', employee_name: 'Vũ Thị Hà', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 2600, description: 'September salary' },
    { id: 'PAY-007', ID_Employees: 'NV007', employee_id: 'NV007', employee_name: 'Đặng Văn Hùng', payment_type: 'bonus', payment_method: 'Bank Transfer', payment_date: '2026-10-15', due_date: '2026-10-15', payment_status: 'paid', status: 'paid', amount: 1800, description: 'Annual performance bonus' },
    { id: 'PAY-008', ID_Employees: 'NV008', employee_id: 'NV008', employee_name: 'Ngô Thị Mai', payment_type: 'allowance', payment_method: 'Bank Transfer', payment_date: '2026-10-01', due_date: '2026-10-01', payment_status: 'paid', status: 'paid', amount: 300, description: 'Meal allowance' },
    { id: 'PAY-009', ID_Employees: 'NV009', employee_id: 'NV009', employee_name: 'Đoàn Quốc Bảo', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 2400, description: 'September salary' },
    { id: 'PAY-010', ID_Employees: 'NV010', employee_id: 'NV010', employee_name: 'Nguyễn Ngọc Lan', payment_type: 'bonus', payment_method: 'Cash', payment_date: '2026-10-24', due_date: '2026-10-24', payment_status: 'pending', status: 'pending', amount: 1500, description: 'Project completion bonus' },
    { id: 'PAY-011', ID_Employees: 'NV011', employee_id: 'NV011', employee_name: 'Trần Quang Khải', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 3200, description: 'September salary' },
    { id: 'PAY-012', ID_Employees: 'NV012', employee_id: 'NV012', employee_name: 'Lê Thị Thu Hà', payment_type: 'allowance', payment_method: 'Bank Transfer', payment_date: '2026-10-05', due_date: '2026-10-05', payment_status: 'paid', status: 'paid', amount: 800, description: 'Housing allowance' },
    { id: 'PAY-013', ID_Employees: 'NV013', employee_id: 'NV013', employee_name: 'Phan Minh Trí', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 2300, description: 'September salary' },
    { id: 'PAY-014', ID_Employees: 'NV014', employee_id: 'NV014', employee_name: 'Vũ Thùy Linh', payment_type: 'other', payment_method: 'Cash', payment_date: '2026-10-10', due_date: '2026-10-10', payment_status: 'paid', status: 'paid', amount: 650, description: 'Travel expenses refund' },
    { id: 'PAY-015', ID_Employees: 'NV015', employee_id: 'NV015', employee_name: 'Bùi Đức Long', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 3600, description: 'September salary' },
    { id: 'PAY-016', ID_Employees: 'NV016', employee_id: 'NV016', employee_name: 'Hoàng Khánh Vân', payment_type: 'bonus', payment_method: 'Bank Transfer', payment_date: '2026-10-18', due_date: '2026-10-18', payment_status: 'pending', status: 'pending', amount: 1100, description: 'Sales achievement bonus' },
    { id: 'PAY-017', ID_Employees: 'NV017', employee_id: 'NV017', employee_name: 'Cao Văn Sơn', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 2900, description: 'September salary' },
    { id: 'PAY-018', ID_Employees: 'NV018', employee_id: 'NV018', employee_name: 'Đinh Mỹ Duyên', payment_type: 'allowance', payment_method: 'Bank Transfer', payment_date: '2026-10-02', due_date: '2026-10-02', payment_status: 'paid', status: 'paid', amount: 250, description: 'Internet & mobile allowance' },
    { id: 'PAY-019', ID_Employees: 'NV019', employee_id: 'NV019', employee_name: 'Lương Thanh Tùng', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 2750, description: 'September salary' },
    { id: 'PAY-020', ID_Employees: 'NV020', employee_id: 'NV020', employee_name: 'Mai Quốc Huy', payment_type: 'other', payment_method: 'Cash', payment_date: '2026-10-21', due_date: '2026-10-21', payment_status: 'pending', status: 'pending', amount: 550, description: 'Equipment purchase refund' },
    { id: 'PAY-021', ID_Employees: 'NV021', employee_id: 'NV021', employee_name: 'Nghiêm Thùy Trang', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 3800, description: 'September salary' },
    { id: 'PAY-022', ID_Employees: 'NV022', employee_id: 'NV022', employee_name: 'Phạm Gia Huy', payment_type: 'bonus', payment_method: 'Bank Transfer', payment_date: '2026-10-12', due_date: '2026-10-12', payment_status: 'paid', status: 'paid', amount: 950, description: 'Customer feedback bonus' },
    { id: 'PAY-023', ID_Employees: 'NV023', employee_id: 'NV023', employee_name: 'Quách Anh Tuấn', payment_type: 'allowance', payment_method: 'Bank Transfer', payment_date: '2026-10-23', due_date: '2026-10-23', payment_status: 'pending', status: 'pending', amount: 400, description: 'Health & wellness stipend' },
    { id: 'PAY-024', ID_Employees: 'NV024', employee_id: 'NV024', employee_name: 'Tạ Ngọc Ánh', payment_type: 'salary', payment_method: 'Bank Transfer', payment_date: '2026-09-30', due_date: '2026-09-30', payment_status: 'paid', status: 'paid', amount: 3700, description: 'September salary' }
  ]
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function initializeStorage() {
  Object.entries(STORAGE_KEYS).forEach(([table, key]) => {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_DATA[table]));
    } else if (table === 'departments') {
      try {
        const parsed = JSON.parse(raw);
        // If parsed departments is less than 6 or missing ID_DEPARTMENT, refresh
        if (!Array.isArray(parsed) || parsed.length < 6 || !parsed[0].ID_DEPARTMENT) {
          localStorage.setItem(key, JSON.stringify(DEFAULT_DATA[table]));
        }
      } catch {
        localStorage.setItem(key, JSON.stringify(DEFAULT_DATA[table]));
      }
    } else if (table === 'payments') {
      try {
        const parsed = JSON.parse(raw);
        // If parsed payments is empty, missing payment_type, or still using old EMP prefix instead of localStorage employee IDs
        if (!Array.isArray(parsed) || parsed.length < 5 || !parsed[0].payment_type || (parsed[0].ID_Employees && parsed[0].ID_Employees.startsWith('EMP'))) {
          localStorage.setItem(key, JSON.stringify(DEFAULT_DATA[table]));
        }
      } catch {
        localStorage.setItem(key, JSON.stringify(DEFAULT_DATA[table]));
      }
    } else if (table === 'employees') {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0 || !parsed[0].ID) {
          localStorage.setItem(key, JSON.stringify(DEFAULT_DATA[table]));
        } else {
          let hasProbation = false;
          parsed.forEach(e => {
            if (e.STATUS === 'On Probation' || e.status === 'probation' || e.status === 'On Probation') {
              e.STATUS = 'Active';
              e.status = 'Active';
              hasProbation = true;
            }
          });
          if (hasProbation) {
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        }
      } catch {
        localStorage.setItem(key, JSON.stringify(DEFAULT_DATA[table]));
      }
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
