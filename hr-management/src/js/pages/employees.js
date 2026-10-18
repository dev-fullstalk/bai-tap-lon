import { employeeService } from '../services/employeeService.js';
import { departmentService } from '../services/departmentService.js';
import { toast } from '../shared/notifications.js';
import { isEmpty, isValidEmail, isValidPhone, formatCurrency } from '../utils/validation.js';

let allEmployees = [];
let allDepartments = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initEmployeesPage();
  setupEventListeners();
});

async function initEmployeesPage() {
  try {
    const [employees, departments] = await Promise.all([
      employeeService.getAll(),
      departmentService.getAll()
    ]);
    allEmployees = employees;
    allDepartments = departments;

    populateDepartmentSelects(departments);
    renderEmployeesTable(allEmployees);
  } catch (error) {
    console.error('Lỗi khởi tạo trang nhân viên:', error);
    toast.error('Không thể tải danh sách nhân viên');
  }
}

function populateDepartmentSelects(departments) {
  const filterSelect = document.querySelector('#filter-department');
  const formSelect = document.querySelector('#emp-department');

  const options = departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  if (filterSelect) {
    filterSelect.innerHTML = `<option value="">Tất cả phòng ban</option>` + options;
  }
  if (formSelect) {
    formSelect.innerHTML = `<option value="">-- Chọn phòng ban --</option>` + options;
  }
}

function renderEmployeesTable(employees) {
  const tbody = document.querySelector('#employees-table-body');
  if (!tbody) return;

  if (employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Không tìm thấy nhân viên nào phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = employees.map(emp => {
    const deptName = emp.departments ? emp.departments.name : 'Chưa phân bổ';
    const statusBadges = {
      active: '<span class="badge badge-success"><span class="badge-dot"></span>Chính thức</span>',
      probation: '<span class="badge badge-warning"><span class="badge-dot"></span>Thử việc</span>',
      resigned: '<span class="badge badge-danger"><span class="badge-dot"></span>Đã nghỉ</span>'
    };

    return `
      <tr>
        <td><span class="emp-code">${emp.emp_code}</span></td>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${getInitials(emp.full_name)}</div>
            <div class="user-cell-meta">
              <span class="user-cell-name">${emp.full_name}</span>
              <span class="user-cell-sub">${emp.email}</span>
            </div>
          </div>
        </td>
        <td>${emp.phone || '-'}</td>
        <td><strong>${deptName}</strong></td>
        <td>${emp.position}</td>
        <td>${statusBadges[emp.status] || emp.status}</td>
        <td>
          <div class="table-actions">
            <button class="action-icon-btn btn-edit-emp" data-id="${emp.id}" title="Chỉnh sửa">✏️</button>
            <button class="action-icon-btn danger btn-delete-emp" data-id="${emp.id}" title="Xóa">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachRowActionListeners();
}

function getInitials(name) {
  if (!name) return 'NV';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function attachRowActionListeners() {
  document.querySelectorAll('.btn-edit-emp').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditModal(id);
    });
  });

  document.querySelectorAll('.btn-delete-emp').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?')) {
        try {
          await employeeService.delete(id);
          toast.success('Đã xóa nhân viên thành công');
          await initEmployeesPage();
        } catch (err) {
          toast.error('Không thể xóa nhân viên');
        }
      }
    });
  });
}

function setupEventListeners() {
  // Tìm kiếm & Lọc
  const searchInput = document.querySelector('#search-employee');
  const deptFilter = document.querySelector('#filter-department');
  const statusFilter = document.querySelector('#filter-status');

  const handleFilter = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const deptId = deptFilter ? deptFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';

    const filtered = allEmployees.filter(emp => {
      const matchQuery = !query || 
        emp.full_name.toLowerCase().includes(query) || 
        emp.emp_code.toLowerCase().includes(query) || 
        emp.email.toLowerCase().includes(query);
      const matchDept = !deptId || emp.department_id === deptId;
      const matchStatus = !status || emp.status === status;

      return matchQuery && matchDept && matchStatus;
    });

    renderEmployeesTable(filtered);
  };

  if (searchInput) searchInput.addEventListener('input', handleFilter);
  if (deptFilter) deptFilter.addEventListener('change', handleFilter);
  if (statusFilter) statusFilter.addEventListener('change', handleFilter);

  // Mở modal thêm mới
  const btnOpenAdd = document.querySelector('#btn-open-add-emp');
  const modal = document.querySelector('#emp-modal');
  const btnClose = document.querySelector('#btn-close-emp-modal');
  const btnCancel = document.querySelector('#btn-cancel-emp-modal');
  const form = document.querySelector('#emp-form');

  if (btnOpenAdd && modal) {
    btnOpenAdd.addEventListener('click', () => {
      form.reset();
      document.querySelector('#emp-id').value = '';
      document.querySelector('#modal-emp-title').textContent = 'Thêm nhân viên mới';
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Xử lý submit form
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.querySelector('#emp-id').value;
      const empCode = document.querySelector('#emp-code').value.trim();
      const fullName = document.querySelector('#emp-name').value.trim();
      const email = document.querySelector('#emp-email').value.trim();
      const phone = document.querySelector('#emp-phone').value.trim();
      const departmentId = document.querySelector('#emp-department').value;
      const position = document.querySelector('#emp-position').value.trim();
      const status = document.querySelector('#emp-status').value;
      const baseSalary = Number(document.querySelector('#emp-salary').value) || 0;

      // Validation
      if (isEmpty(empCode) || isEmpty(fullName) || isEmpty(email)) {
        toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
        return;
      }
      if (!isValidEmail(email)) {
        toast.error('Địa chỉ email không hợp lệ');
        return;
      }

      const payload = {
        emp_code: empCode,
        full_name: fullName,
        email: email,
        phone: phone,
        department_id: departmentId || null,
        position: position || 'Nhân viên',
        status: status,
        base_salary: baseSalary
      };

      try {
        if (id) {
          await employeeService.update(id, payload);
          toast.success('Cập nhật thông tin nhân viên thành công');
        } else {
          await employeeService.create(payload);
          toast.success('Thêm mới nhân viên thành công');
        }
        modal.close();
        await initEmployeesPage();
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi lưu nhân viên');
      }
    });
  }
}

function openEditModal(id) {
  const emp = allEmployees.find(e => e.id === id);
  if (!emp) return;

  const modal = document.querySelector('#emp-modal');
  document.querySelector('#emp-id').value = emp.id;
  document.querySelector('#emp-code').value = emp.emp_code;
  document.querySelector('#emp-name').value = emp.full_name;
  document.querySelector('#emp-email').value = emp.email;
  document.querySelector('#emp-phone').value = emp.phone || '';
  document.querySelector('#emp-department').value = emp.department_id || '';
  document.querySelector('#emp-position').value = emp.position || '';
  document.querySelector('#emp-status').value = emp.status || 'active';
  document.querySelector('#emp-salary').value = emp.base_salary || 0;

  document.querySelector('#modal-emp-title').textContent = 'Chỉnh sửa nhân viên';
  if (modal) modal.showModal();
}
