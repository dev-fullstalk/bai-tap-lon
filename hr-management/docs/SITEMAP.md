# Sơ đồ điều hướng (Sitemap) - HR Management System

## Cấu trúc điều hướng hệ thống

```
HR Management Root (/)
│
├── 📊 index.html (Tổng quan / Dashboard)
│   ├── Thẻ thống kê: Tổng số nhân sự, phòng ban, tỷ lệ chấm công hôm nay, quỹ lương tháng
│   ├── Biểu đồ / Thanh tiến độ nhân sự theo phòng ban
│   ├── Bảng chấm công gần đây & Hoạt động mới nhất
│   └── Lối tắt thao tác nhanh (Thêm NV, Tạo đơn, Chấm công)
│
├── 👥 employees.html (Quản lý Nhân viên)
│   ├── Thanh tìm kiếm theo tên, mã nhân viên
│   ├── Bộ lọc theo phòng ban và trạng thái (Chính thức, Thử việc, Nghỉ việc)
│   ├── Nút "Thêm nhân viên mới" -> Mở Modal nhập liệu
│   ├── Bảng dữ liệu nhân viên (Mã NV, Họ tên, Email, Phòng ban, Vị trí, Trạng thái, Thao tác)
│   └── Modal chi tiết / Chỉnh sửa / Xóa hồ sơ
│
├── 🏢 departments.html (Quản lý Phòng ban)
│   ├── Danh sách phòng ban dạng thẻ trực quan (Card view / Grid)
│   ├── Thông tin: Tên phòng, Trưởng phòng, Số lượng nhân viên, Ngân sách
│   ├── Nút "Thêm phòng ban mới" -> Mở Modal
│   └── Danh sách phân bổ nhân viên theo phòng
│
├── 🔐 users.html (Quản trị Tài khoản & Phân quyền)
│   ├── Bảng tài khoản người dùng gắn với email & nhân viên
│   ├── Quản lý vai trò (Admin, HR, Manager, Employee)
│   ├── Kích hoạt / Khóa tài khoản
│   └── Cấp lại mật khẩu / Phân quyền nhanh
│
├── ⏱️ attendance.html (Quản lý Chấm công)
│   ├── Tiện ích Check-in / Check-out thời gian thực
│   ├── Bộ lọc theo ngày / tháng
│   ├── Thống kê: Đúng giờ, Đi muộn, Vắng mặt, Nghỉ phép
│   └── Bảng chi tiết chấm công của toàn bộ nhân sự
│
├── 📝 requests.html (Quản lý Đơn từ & Phê duyệt)
│   ├── Bộ lọc theo trạng thái (Tất cả, Chờ duyệt, Đã duyệt, Đã từ chối)
│   ├── Nút "Tạo đơn mới" (Nghỉ phép, Công tác, OT, Khiếu nại)
│   ├── Bảng danh sách đơn từ (Người gửi, Loại đơn, Ngày bắt đầu - kết thúc, Lý do, Trạng thái)
│   └── Nút Duyệt / Từ chối nhanh cho cấp quản lý
│
└── 💵 payments.html (Quản lý Bảng lương & Thanh toán)
    ├── Thống kê tổng quỹ lương, số nhân viên đã nhận lương, còn nợ
    ├── Bộ lọc theo kỳ lương (Tháng / Năm)
    ├── Bảng chi tiết lương: Lương cơ bản, Số ngày công, Thưởng, Phụ cấp, Khấu trừ, Lương thực nhận
    ├── Nút "Tạo bảng lương mới"
    └── Xem chi tiết Phiếu lương (Pay slip preview modal)
```
