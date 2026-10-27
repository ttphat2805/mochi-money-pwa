# Mochi — Sổ chi tiêu cá nhân

> Ghi lại một khoản chi chỉ trong **vài giây**. Không cần tài khoản, không cần mạng, dữ liệu nằm trọn trong máy bạn.

**Mochi** là ứng dụng quản lý chi tiêu cá nhân chạy ngay trên trình duyệt và có thể **cài lên màn hình chính** điện thoại như một app thật (PWA). Giao diện tối, gọn gàng, tối ưu cho thao tác một tay trên di động.

---

## Mochi giúp bạn làm gì?

| Tính năng | Mô tả |
|---|---|
| **Thêm chi tiêu siêu nhanh** | Bàn phím số riêng, gợi ý số tiền hay dùng theo từng danh mục, chọn ngày, thêm ghi chú. |
| **Ngân sách theo danh mục** | Đặt hạn mức tháng cho từng danh mục, Mochi cảnh báo khi bạn sắp vượt hoặc đã vượt. |
| **Lịch chi tiêu** | Xem chi tiêu từng ngày dạng bản đồ nhiệt, theo dõi chuỗi ngày chi tiêu hợp lý. |
| **Tổng quan & thống kê** | So sánh hôm nay với hôm qua, xu hướng 6 tháng, top danh mục tốn tiền nhất. |
| **Khoản lặp lại** | Ví dụ cà phê sáng mỗi ngày làm việc: Mochi nhắc bạn xác nhận chỉ với một chạm. |
| **Chi phí cố định** | Tiền nhà, điện nước... được tự động ghi vào đúng ngày trả hàng tháng. |
| **Khoản "chỉ ghi chú"** | Lưu lại khoản chi lớn (học phí, bảo hiểm...) mà **không tính** vào ngân sách. |
| **Tìm kiếm giao dịch** | Tìm nhanh theo ghi chú, danh mục hoặc số tiền. |
| **Cá nhân hoá** | Đổi tên app, màu chủ đạo, sắp xếp & tạo danh mục với icon riêng. |
| **Sao lưu / khôi phục** | Xuất toàn bộ dữ liệu ra file JSON và nhập lại khi đổi máy. |
| **Dùng offline** | Hoạt động bình thường khi mất mạng. |

---

## Cài Mochi lên điện thoại

Mở trang web Mochi, sau đó:

**iPhone / iPad (Safari)**
1. Nhấn nút **Chia sẻ** (hình vuông có mũi tên lên).
2. Chọn **Thêm vào MH chính** (*Add to Home Screen*).
3. Nhấn **Thêm** — biểu tượng Mochi sẽ xuất hiện trên màn hình chính.

**Android (Chrome)**
1. Nhấn menu **⋮** ở góc trên bên phải.
2. Chọn **Cài đặt ứng dụng** hoặc **Thêm vào màn hình chính**.
3. Hoặc nhấn vào banner *Cài đặt* mà Mochi hiển thị ở cuối màn hình.

> **Lưu ý:** Muốn nhận **thông báo nhắc nhở** hằng ngày? Hãy cài app lên màn hình chính trước, rồi bật **Nhắc chi tiêu hằng ngày** trong **Cài đặt**.

---

## Bắt đầu sử dụng

1. **Thêm khoản chi đầu tiên** — nhấn nút **+** ở giữa thanh điều hướng, nhập số tiền, chọn danh mục, nhấn **Lưu**.
2. **Đặt ngân sách** (không bắt buộc) — vào **Cài đặt → Danh mục** và nhập hạn mức tháng cho danh mục bạn muốn kiểm soát.
3. **Nhập thu nhập & mục tiêu tiết kiệm** (không bắt buộc) — vào **Cài đặt → Tài chính** để Mochi tính số tiền bạn còn được tiêu.
4. **Thêm khoản lặp lại / chi phí cố định** — để không phải nhập tay những khoản quen thuộc.

**Mẹo nhỏ**
- Nhấn vào một giao dịch để **sửa** hoặc **xoá** (có nút *Hoàn tác* nếu lỡ tay).
- Trên Android / Chrome máy tính: **nhấn giữ biểu tượng app** để mở nhanh *Thêm chi tiêu*, *Thêm Cafe*, *Xem lịch*.
- Có thể tạo lối tắt (ví dụ bằng iOS Shortcuts) mở đường dẫn dạng:
  - `/?add` — mở màn hình thêm chi tiêu
  - `/?add=35000&cat=cafe` — thêm sẵn 35.000đ vào danh mục Cafe
  - `/?tab=calendar` — mở thẳng tab Lịch

---

## Dữ liệu của bạn ở đâu?

- Toàn bộ dữ liệu được lưu **ngay trên thiết bị** (IndexedDB của trình duyệt). Mochi **không có máy chủ** và không gửi dữ liệu chi tiêu của bạn đi đâu cả.
- Vì dữ liệu chỉ nằm trên máy, **xoá dữ liệu trình duyệt / gỡ app sẽ làm mất dữ liệu**. Hãy thỉnh thoảng vào **Cài đặt → Dữ liệu → Xuất dữ liệu (Export)** để lưu file dự phòng.
- Dữ liệu **không tự đồng bộ** giữa các thiết bị. Khi đổi máy, dùng *Xuất dữ liệu* ở máy cũ rồi *Nhập dữ liệu (Import)* ở máy mới.

---

## Câu hỏi thường gặp

<details>
<summary><b>Có mất phí không? Có cần đăng ký tài khoản không?</b></summary>

Không. Mochi miễn phí và không cần tài khoản.
</details>

<details>
<summary><b>Tôi không thấy bản cập nhật mới?</b></summary>

Khi có phiên bản mới, Mochi sẽ hiện thông báo <i>"Có bản cập nhật mới"</i> — nhấn <b>Cập nhật</b> để tải lại. Nếu không thấy, hãy đóng hẳn app rồi mở lại.
</details>

<details>
<summary><b>Tại sao không nhận được thông báo trên iPhone?</b></summary>

iOS chỉ cho phép thông báo khi Mochi đã được <b>thêm vào màn hình chính</b> (iOS 16.4 trở lên) và bạn đã cấp quyền thông báo.
</details>

<details>
<summary><b>"Khoản chỉ ghi chú" khác gì khoản chi thường?</b></summary>

Khoản chỉ ghi chú vẫn xuất hiện trong lịch sử nhưng không được cộng vào tổng chi, ngân sách, lịch hay thống kê — phù hợp cho các khoản lớn, hiếm khi xảy ra.
</details>

---

## Dành cho nhà phát triển

**Công nghệ:** React 19 · TypeScript · Vite · Tailwind CSS 4 · shadcn/ui (Radix) · Zustand · Dexie.js (IndexedDB) · Recharts · Framer Motion · Vite PWA Plugin · Lucide Icons

### Chạy dự án

Yêu cầu: Node.js 20+ và npm.

```bash
git clone https://github.com/ttphat2805/mochi-money-pwa.git
cd mochi-money-pwa
npm install
npm run dev        # http://localhost:5173
```

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Kiểm tra kiểu (TypeScript) và build bản production vào `dist/` |
| `npm run preview` | Xem thử bản build production |
| `npm run lint` | Kiểm tra code với ESLint |

### Cấu trúc thư mục

```
src/
├── features/     # Các màn hình: home, quick-add, calendar, dashboard, recurring, settings...
├── components/   # Component dùng chung (components/ui = shadcn/ui)
├── hooks/        # Hook đọc dữ liệu & xử lý UI
├── stores/       # Zustand stores
├── lib/          # Database (Dexie), tiện ích, sao lưu, thông báo
├── types/        # Kiểu dữ liệu & danh mục mặc định
└── sw.ts         # Service worker (offline + thông báo)
```

Xem thêm [`CLAUDE.md`](./CLAUDE.md) để biết quy ước code và các lưu ý về dữ liệu.

### Deploy

Dự án là web tĩnh, deploy được lên Vercel / Netlify / bất kỳ static hosting nào:

- **Build command:** `npm run build`
- **Output directory:** `dist`

---

<div align="center">

Phát triển bởi **fat.tran**

</div>
