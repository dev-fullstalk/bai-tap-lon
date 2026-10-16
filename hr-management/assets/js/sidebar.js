document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('#sidebar');
  if (!sidebar) return;

  const isPage = window.location.pathname.includes('/pages/');
  const root = isPage ? '../../' : '';
  sidebar.innerHTML = `
    <h2>HR Management</h2>
    <nav class="sidebar-nav">
      <a href="${root}index.html">Tổng quan</a>
      <a href="${root}pages/employee/index.html">Nhân viên</a>
      <a href="${root}pages/department/index.html">Phòng ban</a>
      <a href="${root}pages/user/index.html">Tài khoản</a>
      <a href="${root}pages/payment/index.html">Thanh toán</a>
      <a href="${root}pages/request/index.html">Đơn từ</a>
      <a href="${root}pages/attendance/index.html">Chấm công</a>
    </nav>`;
});
