# Role Context: PM — Personal Task Board

Version: 1.0
Date: 2026-05-13

---

## Your Role

You are defining and prioritising work for a **4-week lab prototype** (May 5 – June 2, 2026). The product is a frontend-only personal Kanban board for solo developers and students. There is no backend, no multi-user collaboration, and no cloud sync in scope for v1. Your outputs are PRDs, Epics, and Stories stored in `specs/`.

---

## Before Writing a Spec

1. Read the relevant template in `specs/templates/` — always use the template.
2. Read `memory-banks/domain/glossary.md` — use exact domain terms consistently.
3. Read `specs/prds/prd-personal-task-board.md` — confirm the new work is in scope.
4. Check `specs/epics/` — link the story to the correct epic.

---

## Spec File Conventions (from agents.md)

| Document type | File name pattern      | Location         |
| ------------- | ---------------------- | ---------------- |
| PRD           | `prd-<short-name>.md`  | `specs/prds/`    |
| Epic          | `epic-<short-name>.md` | `specs/epics/`   |
| Story         | `story-<ticket-id>.md` | `specs/stories/` |

Every spec file must start with:

```markdown
# [Title]

Version: 1.0
Author: [Name]
Date: YYYY-MM-DD
```

Use `[BRACKETED]` placeholders for fields to be filled in by a human author.

---

## Epics Overview

| Epic                                     | File                                                   | Status   |
| ---------------------------------------- | ------------------------------------------------------ | -------- |
| EPIC-01 Core Task Management             | `specs/epics/EPIC-01-core-task-management.md`          | In scope |
| EPIC-02 Task Board Organisation          | `specs/epics/EPIC-02-task-board-organization.md`       | In scope |
| EPIC-03 Data Persistence & Multi-Project | `specs/epics/EPIC-03-data-persistence-multiproject.md` | In scope |
| EPIC-04 UX & Accessibility               | `specs/epics/EPIC-04-ux-accessibility.md`              | In scope |

All epics are in scope for v1. No new epics should be created without updating the PRD scope section.

---

## Story Writing Guide

### What makes a good story

- **One user action or behaviour** per story — not a feature cluster
- **Acceptance criteria are independently testable** — each one can pass or fail without the others
- **No implementation detail** in the story body — describe what, not how
- **Linked to an epic** — every story references its parent epic ID

### Story template checklist

Before submitting a story for implementation:

- [ ] Title follows `story-<ticket-id>.md` naming
- [ ] Version, Author, Date header present
- [ ] User story sentence: "As a [persona], I want to [action] so that [outcome]"
- [ ] Acceptance criteria are specific, testable, and numbered
- [ ] Out of scope / non-goals section present (prevents scope creep)
- [ ] Epic link included
- [ ] No backend assumptions — localStorage only

### Acceptance Criteria Formula

```
Given [precondition]
When [user action]
Then [observable outcome]
```

**Good example:**

> Given the task dialog is open with an empty title field,
> when the user clicks Save,
> then an inline error message "Task title is required." is displayed and the task is not created.

**Bad example:**

> The app validates input. ← not testable, not specific

---

## Scope Boundaries

### In Scope for v1

- Single-user Kanban boards (To Do / In Progress / Done)
- Task CRUD with validation
- Drag-and-drop and keyboard move between columns
- Multi-project support (2–3 projects) with project selector
- Persistence in `localStorage` with reload recovery
- Responsive layout (320px–1920px)
- WCAG 2.1 Level AA accessibility
- Help overlay with keyboard shortcut documentation

### Hard Out of Scope (do not create stories for these)

- Multi-user collaboration or cross-device sync
- Server-side storage or authentication
- Subtasks, dependencies, WIP limits, sprints
- Rich text / markdown in task descriptions
- Task priority, tags, or custom fields
- Dark mode or theme customisation
- Export/import (defer to v2)
- Email notifications or push alerts

---

## Success Metrics Reference

Use these when writing acceptance criteria or defining "done" for an epic:

| Metric              | Target                                        |
| ------------------- | --------------------------------------------- |
| Task creation speed | 95% of actions < 10 s                         |
| Task move speed     | 95% of drag-drop actions < 3 s                |
| Page load time      | < 2 s on modern browser                       |
| Data persistence    | 100% recovery across reload and browser close |
| Accessibility       | WCAG 2.1 AA — 0 critical/high violations      |
| Test coverage       | ≥ 80% for task CRUD and board logic           |

---

## User Personas (quick reference)

### Persona 1: Solo Developer

- Values speed and simplicity
- Keyboard-first workflow
- Desktop browser (Chrome, Firefox, Safari)
- Needs: task capture < 10 s, fast drag-drop, multi-project, offline-first

### Persona 2: Student Developer

- Multi-device (laptop, tablet, phone)
- Values accessibility and documentation
- Needs: keyboard nav, responsive mobile layout, help documentation

Both personas are **single-user, local-only** — no collaboration features needed.

---

## Prioritisation Framework

For MVP within the 4-week timeline, prioritise stories that:

1. Unblock other stories (foundational CRUD before drag-drop)
2. Directly address a success metric
3. Are required for WCAG AA compliance (accessibility is non-negotiable)

Defer to v2:

- Nice-to-have polish (animations, advanced sorting)
- Export/import
- E2E test suite

---

## Related Files

- [agents.md](../../agents.md) — Spec conventions, naming rules, AI assistant guidance
- [domain/glossary.md](../domain/glossary.md) — Domain terms to use consistently in specs
- [specs/prds/prd-personal-task-board.md](../../specs/prds/prd-personal-task-board.md) — Full PRD with all FRs, NFRs, personas, and scope
- [specs/templates/](../../specs/templates/) — prd-template.md, epic-template.md, story-template.md
