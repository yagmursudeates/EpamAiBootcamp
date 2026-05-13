# User Story 10 — Email Notifications (Phase 3)

**Feature Branch**: `course_project`
**Created**: 2026-05-14
**Status**: Draft
**Priority**: P2
**Depends on**: US9 (in-app notifications, Phase 2)

---

## Overview

When an admin evaluates an idea, the submitter receives an email in addition to the existing in-app notification. The email is sent via `nodemailer` using an Ethereal test account (no real SMTP required). The email delivery is fire-and-forget — it must not block or fail the HTTP response if the transport is unavailable.

---

## Functional Requirements

| ID      | Requirement                                                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| FR-E01  | After every successful evaluation, an email is sent to the idea submitter's registered address.                                     |
| FR-E02  | The email subject is: `[InnovatEPAM] Your idea '{title}' was {decision}` (using human-readable decision text).                     |
| FR-E03  | The email body includes: the notification message, the idea title, and a direct link to the idea detail page.                       |
| FR-E04  | Email delivery is non-blocking — the API response is returned before/regardless of email send outcome.                              |
| FR-E05  | If email sending fails (SMTP error, missing config), the error is logged to the console and the HTTP response is unaffected.        |
| FR-E06  | SMTP credentials are read from environment variables: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`.         |
| FR-E07  | When `EMAIL_HOST` is not set, email sending is skipped silently (allows running the app without any email config).                  |
| FR-E08  | The email transport is injected via a module-level singleton so tests can replace it with a mock without monkey-patching.           |

---

## Environment Variables

Add to `innovatepam/.env.local`:

```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=<ethereal-username>
EMAIL_PASS=<ethereal-password>
EMAIL_FROM="InnovatEPAM <noreply@innovatepam.local>"
```

Generate Ethereal credentials at https://ethereal.email/create (one-time setup).

---

## Implementation Notes

- New module: `src/lib/mailer.ts` — exports `sendEvaluationEmail(to, subject, text)` and a `setTransport(t)` for test injection.
- Call `sendEvaluationEmail` in `POST /api/ideas/[id]/evaluate` **after** `transact()` completes. Use `.catch(console.error)` — do not `await` in the handler.
- Reuse `buildNotificationMessage()` from `src/lib/notifications.ts` for the email body text.
- The idea detail URL is `${process.env.NEXTAUTH_URL}/ideas/${ideaId}`.

---

## Out of Scope

- HTML email templates (plain text only for Phase 3)
- Email open/click tracking
- Unsubscribe functionality
- Bounce handling or delivery receipts
- Real production SMTP provider (Ethereal test account is sufficient)
- Email to admin on new idea submission

---

## Acceptance Scenarios

1. **Given** a valid SMTP config in env, **when** an admin submits an evaluation, **then** `sendEvaluationEmail` is called with the submitter's email and the correct subject/body.
2. **Given** `EMAIL_HOST` is not set in env, **when** an admin submits an evaluation, **then** no email is attempted and the API responds `200` normally.
3. **Given** the SMTP transport throws an error, **when** an admin submits an evaluation, **then** the error is caught and logged, and the API still responds `200`.
4. **Given** a test that injects a mock transport via `setTransport`, **when** `sendEvaluationEmail` is called, **then** the mock is used instead of the real transport and the call arguments are verifiable.
