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

