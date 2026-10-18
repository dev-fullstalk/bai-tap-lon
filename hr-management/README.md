# HR Management System (HR Pro)

Hệ thống quản lý nhân sự chuyên nghiệp, trực quan được xây dựng trên nền tảng **HTML5, Vanilla CSS, Modern JavaScript (ES Modules)**, công cụ đóng gói siêu tốc **Vite** và cơ sở dữ liệu đám mây **Supabase**.

---

## 📁 Cấu trúc thư mục dự án

```text
hr-management/
│
├── index.html                    # Dashboard tổng quan
├── employees.html                # Quản lý nhân viên
├── departments.html              # Quản lý phòng ban
├── users.html                    # Quản trị tài khoản & phân quyền
├── attendance.html               # Quản lý chấm công thời gian thực
├── requests.html                 # Quản lý đơn từ & phê duyệt
├── payments.html                 # Quản lý bảng lương & phiếu lương
│
├── src/
│   ├── styles/
│   │   ├── base.css              # Typography (Plus Jakarta Sans), màu sắc, reset CSS, font chữ
│   │   ├── layout.css            # Sidebar cố định, header, layout đáp ứng (responsive)
│   │   ├── components.css        # Buttons, cards, table, badges, modals, toasts
│   │   └── pages/
│   │       ├── dashboard.css
│   │       ├── employees.css
│   │       ├── departments.css
│   │       ├── users.css
│   │       ├── attendance.css
│   │       ├── requests.css
│   │       └── payments.css
│   │
│   └── js/
│       ├── lib/
│       │   └── supabaseClient.js # Kết nối Supabase với LocalStorage fallback
│       │
│       ├── shared/
│       │   ├── sidebar.js        # Thanh menu điều hướng dùng chung
│       │   └── notifications.js  # Hệ thống thông báo Toast (Toast notifications)
│       │
│       ├── utils/
│       │   └── validation.js     # Hàm kiểm tra hợp lệ, định dạng tiền tệ & ngày tháng
│       │
│       ├── services/
│       │   ├── employeeService.js
│       │   ├── departmentService.js
│       │   ├── userService.js
│       │   ├── attendanceService.js
│       │   ├── requestService.js
│       │   └── paymentService.js
│       │
│       └── pages/
│           ├── dashboard.js
│           ├── employees.js
│           ├── departments.js
│           ├── users.js
│           ├── attendance.js
│           ├── requests.js
│           └── payments.js
│
├── public/
│   └── images/                   # Logo SVG, icon, avatar
│
├── supabase/
│   └── migrations/               # File SQL tạo bảng, RLS và dữ liệu mẫu khởi tạo
│
├── docs/                         # Tài liệu phân tích Use Case, Sitemap, Wireframe
│   ├── USE_CASE.md
│   ├── SITEMAP.md
│   └── WIREFRAME.md
│
├── report/
│   └── BaoCao.docx               # Báo cáo đồ án / dự án
│
├── .env.example                  # Mẫu cấu hình môi trường
├── .env.local                    # Cấu hình biến môi trường cục bộ
├── .gitignore
├── .nvmrc                        # Phiên bản Node.js khuyến nghị
├── package.json                  # Cấu hình dependencies & scripts
├── package-lock.json
├── vite.config.js                # Cấu hình Multi-page Application cho Vite
└── README.md                     # Hướng dẫn chi tiết
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
- Node.js (khuyến nghị phiên bản 18+ hoặc 20+)
- npm hoặc yarn/pnpm

### 2. Cài đặt thư viện dependencies
Mở terminal tại thư mục `hr-management` và chạy:
```bash
npm install
```

### 3. Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại địa chỉ: `http://localhost:3000` (hoặc cổng hiển thị trong terminal).

### 4. Đóng gói cho Production
```bash
npm run build
```
Thư mục `dist/` sẽ được tạo sẵn sàng triển khai lên Vercel, Netlify hoặc bất kỳ static web hosting nào.

---

## 🗄️ Cấu hình cơ sở dữ liệu Supabase (Tùy chọn)

Hệ thống được thiết kế **hoạt động ngay lập tức 100%** với cơ chế Mock LocalStorage tự động nạp dữ liệu mẫu ban đầu.

Khi bạn muốn kết nối vào dự án Supabase trên Cloud:
1. Mở dự án của bạn trên [Supabase Dashboard](https://supabase.com).
2. Vào mục **SQL Editor**, mở và chạy nội dung file:
   `supabase/migrations/20250101000000_initial_schema.sql`
3. Sao chép `Project URL` và `Anon Key` vào file `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Khởi động lại `npm run dev`. Hệ thống sẽ tự động đồng bộ trực tiếp với Supabase.

---

## ✨ Các tính năng nổi bật
- **Giao diện hiện đại (Modern UI/UX)**: Thiết kế chuẩn thẩm mỹ cao với bảng màu indigo, slate cao cấp, thẻ thống kê KPI, biểu đồ tiến độ phòng ban và responsive đa thiết bị.
- **Quản lý toàn diện**: Nhân viên, phòng ban, phân quyền tài khoản, chấm công đồng hồ thực, gửi & duyệt đơn từ, tính bảng lương và xem phiếu lương chi tiết.
- **Hệ thống Modal & Toast chuyên nghiệp**: Hộp thoại `<dialog>` chuẩn HTML5 mượt mà, thông báo nổi Toast thông minh.
