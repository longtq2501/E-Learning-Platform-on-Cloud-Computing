# E-Learning Platform on Cloud Computing

Nền tảng thư viện điện tử cho trường học, triển khai theo kiến trúc điện toán đám mây (object storage tách
khỏi database, backend stateless, load balancing) với backend Java Spring Boot và frontend React.

> Đồ án môn Điện toán đám mây. Xem đầy đủ bối cảnh, nguyên lý thiết kế và bảng đối chiếu kiến trúc
> production/demo trong tài liệu nộp trường: `docs/E-Learning-Platform-Cloud-Computing-Final.html`.

## Trạng thái dự án

🚧 Đang khởi tạo — repo mới ở bước bootstrap cấu trúc thư mục (Phase 0). Tiến độ chi tiết theo từng phase
được theo dõi tại [`docs/PROGRESS.md`](docs/PROGRESS.md) (sẽ được cập nhật khi các phase hoàn tất).

## Kiến trúc tổng quan

Dự án dùng kiến trúc scale-out với 3 nguyên lý cloud chính: tách file khỏi database (object storage),
backend không lưu trạng thái (stateless + JWT) để chạy nhiều instance song song, và load balancer phân
phối tải giữa các instance đó.

Ở phạm vi demo (chạy toàn bộ trên một máy bằng Docker Compose, không dùng tài khoản cloud thật):

| Thành phần | Công nghệ |
|---|---|
| Frontend | React.js (Vite) — Single Page Application |
| Backend | Java Spring Boot — REST API, Spring Security (JWT), Spring Data JPA |
| Database | PostgreSQL (container Docker) |
| File Storage | MinIO (tương thích API Amazon S3) |
| Load Balancer | Nginx — cân bằng tải giữa nhiều instance backend |
| Container hoá | Docker + Docker Compose |

Chi tiết đầy đủ về nguyên lý thiết kế, sơ đồ kiến trúc, và bảng đối chiếu với kiến trúc production
(AWS/Azure thật) nằm trong tài liệu nộp trường ở mục 2 và mục 3.

## Cấu trúc thư mục

```
elearning-cloud-demo/
├── backend/                # Spring Boot project
├── frontend/                # React SPA
├── infra/
│   ├── docker-compose.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── seed/                 # seed data scripts
├── docs/
│   ├── DECISIONS.md          # các giả định/quyết định kỹ thuật phát sinh trong lúc code
│   ├── PROGRESS.md           # bảng theo dõi tiến độ theo phase/step/commit
│   ├── DEMO_SCRIPT.md         # kịch bản trình bày cho buổi bảo vệ
│   └── IMPLEMENTATION_PLAN.md # kế hoạch triển khai chi tiết theo phase
└── README.md
```

## Yêu cầu hệ thống

| Thành phần | Yêu cầu |
|---|---|
| Môi trường phát triển | JDK 17+, Node.js 18+ |
| Build tool | Maven hoặc Gradle (backend); npm/yarn (frontend) |
| Containerization | Docker Desktop / Docker Engine + Docker Compose |
| Phần cứng | CPU 4 nhân trở lên, RAM 8GB trở lên, SSD 20GB trống |

## Hướng dẫn chạy

> Mục này sẽ được cập nhật đầy đủ ở Phase 6 (khi toàn bộ hệ thống đã hoàn chỉnh). Ở giai đoạn hiện tại,
> repo mới có cấu trúc thư mục; lệnh chạy dưới đây sẽ dần hoạt động khi các phase tiếp theo được triển khai.

```bash
# Clone repo
git clone <repo-url>
cd elearning-cloud-demo

# Dựng toàn bộ hệ thống (backend, frontend, postgres, minio, nginx)
cd infra
docker compose up -d

# Kiểm tra backend
curl http://localhost:8080/api/health
```

Sau khi hoàn tất, hệ thống sẽ có sẵn tại:
- Frontend: `http://localhost` (qua Nginx)
- Backend API: `http://localhost:8080/api`
- MinIO console: `http://localhost:9001`

Tài khoản demo mẫu (admin/student) sẽ được thêm vào script seed dữ liệu ở Phase 6.

## Tài liệu liên quan

- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — kế hoạch triển khai chi tiết theo phase,
  mỗi step có expected output và commit message tương ứng.
- `docs/E-Learning-Platform-Cloud-Computing-Final.html` — tài liệu nộp trường: bối cảnh, nguyên lý thiết
  kế, phạm vi triển khai demo vs production, tech stack, ưu/nhược điểm.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — nhật ký các quyết định/giả định kỹ thuật phát sinh trong quá
  trình code (sẽ tạo ở Phase 1).
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — kịch bản trình bày cho buổi bảo vệ (sẽ tạo ở Phase 6).

## Quy ước phát triển

Dự án được triển khai theo từng phase, mỗi phase trên một nhánh `phase/<số>-<slug>`, mỗi step tương ứng
tối thiểu một commit theo convention `<type>(<scope>): <mô tả ngắn>`. Xem đầy đủ trong
[`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md), mục "Quy ước chung".

## Giấy phép

Dự án phục vụ mục đích học thuật (đồ án môn Điện toán đám mây).
