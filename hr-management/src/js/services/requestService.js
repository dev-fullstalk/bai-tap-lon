import { getTable, saveTable } from '../utils/storage.js';

const REQUEST_TYPES = ['leave', 'late_arrival', 'business_trip', 'other'];
const REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

function createDemoRequests(existingRequests) {
  const types = ['leave', 'late_arrival', 'business_trip', 'other'];
  const statuses = ['pending', 'approved', 'rejected', 'cancelled'];
  const titles = ['Annual leave request', 'Late arrival notice', 'Business trip request', 'Personal request'];
  const reasons = ['Family matter', 'Traffic congestion', 'Client meeting', 'Personal appointment'];
  const result = [...existingRequests];

  for (let index = result.length; index < 50; index += 1) {
    const employeeId = `NV${String((index % 24) + 1).padStart(3, '0')}`;
    const type = types[index % types.length];
    const status = statuses[index % statuses.length];
    const day = String((index % 28) + 1).padStart(2, '0');
    result.push({
      request_id: 2000 + index,
      employee_id: employeeId,
      request_type: type,
      title: titles[index % titles.length],
      reason: reasons[index % reasons.length],
      start_date: `2026-10-${day}`,
      end_date: type === 'leave' || type === 'business_trip' ? `2026-10-${String(Math.min((index % 28) + 2, 30)).padStart(2, '0')}` : `2026-10-${day}`,
      request_status: status,
      approver_employee_id: status === 'pending' ? null : 'NV001',
      reviewed_at: status === 'pending' ? null : '2026-10-10T08:30:00.000Z',
      created_at: `2026-10-${day}T08:30:00.000Z`
    });
  }
  return result;
}

function normalizeRequest(request, index) {
  return {
    request_id: Number(request.request_id || String(request.id || '').replace(/\D/g, '') || index + 1),
    employee_id: request.employee_id || '',
    request_type: REQUEST_TYPES.includes(request.request_type) ? request.request_type : (REQUEST_TYPES.includes(request.type) ? request.type : 'other'),
    title: request.title || 'Employee request',
    reason: request.reason || '',
    start_date: request.start_date || null,
    end_date: request.end_date || null,
    request_status: REQUEST_STATUSES.includes(request.request_status) ? request.request_status : (REQUEST_STATUSES.includes(request.status) ? request.status : 'pending'),
    approver_employee_id: request.approver_employee_id || null,
    reviewed_at: request.reviewed_at || null,
    created_at: request.created_at || new Date().toISOString()
  };
}

export const requestService = {
  async getAll() {
    let requests = getTable('requests');
    if (requests.length < 50) {
      requests = createDemoRequests(requests);
      saveTable('requests', requests);
    }
    return requests.map(normalizeRequest);
  },

  async create(requestData) {
    const list = getTable('requests');
    const newRequest = {
      request_id: Date.now(),
      request_status: 'pending',
      approver_employee_id: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      ...requestData
    };
    list.unshift(newRequest);
    saveTable('requests', list);
    return newRequest;
  },

  async review(requestId, request_status, reason = '') {
    let list = getTable('requests');
    const approver_employee_id = localStorage.getItem('hr_current_employee_id') || 'NV001';
    list = list.map(request => Number(request.request_id || String(request.id || '').replace(/\D/g, '')) === Number(requestId)
      ? { ...request, request_status, status: request_status, approver_employee_id, approver_note: reason, reviewed_at: new Date().toISOString() }
      : request);
    saveTable('requests', list);
    return list.find(request => Number(request.request_id || String(request.id || '').replace(/\D/g, '')) === Number(requestId));
  },

  async updateStatus(requestId, status, note = '') {
    return this.review(requestId, status, note);
  },

  async delete(requestId) {
    const list = getTable('requests').filter(request => Number(request.request_id || String(request.id || '').replace(/\D/g, '')) !== Number(requestId));
    saveTable('requests', list);
    return true;
  }
};
