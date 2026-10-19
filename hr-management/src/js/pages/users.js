import { toast } from '../shared/notifications.js';

const SETTINGS_KEY = 'hr_user_account_settings';

const DEFAULT_USER_DATA = {
  fullName: 'Thang Phan',
  role: 'HR Manager',
  status: 'Active',
  email: 'thangphan@company.com',
  phone: '0987654321',
  joinedDate: 'Joined on 01/01/2023',
  gender: 'Male',
  dob: '15/05/1998',
  address: '123 Nguyen Van Cu, District 1, HCMC',
  about: 'Passionate about building efficient HR processes and creating a positive work environment. I enjoy working with people and contributing to the growth of the organization.',
  avatarUrl: ''
};

const DEFAULT_SETTINGS = {
  emailNotif: true,
  systemNotif: true,
  requestNotif: false,
  language: 'en',
  timezone: 'Asia/Ho_Chi_Minh'
};

document.addEventListener('DOMContentLoaded', () => {
  initUserData();
  setupTabs();
  setupPasswordToggle();
  setupPasswordChange();
  setupSettingsSave();
  setupAvatarModal();
});

function loadStoredSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveStoredSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function initUserData() {
  const storedUser = localStorage.getItem('hr_current_user_profile');
  const user = storedUser ? { ...DEFAULT_USER_DATA, ...JSON.parse(storedUser) } : DEFAULT_USER_DATA;

  // Set Profile info
  setText('#user-display-name', user.fullName);
  setText('#user-display-role', user.role);
  setText('#user-display-email', user.email);
  setText('#user-display-phone', user.phone);
  setText('#user-display-joined', user.joinedDate);

  setText('#user-pi-fullname', user.fullName);
  setText('#user-pi-email', user.email);
  setText('#user-pi-phone', user.phone);
  setText('#user-pi-gender', user.gender);
  setText('#user-pi-dob', user.dob);
  setText('#user-pi-address', user.address);
  setText('#user-pi-about', user.about);

  // Avatar
  const avatarBadge = document.querySelector('#user-avatar-badge');
  const avatarImg = document.querySelector('#user-avatar-img');
  if (user.avatarUrl) {
    if (avatarImg) {
      avatarImg.src = user.avatarUrl;
      avatarImg.style.display = 'block';
    }
    if (avatarBadge) avatarBadge.style.display = 'none';
  } else {
    if (avatarImg) avatarImg.style.display = 'none';
    if (avatarBadge) avatarBadge.style.display = 'grid';
  }

  // Load Preferences
  const settings = loadStoredSettings();
  const prefEmail = document.querySelector('#pref-email');
  const prefSystem = document.querySelector('#pref-system');
  const prefRequest = document.querySelector('#pref-request');
  const selectLang = document.querySelector('#setting-language');
  const selectTz = document.querySelector('#setting-timezone');

  if (prefEmail) prefEmail.checked = settings.emailNotif;
  if (prefSystem) prefSystem.checked = settings.systemNotif;
  if (prefRequest) prefRequest.checked = settings.requestNotif;
  if (selectLang) selectLang.value = settings.language;
  if (selectTz) selectTz.value = settings.timezone;

  // Update language flag when changed
  if (selectLang) {
    selectLang.addEventListener('change', () => {
      const flagSpan = selectLang.previousElementSibling;
      if (flagSpan) {
        flagSpan.textContent = selectLang.value === 'vi' ? '🇻🇳' : '🇬🇧';
      }
    });
    // Set initial flag
    const flagSpan = selectLang.previousElementSibling;
    if (flagSpan) {
      flagSpan.textContent = selectLang.value === 'vi' ? '🇻🇳' : '🇬🇧';
    }
  }
}

function setText(selector, val) {
  const el = document.querySelector(selector);
  if (el) el.textContent = val || '-';
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

function setupPasswordToggle() {
  document.querySelectorAll('.btn-toggle-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        if (eyeOpen) eyeOpen.style.display = 'none';
        if (eyeClosed) eyeClosed.style.display = 'block';
      } else {
        input.type = 'password';
        if (eyeOpen) eyeOpen.style.display = 'block';
        if (eyeClosed) eyeClosed.style.display = 'none';
      }
    });
  });
}

function setupPasswordChange() {
  const btnSubmit = document.querySelector('#btn-submit-password');
  const currInput = document.querySelector('#current-password');
  const newInput = document.querySelector('#new-password');
  const confirmInput = document.querySelector('#confirm-password');

  const handleChange = () => {
    const current = currInput ? currInput.value.trim() : '';
    const newPass = newInput ? newInput.value.trim() : '';
    const confirmPass = confirmInput ? confirmInput.value.trim() : '';

    if (!current) {
      toast.error('Please enter your current password');
      if (currInput) currInput.focus();
      return;
    }

    if (!newPass) {
      toast.error('Please enter a new password');
      if (newInput) newInput.focus();
      return;
    }

    if (newPass.length < 6) {
      toast.error('New password must be at least 6 characters long');
      if (newInput) newInput.focus();
      return;
    }

    if (newPass !== confirmPass) {
      toast.error('Confirmation password does not match');
      if (confirmInput) confirmInput.focus();
      return;
    }

    // Success
    toast.success('Password changed successfully!');
    if (currInput) currInput.value = '';
    if (newInput) newInput.value = '';
    if (confirmInput) confirmInput.value = '';
  };

  if (btnSubmit) {
    btnSubmit.addEventListener('click', handleChange);
  }

  const form = document.querySelector('#form-change-password');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleChange();
    });
  }
}

function setupSettingsSave() {
  const btnSave = document.querySelector('#btn-save-settings');
  if (!btnSave) return;

  btnSave.addEventListener('click', () => {
    const prefEmail = document.querySelector('#pref-email')?.checked ?? true;
    const prefSystem = document.querySelector('#pref-system')?.checked ?? true;
    const prefRequest = document.querySelector('#pref-request')?.checked ?? false;
    const language = document.querySelector('#setting-language')?.value || 'en';
    const timezone = document.querySelector('#setting-timezone')?.value || 'Asia/Ho_Chi_Minh';

    const newSettings = {
      emailNotif: prefEmail,
      systemNotif: prefSystem,
      requestNotif: prefRequest,
      language,
      timezone
    };

    saveStoredSettings(newSettings);
    toast.success('Settings saved successfully!');
  });
}

function setupAvatarModal() {
  const btnAvatar = document.querySelector('#btn-change-avatar');
  const modal = document.querySelector('#avatar-modal');
  const btnClose = document.querySelector('#btn-close-avatar-modal');
  const btnCancel = document.querySelector('#btn-cancel-avatar-modal');
  const form = document.querySelector('#avatar-form');
  const urlInput = document.querySelector('#avatar-url-input');

  if (btnAvatar && modal) {
    btnAvatar.addEventListener('click', () => {
      const stored = localStorage.getItem('hr_current_user_profile');
      const user = stored ? JSON.parse(stored) : DEFAULT_USER_DATA;
      if (urlInput) urlInput.value = user.avatarUrl || '';
      modal.showModal();
    });
  }

  const closeModal = () => modal && modal.close();
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newUrl = urlInput ? urlInput.value.trim() : '';

      const stored = localStorage.getItem('hr_current_user_profile');
      const user = stored ? JSON.parse(stored) : { ...DEFAULT_USER_DATA };
      user.avatarUrl = newUrl;
      localStorage.setItem('hr_current_user_profile', JSON.stringify(user));

      const avatarBadge = document.querySelector('#user-avatar-badge');
      const avatarImg = document.querySelector('#user-avatar-img');

      if (newUrl) {
        if (avatarImg) {
          avatarImg.src = newUrl;
          avatarImg.style.display = 'block';
        }
        if (avatarBadge) avatarBadge.style.display = 'none';
      } else {
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarBadge) avatarBadge.style.display = 'grid';
      }

      modal.close();
      toast.success('Profile photo updated successfully!');
    });
  }
}
