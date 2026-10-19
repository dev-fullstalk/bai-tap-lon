// Validation and Formatting Utilities

export function isEmpty(val) {
  return val === null || val === undefined || String(val).trim() === '';
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function isValidPhone(phone) {
  const re = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return re.test(String(phone).replace(/\s+/g, ''));
}

export function isPositiveNumber(val) {
  const n = Number(val);
  return !isNaN(n) && n >= 0;
}

export function isValidDateRange(startDate, endDate) {
  if (!startDate || !endDate) return false;
  return new Date(startDate) <= new Date(endDate);
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('vi-VN');
}
