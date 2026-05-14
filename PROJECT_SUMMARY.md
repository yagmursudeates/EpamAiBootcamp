# Project Summary — InnovatEPAM Portal

## Overview

InnovatEPAM Portal is a full-stack employee innovation management platform that lets EPAM staff submit ideas with file attachments, save them as drafts, and track their progress through a structured multi-stage review pipeline. Administrators evaluate ideas using a 1–5 scoring system across four dimensions, with optional blind review mode to eliminate identity bias.

---

## Features Completed

### MVP Features (Phase 1)
- [x] **User Authentication** — Registration, login, JWT sessions (24 h), role-based routing (`submitter` → `/dashboard`, `admin` → `/admin`)
- [x] **Idea Submission** — Title, description, category (5 fixed), single file attachment (≤ 10 MB, 8 MIME types), server-side Zod validation
- [x] **File Attachment** — Stored outside web root, served via authenticated `GET /api/attachments/[id]` (owner + admin only)
- [x] **Idea Listing** — Submitter dashboard with status badges, empty state, own-ideas-only scoping
- [x] **Evaluation Workflow** — Admin evaluates with decision + notes; idea status updates immediately; notes visible to submitter

### Phases 2–7 Features

| Phase | Feature | Status | Time |
|---|---|---|---|
| Phase 2 | Smart Submission Forms (dynamic category fields) | ⏳ Specced, not yet implemented | ~30 min |
| Phase 3 | Multi-Media Support (multiple file types + previews) | ⏳ Specced, not yet implemented | ~45 min |
| Phase 4 | Draft Management (save, resume, submit later) | ✅ Complete | ~30 min |
| Phase 5 | Multi-Stage Review (Submitted → Screening → Under Review → Accepted/Rejected) | ✅ Complete | ~1 hr |
| Phase 6 | Blind Review (global anonymous evaluation toggle) | ✅ Complete | ~20 min |
| Phase 7 | Scoring System (1–5 ratings on 4 dimensions) | ✅ Complete | ~20 min |

**Phase 4 details:** Save incomplete ideas as `draft`, edit and resume across sessions, promote to `submitted` when ready; drafts invisible to admins even via direct URL.

**Phase 5 details:** 4-stage pipeline with stage-aware evaluation buttons; every transition logged immutably in `review_stage_history` with evaluator, timestamps, and notes; terminal-state re-open support.

**Phase 6 details:** Global `blind_mode` setting in `settings` table; `BlindModeToggle` client component with optimistic UI; per-idea `is_anonymous` flag persists independently of global toggle.

**Phase 7 details:** Score picker (4 × 5 buttons) in `EvaluationForm`; live arithmetic average; scores stored as JSON in `evaluations.scores`; bar indicator cards on both admin and submitter detail pages.

### Bonus Features (Beyond Roadmap)
- [x] **Email Notifications** — nodemailer + Ethereal SMTP integrated into the evaluate route; fire-and-forget with error logging; gated by `EMAIL_HOST` env var so the app works without email config
- [x] **Delete Ideas & Drafts** — Submitters can delete their own ideas or drafts from the dashboard with a confirmation dialog; `DELETE /api/ideas/[id]` with owner-only access control
- [x] **Per-Idea Anonymous Submission** — Submitters can mark individual ideas anonymous at creation time ("Submit anonymously" checkbox in `IdeaForm`); anonymous flag is immutable after submission and overrides global blind mode

---

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4 (`@theme inline` design tokens) |
| Component Library | shadcn/ui (Nova preset, Radix primitives) |
| Database | SQLite via `better-sqlite3` — single-file WAL mode |
| Authentication | NextAuth v5 beta — Credentials provider, JWT 24 h sessions |
| Validation | Zod — schemas shared between client and server |
| Email | nodemailer + Ethereal (fire-and-forget, env-gated) |
| Testing | Vitest v4 + React Testing Library + jsdom |
| Package Manager | npm |

**Architecture decisions:** See [specs/001-innovatepam-portal/adr/](specs/001-innovatepam-portal/adr/)
- ADR-001: Vitest + RTL chosen over manual walkthroughs
- ADR-002: In-app notifications deferred in favour of email-first delivery
- ADR-003: nodemailer + Ethereal for email delivery (bonus feature)

---

## Test Coverage

- **Tests passing**: 109 tests across 13 test files
- **Test strategy**: In-memory SQLite (`:memory:`) for all DB tests — never touches `innovatepam.db`
- **Coverage areas**: API route logic, DB schema validation, component rendering (RTL), scoring calculations, blind review toggle, anonymous submission

---

## Specification Artifacts

All specs live under [`specs/001-innovatepam-portal/`](specs/001-innovatepam-portal/):

```
specs/001-innovatepam-portal/
├── spec.md              # 11 user stories, 30 functional requirements, 12 success criteria
├── plan.md              # Architecture decisions, phase breakdown, SQL schema
├── tasks.md             # 100 tasks (T001–T100), all completed ✅
├── epics/               # 7 epics (EP-001–007)
├── stories/             # 11 user stories (US-001–011)
├── adr/                 # 3 Architecture Decision Records
├── contracts/api.md     # API contract (request/response shapes)
├── data-model.md        # DB schema and entity definitions
├── checklists/          # QA acceptance checklist
├── quickstart.md        # Developer quick-start guide
└── research.md          # Background research notes
```

---

## Transformation Reflection

### Before (Module 01)
I typically started coding immediately after reading a vague feature description — requirements were in my head, not written down. This led to scope creep, missed edge cases, and re-work when stakeholder expectations didn't match the output. "Done" meant "it works on my machine."

### After (Module 08)
Every feature now starts with a written spec: user stories with GWT acceptance criteria, functional requirements with FR-### IDs, and a tasks list that makes progress visible. I write tests before or alongside code (TDD), validate all API input at the boundary with Zod, and treat the spec as the source of truth — not the code. "Done" means all acceptance criteria pass and tests are green.

### Key Learning
Spec-Driven Development eliminates the most expensive kind of rework: building the wrong thing. Writing down *what* the feature must do — in concrete, testable GWT scenarios — before writing a single line of code forces clarity that saves far more time than it costs. The spec is also the most durable artifact: code changes, but a good spec explains *why*.

---

**Author**: Yagmur Sude Ates  
**Date**: 15 May 2026  
**Course**: A201 — Beyond Vibe Coding  
**Repository**: https://github.com/yagmursudeates/EpamAiBootcamp (branch: `course_project`)
