# Architecture & Technical Decisions (ADR)

Tài liệu này lưu trữ các quyết định kiến trúc và giả định kỹ thuật trong quá trình phát triển E-Learning Platform on Cloud Computing (Demo Scope).

---

## ADR-001: Lựa chọn Tech Stack Demo Scope
- **Ngày**: 2026-09-15
- **Trạng thái**: Đã duyệt
- **Bối cảnh**: Cần xây dựng nền tảng E-Learning minh hoạ các đặc tính của điện toán đám mây (Stateless backend, Object Storage tách rời, Load Balancing, Horizontal Scaling) nhưng trong giới hạn tài nguyên máy cá nhân và demo không tốn chi phí cloud thật.
- **Quyết định**:
  - **Backend**: Java 17 + Spring Boot 3.3.x (Spring Web, Spring Data JPA, Spring Security, JWT).
  - **Database**: PostgreSQL 16 (chạy qua Docker container).
  - **Object Storage**: MinIO (S3 compatible API, chạy qua Docker container).
  - **Load Balancer**: Nginx (Reverse Proxy & Round-robin upstream).
  - **Orchestration**: Docker Compose.
  - **Frontend**: React (Vite SPA).
- **Hệ quả**: Không phát sinh chi phí AWS/Azure, toàn bộ hệ thống có thể tái lập và chạy offline hoặc local qua một lệnh `docker compose up -d`.

---

## ADR-002: Tách rời Database và Binary File
- **Ngày**: 2026-09-15
- **Trạng thái**: Đã duyệt
- **Bối cảnh**: Cơ sở dữ liệu quan hệ không được dùng để lưu trữ file nhị phân (PDF, MP4) để tránh phình dung lượng và tắc nghẽn I/O.
- **Quyết định**:
  - Postgres chỉ lưu metadata (id, title, storage_object_key, file_size...).
  - File nhị phân lưu trực tiếp trên MinIO bucket (`elearning-media`).
  - Xoá record trong DB không tự xoá file trên MinIO và ngược lại (lifecycle quản lý độc lập).

---

## ADR-003: Stateless Authentication với JWT & RBAC
- **Ngày**: 2026-09-15
- **Trạng thái**: Đã duyệt
- **Bối cảnh**: Để chuẩn bị cho việc horizontal scaling ở Phase 5 (chạy 3 instances backend sau load balancer), backend bắt buộc phải stateless (không sử dụng HTTP session).
- **Quyết định**:
  - Dùng Spring Security filter chain với `SessionCreationPolicy.STATELESS`.
  - Token JWT sinh theo chuẩn HMAC-SHA256 (jjwt), mang claims email và expiration.
  - Phân quyền theo Role-Based Access Control (`ROLE_STUDENT`, `ROLE_ADMIN`) qua annotation `@PreAuthorize`.
  - Mọi response API tuân theo format bọc thống nhất `ApiResponse<T>`.
  - Cấu hình JPA Auditing tách riêng (`JpaConfig`) khỏi `@SpringBootApplication` để tránh slice-test context pollution trong `@WebMvcTest`.

---

## ADR-004: Tách triển khai Phase 5 khỏi Frontend
- **Ngày**: 2026-09-15
- **Trạng thái**: Đã duyệt
- **Bối cảnh**: Frontend Phase 4 được giao song song cho thành viên khác, trong khi cần kiểm chứng horizontal scaling sớm.
- **Quyết định**:
  - Phase 5 triển khai và kiểm thử độc lập với React frontend.
  - Nginx hiện route `/api/` tới ba backend; route `/` trả thông báo tạm thời cho đến khi frontend được tích hợp.
  - Frontend chỉ cần dùng base URL `/api` khi hoàn tất Phase 4.
- **Hệ quả**: Có thể demo load balancing trước khi có giao diện, nhưng Definition of Done toàn hệ thống chỉ đạt sau khi tích hợp frontend.

---

## ADR-005: Cấu hình secret qua biến môi trường
- **Ngày**: 2026-09-15
- **Trạng thái**: Đã duyệt
- **Bối cảnh**: Ba backend phải dùng chung JWT secret và thông tin dịch vụ mà không hardcode secret production trong Compose.
- **Quyết định**:
  - `JWT_SECRET` là biến bắt buộc khi chạy Compose.
  - Dùng `infra/.env.example` làm mẫu; file `infra/.env` bị loại khỏi Git.
  - `INSTANCE_ID` được cấp riêng cho từng container để chứng minh request distribution.
- **Hệ quả**: Máy chạy demo phải copy `.env.example` thành `.env` và thay secret trước khi khởi động.

---

## ADR-006: Kiến trúc phân tách Phase 4 (Nhánh A Student & Nhánh B Admin)
- **Ngày**: 2026-09-15
- **Trạng thái**: Đã duyệt
- **Bối cảnh**: Để tăng tốc độ phát triển và cho phép phân chia công việc song song, Phase 4 được chia thành hai nhánh độc lập: Nhánh A (Student Portal) và Nhánh B (Admin Management Portal).
- **Quyết định**:
  - Nhánh B triển khai toàn bộ giao diện quản trị back-office: Admin layout, RBAC guard cho `ROLE_ADMIN`, Dashboard thống kê và telemetry node backend, CRUD Category, CRUD Book kèm upload PDF trực tiếp lên MinIO qua multipart form data, CRUD Video kèm upload MP4 và preview streaming qua Presigned URL, danh sách Feedback và quản trị User.
  - Core API client dùng Axios với base URL `/api` và interceptor tự động đính kèm Bearer token JWT từ LocalStorage và ghi nhận header `X-Instance-Id` để hiển thị node backend phục vụ.
  - Nginx cấu hình phục vụ static SPA với fallback `try_files $uri $uri/ /index.html` và proxy upstream `/api/` tới cụm backend.
- **Hệ quả**: Nhánh B hoạt động độc lập và hoàn toàn tương thích để sáp nhập với Nhánh A mà không gây xung đột mã nguồn.

## ADR-007: Frontend Student ownership và JWT storage
- **Ngày**: 2026-09-15
- **Trạng thái**: Đã duyệt
- **Bối cảnh**: Phase 4 được tách thành hai nhánh frontend làm song song; cần tránh để Nhánh A và Nhánh B cùng sửa các feature hoặc route.
- **Quyết định**:
  - Nhánh A sở hữu `frontend/src/pages/student/**` và luồng catalog, tìm kiếm, detail, tải/xem, feedback của Student.
  - Nhánh B sở hữu các path Admin riêng; Nhánh A không tạo `frontend/src/pages/admin/**`, `frontend/src/features/admin/**` hoặc màn quản trị.
  - API client, auth context, token interceptor và route foundation dùng chung nằm ở root `frontend/src`; Nhánh B cần giữ nguyên các file này khi tích hợp.
  - JWT được lưu trong `localStorage` dưới key `cloud-campus-token`; thông tin user lưu dưới `cloud-campus-user`. Đây là lựa chọn phù hợp SPA demo nhưng cần harden bằng httpOnly cookie nếu triển khai production.
  - API base URL lấy từ `VITE_API_BASE_URL`, mặc định `/api` để chạy qua Nginx.
- **Hệ quả**: Hai nhánh không đụng cùng feature path; việc đăng nhập Admin vẫn redirect tới `/admin` để Nhánh B cung cấp route tương ứng ở bước tích hợp cuối Phase 4.
- **Lưu ý tích hợp**: Backend hiện dùng `hasAnyRole('USER', 'ADMIN')` cho POST feedback trong khi role domain là `STUDENT` và `ADMIN`; cần sửa ở bước backend/integration trước khi demo Student gửi feedback end-to-end.

