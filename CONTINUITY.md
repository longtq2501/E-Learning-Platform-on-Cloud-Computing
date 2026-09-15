# CONTINUITY.md - Project Situational Awareness & State Bridge

## Current Big Picture Status
- **Project**: E-Learning Platform on Cloud Computing (Demo Scope)
- **Architecture**: Modular Monolith Backend (Spring Boot 3.3.4, Java 17, JPA, PostgreSQL, MinIO, Spring Security 6 + JWT) + React SPA Frontend (Vite) + Multi-Instance Docker Compose + Nginx Load Balancer.
- **Current Milestone**: Phase 1 (Authentication & RBAC) is complete with 10 passing unit and slice tests. Ready to merge `phase/1-auth` into `main` and branch to `phase/2-catalog-storage`.

## Completed Phases
- **Phase 0**: Bootstrap & Infra Skeleton (Spring Boot health check, Docker Compose with Postgres 16 & MinIO, multi-stage Dockerfile). Merged to `main`.
- **Phase 1**: Authentication & User Management
  - `feat(auth): add user entity and repository` (commit `939fa89`)
  - `feat(auth): implement register and login endpoints` (commit `d0e3cc5`)
  - `feat(auth): configure jwt security filter chain` (commit `f3de5f1`)
  - `feat(auth): add role-based access control` (commit `3770c4c`)
  - `test(auth): add unit tests for auth service` (commit `0a05f65`)

## Next Immediate Steps
1. Commit docs updates (`docs/PROGRESS.md`, `docs/DECISIONS.md`, ledger files).
2. Merge `phase/1-auth` into `main` using commit `merge(phase/1): auth and rbac complete`.
3. Create branch `phase/2-catalog-storage` for Phase 2:
   - Step 2.1: Entity `Category` + CRUD API (admin only)
   - Step 2.2: Entity `Book` + CRUD metadata
   - Step 2.3: Entity `Video` + CRUD metadata
   - Step 2.4: MinIO SDK integration (`StorageService`)
   - Step 2.5: Presigned download URL for Books
   - Step 2.6: Presigned streaming URL for Videos
