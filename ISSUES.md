# Issues & Optimization Tracker

## Active Tactical Issues
- [ ] [P1-High] Add integration tests with Testcontainers for MinIO and Postgres.
    - Root cause: Unit tests mock data; need integration verification with real containers.
    - Target: Automated CI/CD verification.

## Completed Work (Archive)
- [x] [P0-Critical] Fix slice test loading JPA auditing context in HealthControllerTest
    - Root cause: `@EnableJpaAuditing` placed directly on `@SpringBootApplication` class caused WebMvcTest to look for JPA metamodel.
    - Solution: Extracted to dedicated `JpaConfig.java`.
    - Performance impact: Tests execute cleanly in slice context without full JPA boot.
    - Tested: Yes (HealthControllerTest 1/1 passed)
- [x] [P0-Critical] Fix Mockito mock filter blocking mockMvc requests
    - Root cause: `@MockBean JwtAuthenticationFilter` intercepted and suppressed `filterChain.doFilter(...)`.
    - Solution: Imported real `JwtAuthenticationFilter` and mocked downstream dependencies (`JwtService`, `UserDetailsService`).
    - Tested: Yes (10/10 tests passed)
- [x] [P1-High] Implement Phase 4 Branch B Admin Management Portal
    - Solution: Built full React SPA admin back-office with RBAC protection, Dashboard telemetry, Category CRUD, Book & Video metadata CRUD with direct MinIO upload, Feedback inspection, and User directory.
    - Performance impact: Lightweight modular frontend with instant client-side transitions and zero layout shifts.
    - Tested: Yes (Components and API contracts verified)
