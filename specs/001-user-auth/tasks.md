---
description: "Task list for User Authentication System implementation"
---

# Tasks: User Authentication System

**Input**: Design documents from `specs/001-user-auth/`
**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/ ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4, SETUP, FOUND)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project, enforce Constitution constraints, and wire toolchain before any feature work begins.

- [x] T001 [SETUP] Initialize Node.js project: `npm init`, install TypeScript 5.x, configure `tsconfig.json` with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true` → `tsconfig.json`
- [x] T002 [SETUP] Install all production dependencies: `express`, `jsonwebtoken`, `bcrypt`, `zod`, `nodemailer`, `express-rate-limit`, `winston`, `@prisma/client` → `package.json`
- [x] T003 [P] [SETUP] Install all dev dependencies: `typescript`, `ts-node-dev`, `jest`, `ts-jest`, `supertest`, `@types/*` → `package.json`
- [x] T004 [P] [SETUP] Configure Jest with `ts-jest`: coverage thresholds at 80% lines/branches/functions for `src/services/` → `jest.config.js`
- [x] T005 [P] [SETUP] Configure ESLint with `@typescript-eslint` rules; add npm scripts: `dev`, `build`, `test`, `test:coverage`, `lint` → `.eslintrc.json`, `package.json`
- [x] T006 [P] [SETUP] Generate RSA-2048 key pair; document env vars; create `.env.example` with all required variables (`DATABASE_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `JWT_ALGORITHM`, `SMTP_*`, `APP_BASE_URL`, `TLS_CERT_PATH`, `TLS_KEY_PATH`) → `.env.example`
- [x] T007 [SETUP] Implement `src/config/env.ts`: validate and export all environment variables using Zod; fail fast on startup if any required var is missing → `src/config/env.ts`
- [x] T008 [P] [SETUP] Set up local TLS with `mkcert`; document in `specs/001-user-auth/quickstart.md` (already exists — verify instructions match env config) → `quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story can be implemented. All stories depend on these tasks.

- [x] T009 [FOUND] Initialise Prisma: `npx prisma init`; write schema for `User`, `RefreshToken`, `PasswordResetToken` per `data-model.md`; run `prisma migrate dev --name init` → `prisma/schema.prisma`, `prisma/migrations/`
- [x] T010 [FOUND] Implement `src/db/client.ts`: export Prisma client singleton; ensure single instance in dev (hot reload safe) → `src/db/client.ts`
- [x] T011 [P] [FOUND] Implement `src/audit/logger.ts`: Winston JSON logger; mandatory fields `event`, `timestamp`, `userId` (SHA-256 hashed), `ip`, `level`; no PII; export `auditLog(event, userId, ip)` → `src/audit/logger.ts`
- [x] T012 [P] [FOUND] Write unit tests for `auditLog`: assert JSON fields present; assert `userId` is SHA-256 hash; assert no email/token fields in payload → `tests/unit/logger.test.ts`
- [x] T013 [P] [FOUND] Implement `src/middleware/validate.ts`: Zod-powered request validation middleware factory; returns HTTP 400 with field-level errors on failure → `src/middleware/validate.ts`
- [x] T014 [P] [FOUND] Implement `src/middleware/authenticate.ts`: JWT Bearer token middleware; verify RS256 signature, expiry, and required claims (`sub`, `iat`, `exp`, `jti`); return HTTP 401 on any failure → `src/middleware/authenticate.ts`
- [x] T015 [P] [FOUND] Implement `src/middleware/rate-limit.ts`: two limiter instances — per-IP (5/15min) and per-account (10/30min on failure); compose both; attach `Retry-After` header and exponential backoff on threshold breach → `src/middleware/rate-limit.ts`
- [x] T016 [P] [FOUND] Implement `src/app.ts`: Express app factory (no `listen` — testable); mount TLS enforcement middleware (redirect HTTP → HTTPS); mount rate limiters; mount validation; mount router → `src/app.ts`
- [x] T017 [P] [FOUND] Write test helper `tests/helpers/db.helper.ts`: test DB setup/teardown; transaction rollback per test for isolation → `tests/helpers/db.helper.ts`

---

## Phase 3: User Story 1 — User Registration (P1)

**Story goal**: A new user creates an account with email + password; system validates, hashes, stores, and returns HTTP 201.
**Independent test**: `POST /auth/register` with valid credentials → HTTP 201, user persisted, password not in response.

- [x] T018 [US1] Define Zod schema for registration input: `email` (format validated, normalised to lowercase + trim), `password` (min 8, ≥1 uppercase, ≥1 number) → `src/routes/auth.router.ts`
- [x] T019 [US1] Implement `src/services/auth.service.ts` — `register(email, password)`: check uniqueness, hash with bcrypt cost 12, insert user, emit audit log `REGISTER` event; throw typed errors for duplicate/validation failures → `src/services/auth.service.ts`
- [x] T020 [P] [US1] Write JSDoc comments for all exported functions in `auth.service.ts` with `@param`, `@returns`, `@throws` → `src/services/auth.service.ts`
- [x] T021 [US1] Add `POST /auth/register` route: validate body with T018 schema, call `auth.service.register`, return HTTP 201 on success, HTTP 409 on duplicate, HTTP 400 on validation error → `src/routes/auth.router.ts`
- [x] T022 [US1] Write unit tests for `auth.service.register`: happy path, duplicate email (409), invalid password (400), assert password never in response, assert bcrypt hash present in DB → `tests/unit/auth.service.test.ts`
- [ ] T023 [US1] Write integration test for `POST /auth/register` via supertest: valid payload → 201; duplicate → 409; bad password → 400 with field errors → `tests/integration/auth.routes.test.ts`

---

## Phase 4: User Story 2 — Login with JWT Tokens (P1)

**Story goal**: Registered user logs in; system validates credentials and issues RS256 JWT (24h) + refresh token (7d).
**Independent test**: Register user → `POST /auth/login` → HTTP 200 with valid signed JWT and refresh token.

- [x] T024 [US2] Implement `src/services/token.service.ts` — `issueAccessToken(userId)`: sign RS256 JWT with claims `sub`, `iat`, `exp` (+86400s), `jti` (UUID v4) using private key from env → `src/services/token.service.ts`
- [x] T025 [P] [US2] Implement `token.service.ts` — `issueRefreshToken(userId)`: generate `crypto.randomBytes(32).toString('hex')`; store SHA-256 hash in `refresh_tokens` with 7-day expiry; return raw token → `src/services/token.service.ts`
- [x] T026 [P] [US2] Implement `token.service.ts` — `verifyAccessToken(token)`: verify RS256 signature, expiry, required claims; throw typed error on any failure → `src/middleware/authenticate.ts`
- [x] T027 [US2] Implement `auth.service.ts` — `login(email, password)`: find user by normalised email; compare bcrypt hash; on failure emit `LOGIN_FAILURE` audit log and throw generic error (FR-008); on success emit `LOGIN_SUCCESS`; call `issueAccessToken` + `issueRefreshToken`; return token pair → `src/services/auth.service.ts`
- [x] T028 [P] [US2] Add `POST /auth/login` route with per-IP + per-account rate limiters; validate body; call `auth.service.login`; return HTTP 200 with token pair or HTTP 401 with identical generic message for wrong password/unknown email → `src/routes/auth.router.ts`
- [x] T029 [US2] Write unit tests for `token.service`: verify JWT claims present, algorithm RS256, expiry correct; verify refresh token stored as hash; verify raw token not stored → `tests/unit/token.service.test.ts`
- [x] T030 [P] [US2] Write unit tests for `auth.service.login`: correct credentials → token pair; wrong password → generic 401; unknown email → same generic 401 (assert identical error message body); emit correct audit events → `tests/unit/auth.service.test.ts`
- [ ] T031 [P] [US2] Write integration tests for `POST /auth/login`: valid → 200 + tokens; bad password → 401; unknown email → 401 (same body as bad password); rate limit → 429 + `Retry-After` → `tests/integration/auth.routes.test.ts`

---

## Phase 5: User Story 3 — Password Reset via Email (P2)

**Story goal**: User requests reset link; system generates 15-min single-use token, dispatches email; user resets password; all sessions revoked.
**Independent test**: `POST /auth/forgot-password` with registered email → HTTP 200; email dispatched (mock verified); `POST /auth/reset-password` with valid token → password updated, refresh tokens revoked.

- [x] T032 [US3] Implement `contracts/email-service.interface.ts` (already exists) as default nodemailer implementation `src/services/email.service.ts`: `sendPasswordReset(to, resetUrl)` with async retry wrapper (3×, backoff 1s/2s/4s); on exhaustion emit `EMAIL_DELIVERY_FAILED` audit log → `src/services/email.service.ts`
- [x] T033 [P] [US3] Write JSDoc on `IEmailService` and `EmailDeliveryError` (already in contracts file — verify completeness) → `specs/001-user-auth/contracts/email-service.interface.ts`
- [x] T034 [US3] Implement `src/services/password.service.ts` — `requestReset(email)`: always return void (HTTP 200 regardless); if user found: invalidate previous unexpired tokens, generate `crypto.randomBytes(32)` token, store SHA-256 hash with 15-min expiry, call `emailService.sendPasswordReset`; emit audit `PASSWORD_RESET_REQUESTED` → `src/services/password.service.ts`
- [x] T035 [US3] Implement `password.service.ts` — `completeReset(rawToken, newPassword)`: find token by SHA-256 hash; check `expiresAt` and `usedAt` (reject if expired/used → HTTP 400); hash new password (bcrypt cost 12); update user; set `usedAt`; revoke all refresh tokens (FR-007); emit `PASSWORD_RESET_COMPLETED` → `src/services/password.service.ts`
- [x] T036 [P] [US3] Add `POST /auth/forgot-password` route: rate limited; validate body; call `password.service.requestReset`; always return HTTP 200 with generic message → `src/routes/auth.router.ts`
- [x] T037 [P] [US3] Add `POST /auth/reset-password` route: validate body; call `password.service.completeReset`; return HTTP 200 on success, HTTP 400 on invalid/expired/used token → `src/routes/auth.router.ts`
- [x] T038 [US3] Write unit tests for `password.service.requestReset`: registered email → email service called (mock); unregistered email → email service NOT called; previous token invalidated on second request → `tests/unit/password.service.test.ts`
- [x] T039 [P] [US3] Write unit tests for `password.service.completeReset`: valid token → password updated + all refresh tokens revoked; expired token → 400; used token → 400 → `tests/unit/password.service.test.ts`
- [x] T040 [P] [US3] Write integration tests for password reset flow end-to-end: register → forgot-password → capture token → reset-password → assert login with new password works, old password fails → `tests/integration/auth.routes.test.ts`

---

## Phase 6: User Story 4 — Session Management (P2)

**Story goal**: 7-day rolling refresh tokens; per-session logout; logout-all; token reuse attack detection.
**Independent test**: Login → get token pair; simulate expiry; `POST /auth/refresh` → new tokens; old refresh token rejected; `POST /auth/logout` → current session only; `POST /auth/logout-all` → all sessions.

- [x] T041 [US4] Implement `token.service.ts` — `rotateRefreshToken(rawToken, ip)`: within a DB transaction — find token by SHA-256 hash; if `revokedAt IS NOT NULL` → revoke ALL tokens for `userId` + emit `TOKEN_REUSE_DETECTED` audit log → return HTTP 401; else revoke current + insert new; emit `TOKEN_REFRESH` → `src/services/token.service.ts`
- [x] T042 [P] [US4] Implement `auth.service.ts` — `logout(userId, refreshTokenHash)`: set `revokedAt` on matching token only; emit `LOGOUT` audit log → `src/services/auth.service.ts`
- [x] T043 [P] [US4] Implement `auth.service.ts` — `logoutAll(userId)`: set `revokedAt` on all non-revoked tokens for user; emit `LOGOUT_ALL` audit log → `src/services/auth.service.ts`
- [x] T044 [US4] Add `POST /auth/refresh` route: no auth middleware (token in body); validate body; call `token.service.rotateRefreshToken`; return HTTP 200 with new token pair or HTTP 401 → `src/routes/auth.router.ts`
- [x] T045 [P] [US4] Add `POST /auth/logout` route: requires `authenticate` middleware (valid JWT); extract refresh token from body; call `auth.service.logout`; return HTTP 204 → `src/routes/auth.router.ts`
- [x] T046 [P] [US4] Add `POST /auth/logout-all` route: requires `authenticate` middleware; call `auth.service.logoutAll`; return HTTP 204 → `src/routes/auth.router.ts`
- [x] T047 [US4] Write unit tests for `token.service.rotateRefreshToken`: valid token → new pair returned, old revoked; already-revoked token → HTTP 401 + ALL sessions revoked (reuse attack); expired token → HTTP 401 → `tests/unit/token.service.test.ts`
- [x] T048 [P] [US4] Write unit tests for `auth.service.logout` and `auth.service.logoutAll`: logout revokes single token only; logoutAll revokes all; other sessions unaffected after per-session logout → `tests/unit/auth.service.test.ts`
- [x] T049 [P] [US4] Write integration tests for session lifecycle: login × 2 devices → refresh device 1 → logout device 1 → device 2 still works → logoutAll → both rejected → `tests/integration/auth.routes.test.ts`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Coverage validation, security hardening, documentation completeness, and final commit.

- [x] T050 [P] [POLISH] Run `npm run test:coverage`; confirm ≥ 80% lines/branches/functions on `src/services/`; fix any gaps before merge → `jest.config.js`
- [x] T051 [P] [POLISH] Audit all exported functions in `src/services/`, `src/middleware/`, `src/audit/` for JSDoc completeness (`@param`, `@returns`, `@throws`); add any missing → all `src/` files
- [x] T052 [P] [POLISH] Add `src/server.ts` (separate from `app.ts`): load TLS cert/key from env; call `app.listen` on HTTPS; ensure HTTP requests on port 80 receive 301 redirect → `src/server.ts`
- [x] T053 [P] [POLISH] Verify FR-015: review all DB interactions in services; confirm no raw string interpolation; all queries go through Prisma parameterised API → `src/services/*.ts`
- [x] T054 [P] [POLISH] Verify SC-005: search codebase for any logger/console calls that could expose passwords or raw tokens; ensure `password`, `token`, `rawToken` never appear in audit log field values → all `src/` files
- [x] T055 [P] [POLISH] Run ESLint (`npm run lint`); fix all TypeScript warnings and errors → all `src/` files
- [x] T056 [POLISH] Commit all work: `git add -A && git commit -m "feat(auth): implement user authentication system (FR-001–015)"` then push → `git`

---

## Dependency Graph

```
Phase 1 (SETUP): T001–T008
    └── Phase 2 (FOUND): T009–T017
            ├── Phase 3 (US1 — Register): T018–T023
            │       └── Phase 4 (US2 — Login): T024–T031
            │               ├── Phase 5 (US3 — Password Reset): T032–T040
            │               └── Phase 6 (US4 — Session Mgmt): T041–T049
            └── (All phases) → Phase 7 (Polish): T050–T056
```

## Parallel Execution Opportunities

| Parallelisable Group     | Tasks                                    | Notes                             |
| ------------------------ | ---------------------------------------- | --------------------------------- |
| SETUP tooling            | T003, T004, T005, T006, T008             | All target different config files |
| Foundation middleware    | T011, T013, T014, T015                   | Independent modules               |
| Login sub-tasks          | T025, T026, T029                         | After T024 started                |
| Password reset sub-tasks | T033, T036, T037, T038, T039, T040       | After T034 started                |
| Session sub-tasks        | T042, T043, T045, T046, T047, T048, T049 | After T041 started                |
| Polish                   | T050–T055                                | All independent                   |

## Implementation Strategy

| MVP Scope        | Tasks     | Delivers                                                                    |
| ---------------- | --------- | --------------------------------------------------------------------------- |
| MVP (US1 only)   | T001–T023 | Register endpoint, bcrypt, audit log, validation — independently deployable |
| + US2            | T024–T031 | Full login + JWT — users can authenticate                                   |
| + US3            | T032–T040 | Password recovery — production-ready for public launch                      |
| + US4            | T041–T049 | Multi-device sessions — full session lifecycle                              |
| Production-ready | T050–T056 | Coverage gate, JSDoc audit, TLS server, lint clean                          |

**Total tasks**: 56 (T001–T056)
**Tasks per story**: SETUP 8 | FOUND 9 | US1 6 | US2 8 | US3 9 | US4 9 | Polish 7
**Parallel opportunities**: 30+ tasks can run concurrently within their phase
