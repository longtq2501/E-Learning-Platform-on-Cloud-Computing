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

- [ ] **Phase 2: Domain Catalog & Object Storage (Category / Book / Video + MinIO)**
  - [ ] Step 2.1: Entity Category + CRUD API (Admin only)
  - [ ] Step 2.2: Entity Book + Metadata CRUD
  - [ ] Step 2.3: Entity Video + Metadata CRUD
  - [ ] Step 2.4: MinIO SDK integration (StorageService)
  - [ ] Step 2.5: GET /api/books/{id}/download-url (Presigned URL)
  - [ ] Step 2.6: Video streaming via Presigned URL

- [ ] **Phase 3: Search, Feedback & Usage Stats**
  - [ ] Step 3.1: Full-text search with PostgreSQL tsvector
  - [ ] Step 3.2: Entity Feedback + feedback API
  - [ ] Step 3.3: Download and view counters + Admin stats API

- [ ] **Phase 4: Frontend (React SPA with Vite)**
  - [ ] Step 4.1: React bootstrap + router + axios
  - [ ] Step 4.2: Auth pages (Login, Register, JWT storage)
  - [ ] Step 4.3: Catalog listing + Search bar
  - [ ] Step 4.4: Book/Video detail page + Presigned download/streaming
  - [ ] Step 4.5: Admin panel for catalog management
  - [ ] Step 4.6: Feedback form

- [ ] **Phase 5: Cloud Principle Demonstrations (Scale-out Demo)**
  - [ ] Step 5.1: Finalize production backend container
  - [ ] Step 5.2: Multi-instance compose (3 backends + Nginx)
  - [ ] Step 5.3: Round-Robin load balancing configuration
  - [ ] Step 5.4: X-Instance-Id header on all backend responses
  - [ ] Step 5.5: Automated scale & fault tolerance demo script

- [ ] **Phase 6: Documentation, Seed Data & Final Review**
  - [ ] Step 6.1: Seed data script
  - [ ] Step 6.2: README setup instructions
  - [ ] Step 6.3: Defense presentation script
  - [ ] Step 6.4: System audit & v1.0-demo tag
