# Security Review Checklist: User Authentication

## Credential & Secret Handling

- [x] Passwords are hashed with a cost-factor algorithm (bcrypt) before storage — never stored in plaintext (FR-002)
- [x] Plaintext passwords are explicitly prohibited in logs and API responses (FR-002, SC-005)
- [x] Password reset tokens are stored as a hash (`tokenHash`), not plaintext (Key Entities)
- [x] Refresh tokens are stored as a hash (`tokenHash`), not plaintext (Key Entities)
- [x] bcrypt cost factor is specified: minimum cost factor 12 (FR-002)
- [x] JWT signing algorithm is constrained: RS256 or HS256 (min 256-bit secret); `none` and unlisted algorithms rejected (FR-003)

## Authentication Security

- [x] Generic error messages prevent user enumeration on login (FR-008)
- [x] Generic HTTP 200 response on password reset prevents email enumeration (User Story 3 Scenario 2, FR-012)
- [x] Rate limiting defined on login endpoint: 5 attempts / 15 min per IP (FR-010)
- [x] Rate limiting defined on password-reset endpoint (FR-010)
- [x] Exponential backoff applied after 3 consecutive login failures (FR-010)
- [x] HTTP 429 with `Retry-After` header returned on rate limit breach (FR-010)
- [x] Rate limiting defined per-account in addition to per-IP: max 10 failures / 30 min per account (FR-010)
- [ ] No CAPTCHA or bot-detection requirement defined — **deferred to v2**

## Token Security

- [x] JWT access tokens have defined expiry (24-hour) (FR-003)
- [x] Refresh tokens have defined expiry (7-day rolling window) (FR-004)
- [x] Refresh tokens are rotated on every use — old token is immediately invalidated (FR-004)
- [x] Expired or tampered JWTs are rejected on protected routes (User Story 2 Scenario 5)
- [x] Revoked refresh tokens are rejected (User Story 4 Scenario 3)
- [x] All refresh tokens revoked on password reset (FR-007)
- [x] Token reuse attack (refresh token replay) scenario specified in User Story 4 Scenario 4: system detects reuse of consumed token, returns HTTP 401, and revokes ALL user sessions as theft signal (FR-004)
- [x] JWT claims `sub`, `iat`, `exp`, `jti` are mandated in every access token payload (FR-003)
- [ ] Refresh token binding to device/IP — **deferred to v2**

## Session Management

- [x] Per-session logout revokes only the current refresh token (FR-013)
- [x] Logout-all revokes all active refresh tokens for the user (FR-013)
- [x] Multiple concurrent sessions supported with independent tokens (FR-013)
- [x] Password reset invalidates all existing sessions across all devices (FR-007)
- [ ] Refresh token maximum concurrent count per user — **deferred to v2**
- [ ] Session inactivity timeout — **deferred to v2** (7-day rolling expiry is sufficient for v1)

## Data Protection & Transport

- [x] HTTPS/TLS 1.2+ transport mandated for all environments; plaintext HTTP rejected (FR-014)
- [ ] Token storage guidance for clients — **deferred to v2** (API server does not control client storage; guidance belongs in client SDK documentation)
- [x] CORS policy is explicitly out of scope — delegated to reverse proxy / API gateway per Assumptions section

## Audit Logging & Monitoring

- [x] Structured JSON audit logs required for all key security events (FR-011)
- [x] Audit log payloads must not contain passwords, plaintext tokens, or PII (FR-011)
- [x] Audit log on email delivery exhaustion (FR-012)
- [x] SC-007 requires unit test assertions on audit log output
- [x] Audit log schema is defined — FR-011 mandates fields: `event`, `timestamp` (ISO 8601), `userId` (SHA-256 hex of UUID), `ip`, `level`
- [ ] Log integrity / tamper-detection — **deferred to v2**
- [ ] Alerting / monitoring thresholds — **deferred to v2**

## Input Validation & Injection

- [x] Email format validation required (FR-001)
- [x] Password complexity rules defined (FR-001)
- [x] SQL/NoSQL injection protection mandated: parameterised statements required; raw string interpolation prohibited; input validated at all boundaries (FR-015)
- [x] Email normalisation (lowercase, trim) is required — FR-001 updated to mandate email normalisation before storage and all lookups

## OWASP Coverage

- [x] A07 — Identification & Authentication Failures: addressed via FR-001–FR-010, FR-013 (SC-006)
- [x] A09 — Security Logging & Monitoring Failures: addressed via FR-011, SC-007 (SC-006)
- [x] A02 — Cryptographic Failures: addressed — bcrypt cost ≥ 12 (FR-002), RS256/HS256 algorithm constraint (FR-003), TLS 1.2+ mandated (FR-014)
- [x] A03 — Injection: addressed — parameterised queries and input sanitisation mandated (FR-015)
- [x] A05 — Security Misconfiguration: addressed — JWT algorithm constrained (FR-003), CORS delegated to reverse proxy (Assumptions), token storage guidance deferred to v2
- [ ] A01 — Broken Access Control — **out of scope** (spec covers authentication only, not authorisation; deferred to separate feature)
