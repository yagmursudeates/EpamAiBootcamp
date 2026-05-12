# Feature Specification: User Authentication System

**Feature Branch**: `001-user-authentication`  
**Created**: 2026-05-08  
**Status**: Draft  
**Input**: User description: "User authentication system with registration (email/password), login with JWT tokens, password reset via email, and session management (24-hour expiry)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - User Registration (Priority: P1)

A new user creates an account by providing their email address and a password. The system validates the input, hashes the password securely, stores the user, and returns a confirmation.

**Why this priority**: Registration is the entry point of the entire authentication system. Without it, no other story can function. It delivers an immediately testable, independently deployable slice of value.

**Independent Test**: Can be fully tested by `POST /auth/register` with valid credentials and verifying the user is persisted and a success response is returned.

**Acceptance Scenarios**:

1. **Given** a new email address and a valid password (min. 8 chars, at least one uppercase, one number), **When** the user submits the registration form, **Then** the system creates the account, hashes the password (bcrypt), and returns HTTP 201 with a success message.
2. **Given** an email address that is already registered, **When** the user attempts to register, **Then** the system returns HTTP 409 Conflict with a descriptive error message.
3. **Given** an invalid email format or a password that does not meet complexity requirements, **When** the user submits the form, **Then** the system returns HTTP 400 Bad Request with field-level validation errors.
4. **Given** a valid registration request, **When** the account is created, **Then** the password is never stored in plaintext and is not returned in any response.

---

### User Story 2 - Login with JWT Tokens (Priority: P1)

A registered user logs in with their email and password. The system validates the credentials and issues a signed JWT access token.

**Why this priority**: Login is the core of any authentication system and unlocks access to all protected resources. It is co-equal in priority with registration.

**Independent Test**: Can be fully tested by registering a user, then calling `POST /auth/login` and verifying a valid, signed JWT is returned.

**Acceptance Scenarios**:

1. **Given** a registered user with correct credentials, **When** they call the login endpoint, **Then** the system returns HTTP 200 with a signed JWT access token (24-hour expiry) and a refresh token.
2. **Given** a registered user with an incorrect password, **When** they attempt to login, **Then** the system returns HTTP 401 Unauthorized with a generic error message (not revealing which field is wrong).
3. **Given** an email address that does not exist, **When** login is attempted, **Then** the system returns HTTP 401 Unauthorized (same generic message as wrong password to prevent user enumeration).
4. **Given** a valid JWT, **When** it is used to access a protected route, **Then** the system grants access and the token claims are verifiable.
5. **Given** an expired or tampered JWT, **When** it is used on a protected route, **Then** the system returns HTTP 401 Unauthorized.

---

### User Story 3 - Password Reset via Email (Priority: P2)

A user who has forgotten their password requests a reset link. The system sends a time-limited, single-use token to their registered email address.

**Why this priority**: Critical for user retention and account recovery, but depends on registration being functional first. The email flow is an independently testable slice.

**Independent Test**: Can be fully tested by calling `POST /auth/forgot-password` with a registered email and verifying a reset token is generated and an email is dispatched (via mock/spy in tests).

**Acceptance Scenarios**:

1. **Given** a registered email address, **When** the user requests a password reset, **Then** the system generates a secure, time-limited token (15-minute expiry), stores a hashed version, and sends a reset link to the email.
2. **Given** an unregistered email address, **When** a reset is requested, **Then** the system returns the same HTTP 200 success response (to prevent user enumeration) but sends no email.
3. **Given** a valid, unexpired reset token, **When** the user submits a new password, **Then** the password is updated, the token is invalidated, and all existing sessions are revoked.
4. **Given** an expired or already-used reset token, **When** the user attempts to reset, **Then** the system returns HTTP 400 Bad Request with an appropriate message.

---

### User Story 4 - Session Management with 24-Hour Expiry (Priority: P2)

JWT access tokens expire after 24 hours. A refresh token mechanism allows users to obtain a new access token without re-authenticating, until the refresh token itself expires or is revoked.

**Why this priority**: Essential for security hygiene but depends on the login flow. Provides a complete, production-ready session lifecycle.

**Independent Test**: Can be fully tested by obtaining a token, waiting for/simulating expiry, calling `POST /auth/refresh`, and verifying a new access token is issued.

**Acceptance Scenarios**:

1. **Given** a valid refresh token, **When** the user calls the refresh endpoint, **Then** the system issues a new access token (24-hour expiry) and issues a new refresh token (rotating the old one, which is immediately invalidated).
2. **Given** an expired access token and a valid refresh token, **When** the user refreshes, **Then** the new access token is returned and the old one is no longer accepted.
3. **Given** a revoked or invalid refresh token, **When** refresh is attempted, **Then** the system returns HTTP 401 Unauthorized.
4. **Given** an already-rotated (previously invalidated) refresh token is presented to the refresh endpoint, **When** the system detects reuse of a consumed token, **Then** the system MUST return HTTP 401 Unauthorized AND immediately revoke all refresh tokens for the associated user (treat as token theft signal).
5. **Given** a logged-in user, **When** they call `POST /auth/logout`, **Then** the current session's refresh token is revoked and subsequent refresh attempts with it are rejected. Other active sessions on other devices are unaffected.
6. **Given** a user with multiple active sessions, **When** they call `POST /auth/logout-all`, **Then** all refresh tokens for that user are revoked across all devices.

---

### Edge Cases

- What happens when a user submits registration with leading/trailing whitespace in email?
- How does the system handle concurrent login requests with the same credentials? → Multiple concurrent sessions are supported; each login issues an independent refresh token scoped to that session.
- What happens if the email service is unavailable during a password reset request? → System returns HTTP 200 (prevents enumeration); retries email delivery asynchronously up to 3 times with exponential backoff; logs an audit event on exhaustion.
- How does the system handle a brute-force attack on the login endpoint? → Max 5 attempts / 15-min per IP; exponential backoff after 3 failures; HTTP 429 with `Retry-After` header.
- What happens if a JWT secret is rotated — are existing tokens invalidated gracefully?
- How are refresh tokens stored — are they hashed at rest?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to register with a unique email address and a password meeting defined complexity rules (min. 8 chars, 1 uppercase, 1 number). Email addresses MUST be normalised (lowercased and whitespace-trimmed) before storage and all subsequent lookups.
- **FR-002**: System MUST hash passwords using bcrypt with a minimum cost factor of **12** before persistence; plaintext passwords MUST never be stored or logged.
- **FR-003**: System MUST issue a signed JWT access token upon successful login, with a 24-hour expiry. JWTs MUST be signed using **RS256** (asymmetric) or **HS256** (symmetric, minimum 256-bit secret); the `none` algorithm and any algorithm not in this list MUST be rejected. Every JWT payload MUST include the following claims: `sub` (user ID), `iat` (issued-at), `exp` (expiry), `jti` (unique token ID for revocation support).
- **FR-004**: System MUST issue a refresh token upon login (7-day expiry, rolling window) to allow access token renewal without re-authentication. Refresh tokens MUST be rotated on every use — each use invalidates the previous token and issues a new one.
- **FR-005**: System MUST validate JWT signatures and expiry on every protected route request.
- **FR-006**: System MUST support password reset via a time-limited (15-minute), single-use token delivered to the user's registered email.
- **FR-007**: System MUST invalidate all active sessions (refresh tokens) when a password reset is completed.
- **FR-008**: System MUST return identical error responses for "wrong password" and "email not found" to prevent user enumeration attacks. The error message body MUST be: `{ "error": "Invalid credentials" }` for both cases — no additional detail.
- **FR-009**: _(Superseded by FR-013.)_ System MUST provide `POST /auth/logout` to revoke the current session's refresh token and `POST /auth/logout-all` to revoke all active refresh tokens for the authenticated user. See FR-013 for full semantics.
- **FR-010**: System MUST enforce rate limiting on login and password-reset endpoints at two levels: (1) **per-IP**: maximum 5 attempts per 15-minute window; (2) **per-account**: maximum 10 failed attempts per 30-minute window regardless of source IP. After 3 consecutive failures on either dimension, exponential backoff MUST be applied. Responses MUST return HTTP 429 Too Many Requests with a `Retry-After` header when the limit is exceeded.
- **FR-011**: System MUST emit structured audit log entries (JSON) for the following security events: registration, login success, login failure, password reset requested, password reset completed, token refresh, logout, token revocation, and email delivery failure. Every log entry MUST include these mandatory fields: `event` (string enum), `timestamp` (ISO 8601), `userId` (SHA-256 hex of the internal user UUID — non-reversible), `ip` (string), `level` ("info" | "warn" | "error"). Log payloads MUST NOT contain passwords, plaintext tokens, email addresses, or any other PII.
- **FR-012**: When the email service is unavailable during a password reset, the system MUST return HTTP 200 to the caller (to prevent user enumeration), retry delivery asynchronously up to 3 times with exponential backoff, and emit an audit log entry if all retries are exhausted.
- **FR-013**: System MUST support multiple concurrent sessions per user. Each login MUST issue an independent refresh token. `POST /auth/logout` MUST revoke only the current session's token. `POST /auth/logout-all` MUST revoke all active refresh tokens for the authenticated user.
- **FR-014**: All API endpoints MUST be served exclusively over HTTPS/TLS 1.2 or higher. Plaintext HTTP requests MUST be rejected (HTTP 400) or redirected to HTTPS. This requirement applies to all environments including staging.
- **FR-015**: All database queries MUST use parameterised statements or a query builder that prevents SQL/NoSQL injection. Raw string interpolation into queries is prohibited. Input to all endpoints MUST be validated and sanitised at the boundary before processing.

### Key Entities

- **User**: Represents a registered account. Key attributes: `id`, `email` (unique, indexed), `passwordHash`, `createdAt`, `updatedAt`.
- **RefreshToken**: Represents an active session. Key attributes: `id`, `userId` (FK), `tokenHash`, `expiresAt` (7 days from issuance), `revokedAt`. Tokens are rotated on every use — the previous token is revoked when a new one is issued.
- **PasswordResetToken**: Represents a pending reset request. Key attributes: `id`, `userId` (FK), `tokenHash`, `expiresAt`, `usedAt`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can complete registration within a single HTTP round-trip: `POST /auth/register` returns HTTP 201 with `{ "message": "Account created successfully" }`. Registration does NOT return a JWT — the user must subsequently call `POST /auth/login` to obtain tokens.
- **SC-002**: Login endpoint returns a response in under 500ms at p95 under normal load.
- **SC-003**: Password reset email is dispatched within 5 seconds of a valid request.
- **SC-004**: All business logic modules achieve ≥ 80% line, branch, and function coverage as per the project Constitution.
- **SC-005**: Zero plaintext passwords appear in logs, responses, or database at any point (verifiable via security audit of test fixtures).
- **SC-006**: All OWASP Top 10 authentication-related risks (A07: Identification & Authentication Failures, A09: Security Logging & Monitoring Failures) are addressed and documented.
- **SC-007**: Every security event (login, registration, reset, revocation) produces a structured JSON log entry containing event type, timestamp, and non-reversible user identifier — verified by unit tests asserting logger calls.

## Clarifications

### Session 2026-05-12

- Q: What is the refresh token lifetime and rotation strategy? → A: 7-day rolling refresh token, rotated on every use (previous token immediately revoked on refresh)
- Q: What are the rate limiting thresholds for login and password-reset endpoints? → A: 5 attempts / 15-min per IP; exponential backoff after 3 failures; HTTP 429 + `Retry-After` header
- Q: What is the observability/audit logging requirement? → A: Structured JSON logs for all security events (login, registration, reset, revocation, logout); no PII or plaintext tokens in payloads
- Q: What happens when the email service is unavailable during password reset? → A: Return HTTP 200; retry async up to 3× with exponential backoff; log audit event on exhaustion
- Q: Are multiple concurrent sessions (multi-device) supported? → A: Yes; each login issues an independent refresh token; logout revokes current session only; `POST /auth/logout-all` revokes all
- Security hardening (batch): bcrypt cost ≥ 12; JWT algorithm RS256/HS256 only with `sub`/`iat`/`exp`/`jti` claims; TLS 1.2+ mandatory (FR-014); account-level rate limiting added to FR-010; injection protection mandated (FR-015); token reuse attack scenario added to User Story 4

## Assumptions

- Email delivery is handled by an external SMTP provider or transactional email service (e.g., SendGrid); the service is injected as a dependency and mocked in tests.
- The consuming application is a REST API; no OAuth2 / SSO / social login is in scope for v1.
- Refresh tokens are stored server-side (e.g., in a database or Redis) to support revocation; stateless-only refresh is out of scope.
- Rate limiting is implemented at the application layer (e.g., via middleware); infrastructure-level WAF rules are out of scope.
- Mobile clients are consumers of the API but no native SDK or mobile-specific flow (e.g., biometric) is in scope for v1.
- The project uses the TypeScript strict-mode stack declared in the Constitution.
- CORS policy is the responsibility of the consuming deployment environment (reverse proxy / API gateway). The application server does not set CORS headers in v1; this is explicitly out of scope.
