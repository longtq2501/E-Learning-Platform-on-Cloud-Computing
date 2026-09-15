# High-Level Roadmap & Task Checklist

- [x] **Phase 0: Bootstrap & Infra Skeleton**
  - [x] Step 0.1: Project structure, .gitignore, documentation skeleton
  - [x] Step 0.2: Spring Boot bootstrap + GET /api/health
  - [x] Step 0.3: Docker Compose (PostgreSQL 16 + MinIO)
  - [x] Step 0.4: Multi-stage Dockerfile for backend

- [x] **Phase 1: Authentication & User Management (Auth)**
  - [x] Step 1.1: User entity + UserRepository + DB schema
  - [x] Step 1.2: POST /api/auth/register & POST /api/auth/login endpoints
  - [x] Step 1.3: Spring Security filter chain with JWT & stateless policy
  - [x] Step 1.4: Role-Based Access Control (@PreAuthorize for admin-only)
  - [x] Step 1.5: Unit tests for AuthService & UserController

- [x] **Phase 2: Domain Catalog & Object Storage (Category / Book / Video + MinIO)**
  - [x] Step 2.1: Entity Category + CRUD API (Admin only)
  - [x] Step 2.2: Entity Book + Metadata CRUD
  - [x] Step 2.3: Entity Video + Metadata CRUD
  - [x] Step 2.4: MinIO SDK integration (StorageService)
  - [x] Step 2.5: GET /api/books/{id}/download-url (Presigned URL)
  - [x] Step 2.6: Video streaming via Presigned URL

- [x] **Phase 3: Search, Feedback & Usage Stats**
  - [x] Step 3.1: Full-text search with PostgreSQL tsvector
  - [x] Step 3.2: Entity Feedback + feedback API
  - [x] Step 3.3: Download and view counters + Admin stats API

- [ ] **Phase 4: Frontend (React SPA with Vite)**
  - [ ] **Branch A: Student / Client Portal (Independent)**
    - [ ] Step 4.1.A: Student navigation & auth state
    - [ ] Step 4.2.A: Public catalog listing & search
    - [ ] Step 4.3.A: Book details & presigned download
    - [ ] Step 4.4.A: Video details & presigned streaming player
    - [ ] Step 4.5.A: Student feedback form
  - [x] **Branch B: Admin & Content Management Portal (Done)**
    - [x] Step 4.5.B1: Admin shell, router, and RBAC guard
    - [x] Step 4.5.B2: Admin dashboard & system telemetry
    - [x] Step 4.5.B3: Category CRUD management
    - [x] Step 4.5.B4: Book metadata CRUD & MinIO PDF upload
    - [x] Step 4.5.B5: Video metadata CRUD & MinIO MP4 upload + stream preview
    - [x] Step 4.5.B6: Student feedback inspection
    - [x] Step 4.5.B7: User directory and role inspection

- [x] **Phase 5: Cloud Principle Demonstrations (Scale-out Demo)**
  - [x] Step 5.1: Finalize production backend container
  - [x] Step 5.2: Multi-instance compose (3 backends + Nginx)
  - [x] Step 5.3: Round-Robin load balancing configuration
  - [x] Step 5.4: X-Instance-Id header on all backend responses
  - [x] Step 5.5: Automated scale & fault tolerance demo script

- [ ] **Phase 6: Documentation, Seed Data & Final Review**
  - [ ] Step 6.1: Seed data script
  - [ ] Step 6.2: README setup instructions
  - [ ] Step 6.3: Defense presentation script
  - [ ] Step 6.4: System audit & v1.0-demo tag
