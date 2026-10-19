import { userService } from '../services/userService.js';
import { toast } from '../shared/notifications.js';
import { isEmpty, isValidEmail } from '../utils/validation.js';

let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initUsersPage();
  setupEventListeners();
});

async function initUsersPage() {
  try {
    allUsers = await userService.getAll();
    renderUsersTable(allUsers);
  } catch (error) {
    console.error('Lỗi tải người dùng:', error);
    toast.error('Không thể tải danh sách tài khoản');
  }
}

function renderUsersTable(users) {
  const tbody = document.querySelector('#users-table-body');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Không tìm thấy tài khoản người dùng nào.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => {
    const roleClasses = {
      admin: 'role-admin',
      hr: 'role-hr',
      manager: 'role-manager',
      employee: 'role-employee'
    };

    const roleLabels = {
      admin: 'Quản trị viên (Admin)',
      hr: 'Nhân sự (HR)',
      manager: 'Trưởng nhóm (Manager)',
      employee: 'Nhân viên (Employee)'
    };

    const statusBadge = user.status === 'active'
      ? '<span class="badge badge-success"><span class="badge-dot"></span>Hoạt động</span>'
      : '<span class="badge badge-neutral"><span class="badge-dot"></span>Đã khóa</span>';

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${(user.full_name || 'US').slice(0, 2).toUpperCase()}</div>
            <div class="user-cell-meta">
              <span class="user-cell-name">${user.full_name}</span>
              <span class="user-cell-sub">${user.email}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="role-badge ${roleClasses[user.role] || 'role-employee'}">
            ${roleLabels[user.role] || user.role}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td><span style="font-size: 0.82rem; color: var(--text-muted);">${user.last_login || 'Chưa đăng nhập'}</span></td>
        <td>
          <select class="filter-select select-role-change" data-id="${user.id}" style="padding: 4px 8px; font-size: 0.8rem;">
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="hr" ${user.role === 'hr' ? 'selected' : ''}>HR</option>
            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
            <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Employee</option>
          </select>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm ${user.status === 'active' ? 'btn-outline' : 'btn-secondary'} btn-toggle-status" data-id="${user.id}">
              ${user.status === 'active' ? 'Khóa' : 'Kích hoạt'}
            </button>
            <button class="action-icon-btn danger btn-delete-user" data-id="${user.id}" title="Xóa tài khoản">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachUserActions();
}

function attachUserActions() {
  document.querySelectorAll('.select-role-change').forEach(select => {
    select.addEventListener('change', async (e) => {
      const id = select.getAttribute('data-id');
      const newRole = e.target.value;
      try {
        await userService.updateRole(id, newRole);
        toast.success('Đã cập nhật vai trò người dùng');
        await initUsersPage();
      } catch (err) {
        toast.error('Không thể cập nhật vai trò');
      }
    });
  });

  document.querySelectorAll('.btn-toggle-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        await userService.toggleStatus(id);
        toast.success('Đã cập nhật trạng thái tài khoản');
        await initUsersPage();
      } catch (err) {
        toast.error('Không thể thay đổi trạng thái');
      }
    });
  });

  document.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
        try {
          await userService.delete(id);
          toast.success('Đã xóa tài khoản');
          await initUsersPage();
        } catch (err) {
          toast.error('Không thể xóa tài khoản');
        }
      }
    });
  });
}

function setupEventListeners() {
  const searchInput = document.querySelector('#search-user');
  const roleFilter = document.querySelector('#filter-user-role');

  const filterUsers = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const role = roleFilter ? roleFilter.value : '';

    const filtered = allUsers.filter(u => {
      const matchQuery = !query || u.full_name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
      const matchRole = !role || u.role === role;
      return matchQuery && matchRole;
    });

    renderUsersTable(filtered);
  };

  if (searchInput) searchInput.addEventListener('input', filterUsers);
  if (roleFilter) roleFilter.addEventListener('change', filterUsers);

  // Modal thêm tài khoản
  const btnOpenAdd = document.querySelector('#btn-open-add-user');
  const modal = document.querySelector('#user-modal');
  const btnClose = document.querySelector('#btn-close-user-modal');
  const btnCancel = document.querySelector('#btn-cancel-user-modal');
  const form = document.querySelector('#user-form');

  if (btnOpenAdd && modal) {
    btnOpenAdd.addEventListener('click', () => {
      form.reset();
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.querySelector('#user-name').value.trim();
      const email = document.querySelector('#user-email').value.trim();
      const role = document.querySelector('#user-role').value;
      const status = document.querySelector('#user-status').value;

      if (isEmpty(fullName) || isEmpty(email)) {
        toast.error('Vui lòng điền đủ họ tên và email');
        return;
      }
      if (!isValidEmail(email)) {
        toast.error('Email không hợp lệ');
        return;
      }

      try {
        await userService.create({ full_name: fullName, email, role, status });
        toast.success('Thêm tài khoản thành công');
        modal.close();
        await initUsersPage();
      } catch (err) {
        toast.error('Lỗi khi thêm tài khoản');
      }
    });
  }
}
