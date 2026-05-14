# User Story: Employee Registration & Login

**Story ID:** US-001  
**Epic:** EP-001 — Authentication & Access Control  
**Author:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. User Story

> As an **EPAM employee**,  
> I want to **register an account and log in with my credentials**,  
> so that **I can securely access the InnovatEPAM portal and submit or track my ideas**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given a visitor on `/register`, when they submit a valid name, email, and password (≥ 8 chars), then an account is created with role `submitter` and they are redirected to `/dashboard`.
- [x] **AC-2:** Given a visitor on `/register`, when they submit an email that already exists, then they see an inline error "Email already in use" and the form is not submitted.
- [x] **AC-3:** Given a registered `submitter` on `/login`, when they submit correct credentials, then they are redirected to `/dashboard`. Given a registered `admin`, then they are redirected to `/admin`.
- [x] **AC-4:** Given a registered user on `/login`, when they submit incorrect credentials, then they see "Invalid email or password" and no session is created.
- [x] **AC-5:** Given a logged-in user, when they click "Logout", then the session is destroyed and they are redirected to `/login`.
- [x] **AC-6:** Given an unauthenticated user, when they navigate to `/dashboard`, then they are redirected to `/login`.

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/auth/register` — creates user with bcrypt-hashed password. `POST /api/auth/signin` handled by NextAuth Credentials provider.
- **Data / Schema:** `users` table: `id`, `name`, `email` (UNIQUE), `password_hash`, `role` (DEFAULT `submitter`), `created_at`.
- **Dependencies:** NextAuth v5 beta, bcryptjs. Edge-safe `auth.config.ts` used in `proxy.ts`; full `auth.ts` used in API routes and server components.
- **Edge Cases:** Duplicate email returns 409. Session expiry (24 h) redirects to `/login` with original URL preserved in `callbackUrl`.
- **Security:** Passwords hashed with bcrypt (cost factor 12). JWT stored in an httpOnly cookie. No password stored in plaintext anywhere.

---

## 4. Estimation

**Estimate:** 3 story points

**Rationale:** Standard auth pattern with NextAuth. Role-aware redirect and edge-safe proxy add a small but meaningful integration challenge.
