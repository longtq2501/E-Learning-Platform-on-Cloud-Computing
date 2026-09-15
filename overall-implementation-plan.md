# Implementation Plan — E-Learning Platform on Cloud Computing (Demo Scope)

> Tài liệu này dành cho AI Agent triển khai code. Đọc kỹ phần **Quy ước chung** trước khi bắt đầu Phase 0.
> Kiến trúc mục tiêu và ranh giới demo/production đã được chốt trong tài liệu nộp trường
> (`E-Learning-Platform-Cloud-Computing-Final.html`, Mục 3). Plan này bám sát đúng bảng đối chiếu đó — không
> tự ý thêm AWS/Azure thật, không tự ý thêm Kubernetes.

---

## Quy ước chung (đọc trước khi làm bất kỳ phase nào)

1. **Nhánh git**: mỗi phase làm trên 1 nhánh `phase/<số>-<slug>` (vd: `phase/1-auth`), merge vào `main` khi Definition of Done của phase đạt, sau đó mới sang phase kế tiếp.
2. **Commit convention**: `<type>(<scope>): <mô tả ngắn>` — type dùng `feat`, `fix`, `chore`, `docs`, `test`, `infra`. Mỗi step trong plan này = tối thiểu 1 commit tương ứng, dùng đúng message được ghi trong cột **Commit**.
3. **Không gộp nhiều step vào 1 commit.** Nếu 1 step lớn hơn dự kiến, chia nhỏ thêm commit con nhưng vẫn phải có 1 commit "chốt" đúng message ở cột Commit khi step hoàn tất.
4. **Definition of Done của mỗi step** = cột "Expected Output" chạy được / build được / test được, không phải chỉ "có file code".
5. **Khi không chắc chắn** (thiếu thông tin nghiệp vụ, ví dụ định nghĩa role, giới hạn file size...), Agent tự chọn giả định hợp lý nhất, ghi giả định đó vào `docs/DECISIONS.md`, rồi tiếp tục — không dừng lại chờ hỏi trừ khi việc đó chặn hoàn toàn khả năng chạy demo.
6. **Không thêm dịch vụ ngoài phạm vi demo** đã chốt: KHÔNG dùng AWS/Azure thật, KHÔNG dùng Kubernetes, KHÔNG dùng Elasticsearch. Đúng theo Mục 3 của tài liệu: MinIO, PostgreSQL (Docker), Nginx, Docker Compose.
7. Cuối mỗi phase, Agent phải cập nhật `docs/PROGRESS.md` (bảng: phase, step, trạng thái, commit hash) trước khi merge.

---

## Cấu trúc thư mục mục tiêu

```
elearning-platform-cloud-computing/
├── backend/                # Spring Boot project
├── frontend/                # React SPA
├── infra/
│   ├── docker-compose.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── seed/                # seed data scripts
├── docs/
│   ├── DECISIONS.md
│   ├── PROGRESS.md
│   └── DEMO_SCRIPT.md
└── README.md
```

---

## Phase 0 — Bootstrap & Infra Skeleton

**Mục tiêu**: Có repo chạy được "hello world" end-to-end qua Docker Compose trước khi viết bất kỳ business logic nào — để phát hiện sớm mọi vấn đề về môi trường.

| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| 0.1 | Khởi tạo cấu trúc thư mục ở trên; thêm `.gitignore` cho Java/Node/Docker | Repo có đúng cấu trúc thư mục, `git status` sạch | `chore(repo): init project structure` |
| 0.2 | Khởi tạo Spring Boot project (Maven, JDK 17, Spring Web, Spring Data JPA, Spring Security, PostgreSQL driver) với 1 endpoint `GET /api/health` trả `{"status":"UP"}` | `./mvnw spring-boot:run` chạy local, `curl localhost:8080/api/health` trả 200 | `feat(backend): bootstrap spring boot project with health endpoint` |
| 0.3 | Viết `infra/docker-compose.yml` với 2 service: `postgres` (image chính thức, volume persist) và `minio` (image chính thức, console port riêng) | `docker compose up -d postgres minio` chạy được, truy cập MinIO console qua browser, `psql` connect được vào postgres | `infra(compose): add postgres and minio services` |
| 0.4 | Dockerize backend (Dockerfile multi-stage: build bằng Maven, run bằng JRE slim), thêm service `backend` vào docker-compose, trỏ tới postgres | `docker compose up -d` (toàn bộ) → `curl localhost:8080/api/health` trả 200 khi chạy hoàn toàn trong container | `infra(docker): containerize backend service` |

**Definition of Done Phase 0**: `docker compose up -d` từ thư mục `infra/` dựng được backend + postgres + minio, health check pass, không cần cài JDK/Node trên máy chạy container.

---

## Phase 1 — Xác thực & Quản lý người dùng (Auth)

**Mục tiêu**: Backend stateless với JWT — nền tảng bắt buộc để scale-out ở Phase 5.

| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| 1.1 | Entity `User` (id, email, passwordHash, fullName, role ENUM[ADMIN, STUDENT], createdAt) + Repository (Spring Data JPA) + Flyway/Hibernate migration | Bảng `users` được tạo tự động khi backend khởi động, xác nhận bằng `psql \d users` | `feat(auth): add user entity and repository` |
| 1.2 | Endpoint `POST /api/auth/register` (hash password bằng BCrypt) và `POST /api/auth/login` (trả JWT nếu đúng thông tin) | `curl POST /api/auth/register` tạo user thành công; `curl POST /api/auth/login` trả về JWT hợp lệ; đăng ký trùng email trả lỗi 409 | `feat(auth): implement register and login endpoints` |
| 1.3 | Cấu hình Spring Security filter chain: JWT filter, stateless session policy, public endpoints (`/api/auth/**`, `/api/health`) vs protected endpoints | Gọi endpoint bảo vệ (vd `/api/books`) không có token → 401; có token hợp lệ → pass qua filter | `feat(auth): configure jwt security filter chain` |
| 1.4 | Role-based access: `@PreAuthorize` cho endpoint admin-only | User role STUDENT gọi endpoint admin-only → 403; ADMIN gọi được | `feat(auth): add role-based access control` |
| 1.5 | Unit test cho AuthService (register, login, invalid password) | `./mvnw test` pass, coverage AuthService ≥ 1 test/nhánh logic chính | `test(auth): add unit tests for auth service` |

**Definition of Done Phase 1**: Có thể đăng ký 2 tài khoản (1 ADMIN, 1 STUDENT) qua API thật, đăng nhập lấy JWT, và phân quyền hoạt động đúng.

---

## Phase 2 — Domain chính: Category / Book / Video + Object Storage

**Mục tiêu**: Chứng minh nguyên lý "tách file khỏi database" bằng code chạy thật với MinIO.

| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| 2.1 | Entity `Category` (id, name, semester/major) + CRUD API (admin only) | CRUD qua Postman/curl hoạt động đầy đủ (C/R/U/D) | `feat(catalog): add category entity and crud api` |
| 2.2 | Entity `Book` (id, title, author, categoryId, description, storageObjectKey, createdAt) + CRUD metadata (chưa xử lý file) | Tạo/sửa/xoá/list book qua API, dữ liệu lưu đúng trong Postgres | `feat(catalog): add book entity and metadata crud` |
| 2.3 | Entity `Video` tương tự Book (title, categoryId, storageObjectKey, durationSeconds) + CRUD metadata | Tạo/sửa/xoá/list video qua API | `feat(catalog): add video entity and metadata crud` |
| 2.4 | Tích hợp MinIO SDK vào backend: `StorageService` với method `uploadFile()`, `generatePresignedUrl(key, expiryMinutes)` | Upload file PDF test qua endpoint `POST /api/books/{id}/upload`, xác nhận file xuất hiện trong MinIO console | `feat(storage): integrate minio for file upload` |
| 2.5 | Endpoint `GET /api/books/{id}/download-url` trả về signed URL có thời hạn (vd 15 phút) | Gọi endpoint nhận URL; mở URL trong 15 phút tải được file; sau 15 phút URL hết hạn (test bằng cách set expiry ngắn để verify) | `feat(storage): add signed url download endpoint` |
| 2.6 | Áp dụng luồng upload/download tương tự cho Video (streaming qua signed URL) | Video upload lên MinIO, lấy signed URL phát được trong `<video>` tag test HTML | `feat(storage): add video upload and streaming url` |

**Definition of Done Phase 2**: Admin upload được PDF + video thật lên MinIO qua API, Student lấy được signed URL và tải/xem thành công, metadata và file tách biệt hoàn toàn (xoá record DB không tự xoá file, và ngược lại — ghi rõ hành vi này vào `docs/DECISIONS.md`).

---

## Phase 3 — Tìm kiếm & Feedback & Thống kê

| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| 3.1 | Thêm full-text search index (PostgreSQL `tsvector`) trên Book.title/author và Video.title; endpoint `GET /api/search?q=` | Tìm kiếm trả kết quả đúng với từ khoá gần đúng (không phân biệt hoa/thường, có dấu/không dấu nếu khả thi) | `feat(search): add postgres full-text search endpoint` |
| 3.2 | Entity `Feedback` (userId, bookId hoặc videoId nullable, message, createdAt) + endpoint gửi feedback (student) + endpoint xem feedback (admin) | Student gửi feedback thành công; admin xem được danh sách | `feat(feedback): add feedback entity and endpoints` |
| 3.3 | Đếm lượt tải/lượt xem: tăng counter mỗi khi signed URL được cấp; endpoint thống kê cho admin `GET /api/admin/stats` | Gọi download-url 3 lần → stats trả đúng số 3; endpoint stats chỉ ADMIN gọi được | `feat(admin): add view and download stats tracking` |

**Definition of Done Phase 3**: Search, feedback, thống kê hoạt động đầy đủ qua API, có test cơ bản cho search.

---

## Phase 4 — Frontend (React SPA)
 
**Cách chia việc cho 2 thành viên**: Phase 4 tách thành 1 bước nền tảng làm trước (bắt buộc xong mới tách
nhánh), sau đó chia thành **2 nhánh độc lập, làm song song** — không đổi phạm vi tính năng, chỉ tổ chức
lại thứ tự để 2 người có thể code cùng lúc mà không đụng file của nhau.
 
- Nhánh nền tảng: `phase/4-frontend-foundation` — 1 người làm trước, merge vào `main` rồi mới cho 2 thành
  viên tách nhánh từ đây.
- Nhánh A: `phase/4a-frontend-student` — luồng người dùng (Student).
- Nhánh B: `phase/4b-frontend-admin` — luồng quản trị (Admin).
- Cả hai nhánh A và B **đều bắt đầu từ nhánh nền tảng sau khi đã merge**, để tránh xung đột API client,
  routing, và cấu trúc component dùng chung.
### 4.0 — Nền tảng dùng chung (làm trước, 1 người, không tách nhánh)
 
| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| 4.0.1 | Khởi tạo React project (Vite), cấu hình routing (React Router), API client (axios instance với base URL từ env var) | `npm run dev` chạy trang trắng có routing hoạt động (điều hướng giữa 2 route test) | `chore(frontend): bootstrap react app with routing` |
| 4.0.2 | Trang Đăng ký / Đăng nhập dùng chung cho cả Student và Admin (đăng nhập cùng 1 trang, redirect theo role sau khi login), lưu JWT (in-memory hoặc httpOnly cookie theo lựa chọn Agent — ghi vào DECISIONS.md), interceptor gắn token vào request, route guard theo role (`ProtectedRoute`, `AdminRoute`) | Đăng ký + đăng nhập từ UI thành công cho cả 2 role, gọi được API bảo vệ sau khi login, route guard chặn đúng khi sai role | `feat(frontend): add login/register pages and role-based route guards` |
 
**Definition of Done 4.0**: Merge `phase/4-frontend-foundation` vào `main`. Từ đây 2 thành viên mới bắt đầu
tách nhánh A và B — không bắt đầu song song trước khi bước này xong, vì cả 2 nhánh đều phụ thuộc API client
và route guard ở đây.
 
---
 
### Nhánh A — Luồng Student (`phase/4a-frontend-student`)
 
| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| A.1 | Trang danh sách sách/video theo danh mục + ô tìm kiếm | Danh sách hiển thị đúng dữ liệu từ backend, tìm kiếm lọc kết quả real-time hoặc on-submit | `feat(frontend-student): add book and video listing with search` |
| A.2 | Trang chi tiết sách/video: nút Tải/Xem gọi endpoint signed URL rồi mở/tải file | Click nút tải → file tải về đúng; click xem video → video phát được | `feat(frontend-student): add detail page with download and streaming` |
| A.3 | Form gửi feedback ở trang chi tiết (phía Student) | Student gửi feedback từ UI thành công, dữ liệu lưu đúng qua API feedback (Phase 3.2) | `feat(frontend-student): add feedback submission form` |
 
**Definition of Done Nhánh A**: Từ trang chủ, một tài khoản Student có thể tìm sách/video, xem chi tiết,
tải/xem, và gửi feedback — toàn bộ qua giao diện, không cần Postman.
 
---
 
### Nhánh B — Luồng Admin (`phase/4b-frontend-admin`)
 
| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| B.1 | Trang Admin: CRUD category/book/video (form + upload file) | Admin login → thêm/sửa/xoá category, book, video kèm file từ UI → dữ liệu cập nhật đúng qua API | `feat(frontend-admin): add crud pages for category, book, video` |
| B.2 | Dashboard thống kê đơn giản (bảng hoặc chart nhỏ hiển thị lượt tải/lượt xem từ API stats — Phase 3.3) | Dashboard hiển thị đúng số liệu thống kê từ backend | `feat(frontend-admin): add stats dashboard` |
| B.3 | Trang xem feedback (phía Admin) | Admin xem được danh sách feedback đã gửi từ Student qua API feedback (Phase 3.2) | `feat(frontend-admin): add feedback list view` |
 
**Definition of Done Nhánh B**: Một tài khoản Admin có thể đăng nhập, quản lý toàn bộ nội dung (category/
book/video, kèm upload file), xem thống kê, và xem feedback — toàn bộ qua giao diện, không cần Postman.
 
---
 
### 4.9 — Tích hợp 2 nhánh (bước cuối Phase 4, làm chung)
 
| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| 4.9 | Merge `phase/4a-frontend-student` và `phase/4b-frontend-admin` vào `main` (giải quyết conflict nếu có), kiểm tra lại toàn bộ routing không trùng path, chạy thử cả 2 luồng liên tiếp trên cùng 1 build | Chạy `npm run dev` một lần duy nhất, đăng nhập lần lượt Student và Admin, cả 2 luồng đều hoạt động không lỗi | `chore(frontend): integrate student and admin flows` |
 
**Definition of Done Phase 4**: Có thể demo toàn bộ luồng người dùng (đăng ký → đăng nhập → tìm sách →
tải/xem → feedback) và luồng admin (đăng nhập → upload nội dung → xem thống kê → xem feedback) hoàn toàn
qua giao diện, không cần Postman.
 
 
---

## Phase 5 — Lớp minh hoạ nguyên lý Cloud (Scale-out Demo)

**Mục tiêu**: Đây là phần "chứng minh cloud computing thật" cho buổi bảo vệ — trọng tâm chấm điểm.

| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| 5.1 | Đảm bảo backend Dockerfile production-ready (multi-stage, image nhỏ, biến môi trường cho DB/MinIO/JWT secret không hardcode) | `docker build` ra image, chạy container độc lập không lỗi thiếu config | `infra(docker): finalize production-style backend image` |
| 5.2 | Cập nhật `docker-compose.yml`: 3 service backend (`backend-1`, `backend-2`, `backend-3`, cùng image, khác tên) + service `nginx` làm load balancer + `frontend` (build static, serve qua Nginx hoặc container riêng) | `docker compose up -d --scale` hoặc 3 service riêng đều healthy; `docker ps` thấy đủ container | `infra(compose): add multi-instance backend and nginx load balancer` |
| 5.3 | Viết `infra/nginx/nginx.conf` với `upstream` round-robin trỏ tới 3 backend instance; route `/api/*` qua Nginx | Gọi lặp lại `curl localhost/api/health` nhiều lần, log của từng backend container cho thấy request được phân phối luân phiên (thêm header response `X-Instance-Id` để chứng minh trực quan) | `infra(nginx): configure load balancing across backend instances` |
| 5.4 | Thêm middleware/log trả về `X-Instance-Id` (hostname container) trong mọi response của backend | Response header có `X-Instance-Id` khác nhau qua các lần gọi liên tiếp — đây là bằng chứng trực quan cho giám khảo | `feat(backend): expose instance id header for load-balancing demo` |
| 5.5 | Script demo scale thủ công (`infra/scale-demo.sh`): tắt bớt 1 instance, gọi lại API, cho thấy hệ thống vẫn chạy (minh hoạ tính chịu lỗi/scale) | Chạy script, tắt `backend-2`, hệ thống vẫn phục vụ request bình thường qua `backend-1`/`backend-3` | `infra(demo): add manual scale demonstration script` |

**Definition of Done Phase 5**: Trong buổi bảo vệ, Agent/người trình bày có thể mở terminal, gọi API liên tục, và chỉ ra header `X-Instance-Id` đổi luân phiên — bằng chứng trực quan, thuyết phục hơn nhiều so với chỉ nói lý thuyết.

---

## Phase 6 — Dữ liệu mẫu, Tài liệu & Chuẩn bị bảo vệ

| Step | Việc cần làm | Expected Output | Commit |
|---|---|---|---|
| 6.1 | Script/migration seed dữ liệu mẫu: ≥ 3 category, ≥ 8 book, ≥ 4 video, 1 admin + 2 student account, vài feedback mẫu | Chạy `docker compose up -d` từ máy sạch → seed tự động → demo có dữ liệu ngay, không cần nhập tay | `infra(seed): add sample data seeding script` |
| 6.2 | `README.md` gốc: yêu cầu hệ thống, lệnh chạy (`docker compose up -d`), địa chỉ truy cập frontend/backend/MinIO console, tài khoản demo mẫu | Người khác (không phải Agent) làm theo README từ đầu, chạy được hệ thống trong < 10 phút | `docs(readme): add setup and run instructions` |
| 6.3 | `docs/DEMO_SCRIPT.md`: kịch bản trình bày từng bước cho buổi bảo vệ (thứ tự thao tác: đăng nhập admin → upload sách → đăng nhập student → tìm kiếm → tải → xem stats → demo load balancing bằng `X-Instance-Id`) | Đọc script làm theo được không vấp, đúng thứ tự logic thuyết phục giám khảo | `docs(demo): add presentation script for defense` |
| 6.4 | Rà soát cuối: chạy toàn bộ luồng từ máy sạch 1 lần, sửa mọi lỗi phát sinh, tag git `v1.0-demo` | Chạy full flow không lỗi; `git tag v1.0-demo` tồn tại, `git push --tags` thành công | `chore(release): tag v1.0-demo` |

**Definition of Done Phase 6**: Một người chưa từng thấy project có thể clone repo, chạy 1 lệnh, và xem được toàn bộ demo end-to-end theo đúng kịch bản trong `DEMO_SCRIPT.md`.

---

## Bảng tổng hợp Phase (để theo dõi tiến độ)

| Phase | Chủ đề | Số step | Rủi ro chính nếu bỏ qua |
|---|---|---|---|
| 0 | Bootstrap & Infra | 4 | Không phát hiện lỗi môi trường sớm, dồn lỗi về cuối |
| 1 | Auth (JWT) | 5 | Không có auth → không phân quyền được admin/student |
| 2 | Catalog + Object Storage | 6 | Đây là phần chứng minh "cloud" cốt lõi — không được cắt giảm |
| 3 | Search/Feedback/Stats | 3 | Thiếu tính năng theo yêu cầu ban đầu của đồ án |
| 4 | Frontend | 6 | Không có UI thì không demo được cho giám khảo xem trực quan |
| 5 | Scale-out Demo | 5 | **Đây là phần khác biệt giữa "web app thường" và "cloud computing" — ưu tiên cao nhất nếu thiếu thời gian, không được cắt** |
| 6 | Docs & Demo Prep | 4 | Không có kịch bản → dễ lúng túng khi bảo vệ |

**Nếu thiếu thời gian**: có thể rút gọn Phase 3 (bỏ stats chi tiết, giữ search + feedback tối thiểu) và rút gọn Phase 4.5 (dashboard đơn giản hơn), nhưng **không được cắt Phase 5** — đây chính là phần chứng minh dự án là "cloud computing", không phải chỉ là một web app CRUD thông thường.