import { employeeService } from '../services/employeeService.js';
import { departmentService } from '../services/departmentService.js';
import { toast } from '../shared/notifications.js';

let currentEmployee = null;
let allDepartments = [];
let allEmployees = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initDetailPage();
  setupTabs();
  setupNotesHandler();
  setupAvatarHandler();
});

async function initDetailPage() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const empId = urlParams.get('id') || 'NV001';

    const [employees, departments] = await Promise.all([
      employeeService.getAll(),
      departmentService.getAll()
    ]);

    allEmployees = employees;
    allDepartments = departments;

    // Find requested employee or fallback to the first one
    currentEmployee = allEmployees.find(e => (e.ID || e.id || e.emp_code) === empId) || allEmployees[0];

    if (!currentEmployee) {
      toast.error('Employee not found');
      return;
    }

    renderEmployeeData(currentEmployee, allDepartments, allEmployees);
    renderNotes(currentEmployee.ID || currentEmployee.id);
  } catch (err) {
    console.error('Error loading employee details:', err);
    toast.error('Failed to load employee details');
  }
}

function getInitials(name) {
  if (!name) return 'NV';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function renderEmployeeData(emp, departments, employees) {
  const code = emp.ID || emp.emp_code || 'NV001';
  const name = emp.FULL_NAME || emp.full_name || 'Nguyen Van An';
  const email = emp.EMAIL || emp.email || 'an.nguyen@company.com';
  const phone = emp.SDT || emp.phone || '0901234567';
  const position = emp.POSITION || emp.position || 'Frontend Developer';
  const status = (emp.STATUS || emp.status) === 'Inactive' ? 'Inactive' : 'Active';
  const avatarUrl = emp.AVATAR || emp.avatar || '';

  // Find Department
  const deptId = emp.ID_DEPARTMENT || emp.department_id;
  const dept = departments.find(d => d.ID_DEPARTMENT === deptId || d.id === deptId || d.NAME === deptId || d.name === deptId);
  const deptName = dept ? (dept.NAME || dept.name) : 'Engineering';

  // Find Direct Manager
  let managerName = 'Nguyen Van An';
  let managerAvatar = '';
  if (dept && dept.DIRECT_MANAGER) {
    const mgr = employees.find(e => (e.ID || e.id || e.emp_code) === dept.DIRECT_MANAGER);
    if (mgr) {
      managerName = mgr.FULL_NAME || mgr.full_name;
      managerAvatar = mgr.AVATAR || mgr.avatar || '';
    }
  }

  // Fallback personal details
  const dob = emp.DOB || emp.date_of_birth || '15/03/1995';
  const gender = emp.GENDER || emp.gender || (name.includes('Thị') || name.includes('Lan') || name.includes('Mai') || name.includes('Hà') || name.includes('Linh') || name.includes('Vân') || name.includes('Duyên') || name.includes('Trang') || name.includes('Ánh') ? 'Female' : 'Male');
  const address = emp.ADDRESS || emp.address || '123 Nguyen Van Cu, District 1, HCMC';
  const joinDate = emp.JOIN_DATE || emp.join_date || '01/06/2022';
  const employmentType = emp.EMPLOYMENT_TYPE || emp.employment_type || 'Full-time';
  const aboutMe = emp.ABOUT || emp.about || `Passionate ${position.toLowerCase()} with 3+ years of experience in building modern web applications. I enjoy working in collaborative teams and always strive to create high-quality products that provide great user experiences.`;

  // 1. Profile Summary Card
  const elAvatar = document.querySelector('#detail-avatar');
  const elFallback = document.querySelector('#detail-avatar-fallback');
  if (avatarUrl) {
    elAvatar.src = avatarUrl;
    elAvatar.style.display = 'block';
    if (elFallback) elFallback.style.display = 'none';
    elAvatar.onerror = () => {
      elAvatar.style.display = 'none';
      if (elFallback) {
        elFallback.style.display = 'grid';
        elFallback.textContent = getInitials(name);
      }
    };
  } else {
    if (elAvatar) elAvatar.style.display = 'none';
    if (elFallback) {
      elFallback.style.display = 'grid';
      elFallback.textContent = getInitials(name);
    }
  }

  setText('#detail-name', name);
  setText('#detail-code', code);
  
  const statusEl = document.querySelector('#detail-status');
  if (statusEl) {
    statusEl.textContent = status;
    statusEl.className = `status-badge ${status === 'Active' ? 'status-active' : 'status-inactive'}`;
  }

  setText('#detail-email', email);
  setText('#detail-phone', phone);
  setText('#detail-tag-dept-name', deptName);
  setText('#detail-tag-pos', position);

  // Personal Information
  setText('#detail-pi-fullname', name);
  setText('#detail-pi-email', email);
  setText('#detail-pi-phone', phone);
  setText('#detail-pi-dob', dob);
  setText('#detail-pi-gender', gender);
  setText('#detail-pi-address', address);
  setText('#detail-about', aboutMe);

  // 2. Tab 1: Work Information Cards
  // Card 1: Department & Position
  setText('#card-dept', deptName);
  setText('#card-position', position);
  renderManagerInfo('#card-manager-avatar', '#card-manager-fallback', '#card-manager-name', managerName, managerAvatar);

  // Card 2: Employment Information
  setText('#card-emp-code', code);
  setText('#card-emp-type', employmentType);
  setText('#card-join-date', joinDate);
  const cardStatus = document.querySelector('#card-status');
  if (cardStatus) {
    cardStatus.textContent = status;
    cardStatus.className = `status-badge ${status === 'Active' ? 'status-active' : 'status-inactive'}`;
  }

  // Card 3: Contact Details
  setText('#card-contact-email', email);
  setText('#card-contact-phone', phone);
  setText('#card-contact-address', address);

  // Card 4: Organization Structure
  setText('#card-org-dept', deptName);
  setText('#card-org-position', position);
  renderManagerInfo('#card-org-manager-avatar', '#card-org-manager-fallback', '#card-org-manager-name', managerName, managerAvatar);

  // Tab 2 History header
  setText('#history-current-role', position);
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text || '-';
}

function renderManagerInfo(avatarSel, fallbackSel, nameSel, name, avatarUrl) {
  setText(nameSel, name);
  const imgEl = document.querySelector(avatarSel);
  const fallbackEl = document.querySelector(fallbackSel);

  if (imgEl && avatarUrl) {
    imgEl.src = avatarUrl;
    imgEl.style.display = 'block';
    if (fallbackEl) fallbackEl.style.display = 'none';
    imgEl.onerror = () => {
      imgEl.style.display = 'none';
      if (fallbackEl) {
        fallbackEl.style.display = 'grid';
        fallbackEl.textContent = getInitials(name);
      }
    };
  } else {
    if (imgEl) imgEl.style.display = 'none';
    if (fallbackEl) {
      fallbackEl.style.display = 'grid';
      fallbackEl.textContent = getInitials(name);
    }
  }
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.querySelector(`#${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* Notes Feature */
function getStorageNotesKey(empId) {
  return `hr_emp_notes_${empId}`;
}

function renderNotes(empId) {
  const container = document.querySelector('#notes-list');
  const emptyMsg = document.querySelector('#notes-empty-msg');
  if (!container || !emptyMsg) return;

  const saved = localStorage.getItem(getStorageNotesKey(empId));
  const notes = saved ? JSON.parse(saved) : [];

  if (notes.length === 0) {
    emptyMsg.style.display = 'block';
    container.style.display = 'none';
    container.innerHTML = '';
  } else {
    emptyMsg.style.display = 'none';
    container.style.display = 'flex';
    container.innerHTML = notes.map((item) => `
      <div class="note-item">
        <span>${escapeHtml(item.text)}</span>
        <span class="note-time">${item.date}</span>
      </div>
    `).join('');
  }
}

function setupNotesHandler() {
  const btnAdd = document.querySelector('#btn-add-note');
  const modal = document.querySelector('#note-modal');
  const btnClose = document.querySelector('#btn-close-note-modal');
  const btnCancel = document.querySelector('#btn-cancel-note-modal');
  const form = document.querySelector('#note-form');
  const noteInput = document.querySelector('#note-text');

  if (btnAdd && modal) {
    btnAdd.addEventListener('click', () => {
      if (form) form.reset();
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = noteInput.value.trim();
      if (!text || !currentEmployee) return;

      const empId = currentEmployee.ID || currentEmployee.id;
      const key = getStorageNotesKey(empId);
      const saved = localStorage.getItem(key);
      const notes = saved ? JSON.parse(saved) : [];

      const newNote = {
        id: Date.now(),
        text,
        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      notes.unshift(newNote);
      localStorage.setItem(key, JSON.stringify(notes));

      renderNotes(empId);
      modal.close();
      toast.success('Note added successfully');
    });
  }
}

/* Avatar Photo Upload Handler */
function setupAvatarHandler() {
  const btnAvatar = document.querySelector('#btn-change-avatar');
  const modal = document.querySelector('#avatar-modal');
  const btnClose = document.querySelector('#btn-close-avatar-modal');
  const btnCancel = document.querySelector('#btn-cancel-avatar-modal');
  const form = document.querySelector('#avatar-form');
  const urlInput = document.querySelector('#avatar-url-input');

  if (btnAvatar && modal) {
    btnAvatar.addEventListener('click', () => {
      if (currentEmployee) {
        urlInput.value = currentEmployee.AVATAR || currentEmployee.avatar || '';
      }
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newUrl = urlInput.value.trim();
      if (!newUrl || !currentEmployee) return;

      const empId = currentEmployee.ID || currentEmployee.id;
      try {
        await employeeService.update(empId, { AVATAR: newUrl });
        currentEmployee.AVATAR = newUrl;
        
        const elAvatar = document.querySelector('#detail-avatar');
        const elFallback = document.querySelector('#detail-avatar-fallback');
        if (elAvatar) {
          elAvatar.src = newUrl;
          elAvatar.style.display = 'block';
          if (elFallback) elFallback.style.display = 'none';
        }
        modal.close();
        toast.success('Avatar updated successfully');
      } catch (err) {
        console.error(err);
        toast.error('Could not update avatar');
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
