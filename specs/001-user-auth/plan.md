# Implementation Plan: User Authentication System

**Branch**: `module_5` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-user-auth/spec.md`

## Summary

Build a production-ready REST API authentication system in TypeScript (strict mode) providing user registration, JWT-based login, password reset via email, and multi-device session management. The system issues RS256-signed JWT access tokens (24h) with rotating refresh tokens (7-day rolling), enforces dual-axis rate limiting, and emits structured JSON audit logs for all security events. All data access uses parameterised queries; transport requires TLS 1.2+.

## Technical Context

**Language/Version**: TypeScript 5.x — strict mode (Constitution mandate)
**Primary Dependencies**:

- `express` — HTTP server
- `jsonwebtoken` — JWT signing/verification (RS256)
- `bcrypt` — password hashing (cost factor ≥ 12)
- `zod` — runtime input validation and schema enforcement
- `nodemailer` — email delivery (injected; SMTP-agnostic)
- `express-rate-limit` — per-IP and per-account rate limiting middleware
- `winston` — structured JSON audit logging
- `prisma` (or `pg` + raw parameterised queries) — database access (injection-safe)

**Storage**: PostgreSQL — relational, supports row-level revocation queries efficiently
**Testing**: Jest + `ts-jest` with coverage reporting; `supertest` for HTTP integration tests
**Target Platform**: Linux server (Node.js 20 LTS)
**Project Type**: REST API service / library
**Performance Goals**: Login p95 < 500ms (SC-002); password reset email dispatch < 5s (SC-003)
**Constraints**: TLS 1.2+ required (FR-014); bcrypt cost ≥ 12; ≥ 80% branch/line/function coverage on business logic (Constitution)
**Scale/Scope**: v1 single-service; horizontal scaling deferred; no concurrent-session cap in v1

## Constitution Check

| Gate                   | Status  | Notes                                                                          |
| ---------------------- | ------- | ------------------------------------------------------------------------------ |
| TypeScript strict mode | ✅ PASS | All source files `.ts`; `strict: true` in `tsconfig.json`                      |
| No implicit `any`      | ✅ PASS | Enforced by compiler; Zod schemas provide runtime safety                       |
| JSDoc on all exports   | ✅ PASS | Mandated — all service methods, route handlers, interfaces documented          |
| Testing Pyramid ≥ 80%  | ✅ PASS | Jest coverage thresholds set to 80% on lines/branches/functions for `src/`     |
| Simplicity / YAGNI     | ✅ PASS | No microservices, no event sourcing, no caching layer in v1                    |
| Clean Code             | ✅ PASS | Single-responsibility services; no dead code; named constants for magic values |

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   ├── auth.openapi.yaml
│   └── email-service.interface.ts
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── config/
│   └── env.ts                  # Validated env vars (TLS, JWT secret, DB URL)
├── db/
│   └── client.ts               # Prisma client singleton
├── models/                     # TypeScript interfaces (no ORM models here)
│   ├── user.model.ts
│   ├── refresh-token.model.ts
│   └── password-reset-token.model.ts
├── services/                   # Business logic (80% coverage gate applies here)
│   ├── auth.service.ts         # register, login, logout, logoutAll
│   ├── token.service.ts        # issueAccessToken, issueRefreshToken, rotate, revoke
│   ├── password.service.ts     # hash, compare, requestReset, completeReset
│   └── email.service.ts        # sendResetEmail (interface + default impl)
├── middleware/
│   ├── authenticate.ts         # JWT validation middleware
│   ├── rate-limit.ts           # Per-IP + per-account rate limiters
│   └── validate.ts             # Zod request validation middleware
├── routes/
│   └── auth.router.ts          # POST /auth/* route definitions
├── audit/
│   └── logger.ts               # Winston structured JSON audit logger
└── app.ts                      # Express app factory (no listen — testable)

tests/
├── unit/
│   ├── auth.service.test.ts
│   ├── token.service.test.ts
│   └── password.service.test.ts
├── integration/
│   └── auth.routes.test.ts     # supertest end-to-end route tests
└── helpers/
    └── db.helper.ts            # Test DB setup/teardown utilities
```

**Structure Decision**: Single project (Option 1). No frontend — API only. All business logic isolated in `src/services/` to enforce coverage gate. Email service is an interface injected at startup, enabling mock substitution in tests without library coupling.

## Phase 0: Research

See [research.md](research.md) for full findings. Key decisions:

| Topic                 | Decision                                                                 | Rationale                                                                      |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| JWT algorithm         | RS256 with key pair from env                                             | Asymmetric — public key shareable; private key never leaves server             |
| Refresh token storage | PostgreSQL (`refresh_tokens` table, token stored as SHA-256 hash)        | Server-side revocation; hash-at-rest prevents plaintext exposure               |
| Password reset token  | Crypto-random 32-byte token; stored as SHA-256 hash; 15-min TTL          | Matches FR-006; `usedAt` set on consumption to enforce single-use              |
| Rate limiting         | `express-rate-limit` — two instances: per-IP window + per-account window | Dual-axis per FR-010; both check same key store (memory in dev, Redis in prod) |
| Email service         | `nodemailer` behind `IEmailService` interface                            | Swappable in tests; async retry wrapper handles FR-012                         |
| Input validation      | Zod schemas at route boundary                                            | Prevents injection (FR-015); type-safe; composable                             |
| Audit logging         | Winston JSON transport — `event`, `timestamp`, `userId` (hashed), `ip`   | FR-011 schema defined; no PII; testable via mock transport                     |

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](data-model.md) for full schema. Summary:

| Table                   | Key Columns                                                                  | Notes                                                          |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `users`                 | `id`, `email` (unique), `password_hash`, `created_at`, `updated_at`          | Email lowercased + trimmed before insert                       |
| `refresh_tokens`        | `id`, `user_id` (FK), `token_hash`, `expires_at`, `revoked_at`, `created_at` | Hash stored; rotate = insert new + set `revoked_at` on old     |
| `password_reset_tokens` | `id`, `user_id` (FK), `token_hash`, `expires_at`, `used_at`, `created_at`    | `used_at` set on consumption; new request invalidates previous |

### API Contracts

See [contracts/auth.openapi.yaml](contracts/auth.openapi.yaml) for full OpenAPI spec. Endpoints:

| Method | Path                    | Auth                 | FR                     |
| ------ | ----------------------- | -------------------- | ---------------------- |
| POST   | `/auth/register`        | None                 | FR-001, FR-002         |
| POST   | `/auth/login`           | None                 | FR-003, FR-004, FR-010 |
| POST   | `/auth/refresh`         | Refresh token (body) | FR-004, FR-005         |
| POST   | `/auth/logout`          | Bearer JWT           | FR-009, FR-013         |
| POST   | `/auth/logout-all`      | Bearer JWT           | FR-013                 |
| POST   | `/auth/forgot-password` | None                 | FR-006, FR-010, FR-012 |
| POST   | `/auth/reset-password`  | Reset token (body)   | FR-006, FR-007         |

### Email Service Interface

See [contracts/email-service.interface.ts](contracts/email-service.interface.ts).

### Quickstart

See [quickstart.md](quickstart.md) for local setup steps.

## Complexity Tracking

No Constitution violations. No complexity justification required.
