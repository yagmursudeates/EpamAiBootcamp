# User Story: In-App Notifications

**Story ID:** US-005  
**Epic:** EP-003 — Engagement & Feedback  
**Author:** Engineering team  
**Date:** 2026-05-17  
**Status:** Ready for development

---

## 1. User Story

> As a **logged-in submitter**,  
> I want to **see a notification bell that shows unread alerts when my ideas are evaluated**,  
> so that **I am promptly informed about evaluation outcomes without checking each idea individually**.

---

## 2. Acceptance Criteria

- [ ] **AC-1:** Given a submitter with unread notifications, when they call `GET /api/notifications`, then the response contains an array of notification objects (`id`, `message`, `is_read`, `created_at`) for the authenticated user only.
- [ ] **AC-2:** Given the same endpoint called by a different user, then only that user's own notifications are returned (no cross-user data leakage).
- [ ] **AC-3:** Given a submitter with no notifications, when they call `GET /api/notifications`, then the response contains an empty array.
- [ ] **AC-4:** Given a submitter who wants to mark a single notification read, when they send `PATCH /api/notifications/[id]`, then that notification's `is_read` is set to `1` and the response returns the updated notification.
- [ ] **AC-5:** Given a `PATCH /api/notifications/[id]` for a notification not owned by the caller, then the server returns `403 Forbidden`.
- [ ] **AC-6:** Given a submitter who wants to mark all notifications read, when they send `PATCH /api/notifications` with body `{ markAllRead: true }`, then all their notifications have `is_read = 1`.
- [ ] **AC-7:** Given an unauthenticated request to any notification route, then the server returns `401 Unauthorized`.

---

## 3. Technical Notes

- **API / Endpoints:**
  - `GET /api/notifications` — returns all notifications for `session.user.id` ordered by `created_at DESC`
  - `PATCH /api/notifications/[id]` — sets `is_read = 1` for the specified notification after verifying ownership
  - `PATCH /api/notifications` — sets `is_read = 1` for ALL notifications belonging to `session.user.id`
- **Data / Schema:** `notifications` table: `id`, `user_id`, `message`, `is_read` (0/1 integer), `created_at`
- **Source files:**
  - `src/app/api/notifications/route.ts` — GET + PATCH (bulk) handlers
  - `src/app/api/notifications/[id]/route.ts` — PATCH (single) handler
- **Component:** `src/components/notifications/NotificationBell.tsx` — client component; fetches `GET /api/notifications` on mount; shows unread count badge; renders notification list in a dropdown; calls bulk PATCH on open.
- **Auth:** All routes require `getServerSession()` check; 401 if no session.
- **Security:** Ownership check for single-notification PATCH to prevent IDOR.
- **Dependencies:** US-001 (auth), US-004 (evaluate route creates notification rows)
- **ADR:** ADR-002 (In-App Notifications — accepted decision)

---

## 4. Estimation

**Estimate:** 4 story points

**Rationale:** Three route files (list, single patch, bulk patch), one client component, and thorough integration tests covering auth guards, isolation, and mark-read semantics.
