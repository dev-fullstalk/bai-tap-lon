import { departmentService } from '../services/departmentService.js';
import { employeeService } from '../services/employeeService.js';
import { toast } from '../shared/notifications.js';
import { isEmpty, formatCurrency } from '../utils/validation.js';

let allDepartments = [];
let allEmployees = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initDepartmentsPage();
  setupEventListeners();
});

async function initDepartmentsPage() {
  try {
    const [departments, employees] = await Promise.all([
      departmentService.getAll(),
      employeeService.getAll()
    ]);
    allDepartments = departments;
    allEmployees = employees;

    renderDepartmentsGrid(allDepartments);
  } catch (error) {
    console.error('Lỗi nạp phòng ban:', error);
    toast.error('Không thể tải danh sách phòng ban');
  }
}

function renderDepartmentsGrid(departments) {
  const container = document.querySelector('#departments-grid-container');
  if (!container) return;

  if (departments.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <p style="color: var(--text-muted); font-size: 1.1rem;">Chưa có phòng ban nào trong hệ thống.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = departments.map(dept => {
    const empCount = allEmployees.filter(e => e.department_id === dept.id).length;

    return `
      <div class="dept-card">
        <div class="dept-header">
          <div class="dept-icon">🏢</div>
          <span class="badge badge-info">${dept.code}</span>
        </div>

        <div class="dept-title">${dept.name}</div>
        <div class="dept-desc">${dept.description || 'Chưa có mô tả cho phòng ban này.'}</div>

        <div class="dept-meta-grid">
          <div class="dept-meta-item">
            <span class="dept-meta-label">Trưởng phòng</span>
            <span class="dept-meta-val">${dept.manager_name || 'Chưa bổ nhiệm'}</span>
          </div>
          <div class="dept-meta-item">
            <span class="dept-meta-label">Nhân sự</span>
            <span class="dept-meta-val">${empCount} thành viên</span>
          </div>
          <div class="dept-meta-item">
            <span class="dept-meta-label">Địa điểm</span>
            <span class="dept-meta-val" style="font-size: 0.85rem;">${dept.location || 'Trụ sở chính'}</span>
          </div>
          <div class="dept-meta-item">
            <span class="dept-meta-label">Ngân sách</span>
            <span class="dept-meta-val" style="font-size: 0.85rem; color: var(--primary);">${formatCurrency(dept.budget || 0)}</span>
          </div>
        </div>

        <div class="dept-footer">
          <button class="btn btn-sm btn-outline btn-edit-dept" data-id="${dept.id}">✏️ Chỉnh sửa</button>
          <button class="btn btn-sm btn-outline btn-delete-dept" data-id="${dept.id}" style="color: var(--danger); border-color: #fee2e2;">🗑️ Xóa</button>
        </div>
      </div>
    `;
  }).join('');

  attachDepartmentListeners();
}

function attachDepartmentListeners() {
  document.querySelectorAll('.btn-edit-dept').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditModal(id);
    });
  });

  document.querySelectorAll('.btn-delete-dept').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Bạn có chắc muốn xóa phòng ban này? Các nhân viên trong phòng ban sẽ được chuyển sang Chưa phân bổ.')) {
        try {
          await departmentService.delete(id);
          toast.success('Đã xóa phòng ban');
          await initDepartmentsPage();
        } catch (err) {
          toast.error('Không thể xóa phòng ban');
        }
      }
    });
  });
}

function setupEventListeners() {
  const searchInput = document.querySelector('#search-dept');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allDepartments.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.code.toLowerCase().includes(query) ||
        (d.manager_name && d.manager_name.toLowerCase().includes(query))
      );
      renderDepartmentsGrid(filtered);
    });
  }

  const btnOpenAdd = document.querySelector('#btn-open-add-dept');
  const modal = document.querySelector('#dept-modal');
  const btnClose = document.querySelector('#btn-close-dept-modal');
  const btnCancel = document.querySelector('#btn-cancel-dept-modal');
  const form = document.querySelector('#dept-form');

  if (btnOpenAdd && modal) {
    btnOpenAdd.addEventListener('click', () => {
      form.reset();
      document.querySelector('#dept-id').value = '';
      document.querySelector('#modal-dept-title').textContent = 'Thêm phòng ban mới';
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.querySelector('#dept-id').value;
      const code = document.querySelector('#dept-code').value.trim().toUpperCase();
      const name = document.querySelector('#dept-name').value.trim();
      const managerName = document.querySelector('#dept-manager').value.trim();
      const location = document.querySelector('#dept-location').value.trim();
      const budget = Number(document.querySelector('#dept-budget').value) || 0;
      const description = document.querySelector('#dept-desc').value.trim();

      if (isEmpty(code) || isEmpty(name)) {
        toast.error('Mã phòng ban và tên phòng ban là bắt buộc');
        return;
      }

      const payload = {
        code,
        name,
        manager_name: managerName,
        location,
        budget,
        description
      };

      try {
        if (id) {
          await departmentService.update(id, payload);
          toast.success('Cập nhật phòng ban thành công');
        } else {
          await departmentService.create(payload);
          toast.success('Thêm mới phòng ban thành công');
        }
        modal.close();
        await initDepartmentsPage();
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi lưu phòng ban');
      }
    });
  }
}

function openEditModal(id) {
  const dept = allDepartments.find(d => d.id === id);
  if (!dept) return;

  const modal = document.querySelector('#dept-modal');
  document.querySelector('#dept-id').value = dept.id;
  document.querySelector('#dept-code').value = dept.code;
  document.querySelector('#dept-name').value = dept.name;
  document.querySelector('#dept-manager').value = dept.manager_name || '';
  document.querySelector('#dept-location').value = dept.location || '';
  document.querySelector('#dept-budget').value = dept.budget || 0;
  document.querySelector('#dept-desc').value = dept.description || '';

  document.querySelector('#modal-dept-title').textContent = 'Chỉnh sửa phòng ban';
  if (modal) modal.showModal();
}
