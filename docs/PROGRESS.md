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
| **Phase 3** | 3.1 | Full-text search PostgreSQL `tsvector` | Planned | - | `feat(search): add postgres full-text search endpoint` |
| | 3.2 | Entity Feedback + API gửi/xem feedback | Planned | - | `feat(feedback): add feedback entity and endpoints` |
| | 3.3 | Thống kê lượt xem/tải | Planned | - | `feat(admin): add view and download stats tracking` |
| **Phase 4** | 4.1 | Khởi tạo React Vite + Routing + Axios | Planned | - | `chore(frontend): bootstrap react app with routing` |
| | 4.2 | Trang Đăng ký / Đăng nhập + JWT auth context | Planned | - | `feat(frontend): add login and register pages` |
| | 4.3 | Trang danh sách sách/video + tìm kiếm | Planned | - | `feat(frontend): add book and video listing with search` |
| | 4.4 | Trang chi tiết sách/video + tải & streaming | Planned | - | `feat(frontend): add detail page with download and streaming` |
| | 4.5 | Trang Admin quản lý nội dung & thống kê | Planned | - | `feat(frontend): add admin panel for content management` |
| | 4.6 | Form gửi feedback | Planned | - | `feat(frontend): add feedback form` |
| **Phase 5** | 5.1 | Dockerfile Backend hoàn thiện | Planned | - | `infra(docker): finalize production-style backend image` |
| | 5.2 | Docker Compose 3 backend instances + Nginx + Frontend | Planned | - | `infra(compose): add multi-instance backend and nginx load balancer` |
| | 5.3 | Nginx cấu hình load balancing Round-Robin | Planned | - | `infra(nginx): configure load balancing across backend instances` |
| | 5.4 | Header `X-Instance-Id` trên mọi response backend | Planned | - | `feat(backend): expose instance id header for load-balancing demo` |
| | 5.5 | Script demo scale & fault tolerance | Planned | - | `infra(demo): add manual scale demonstration script` |
| **Phase 6** | 6.1 | Script seed dữ liệu mẫu | Planned | - | `infra(seed): add sample data seeding script` |
| | 6.2 | README.md chi tiết hướng dẫn vận hành | Planned | - | `docs(readme): add setup and run instructions` |
| | 6.3 | Kịch bản trình bày demo chi tiết cho buổi bảo vệ | Planned | - | `docs(demo): add presentation script for defense` |
| | 6.4 | Rà soát toàn bộ hệ thống & tag `v1.0-demo` | Planned | - | `chore(release): tag v1.0-demo` |
