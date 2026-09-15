# Full API and Frontend Test Cases

Tài liệu này dùng để kiểm thử toàn bộ API trong Swagger và các workflow chính trên giao diện frontend.

## 1. Test Environment

Base URL qua Nginx:

```text
http://localhost
```

Swagger UI:

```text
http://localhost/swagger-ui/index.html
```

OpenAPI JSON:

```text
http://localhost/v3/api-docs
```

Khởi động hệ thống:

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d --build
```

Kiểm tra container:

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml ps
```

Điều kiện đạt: PostgreSQL và MinIO `healthy`, `backend-1`, `backend-2`, `backend-3` `healthy`, frontend và Nginx `running`.

### Test accounts

Dùng tài khoản seed nếu đã có. Nếu chưa có, tạo student bằng API register. Admin cần tài khoản có role `ADMIN`.

Sau khi login, copy `data.accessToken` và chọn **Authorize** trong Swagger UI với giá trị:

```text
Bearer <accessToken>
```

Mỗi response API nên được kiểm tra thêm header:

```text
X-Instance-Id
```

Header này phải có giá trị `backend-1`, `backend-2` hoặc `backend-3` khi gọi qua Nginx.

## 2. API Test Cases

### 2.1 Health Controller

| ID | Method | Endpoint | Role | Test | Expected |
|---|---|---|---|---|---|
| H-01 | GET | `/api/health` | Public | Gọi health khi hệ thống đang chạy | `200`, body có `status: UP`, có `X-Instance-Id` |
| H-02 | GET | `/api/health` | Public | Gọi lặp lại 6-12 lần | Status `200`, instance ID phân phối giữa các backend |
| H-03 | GET | `/api/health` | Public | Dừng một backend rồi gọi lại | Vẫn `200` qua backend còn lại |

### 2.2 Auth Controller

#### POST `/api/auth/register`

Payload hợp lệ:

```json
{
  "fullName": "Test Student",
  "email": "student01@example.com",
  "password": "student123"
}
```

| ID | Role | Test | Expected |
|---|---|---|---|
| AUTH-01 | Public | Register payload hợp lệ | `201`, `data.accessToken`, `data.user.role = STUDENT` |
| AUTH-02 | Public | Register email đã tồn tại | `409` |
| AUTH-03 | Public | Email sai format | `400` |
| AUTH-04 | Public | Thiếu `fullName`, `email` hoặc `password` | `400` |
| AUTH-05 | Public | Password ngắn hơn 6 ký tự | `400` |
| AUTH-06 | Public | Gửi role không hợp lệ | `400` |
| AUTH-07 | Public | Gửi role `ADMIN` khi đăng ký public | Kiểm tra chính sách môi trường; không cho phép user tự nâng quyền trong production |

#### POST `/api/auth/login`

Payload:

```json
{
  "email": "student01@example.com",
  "password": "student123"
}
```

| ID | Role | Test | Expected |
|---|---|---|---|
| AUTH-08 | Public | Login student đúng credentials | `200`, lấy được `data.accessToken`, user role `STUDENT` |
| AUTH-09 | Public | Login admin đúng credentials | `200`, user role `ADMIN` |
| AUTH-10 | Public | Sai password | `401` |
| AUTH-11 | Public | Email chưa đăng ký | `401` |
| AUTH-12 | Public | Thiếu email hoặc password | `400` |
| AUTH-13 | Public | Dùng token hợp lệ ở Swagger Authorize | Endpoint protected chấp nhận token |
| AUTH-14 | Public | Dùng token hết hạn hoặc token giả | `401` |

### 2.3 User Controller

| ID | Method | Endpoint | Role | Test | Expected |
|---|---|---|---|---|---|
| USER-01 | GET | `/api/users/me` | STUDENT | Gọi bằng student token | `200`, trả đúng profile student |
| USER-02 | GET | `/api/users/me` | ADMIN | Gọi bằng admin token | `200`, trả đúng profile admin |
| USER-03 | GET | `/api/users/me` | None | Không gửi token | `401` hoặc `403` theo security response |
| USER-04 | GET | `/api/admin/users` | ADMIN | Gọi bằng admin token | `200`, trả danh sách user |
| USER-05 | GET | `/api/admin/users` | STUDENT | Gọi bằng student token | `403` |
| USER-06 | GET | `/api/admin/users` | None | Không gửi token | `401` hoặc `403` |

### 2.4 Category Controller

Payload mẫu:

```json
{
  "name": "Cloud Computing",
  "semester": "Semester 1",
  "major": "Computer Science",
  "description": "Cloud architecture and distributed systems"
}
```

| ID | Method | Endpoint | Role | Test | Expected |
|---|---|---|---|---|---|
| CAT-01 | GET | `/api/categories` | Public | Lấy toàn bộ category | `200`, trả array |
| CAT-02 | GET | `/api/categories/{id}` | Public | ID tồn tại | `200`, trả category |
| CAT-03 | GET | `/api/categories/{id}` | Public | ID không tồn tại | `404` |
| CAT-04 | POST | `/api/categories` | ADMIN | Tạo payload hợp lệ | `201` |
| CAT-05 | POST | `/api/categories` | STUDENT | Student thử tạo category | `403` |
| CAT-06 | POST | `/api/categories` | None | Không token | `401` hoặc `403` |
| CAT-07 | POST | `/api/categories` | ADMIN | Thiếu `name` | `400` |
| CAT-08 | PUT | `/api/categories/{id}` | ADMIN | Cập nhật payload hợp lệ | `200` |
| CAT-09 | PUT | `/api/categories/{id}` | STUDENT | Student thử cập nhật | `403` |
| CAT-10 | PUT | `/api/categories/{id}` | ADMIN | ID không tồn tại | `404` |
| CAT-11 | DELETE | `/api/categories/{id}` | ADMIN | Xóa category | `204` |
| CAT-12 | DELETE | `/api/categories/{id}` | STUDENT | Student thử xóa | `403` |
| CAT-13 | DELETE | `/api/categories/{id}` | ADMIN | ID không tồn tại | `404` |

### 2.5 Book Controller

Payload mẫu:

```json
{
  "title": "Introduction to Cloud Computing",
  "author": "Test Author",
  "categoryId": 1,
  "description": "Basic cloud computing concepts"
}
```

| ID | Method | Endpoint | Role | Test | Expected |
|---|---|---|---|---|---|
| BOOK-01 | GET | `/api/books` | Public | Lấy toàn bộ sách | `200`, trả array |
| BOOK-02 | GET | `/api/books?categoryId=1` | Public | Lọc theo category | `200`, chỉ trả sách category đó |
| BOOK-03 | GET | `/api/books/{id}` | Public | ID tồn tại | `200` |
| BOOK-04 | GET | `/api/books/{id}` | Public | ID không tồn tại | `404` |
| BOOK-05 | GET | `/api/books/search?q=cloud` | Public | Tìm theo từ khóa | `200`, kết quả phù hợp |
| BOOK-06 | POST | `/api/books` | ADMIN | Tạo metadata hợp lệ | `201` |
| BOOK-07 | POST | `/api/books` | STUDENT | Student thử tạo sách | `403` |
| BOOK-08 | POST | `/api/books` | ADMIN | `categoryId` không tồn tại | `404` |
| BOOK-09 | POST | `/api/books` | ADMIN | Thiếu title/author/categoryId | `400` |
| BOOK-10 | PUT | `/api/books/{id}` | ADMIN | Cập nhật metadata | `200` |
| BOOK-11 | PUT | `/api/books/{id}` | STUDENT | Student thử cập nhật | `403` |
| BOOK-12 | DELETE | `/api/books/{id}` | ADMIN | Xóa sách | `204` |
| BOOK-13 | DELETE | `/api/books/{id}` | STUDENT | Student thử xóa | `403` |
| BOOK-14 | POST | `/api/books/{id}/upload` | ADMIN | Upload file PDF hợp lệ | `200`, metadata có file information |
| BOOK-15 | POST | `/api/books/{id}/upload` | STUDENT | Student thử upload | `403` |
| BOOK-16 | POST | `/api/books/{id}/upload` | ADMIN | Upload file sai loại hoặc file rỗng | `4xx` hoặc lỗi validation theo policy |
| BOOK-17 | GET | `/api/books/{id}/download-url` | STUDENT | Lấy presigned URL của sách có file | `200`, URL mở được trong thời hạn |
| BOOK-18 | GET | `/api/books/{id}/download-url` | Public | Không token | Kiểm tra policy hiện tại; endpoint GET đang public theo SecurityConfig |
| BOOK-19 | GET | `/api/books/{id}/download-url` | Public | Sách chưa có file | `404` |
| BOOK-20 | POST | `/api/books/{id}/download` | STUDENT | Tăng download counter | `200`, counter tăng |
| BOOK-21 | POST | `/api/books/{id}/download` | ADMIN | Admin gọi counter | `200` hoặc policy đã thống nhất |
| BOOK-22 | POST | `/api/books/{id}/download` | None | Không token | Kiểm tra policy security thực tế |
| BOOK-23 | POST | `/api/books/{id}/view` | STUDENT | Tăng view counter | `200`, counter tăng |
| BOOK-24 | POST | `/api/books/{id}/view` | STUDENT | ID không tồn tại | `404` |

### 2.6 Video Controller

Payload mẫu:

```json
{
  "title": "Cloud Architecture Lecture",
  "categoryId": 1,
  "description": "Lecture about scalable architecture",
  "durationSeconds": 600
}
```

| ID | Method | Endpoint | Role | Test | Expected |
|---|---|---|---|---|---|
| VIDEO-01 | GET | `/api/videos` | Public | Lấy toàn bộ video | `200`, trả array |
| VIDEO-02 | GET | `/api/videos?categoryId=1` | Public | Lọc theo category | `200` |
| VIDEO-03 | GET | `/api/videos/{id}` | Public | ID tồn tại | `200` |
| VIDEO-04 | GET | `/api/videos/{id}` | Public | ID không tồn tại | `404` |
| VIDEO-05 | GET | `/api/videos/search?q=cloud` | Public | Tìm video | `200` |
| VIDEO-06 | POST | `/api/videos` | ADMIN | Tạo metadata hợp lệ | `201` |
| VIDEO-07 | POST | `/api/videos` | STUDENT | Student thử tạo video | `403` |
| VIDEO-08 | POST | `/api/videos` | ADMIN | Duration âm hoặc thiếu category | `400` |
| VIDEO-09 | PUT | `/api/videos/{id}` | ADMIN | Cập nhật metadata | `200` |
| VIDEO-10 | PUT | `/api/videos/{id}` | STUDENT | Student thử cập nhật | `403` |
| VIDEO-11 | DELETE | `/api/videos/{id}` | ADMIN | Xóa video | `204` |
| VIDEO-12 | DELETE | `/api/videos/{id}` | STUDENT | Student thử xóa | `403` |
| VIDEO-13 | POST | `/api/videos/{id}/upload` | ADMIN | Upload MP4 hợp lệ | `200` |
| VIDEO-14 | POST | `/api/videos/{id}/upload` | STUDENT | Student thử upload | `403` |
| VIDEO-15 | POST | `/api/videos/{id}/upload` | ADMIN | Upload file sai loại | `4xx` hoặc lỗi validation theo policy |
| VIDEO-16 | GET | `/api/videos/{id}/stream-url` | STUDENT | Lấy streaming URL | `200`, URL phát được trong thẻ video |
| VIDEO-17 | GET | `/api/videos/{id}/stream-url` | Public | Video chưa có file | `404` |
| VIDEO-18 | POST | `/api/videos/{id}/view` | STUDENT | Tăng view counter | `200`, counter tăng |
| VIDEO-19 | POST | `/api/videos/{id}/view` | STUDENT | ID không tồn tại | `404` |

### 2.7 Feedback Controller

Payload mẫu:

```json
{
  "targetType": "BOOK",
  "targetId": 1,
  "rating": 5,
  "content": "Tài liệu dễ hiểu và hữu ích"
}
```

| ID | Method | Endpoint | Role | Test | Expected |
|---|---|---|---|---|---|
| FB-01 | GET | `/api/feedbacks?targetType=BOOK&targetId=1` | Public | Lấy feedback theo sách | `200`, trả Page |
| FB-02 | GET | `/api/feedbacks?targetType=VIDEO&targetId=1` | Public | Lấy feedback theo video | `200`, trả Page |
| FB-03 | GET | `/api/feedbacks` | Public | Thiếu targetType/targetId | `400` |
| FB-04 | POST | `/api/feedbacks` | STUDENT | Gửi feedback hợp lệ | `201` |
| FB-05 | POST | `/api/feedbacks` | ADMIN | Admin gửi feedback hợp lệ | `201` |
| FB-06 | POST | `/api/feedbacks` | None | Không token | `401` hoặc `403` |
| FB-07 | POST | `/api/feedbacks` | STUDENT | Rating nhỏ hơn 1 hoặc lớn hơn 5 | `400` |
| FB-08 | POST | `/api/feedbacks` | STUDENT | Target không tồn tại | `404` |
| FB-09 | GET | `/api/feedbacks/admin` | ADMIN | Lấy toàn bộ feedback | `200`, `data.content` là danh sách |
| FB-10 | GET | `/api/feedbacks/admin` | STUDENT | Student thử xem toàn bộ feedback | `403` |
| FB-11 | GET | `/api/feedbacks/admin` | None | Không token | `401` hoặc `403` |

## 3. Frontend Workflow Test Cases

Các workflow dưới đây test theo đúng thứ tự người dùng thao tác trên giao diện. Mỗi bước cần ghi lại `Pass/Fail`, response lỗi nếu có và `X-Instance-Id` nếu thao tác gọi API.

### 3.1 Application entry and routing

| Step | Action | Expected |
|---|---|---|
| UI-01 | Mở `http://localhost/` | Landing portal hiển thị, không lỗi trắng màn hình |
| UI-02 | Chọn Student portal hoặc mở `/login` | Student login hiển thị |
| UI-03 | Mở `/register` | Form đăng ký hiển thị |
| UI-04 | Mở `/admin/login` | Admin login hiển thị |
| UI-05 | Refresh tại `/admin/login`, `/login`, `/student` | SPA không trả 404; route vẫn tải đúng |
| UI-06 | Mở route không tồn tại | Redirect về `/` |

### 3.2 Student workflow: register to learning

#### A. Register and login

1. Mở `/register`.
2. Nhập họ tên, email mới và password >= 6 ký tự.
3. Submit.
4. Expected: đăng ký thành công, token được lưu, chuyển tới `/student` hoặc login theo UI hiện tại.
5. Logout.
6. Login lại tại `/login` bằng credentials vừa tạo.
7. Expected: chuyển tới `/student`, tên user hiển thị trên header.
8. Refresh trang.
9. Expected: session vẫn được khôi phục từ localStorage.
10. Xóa token trong DevTools hoặc logout.
11. Mở `/student`.
12. Expected: redirect về `/login`.

#### B. Browse and search catalog

1. Đăng nhập student.
2. Kiểm tra danh sách category, book và video.
3. Chọn một category.
4. Expected: danh sách chỉ còn nội dung thuộc category.
5. Nhập từ khóa vào ô search và submit.
6. Expected: frontend gọi `/api/books/search` và `/api/videos/search`.
7. Kiểm tra kết quả rỗng.
8. Expected: hiển thị empty state, không crash.
9. Gọi lặp API và kiểm tra `X-Instance-Id` thay đổi theo Nginx.

#### C. Book detail and download

1. Chọn một book trong catalog.
2. Expected: mở `/student/book/{id}`.
3. Kiểm tra title, author, description, category.
4. Chọn **Tải tài liệu**.
5. Expected: gọi download URL và mở presigned URL trong tab mới.
6. Kiểm tra file tải được.
7. Kiểm tra download counter tăng nếu UI gọi counter endpoint.
8. Mở book không tồn tại bằng URL thủ công.
9. Expected: hiển thị lỗi thân thiện.

#### D. Video detail and streaming

1. Quay lại catalog và chọn video.
2. Expected: mở `/student/video/{id}`.
3. Chọn **Xem video**.
4. Expected: gọi stream URL, video player xuất hiện và phát được.
5. Kiểm tra view counter tăng.
6. Kiểm tra video chưa upload.
7. Expected: thông báo lỗi, không làm hỏng trang.

#### E. Student feedback

1. Mở detail của book hoặc video.
2. Chọn rating từ 1 đến 5.
3. Nhập feedback tối thiểu 3 ký tự.
4. Submit.
5. Expected: nhận `201`, hiển thị thông báo thành công, form reset.
6. Thử submit nội dung rỗng hoặc quá ngắn.
7. Expected: browser validation hoặc API trả `400`.
8. Dùng Swagger `GET /api/feedbacks` để kiểm tra feedback vừa tạo.

### 3.3 Admin workflow: management portal

#### A. Admin login and authorization

1. Mở `/admin/login`.
2. Đăng nhập bằng admin.
3. Expected: chuyển tới `/admin`.
4. Refresh trang.
5. Expected: admin session vẫn hoạt động.
6. Đăng xuất.
7. Thử mở `/admin`.
8. Expected: redirect về `/admin/login`.
9. Đăng nhập bằng student tại `/admin/login`.
10. Expected: bị từ chối quyền admin, không vào dashboard.

#### B. Dashboard

1. Mở `/admin`.
2. Expected: KPI category/book/video/feedback hiển thị.
3. Kiểm tra usage stats.
4. Nhấn refresh metrics.
5. Expected: dữ liệu tải lại, không duplicate hoặc crash.
6. Kiểm tra backend instance telemetry.

#### C. Category CRUD

1. Mở `/admin/categories`.
2. Tạo category mới.
3. Expected: category xuất hiện trong danh sách.
4. Sửa tên hoặc mô tả.
5. Expected: dữ liệu cập nhật.
6. Xóa category không còn được dùng.
7. Expected: category biến mất.
8. Thử tạo category không có name.
9. Expected: lỗi validation.

#### D. Book CRUD and PDF upload

1. Mở `/admin/books`.
2. Tạo book metadata với category hợp lệ.
3. Expected: book xuất hiện.
4. Chọn upload PDF.
5. Expected: upload progress hiển thị, upload thành công.
6. Kiểm tra metadata file/content type.
7. Mở student portal.
8. Expected: book xuất hiện và có thể download.
9. Sửa metadata book.
10. Xóa book test.
11. Expected: book biến mất khỏi danh sách.

#### E. Video CRUD and MP4 upload

1. Mở `/admin/videos`.
2. Tạo video metadata.
3. Upload file MP4.
4. Expected: upload thành công và preview/stream URL hoạt động.
5. Mở student portal.
6. Expected: video xuất hiện và phát được.
7. Sửa metadata.
8. Xóa video test.

#### F. Feedback and users

1. Mở `/admin/feedback`.
2. Expected: gọi `/api/feedbacks/admin` và hiển thị `data.content`.
3. Tìm kiếm feedback.
4. Lọc theo BOOK/VIDEO.
5. Mở chi tiết feedback.
6. Mở `/admin/users`.
7. Expected: danh sách user và role hiển thị.
8. Kiểm tra student không truy cập được các trang này.

## 4. Infrastructure and Failure Tests

| ID | Action | Expected |
|---|---|---|
| INFRA-01 | Gọi `/api/health` 12 lần | `X-Instance-Id` phân phối qua 3 backend |
| INFRA-02 | Dừng `backend-2` | API vẫn trả `200` qua backend-1/3 |
| INFRA-03 | Refresh `/admin/login` | SPA fallback trả frontend, không 404 |
| INFRA-04 | Mở Swagger UI qua port 80 | Swagger tải được |
| INFRA-05 | Mở `/v3/api-docs` | JSON OpenAPI trả `200` |
| INFRA-06 | Dừng Nginx | Browser/API không truy cập được; restart Nginx khôi phục |
| INFRA-07 | Dừng PostgreSQL | Backend không phục vụ chức năng DB; log có lỗi kết nối rõ ràng |
| INFRA-08 | Dừng MinIO | Upload/signed URL lỗi rõ ràng; metadata API không crash toàn hệ thống |
| INFRA-09 | Gửi token giả | Endpoint protected trả `401` |
| INFRA-10 | Student gọi endpoint admin | `403` |

Script scale-out có sẵn:

```powershell
.\infra\scale-demo.ps1
```

## 5. Test Result Template

```text
Tester:
Date:
Git commit:
Docker Compose state:

Test ID | Pass/Fail | Notes | Instance ID
--------|-----------|-------|------------
H-01    |           |       |
AUTH-01 |           |       |
CAT-04  |           |       |
BOOK-14 |           |       |
VIDEO-13|           |       |
FB-04   |           |       |
UI-01   |           |       |
UI-Student-flow |  |       |
UI-Admin-flow   |  |       |
INFRA-01|           |       |
INFRA-02|           |       |
```
