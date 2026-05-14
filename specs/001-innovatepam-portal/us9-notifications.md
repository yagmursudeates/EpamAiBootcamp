# User Story 9 — In-App Notifications (Phase 2)

**Feature Branch**: `course_project`
**Created**: 2026-05-14
**Status**: Accepted
**Priority**: P2
**Depends on**: US1 (auth), US5 (evaluation workflow)

---

## Overview

When an admin evaluates an idea, the submitter receives an in-app notification informing them of the status change. A bell icon in the Navbar shows the unread count. Clicking the bell reveals all notifications; clicking a notification marks it read and navigates to the idea.

---

## Functional Requirements

| ID     | Requirement                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| FR-N01 | A notification is created for the idea submitter whenever an evaluation is saved (under_review, accepted, rejected). |
| FR-N02 | The Navbar bell icon shows an unread count badge. Badge is hidden when count is 0.                                   |
| FR-N03 | Clicking the bell opens a dropdown listing all notifications (newest first).                                         |
| FR-N04 | Each notification shows: message text, idea title, time since creation, and read/unread state.                       |
| FR-N05 | Clicking a notification marks it as read and navigates to the idea detail page.                                      |
| FR-N06 | Notifications are user-scoped: each user sees only their own.                                                        |
| FR-N07 | A "Mark all as read" action clears the unread badge.                                                                 |

---

## Schema Addition

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idea_id    TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  is_read    INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## API Contracts

| Method | Path                      | Auth              | Description                                        |
| ------ | ------------------------- | ----------------- | -------------------------------------------------- |
| GET    | `/api/notifications`      | Any authenticated | List notifications for current user (newest first) |
| PATCH  | `/api/notifications/[id]` | Owner only        | Mark single notification as read                   |
| PATCH  | `/api/notifications`      | Any authenticated | Mark all as read                                   |

---

## Acceptance Scenarios

1. **Given** an admin evaluates idea X as `accepted`, **When** the evaluation is saved, **Then** the idea submitter has a new unread notification with message "Your idea 'X' was accepted."

2. **Given** an admin evaluates idea X as `rejected`, **When** the evaluation is saved, **Then** the submitter has a notification "Your idea 'X' was rejected."

3. **Given** an admin evaluates idea X as `under_review`, **When** the evaluation is saved, **Then** the submitter has a notification "Your idea 'X' is now under review."

4. **Given** the submitter has unread notifications, **When** they view the Navbar, **Then** the bell icon shows the correct unread count badge.

5. **Given** the submitter has 0 unread notifications, **When** they view the Navbar, **Then** no badge is shown.

6. **Given** a notification in the bell dropdown, **When** the user clicks it, **Then** the notification is marked as read and they are navigated to the idea detail.

7. **Given** multiple unread notifications, **When** the user clicks "Mark all as read", **Then** the unread count resets to 0.

8. **Given** a notification for user A, **When** user B queries `/api/notifications`, **Then** user A's notification is not returned.

---

## Out of Scope (Phase 2)

- Email delivery (deferred — see ADR-002)
- Push / WebSocket real-time updates (deferred)
- Notifications for comment activity (Phase 3)
