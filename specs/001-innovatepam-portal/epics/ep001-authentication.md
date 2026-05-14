# Epic: Authentication & Access Control

**Epic ID:** EP-001  
**Related PRD:** specs/001-innovatepam-portal/spec.md  
**Owner:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. Description

Establish the identity layer of the InnovatEPAM portal: visitor registration, credential-based login, role-aware session management, and protected-route enforcement. Every other epic depends on this foundation being secure and stable.

---

## 2. Primary Persona

**Persona:** EPAM Employee (Submitter)  
**Benefit:** Can securely access their personal dashboard and idea data without risk of another user seeing their submissions.

---

## 3. Success Criteria

- [x] A visitor can register with name, email, and password and receive role `submitter`.
- [x] A registered user can log in and is redirected to the correct role-based destination (`/dashboard` or `/admin`).
- [x] Invalid credentials return a user-visible error; no session is created.
- [x] JWT sessions expire after 24 hours; expired sessions redirect to `/login`.
- [x] A `submitter` navigating to any `/admin` route is redirected to `/dashboard`.

---

## 4. Scope / Complexity

**Size:** M — Medium (1–2 weeks)

**Justification:** Standard auth pattern but requires role-aware routing, bcrypt hashing, and NextAuth v5 JWT configuration — all well-understood but with meaningful integration surface.

### In Scope

- `/register` page and `POST /api/auth/register` endpoint
- `/login` page (NextAuth Credentials provider)
- JWT session with 24-hour expiry
- Role-based redirect on login (`submitter` → `/dashboard`, `admin` → `/admin`)
- `proxy.ts` route protection (edge-safe, no DB import)

### Out of Scope

- OAuth / SSO providers
- Password reset / forgot-password flow
- Email verification on registration
- Self-service admin account creation

---

## 5. Dependencies

| ID  | Dependency                              | Type        | Status |
|-----|-----------------------------------------|-------------|--------|
| D-1 | SQLite DB with `users` table            | Technical   | Done   |
| D-2 | NextAuth v5 beta installed              | Technical   | Done   |
| D-3 | bcryptjs for password hashing           | Technical   | Done   |

---

## 6. User Stories

| Story | Title                          | Priority | Status |
|-------|--------------------------------|----------|--------|
| US-001 | Employee Registration & Login | P1       | Done   |
