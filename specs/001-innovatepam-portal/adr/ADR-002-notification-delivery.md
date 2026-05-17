# ADR-002: Notification Delivery — In-App Only (Phase 2)

**Date**: 2026-05-14
**Status**: Accepted
**Deciders**: Engineering team

---

## Context

Phase 2 introduces user notifications triggered by admin evaluation events. The question is whether to deliver notifications via email, in-app UI, or both.

## Decision

Implement **in-app notifications only** for Phase 2. Email delivery is deferred.

### Rationale

| Option                        | Pro                                     | Con                                             | Decision   |
| ----------------------------- | --------------------------------------- | ----------------------------------------------- | ---------- |
| Email (nodemailer + Ethereal) | Realistic                               | Requires SMTP config, test account, async queue | Deferred   |
| Email (mock/log-only)         | Simple                                  | No real value; misleading                       | Rejected   |
| In-app (SQLite + polling)     | Self-contained, testable, works offline | No real-time push                               | ✓ Accepted |
| WebSocket / SSE               | Real-time                               | Significant complexity for course scope         | Deferred   |

### Implementation

- `notifications` table in SQLite (user-scoped, idea-linked)
- Created atomically inside the existing `POST /api/ideas/[id]/evaluate` transaction
- Read via `GET /api/notifications` (client polls on bell open)
- `NotificationBell` client component in Navbar fetches on mount + on dropdown open
- Mark-read via `PATCH /api/notifications/[id]` and `PATCH /api/notifications` (bulk)

### Email deferral path

When email is implemented (Phase 3+), add `nodemailer` transport called from the same evaluate route handler after the DB write. The notification record already contains all needed context.

## Consequences

- New `notifications` table migration added to `schema.sql` (additive, idempotent)
- No new runtime dependencies required
- `POST /api/ideas/[id]/evaluate` gains a side-effect: insert notification row
