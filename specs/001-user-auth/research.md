# Research: User Authentication System

**Branch**: `module_5` | **Date**: 2026-05-12
**Purpose**: Resolve all unknowns from Technical Context before Phase 1 design.

## JWT: Algorithm & Claims

**Decision**: RS256 (asymmetric RSA)
**Rationale**: Private key used for signing never leaves the server; public key can be distributed to downstream services for verification without secret sharing. HS256 is acceptable for single-service deployments but RS256 is preferred for forward compatibility.
**Implementation**: Generate RSA key pair at deployment; store private key as env var `JWT_PRIVATE_KEY`; expose public key at `GET /.well-known/jwks.json` (optional, v2).
**Required claims**: `sub` (user UUID), `iat` (Unix timestamp), `exp` (Unix timestamp, iat + 86400), `jti` (UUID v4 — enables per-token revocation tracking).

## Refresh Token Storage

**Decision**: PostgreSQL table `refresh_tokens`; token stored as SHA-256 hex hash.
**Rationale**: Server-side storage enables instant revocation (FR-007, FR-013). Hashing the token value at rest means a database breach does not expose usable tokens.
**Rotation flow**:

1. On refresh request: verify presented token hash exists and is not revoked/expired.
2. Detect reuse: if token hash exists but `revoked_at IS NOT NULL` → revoke ALL tokens for `user_id` (theft signal) and return HTTP 401.
3. Happy path: set `revoked_at = NOW()` on old row; insert new row; return new tokens.

## Password Reset Token

**Decision**: `crypto.randomBytes(32).toString('hex')` — 64-char hex string.
**Storage**: SHA-256 hash stored in `password_reset_tokens`; raw token sent in reset link URL only.
**Lifecycle**: On new request — any previous unexpired token for the user is invalidated (set `used_at = NOW()`). On consumption — set `used_at = NOW()`; check `expires_at`; enforce single-use. Revoke all refresh tokens (FR-007).

## Rate Limiting Strategy

**Decision**: Two `express-rate-limit` instances composed as middleware.

- **Per-IP limiter**: 5 requests / 15-min window keyed on `req.ip`. Applied to `/auth/login` and `/auth/forgot-password`.
- **Per-account limiter**: 10 failed attempts / 30-min window keyed on normalised email (from request body). Applied after input validation (email parsed from body). Increments only on failure (custom `skip` function).
  **Backoff**: After 3 consecutive failures on either dimension, response includes `Retry-After` header with exponential delay: `baseDelay * 2^(attempts-3)` seconds (base = 1s, max = 300s).
  **Store**: In-memory (`MemoryStore`) for development; Redis store (`rate-limit-redis`) recommended for production multi-instance deployments.

## Email Service

**Decision**: `nodemailer` behind `IEmailService` TypeScript interface.
**Interface** (see `contracts/email-service.interface.ts`): `sendPasswordReset(to: string, resetUrl: string): Promise<void>`.
**Async retry wrapper**: Wraps the interface implementation; retries up to 3× with exponential backoff (1s, 2s, 4s); on exhaustion logs audit event `EMAIL_DELIVERY_FAILED` and resolves (does not throw — HTTP 200 already sent).

## Input Validation

**Decision**: Zod schemas defined per-endpoint in `src/middleware/validate.ts`.
**Injection prevention**: Zod `.string().email()`, `.string().min()/.max()`, `.string().regex()` — all inputs coerced to validated types before reaching services. Raw request body never passed to DB layer. Prisma ORM parameterises all queries by default.

## Audit Log Schema

**Decision**: Winston JSON transport with mandatory fields per log entry:

```json
{
  "event": "LOGIN_SUCCESS | LOGIN_FAILURE | REGISTER | ...",
  "timestamp": "2026-05-12T10:00:00.000Z",
  "userId": "<sha256-of-user-id>",
  "ip": "x.x.x.x",
  "level": "info | warn | error"
}
```

**PII policy**: `userId` is SHA-256 of the internal UUID — non-reversible (FR-011). Email addresses, passwords, and tokens are never logged.

## bcrypt Cost Factor

**Decision**: Cost factor **12**.
**Rationale**: At cost 12, bcrypt requires ~250ms on modern hardware — slow enough to defeat offline brute-force while fast enough to meet the 500ms p95 login SLA (SC-002) with headroom for DB round-trips. Cost 10 (common default) is insufficient for 2026 hardware.

## TLS

**Decision**: TLS 1.2+ enforced at reverse proxy / load balancer level (nginx/Caddy); application server listens on HTTP internally. `FR-014` requires the system to reject plaintext — this is satisfied by the reverse proxy returning HTTP 301 redirect to HTTPS for all HTTP requests.
**Local dev**: `mkcert` for self-signed localhost cert; TLS required even in dev per FR-014.

## Database: PostgreSQL + Prisma

**Decision**: Prisma ORM.
**Rationale**: All queries parameterised by default (FR-015); TypeScript-native; schema migrations via `prisma migrate`; test isolation via `prisma.$transaction` rollback. Alternatives (raw `pg`) rejected as they require manual parameterisation discipline.
