# Bảng theo dõi tiến độ triển khai (Progress Tracking)

| Phase | Step | Nhiệm vụ | Trạng thái | Commit Hash | Ghi chú |
|---|---|---|---|---|---|
| **Phase 0** | 0.1 | Khởi tạo cấu trúc thư mục, .gitignore, docs | Done | `2a14f8e` | `chore(repo): init project structure` |
| | 0.2 | Khởi tạo Spring Boot + endpoint `/api/health` | Done | `f3b3479` | `feat(backend): bootstrap spring boot project with health endpoint` |
| | 0.3 | Cấu hình Docker Compose: Postgres + MinIO | Done | `7790d7a` | `infra(compose): add postgres and minio services` |
| | 0.4 | Dockerize backend + ghép vào Docker Compose | Done | `c182006` | `infra(docker): containerize backend service` |

| **Phase 1** | 1.1 | Entity User + Repository + Schema | Done | `939fa89` | `feat(auth): add user entity and repository` |
| | 1.2 | Register & Login endpoints (BCrypt, JWT) | Done | `d0e3cc5` | `feat(auth): implement register and login endpoints` |
| | 1.3 | Spring Security Filter Chain JWT Stateless | Done | `f3de5f1` | `feat(auth): configure jwt security filter chain` |
| | 1.4 | Phân quyền RBAC (@PreAuthorize) | Done | `3770c4c` | `feat(auth): add role-based access control` |
| | 1.5 | Unit tests AuthService | Done | `0a05f65` | `test(auth): add unit tests for auth service` |
| **Phase 2** | 2.1 | Entity Category + CRUD API | Done | `bce1864` | `feat(catalog): add category entity and crud api` |
| | 2.2 | Entity Book + CRUD metadata | Done | `e6e897c` | `feat(catalog): add book entity and metadata crud` |
| | 2.3 | Entity Video + CRUD metadata | Done | `41c75f6` | `feat(catalog): add video entity and metadata crud` |
| | 2.4 | Tích hợp MinIO SDK + Upload file | Done | `4fd84f5` | `feat(storage): integrate minio for file upload` |
| | 2.5 | Endpoint Download Presigned URL | Done | `d0dd3b3` | `feat(storage): add signed url download endpoint` |
| | 2.6 | Video Streaming qua Presigned URL | Done | `df14dbc` | `feat(storage): add video upload and streaming url` |
| **Phase 3** | 3.1 | Full-text search PostgreSQL `tsvector` | Done | `4ca0653` | `feat(search): add postgres full-text search endpoint` |
| | 3.2 | Entity Feedback + API gửi/xem feedback | Done | `de06cf4` | `feat(feedback): add feedback entity and endpoints` |
| | 3.3 | Thống kê lượt xem/tải | Done | `de06cf4` | `feat(admin): add view and download stats tracking` |
| **Phase 4 (Branch A)** | 4.1.A | Navigation, Auth context, Login/Register cho Student | Planned | - | `feat(frontend): add student auth and shell` |
| | 4.2.A | Trang danh sách sách/video + tìm kiếm tsvector | Planned | - | `feat(frontend): add book and video listing with search` |
| | 4.3.A | Trang chi tiết sách + tải qua MinIO Presigned URL | Planned | - | `feat(frontend): add book detail and presigned download` |
| | 4.4.A | Trang chi tiết video + player streaming Presigned URL | Planned | - | `feat(frontend): add video detail and presigned streaming` |
| | 4.5.A | Form gửi feedback cho sinh viên | Planned | - | `feat(frontend): add student feedback form` |
| **Phase 4 (Branch B)** | 4.1.B | Khởi tạo React Vite + Router + Axios JWT interceptor + AdminGuard | Done | `branch:phase/4-branch-b-admin` | `feat(admin): bootstrap admin shell, router, and auth guard` |
| | 4.2.B | Dashboard KPI, thống kê lượt xem/tải, telemetry kiến trúc cloud | Done | `branch:phase/4-branch-b-admin` | `feat(admin): implement dashboard overview and metrics` |
| | 4.3.B | Quản lý Category CRUD + tìm kiếm | Done | `branch:phase/4-branch-b-admin` | `feat(admin): implement category crud management` |
| | 4.4.B | Quản lý Book metadata CRUD + Upload PDF trực tiếp MinIO | Done | `branch:phase/4-branch-b-admin` | `feat(admin): implement book metadata crud and pdf upload to minio` |
| | 4.5.B | Quản lý Video metadata CRUD + Upload MP4 MinIO + Stream Preview | Done | `branch:phase/4-branch-b-admin` | `feat(admin): implement video metadata crud and mp4 upload with preview` |
| | 4.6.B | Danh sách phản hồi feedback của sinh viên | Done | `branch:phase/4-branch-b-admin` | `feat(admin): implement feedback inspection` |
| | 4.7.B | Quản lý danh sách người dùng và phân quyền RBAC | Done | `branch:phase/4-branch-b-admin` | `feat(admin): implement user directory and role inspection` |
| **Phase 5** | 5.1 | Dockerfile Backend hoàn thiện | Done | `2503100` | `infra(docker): finalize production-style backend image` |
| | 5.2 | Docker Compose 3 backend instances + Nginx + Frontend | Done | `0c21150` | Frontend integration deferred to Phase 4; `infra(compose): add multi-instance backend and nginx load balancer` |
| | 5.3 | Nginx cấu hình load balancing Round-Robin | Done | `ac2f9df` | `infra(nginx): configure load balancing across backend instances` |
| | 5.4 | Header `X-Instance-Id` trên mọi response backend | Done | `cc7b2da` | `feat(backend): expose instance id header for load-balancing demo` |
| | 5.5 | Script demo scale & fault tolerance | Done | `c770e60` | `infra(demo): add manual scale demonstration script` |
| **Phase 6** | 6.1 | Script seed dữ liệu mẫu | Planned | - | `infra(seed): add sample data seeding script` |
| | 6.2 | README.md chi tiết hướng dẫn vận hành | Planned | - | `docs(readme): add setup and run instructions` |
| | 6.3 | Kịch bản trình bày demo chi tiết cho buổi bảo vệ | Planned | - | `docs(demo): add presentation script for defense` |
| | 6.4 | Rà soát toàn bộ hệ thống & tag `v1.0-demo` | Planned | - | `chore(release): tag v1.0-demo` |
