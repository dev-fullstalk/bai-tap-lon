# Sơ đồ và Mô tả Use Case - Hệ Thống HR Management

## 1. Giới thiệu tổng quan
Hệ thống quản lý nhân sự (HR Management System) cung cấp các giải pháp quản lý toàn diện thông tin nhân sự, phòng ban, phân quyền tài khoản, bảng lương, chấm công và các yêu cầu đơn từ nội bộ.

## 2. Các tác nhân chính (Actors)
1. **Admin (Quản trị viên hệ thống)**: Có toàn quyền quản trị tài khoản người dùng, phân quyền, cấu hình hệ thống, phòng ban.
2. **HR / Nhân sự**: Quản lý hồ sơ nhân viên, tính và duyệt bảng lương, theo dõi chấm công, quản lý và phê duyệt đơn từ.
3. **Manager (Trưởng bộ phận)**: Theo dõi nhân sự trong phòng ban, duyệt đơn xin nghỉ/đơn xin tăng ca, giám sát tiến độ và chấm công.
4. **Employee (Nhân viên)**: Xem thông tin cá nhân, check-in/check-out chấm công hàng ngày, gửi đơn từ (nghỉ phép, giải trình, tạm ứng), tra cứu phiếu lương.

---

## 3. Danh sách Use Cases chi tiết

### UC01: Xác thực & Quản lý tài khoản (Authentication & User Management)
- **UC01.1 Đăng nhập / Đăng xuất**: Người dùng đăng nhập bằng email và mật khẩu hoặc OAuth qua Supabase Auth.
- **UC01.2 Phân quyền vai trò (Role-based access control)**: Admin gán vai trò: `admin`, `hr`, `manager`, `employee`.
- **UC01.3 Khóa / Kích hoạt tài khoản**: Quản trị viên kích hoạt hoặc tạm dừng tài khoản người dùng.

### UC02: Quản lý nhân viên (Employee Management)
- **UC02.1 Thêm mới nhân viên**: Nhập họ tên, mã nhân viên, email, số điện thoại, ngày sinh, phòng ban, chức vụ, mức lương cơ bản, ngày vào làm.
- **UC02.2 Cập nhật hồ sơ nhân viên**: Chỉnh sửa thông tin liên hệ, chức vụ, phòng ban, trạng thái làm việc (Chính thức, Thử việc, Nghỉ việc).
- **UC02.3 Tìm kiếm & Lọc nhân sự**: Lọc theo phòng ban, trạng thái làm việc, từ khóa họ tên hoặc mã NV.
- **UC02.4 Xóa / Lưu trữ nhân viên**: Xóa hoặc chuyển trạng thái nhân viên đã nghỉ.

### UC03: Quản lý phòng ban (Department Management)
- **UC03.1 Thêm mới phòng ban**: Tên phòng ban, mã phòng, trưởng phòng phụ trách, ngân sách hoạt động, vị trí làm việc.
- **UC03.2 Cập nhật thông tin phòng ban**: Đổi trưởng phòng, sửa thông tin mô tả.
- **UC03.3 Thống kê nhân sự phòng ban**: Xem danh sách nhân viên thuộc phòng ban, số lượng nhân sự.

### UC04: Quản lý chấm công (Attendance Management)
- **UC04.1 Check-in / Check-out**: Nhân viên thực hiện ghi nhận giờ vào và giờ ra kèm ghi chú / vị trí.
- **UC04.2 Theo dõi bảng chấm công**: Xem trạng thái làm việc trong ngày (Đúng giờ, Đi muộn, Về sớm, Nghỉ phép).
- **UC04.3 Báo cáo tổng hợp công**: HR tổng hợp số ngày công, giờ làm thêm (OT) theo tháng để tính lương.

### UC05: Quản lý đơn từ & Phê duyệt (Request Management)
- **UC05.1 Tạo đơn mới**: Nhân viên gửi đơn xin nghỉ phép, nghỉ ốm, công tác, làm thêm giờ hoặc khiếu nại công.
- **UC05.2 Duyệt / Từ chối đơn**: Manager hoặc HR xem xét lý do, duyệt hoặc từ chối kèm phản hồi.
- **UC05.3 Lịch sử đơn từ**: Theo dõi tiến độ xử lý và trạng thái đơn từ (Chờ duyệt, Đã duyệt, Đã từ chối).

### UC06: Quản lý bảng lương (Payroll & Payment Management)
- **UC06.1 Tính toán bảng lương tháng**: Lương cơ bản + Phụ cấp + Thưởng - Khấu trừ bảo hiểm/thuế dựa trên số ngày công thực tế.
- **UC06.2 Xuất & Gửi phiếu lương**: HR phê duyệt bảng lương và tạo phiếu lương cho nhân viên.
- **UC06.3 Cập nhật trạng thái thanh toán**: Đánh dấu đã thanh toán (Paid) hoặc đang xử lý (Pending).
