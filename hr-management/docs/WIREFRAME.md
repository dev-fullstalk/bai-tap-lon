# Kiến trúc Wireframe & Giao diện - HR Management

## 1. Bố cục tổng thể (App Layout Framework)

```
+------------------------------------------------------------------------------------+
| SIDEBAR (Cố định trái: 260px)   | HEADER CHÍNH (Cố định trên: 64px)                 |
| - Logo & Tên dự án (HR Pro)     | [Search Bar...]       [Notif Bell] [User Avatar]  |
|                                 +--------------------------------------------------+
| - 📊 Dashboard (index.html)     | NỘI DUNG TRANG (Main Content Area)                |
| - 👥 Nhân viên (employees.html) |                                                  |
| - 🏢 Phòng ban (departments)    | [Tiêu đề trang]   [Breadcrumb]   [Nút hành động]  |
| - 🔐 Tài khoản (users.html)     |                                                  |
| - ⏱️ Chấm công (attendance)    | +----------------------------------------------+ |
| - 📝 Đơn từ (requests.html)     | | Các thẻ KPI / Thống kê số liệu (Stat Cards)   | |
| - 💵 Bảng lương (payments.html) | +----------------------------------------------+ |
|                                 |                                                  |
| - Cài đặt & Trợ giúp            | +----------------------------------------------+ |
| - Nút đăng xuất                 | | Thanh công cụ: Tìm kiếm, Bộ lọc, Xuất file   | |
|                                 | +----------------------------------------------+ |
|                                 | | Bảng dữ liệu / Grid Danh sách (Data Table)   | |
|                                 | | [Avatar] [Tên] [Phòng] [Badge] [...] [Action]| |
|                                 | +----------------------------------------------+ |
+------------------------------------------------------------------------------------+
```

## 2. Thiết kế Wireframe các thành phần (Components)

### A. Thẻ thống kê (Metric Stat Cards)
- Biểu tượng bo tròn với màu sắc gradient đặc trưng.
- Giá trị số liệu lớn, nổi bật (ví dụ: "128", "96.4%", "1,250,000,000 đ").
- Nhãn mô tả và chỉ số tăng trưởng phần trăm kèm mũi tên so với tháng trước.

### B. Bảng dữ liệu hiện đại (Data Table)
- Hàng tiêu đề nền xám nhạt tinh tế, font chữ hoa nhỏ gọn.
- Hàng dữ liệu có hiệu ứng hover mượt mà, phân tách bằng đường viền mỏng.
- Badge trạng thái:
  - Xanh lá cây: Chính thức / Đã duyệt / Đúng giờ / Đã thanh toán.
  - Vàng cam: Thử việc / Chờ duyệt / Đi muộn / Chờ xử lý.
  - Đỏ/Hồng: Nghỉ việc / Từ chối / Vắng mặt.

### C. Hộp thoại nổi (Modal Dialog)
- Nền mờ kính (Backdrop blur) nhẹ nhàng.
- Khung modal nổi bo góc lớn (16px), đổ bóng đa tầng.
- Tiêu đề rõ ràng kèm nút đóng X, form nhập liệu 2 cột linh hoạt và nhóm nút [Hủy] - [Lưu thay đổi].

### D. Hệ thống thông báo nổi (Toast Notifications)
- Nằm cố định ở góc trên bên phải màn hình (`top: 24px; right: 24px; z-index: 9999;`).
- Tự động trượt vào với hiệu ứng CSS keyframe animation và tự ẩn sau 3.5 giây.
