# E-Learning Platform on Cloud Computing

Nền tảng học trực tuyến gồm cổng học viên và cổng quản trị nội dung. Hệ thống được triển khai theo kiến trúc cloud demo với backend stateless, JWT authentication, PostgreSQL, MinIO object storage và Nginx load balancing.

## Kiến trúc

| Thành phần | Công nghệ |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Java 17, Spring Boot, Spring Security, JWT, Spring Data JPA |
| Database | PostgreSQL 16 |
| Object storage | MinIO, S3-compatible |
| Load balancer | Nginx |
| Containerization | Docker Compose |

Docker Compose chạy ba backend instances (`backend-1`, `backend-2`, `backend-3`) phía sau Nginx. File PDF/MP4 được lưu ở MinIO, không lưu trực tiếp trong PostgreSQL.

## Yêu cầu

- Docker Desktop đang chạy
- Docker Compose
- JDK 17+ và Node.js 18+ nếu chạy test/build bên ngoài Docker
- Tối thiểu 8 GB RAM khuyến nghị

## Chạy bằng Docker

Từ thư mục gốc repository:

```powershell
Copy-Item infra\.env.example infra\.env
```

Chỉnh `infra\.env` nếu cần, đặc biệt là `JWT_SECRET`. Sau đó khởi động toàn bộ hệ thống:

```powershell
docker compose --env-file infra\.env -f infra\docker-compose.yml up -d --build
```

Kiểm tra service:

```powershell
docker compose --env-file infra\.env -f infra\docker-compose.yml ps
```

Trạng thái mong đợi:

- PostgreSQL: `healthy`
- MinIO: `healthy`
- `backend-1`, `backend-2`, `backend-3`: `healthy`
- Frontend và Nginx: `running`

Dừng hệ thống:

```powershell
docker compose --env-file infra\.env -f infra\docker-compose.yml down
```

## Địa chỉ truy cập

| Mục đích | URL |
|---|---|
| Landing page | http://localhost/ |
| Student login | http://localhost/login |
| Student register | http://localhost/register |
| Student portal | http://localhost/student |
| Admin login | http://localhost/admin/login |
| Admin portal | http://localhost/admin |
| Swagger UI | http://localhost/swagger-ui/index.html |
| MinIO Console | http://localhost:9001 |
| Health API | http://localhost/api/health |

Nên truy cập qua `http://localhost` để request đi qua Nginx và load balancer. Không truy cập trực tiếp backend container từ trình duyệt.

## Tài khoản demo

Backend tự tạo hai tài khoản admin khi khởi động nếu chúng chưa tồn tại:

```text
Default Admin
Email: admin@elearning.com
Password: admin123

Teacher Admin
Email: teacher@elearning.com
Password: admin123
```

Student được tạo từ `http://localhost/register`. Đăng ký public luôn tạo role `STUDENT`; không thể tự gửi role `ADMIN`.

## Workflow demo đầy đủ

### Student

1. Mở `/register` và tạo tài khoản student.
2. Đăng nhập tại `/login`.
3. Mở `/student`.
4. Tìm kiếm và lọc sách/video theo category.
5. Mở chi tiết sách để tải PDF.
6. Mở chi tiết video để phát nội dung.
7. Gửi feedback và đăng xuất.

### Admin

1. Mở `/admin/login`.
2. Đăng nhập bằng `admin@elearning.com / admin123`.
3. Tạo category tại `/admin/categories`.
4. Tạo book tại `/admin/books`, chọn category rồi upload PDF.
5. Tạo video tại `/admin/videos`, chọn category rồi upload MP4.
6. Kiểm tra feedback tại `/admin/feedback`.
7. Kiểm tra user và role tại `/admin/users`.
8. Quay lại `/student` để xác nhận nội dung vừa tạo xuất hiện.

Category phải được tạo trước khi tạo book hoặc video vì `categoryId` là bắt buộc. Giới hạn upload hiện tại là 500 MB cho mỗi file và mỗi request.

## Kiểm thử

### Backend

```powershell
Set-Location backend
.\mvnw.cmd test
```

### Frontend

```powershell
Set-Location frontend
npm ci
npm test -- --run
npm run build
```

### Smoke test API

```powershell
Invoke-WebRequest http://localhost/ -UseBasicParsing
Invoke-WebRequest http://localhost/api/health -UseBasicParsing
Invoke-WebRequest http://localhost/swagger-ui/index.html -UseBasicParsing
```

Health response phải trả HTTP 200 và có header `X-Instance-Id`. Lặp lại request để quan sát các backend instances khác nhau.

Chi tiết test case và kiểm thử Swagger:

- [docs/TESTING.md](docs/TESTING.md)
- [docs/API_TESTING.md](docs/API_TESTING.md)
- [docs/FULL_TEST_CASES.md](docs/FULL_TEST_CASES.md)

## Cấu trúc thư mục

```text
backend/                 Spring Boot REST API
frontend/                React/Vite SPA
infra/docker-compose.yml Docker services and load balancer
infra/nginx/             Nginx configuration
docs/                    Testing and project documentation
```

## Xử lý lỗi thường gặp

- `401 Invalid email or password`: kiểm tra backend đã rebuild để tạo admin mặc định; dùng đúng `admin@elearning.com / admin123`.
- `Validation failed` khi tạo book/video: tạo category trước và chọn category trong form.
- Upload trả `500` hoặc `Maximum upload size exceeded`: file phải nhỏ hơn 500 MB; rebuild backend sau khi thay đổi cấu hình.
- Video không phát hoặc URL chứa hostname `minio`: truy cập qua `http://localhost`, refresh bằng `Ctrl + F5`, và kiểm tra MinIO đang `healthy`.
- Frontend hiển thị CSS cũ: rebuild `frontend` và refresh mạnh trình duyệt.

## Tài liệu liên quan

- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)
- [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/PROGRESS.md](docs/PROGRESS.md)
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)

## Giấy phép

Dự án phục vụ mục đích học thuật cho đồ án môn Điện toán đám mây.
