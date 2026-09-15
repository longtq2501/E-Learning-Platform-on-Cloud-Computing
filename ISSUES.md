# Issues & Optimization Tracker

## Active Tactical Issues
- [ ] [P1-High] Add integration tests with Testcontainers for MinIO and Postgres in Phase 2.
    - Root cause: Unit tests mock data; need integration verification with real containers.
    - Target: Phase 2 MinIO integration.

## Completed Work (Archive)
- [x] [P0-Critical] Fix slice test loading JPA auditing context in HealthControllerTest
    - Root cause: `@EnableJpaAuditing` placed directly on `@SpringBootApplication` class caused WebMvcTest to look for JPA metamodel.
    - Solution: Extracted to dedicated `JpaConfig.java`.
    - Performance impact: Tests execute cleanly in slice context without full JPA boot.
    - Tested: ✅ (HealthControllerTest 1/1 passed)
- [x] [P0-Critical] Fix Mockito mock filter blocking mockMvc requests
    - Root cause: `@MockBean JwtAuthenticationFilter` intercepted and suppressed `filterChain.doFilter(...)`.
    - Solution: Imported real `JwtAuthenticationFilter` and mocked downstream dependencies (`JwtService`, `UserDetailsService`).
    - Tested: ✅ (10/10 tests passed)
