# Specification Quality Checklist: User Authentication

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] User stories are written from the user's perspective
- [x] Acceptance scenarios use Given/When/Then format consistently
- [x] Out-of-scope items are explicitly declared (OAuth, biometric, mobile SDK)

## Requirement Completeness

- [x] Requirements are testable and unambiguous
- [x] All functional requirements have a corresponding user story
- [x] Password complexity rules are defined (min. 8 chars, 1 uppercase, 1 number)
- [x] Token expiry values are specified (access: 24h, refresh: 7-day rolling)
- [x] Rate limiting thresholds are defined (5 attempts / 15 min, backoff after 3)
- [x] Audit logging events are enumerated (FR-011)
- [x] Multi-device session behaviour is defined (FR-013)
- [x] Edge cases are identified — token reuse attack added (US4 Scenario 4); email normalisation resolved (FR-001); JWT secret rotation deferred to v2
- [x] Email normalisation behaviour is defined — FR-001 updated: email lowercased and whitespace-trimmed before storage and all lookups
- [x] JWT required claims are specified — FR-003 mandates `sub`, `iat`, `exp`, `jti` in every access token payload

## Requirement Clarity

- [x] Success criteria are measurable (SC-001 through SC-007)
- [x] Security requirements reference OWASP standards (A07, A09)
- [x] Refresh token rotation behaviour is unambiguous (FR-004)
- [x] Error response parity for anti-enumeration is specified (FR-008)
- [x] "Generic error message" is specified verbatim — FR-008 defines exact body: `{ "error": "Invalid credentials" }` for both wrong password and unknown email
- [x] Audit log JSON schema is defined — FR-011 mandates fields: `event`, `timestamp` (ISO 8601), `userId` (SHA-256 hex of UUID), `ip`, `level`
- [x] "Non-reversible user identifier" is defined — FR-011 specifies SHA-256 hex of the internal user UUID

## Requirement Consistency

- [x] All user stories align with functional requirements
- [x] Password reset revokes all sessions (FR-007 consistent with User Story 3 Scenario 3)
- [x] Logout behaviour is asymmetric by design (per-session vs. logout-all)
- [x] FR-009 conflict resolved — FR-009 updated to explicitly defer to FR-013 for per-session logout semantics
- [x] SC-001 consistent with FR-003 — SC-001 updated: registration returns HTTP 201 confirmation only (no JWT); user must call `POST /auth/login` separately to obtain tokens

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] Key entities are defined with attributes (User, RefreshToken, PasswordResetToken)
- [x] External dependencies are declared (email service, rate limiting middleware)
- [x] Clarifications session completed (5/5 questions resolved)
- [x] Constitution principles are satisfied (TypeScript strict, 80% coverage, JSDoc)
- [x] Token reuse attack scenario is defined — User Story 4 Scenario 4: reuse of rotated token → HTTP 401 + all sessions revoked
- [x] Non-functional gaps addressed — HTTPS/TLS mandated (FR-014); throughput/RPS and availability SLA deferred to v2 (not required for v1 scope)
