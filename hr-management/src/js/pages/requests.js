import { requestService } from '../services/requestService.js';
import { employeeService } from '../services/employeeService.js';
import { toast } from '../shared/notifications.js';
import { isEmpty, isValidDateRange } from '../utils/validation.js';

let allRequests = [];
let allEmployees = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initRequestsPage();
  setupEventListeners();
});

async function initRequestsPage() {
  try {
    const [requests, employees] = await Promise.all([
      requestService.getAll(),
      employeeService.getAll()
    ]);
    allRequests = requests;
    allEmployees = employees;

    populateEmployeeSelect(employees);
    updateRequestKPIs(allRequests);
    renderRequestsTable(allRequests);
  } catch (error) {
    console.error('Lỗi tải đơn từ:', error);
    toast.error('Không thể tải danh sách đơn từ');
  }
}

function populateEmployeeSelect(employees) {
  const select = document.querySelector('#req-employee');
  if (select) {
    select.innerHTML = employees.map(e => `<option value="${e.id}">${e.full_name} (${e.emp_code})</option>`).join('');
  }
}

function updateRequestKPIs(requests) {
  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  const elPending = document.querySelector('#kpi-req-pending');
  const elApproved = document.querySelector('#kpi-req-approved');
  const elRejected = document.querySelector('#kpi-req-rejected');

  if (elPending) elPending.textContent = pending;
  if (elApproved) elApproved.textContent = approved;
  if (elRejected) elRejected.textContent = rejected;
}

function renderRequestsTable(requests) {
  const tbody = document.querySelector('#requests-table-body');
  if (!tbody) return;

  if (requests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Không có yêu cầu đơn từ nào trong danh sách.
        </td>
      </tr>
    `;
    return;
  }

  const typeLabels = {
    leave: '🏖️ Nghỉ phép',
    overtime: '⚡ Làm thêm giờ (OT)',
    business_trip: '✈️ Đi công tác',
    complaint: '📩 Khiếu nại/Đề xuất'
  };

  const statusBadges = {
    pending: '<span class="badge badge-warning"><span class="badge-dot"></span>Chờ duyệt</span>',
    approved: '<span class="badge badge-success"><span class="badge-dot"></span>Đã duyệt</span>',
    rejected: '<span class="badge badge-danger"><span class="badge-dot"></span>Từ chối</span>'
  };

  tbody.innerHTML = requests.map(req => {
    const emp = req.employees;
    const empName = emp ? emp.full_name : 'Nhân viên';
    const deptName = emp && emp.departments ? emp.departments.name : '-';

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${empName.slice(0, 2).toUpperCase()}</div>
            <div class="user-cell-meta">
              <span class="user-cell-name">${empName}</span>
              <span class="user-cell-sub">${deptName}</span>
            </div>
          </div>
        </td>
        <td><span class="request-type-badge">${typeLabels[req.type] || req.type}</span></td>
        <td>${req.start_date} ${req.start_date !== req.end_date ? `đến ${req.end_date}` : ''}</td>
        <td><div class="request-reason" title="${req.reason}">${req.reason}</div></td>
        <td>${statusBadges[req.status] || req.status}</td>
        <td><span style="font-size: 0.82rem; color: var(--text-muted);">${req.approver_note || '-'}</span></td>
        <td>
          <div class="table-actions">
            ${req.status === 'pending' ? `
              <button class="btn btn-sm btn-outline btn-approve-req" data-id="${req.id}" style="color: var(--success); border-color: #bbf7d0;">✓ Duyệt</button>
              <button class="btn btn-sm btn-outline btn-reject-req" data-id="${req.id}" style="color: var(--danger); border-color: #fecdd3;">✗ Từ chối</button>
            ` : `
              <span style="font-size: 0.78rem; color: var(--text-muted);">Đã hoàn tất</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachRequestActions();
}

function attachRequestActions() {
  document.querySelectorAll('.btn-approve-req').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        await requestService.updateStatus(id, 'approved', 'Đã được phê duyệt');
        toast.success('Đã duyệt đơn thành công');
        await initRequestsPage();
      } catch (err) {
        toast.error('Không thể cập nhật đơn');
      }
    });
  });

  document.querySelectorAll('.btn-reject-req').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const reason = prompt('Nhập lý do từ chối:');
      if (reason !== null) {
        try {
          await requestService.updateStatus(id, 'rejected', reason || 'Từ chối duyệt');
          toast.warning('Đã từ chối đơn yêu cầu');
          await initRequestsPage();
        } catch (err) {
          toast.error('Không thể cập nhật đơn');
        }
      }
    });
  });
}

function setupEventListeners() {
  const filterStatus = document.querySelector('#filter-req-status');
  const searchInput = document.querySelector('#search-req');

  const filter = () => {
    const status = filterStatus ? filterStatus.value : '';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = allRequests.filter(r => {
      const matchStatus = !status || r.status === status;
      const emp = r.employees;
      const matchQuery = !query ||
        (emp && emp.full_name.toLowerCase().includes(query)) ||
        r.reason.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });

    renderRequestsTable(filtered);
  };

  if (filterStatus) filterStatus.addEventListener('change', filter);
  if (searchInput) searchInput.addEventListener('input', filter);

  // Modal tạo đơn mới
  const btnOpenAdd = document.querySelector('#btn-open-add-req');
  const modal = document.querySelector('#req-modal');
  const btnClose = document.querySelector('#btn-close-req-modal');
  const btnCancel = document.querySelector('#btn-cancel-req-modal');
  const form = document.querySelector('#req-form');

  if (btnOpenAdd && modal) {
    btnOpenAdd.addEventListener('click', () => {
      form.reset();
      const today = new Date().toISOString().split('T')[0];
      document.querySelector('#req-start-date').value = today;
      document.querySelector('#req-end-date').value = today;
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const employeeId = document.querySelector('#req-employee').value;
      const type = document.querySelector('#req-type').value;
      const startDate = document.querySelector('#req-start-date').value;
      const endDate = document.querySelector('#req-end-date').value;
      const reason = document.querySelector('#req-reason').value.trim();

      if (isEmpty(reason)) {
        toast.error('Vui lòng nêu rõ lý do làm đơn');
        return;
      }

      if (!isValidDateRange(startDate, endDate)) {
        toast.error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu');
        return;
      }

      try {
        await requestService.create({
          employee_id: employeeId,
          type,
          start_date: startDate,
          end_date: endDate,
          reason
        });
        toast.success('Gửi đơn yêu cầu thành công!');
        modal.close();
        await initRequestsPage();
      } catch (err) {
        toast.error('Không thể tạo đơn yêu cầu');
      }
    });
  }
}
