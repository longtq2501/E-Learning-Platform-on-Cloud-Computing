# CONTINUITY.md - Project Situational Awareness & State Bridge

## Current Big Picture Status
- **Project**: E-Learning Platform on Cloud Computing (Demo Scope)
- **Architecture**: Modular Monolith Backend (Spring Boot 3.3.4, Java 17, JPA, PostgreSQL, MinIO, Spring Security 6 + JWT) + React SPA Frontend (Vite) + Multi-Instance Docker Compose + Nginx Load Balancer.
- **Current Milestone**: Phase 4 Branch B (Admin & Content Management Portal) is complete on branch `phase/4-branch-b-admin`. Ready to merge into `main` and return to `main`.

## Completed Phases
- **Phase 0**: Bootstrap & Infra Skeleton (Spring Boot health check, Docker Compose with Postgres 16 & MinIO, multi-stage Dockerfile). Merged to `main`.
- **Phase 1**: Authentication & User Management (JWT, BCrypt, Spring Security 6, RBAC). Merged to `main`.
- **Phase 2**: Domain Catalog & Object Storage (Category/Book/Video metadata, MinIO SDK upload, signed download/stream URLs). Merged to `main`.
- **Phase 3**: Search, Feedback & Usage Stats (PostgreSQL tsvector full-text search, Feedback entity & API, view/download counters). Merged to `main`.
- **Phase 5**: Cloud Principle Demonstrations (Scale-out 3 backend instances, Nginx round-robin upstream, X-Instance-Id telemetry header). Merged to `main`.
- **Phase 4 (Branch B)**: Admin Management Portal (Admin layout, RBAC guard, Dashboard analytics, Category CRUD, Book CRUD + MinIO PDF upload, Video CRUD + MinIO MP4 upload + streaming preview, Feedback inspection, User directory).

## Next Immediate Steps
1. Finalize and review Branch A (Student Portal: catalog search, public reader/player, feedback submission).
2. Phase 6: Documentation, seed data script (`infra/seed/`), README setup instructions, and final presentation script.
