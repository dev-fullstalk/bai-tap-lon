const icons = {
  brand: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.25"/><path d="M3.5 19c.25-4 2.1-6 5.5-6s5.25 2 5.5 6M14 14c3.4 0 5.2 1.7 5.5 5"/></svg>',
  overview: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  employees: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.25-4 2.1-6 5.5-6s5.25 2 5.5 6M16 5.5a3 3 0 0 1 0 5.5M16 14c2.75 0 4.25 1.65 4.5 5"/></svg>',
  departments: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V7l8-4 8 4v14M8 10h2M14 10h2M8 14h2M14 14h2M10 21v-4h4v4M2 21h20"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.25-4 2.1-6 5.5-6 1.6 0 2.9.45 3.8 1.35M18 12v7M14.5 15.5h7"/></svg>',
  attendance: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.75 1.75M9 3h6M12 3v2"/></svg>',
  requests: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  payments: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
};

const menuItems = [
  { label: 'Overview', href: 'index.html', icon: 'overview' },
  { label: 'Employees', href: 'employees.html', icon: 'employees' },
  { label: 'Departments', href: 'departments.html', icon: 'departments' },
  { label: 'User Accounts', href: 'users.html', icon: 'users' },
  { label: 'Attendance', href: 'attendance.html', icon: 'attendance' },
  { label: 'Requests', href: 'requests.html', icon: 'requests' },
  { label: 'Payroll', href: 'payments.html', icon: 'payments' }
];

function getCurrentPage() {
  const fileName = window.location.pathname.split('/').pop();
  return fileName || 'index.html';
}

function createSidebarMarkup() {
  const currentPage = getCurrentPage();
  const links = menuItems.map((item) => {
    const isActive = item.href === currentPage || (currentPage === 'employee-detail.html' && item.href === 'employees.html');
    return `
      <a class="sidebar-link${isActive ? ' active' : ''}" href="${item.href}"${isActive ? ' aria-current="page"' : ''}>
        <span class="sidebar-icon">${icons[item.icon]}</span>
        <span>${item.label}</span>
      </a>`;
  }).join('');

  return `
    <div class="sidebar-brand">
      <span class="brand-logo">${icons.brand}</span>
      <span class="brand-copy">
        <strong>HR Manager</strong>
        <small>Human Resources</small>
      </span>
      <button class="sidebar-close" type="button" aria-label="Đóng menu">${icons.close}</button>
    </div>
    <nav class="sidebar-nav" aria-label="Menu quản lý nhân sự">
      <span class="sidebar-label">MANAGEMENT MENU</span>
      ${links}
    </nav>
    <div class="sidebar-footer">
      <div style="font-weight: 600; color: var(--color-navy-800); margin-bottom: 2px;">© 2025 HR Manager</div>
      <div style="color: var(--color-navy-400); font-size: 0.72rem;">Build a better workplace together</div>
    </div>`;
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  document.querySelector('.sidebar-mobile-toggle')?.setAttribute('aria-expanded', 'false');
}

function openSidebar() {
  document.body.classList.add('sidebar-open');
  document.querySelector('.sidebar-mobile-toggle')?.setAttribute('aria-expanded', 'true');
}

function setupMobileControls() {
  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'sidebar-mobile-toggle';
  toggleButton.setAttribute('aria-label', 'Mở menu');
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.innerHTML = icons.menu;

  const overlay = document.createElement('button');
  overlay.type = 'button';
  overlay.className = 'sidebar-overlay';
  overlay.setAttribute('aria-label', 'Đóng menu');

  document.body.append(toggleButton, overlay);

  toggleButton.addEventListener('click', () => {
    if (document.body.classList.contains('sidebar-open')) closeSidebar();
    else openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);
  document.querySelector('.sidebar-close')?.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSidebar();
  });

  window.matchMedia('(min-width: 801px)').addEventListener('change', (event) => {
    if (event.matches) closeSidebar();
  });
}

export function renderSidebar() {
  const sidebar = document.querySelector('#app-sidebar');
  if (!sidebar) return;

  sidebar.className = 'app-sidebar';
  sidebar.innerHTML = createSidebarMarkup();
  setupMobileControls();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderSidebar, { once: true });
} else {
  renderSidebar();
}
