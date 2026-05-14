# ADR-003: Email Delivery via Nodemailer + Ethereal (Phase 3)

**Date**: 2026-05-14
**Status**: Accepted
**Deciders**: Engineering team
**Supersedes**: ADR-002 (extends, does not replace — in-app notifications are retained)

---

## Context

Phase 2 delivered in-app notifications. ADR-002 deferred email delivery with the note: _"When email is implemented (Phase 3+), add a `nodemailer` transport called from the same evaluate route handler after the DB write."_ Phase 3 now implements that path.

The key questions are:

1. Which SMTP provider to use for the course environment?
2. Should email sending block the HTTP response?
3. How do we keep the transport testable without hitting a real mail server?

---

## Decision

Use **nodemailer with an Ethereal test account** for SMTP transport. Send email **fire-and-forget** (non-blocking). Inject the transport via a module-level setter so tests can swap in a mock.

---

## Options Considered

| Option                 | Pro                                        | Con                                                   | Decision   |
| ---------------------- | ------------------------------------------ | ----------------------------------------------------- | ---------- |
| Nodemailer + Ethereal  | Zero cost, captures emails in web UI, easy | Not a real mail server; emails not delivered to inbox | ✓ Accepted |
| Nodemailer + real SMTP | Production-realistic                       | Requires credentials, billing, spam risk              | Deferred   |
| Resend / SendGrid SDK  | Modern API, good DX                        | External dependency, API key required                 | Deferred   |
| Log-only mock          | Trivial to implement                       | No way to verify email content outside tests          | Rejected   |
| AWS SES                | Scalable                                   | Requires AWS account, IAM config, overkill for course | Deferred   |

---

## Implementation

### Transport module (`src/lib/mailer.ts`)

```ts
import nodemailer from 'nodemailer'

let transport = nodemailer.createTransport({ ... }) // created from env vars

export function setTransport(t: nodemailer.Transporter) { transport = t }

export async function sendEvaluationEmail(to, subject, text) {
  if (!process.env.EMAIL_HOST) return   // FR-E07: skip when unconfigured
  await transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, text })
}
```

### Call site (`POST /api/ideas/[id]/evaluate`)

```ts
transact(); // DB write completes synchronously

sendEvaluationEmail(submitterEmail, subject, body).catch(console.error); // FR-E04: non-blocking, FR-E05: errors logged

return Response.json({ message: "Evaluation saved" });
```

### Environment variables

| Variable   | Example value                             |
| ---------- | ----------------------------------------- |
| EMAIL_HOST | smtp.ethereal.email                       |
| EMAIL_PORT | 587                                       |
| EMAIL_USER | \<ethereal username\>                     |
| EMAIL_PASS | \<ethereal password\>                     |
| EMAIL_FROM | InnovatEPAM \<noreply@innovatepam.local\> |

---

## Consequences

- New runtime dependency: `nodemailer` + `@types/nodemailer`
- No schema changes required (notification record already contains all needed data)
- No new API routes (piggybacked on existing evaluate route)
- Tests inject a mock transporter via `setTransport()` — no real SMTP calls in CI
- App runs normally without any email env vars configured (FR-E07 silent skip)
- `EMAIL_HOST` must be added to `.env.local` manually by the developer; it is gitignored
