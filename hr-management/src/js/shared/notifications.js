// Shared Toast Notification System

export function showToast({ type = 'info', title = '', message = '', duration = 3500 }) {
  let container = document.querySelector('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    danger: '❌',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toastType = type === 'error' ? 'danger' : type;

  const toastEl = document.createElement('div');
  toastEl.className = `toast toast-${toastType}`;
  toastEl.innerHTML = `
    <div class="toast-icon">${icons[toastType] || 'ℹ️'}</div>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toastEl.remove();
    }, 300);
  }, duration);
}

export const toast = {
  success: (message, title = 'Thành công') => showToast({ type: 'success', title, message }),
  error: (message, title = 'Lỗi') => showToast({ type: 'danger', title, message }),
  warning: (message, title = 'Cảnh báo') => showToast({ type: 'warning', title, message }),
  info: (message, title = 'Thông báo') => showToast({ type: 'info', title, message })
};
