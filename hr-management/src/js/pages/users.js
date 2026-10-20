import { userService } from '../services/userService.js';
import { employeeService } from '../services/employeeService.js';
import { toast } from '../shared/notifications.js';

let accounts = [];
let employees = [];

document.addEventListener('DOMContentLoaded', async () => { document.querySelector('.user-avatar-circle').textContent = 'TP'; document.querySelector('.user-name').textContent = 'Thang Phan'; await loadData(); setupFilters(); setupModal(); });

async function loadData() {
  try { [accounts, employees] = await Promise.all([userService.getAll(), employeeService.getAll()]); renderEmployeeOptions(); renderReport(); }
  catch (error) { console.error('Could not load account report:', error); toast.error('Could not load user accounts'); }
}

function employeeName(id) { const employee = employees.find(item => (item.ID || item.id) === id); return employee ? (employee.FULL_NAME || employee.full_name || id) : 'Unlinked employee'; }
function employeeInitials(name) { return (name || 'NA').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(); }

function renderReport() {
  const search = document.querySelector('#account-search')?.value.trim().toLowerCase() || '';
  const role = document.querySelector('#account-role-filter')?.value || '';
  const status = document.querySelector('#account-status-filter')?.value || '';
  const filtered = accounts.filter(account => { const text = `${account.username} ${account.employee_id} ${employeeName(account.employee_id)}`.toLowerCase(); return (!search || text.includes(search)) && (!role || account.role === role) && (!status || account.account_status === status); });
  document.querySelector('#accounts-table-body').innerHTML = filtered.length ? filtered.map(accountRow).join('') : '<tr><td colspan="7" class="account-empty">No accounts found.</td></tr>';
  document.querySelector('#account-result-count').textContent = `${filtered.length} account${filtered.length === 1 ? '' : 's'}`;
  document.querySelector('#stat-total-accounts').textContent = accounts.length;
  document.querySelector('#stat-active-accounts').textContent = accounts.filter(a => a.account_status === 'active').length;
  document.querySelector('#stat-locked-accounts').textContent = accounts.filter(a => a.account_status === 'locked').length;
  document.querySelector('#stat-privileged-accounts').textContent = accounts.filter(a => ['admin', 'manager'].includes(a.role)).length;
  document.querySelectorAll('[data-account-action]').forEach(button => button.addEventListener('click', handleAction));
}

function accountRow(account) { const name = employeeName(account.employee_id); const statusLabel = account.account_status === 'locked' ? 'Locked' : 'Active'; return `<tr><td><span class="account-id">${account.id}</span></td><td><div class="account-employee"><span class="account-avatar">${employeeInitials(name)}</span><span><strong>${name}</strong><small>${account.employee_id || 'No employee ID'}</small></span></div></td><td><span class="account-username">${account.username}</span></td><td><span class="role-badge role-${account.role}">${account.role}</span></td><td><span class="account-status status-${account.account_status}">${statusLabel}</span></td><td>${account.last_login || 'Never'}</td><td><div class="account-actions"><button type="button" data-account-action="edit" data-id="${account.id}">Edit</button><button type="button" data-account-action="toggle" data-id="${account.id}">${account.account_status === 'locked' ? 'Unlock' : 'Lock'}</button><button type="button" class="danger" data-account-action="delete" data-id="${account.id}">Delete</button></div></td></tr>`; }
function renderEmployeeOptions() { document.querySelector('#account-employee').innerHTML = '<option value="">-- Select employee --</option>' + employees.map(employee => `<option value="${employee.ID || employee.id}">${employee.FULL_NAME || employee.full_name} (${employee.ID || employee.id})</option>`).join(''); }
function setupFilters() { ['#account-search', '#account-role-filter', '#account-status-filter'].forEach(selector => document.querySelector(selector)?.addEventListener('input', renderReport)); }

function setupModal() {
  const modal = document.querySelector('#account-modal');
  document.querySelector('#btn-add-account').addEventListener('click', () => openModal());
  document.querySelector('#btn-close-account-modal').addEventListener('click', () => modal.close());
  document.querySelector('#btn-cancel-account').addEventListener('click', () => modal.close());
  document.querySelector('#account-form').addEventListener('submit', async event => {
    event.preventDefault(); const id = document.querySelector('#account-id').value; const password = document.querySelector('#account-password').value.trim();
    if (!id && password.length < 6) { toast.error('Password must contain at least 6 characters'); return; }
    const data = { employee_id: document.querySelector('#account-employee').value, username: document.querySelector('#account-username').value.trim(), role: document.querySelector('#account-role').value, account_status: document.querySelector('#account-status').value };
    if (password) data.password_hash = `demo-hash-${btoa(password).slice(0, 16)}`;
    if (!data.employee_id || !data.username) { toast.error('Employee and username are required'); return; }
    if (id) await userService.update(id, data); else await userService.create(data);
    await loadData(); modal.close(); toast.success(id ? 'Account updated successfully' : 'Account created successfully');
  });
}

function openModal(account = null) { const modal = document.querySelector('#account-modal'); document.querySelector('#account-modal-title').textContent = account ? 'Edit Login Account' : 'Add Login Account'; document.querySelector('#account-id').value = account?.id || ''; document.querySelector('#account-employee').value = account?.employee_id || ''; document.querySelector('#account-username').value = account?.username || ''; document.querySelector('#account-role').value = account?.role || 'employee'; document.querySelector('#account-status').value = account?.account_status || 'active'; document.querySelector('#account-password').value = ''; modal.showModal(); }

async function handleAction(event) { const id = event.currentTarget.dataset.id; const account = accounts.find(item => item.id === id); if (!account) return; const action = event.currentTarget.dataset.accountAction; if (action === 'edit') openModal(account); if (action === 'toggle') { await userService.updateStatus(id, account.account_status === 'locked' ? 'active' : 'locked'); await loadData(); toast.success('Account status updated'); } if (action === 'delete' && window.confirm(`Delete login account ${account.username}?`)) { await userService.delete(id); await loadData(); toast.success('Account deleted'); } }
