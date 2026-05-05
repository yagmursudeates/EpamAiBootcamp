# Project Brief: Personal Task Board

## Executive Summary

A lightweight, frontend-only React task board application for solo developers and students to manage work across multiple small projects without enterprise tool overhead. No backend required; all data persists locally using browser localStorage.

---

## Problem Statement

Solo developers and students struggle with existing task management tools because they are:
- **Too heavy** — Require server setup, database management, complex onboarding
- **Overkill for small projects** — Enterprise features like Jira create friction for 1–3 concurrent projects
- **Require accounts/infrastructure** — Add friction when just needing a simple local tool

**Target Users:**
- Solo Developer: manages 2–3 personal projects; values speed and simplicity
- Student Developer: tracks coursework, coding assignments, personal practice projects

**Impact:** Developers spend 5–10 minutes setting up project management tools when they could start working in 10 seconds.

---

## Solution Overview

**Personal Task Board** — A React + Vite web app (no backend) where developers:
1. Create tasks with title and optional description
2. Organize tasks in a three-column Kanban board (To Do / In Progress / Done)
3. Move tasks via drag-and-drop or keyboard shortcuts
4. Manage tasks across multiple projects with filtering
5. Persist all data locally to browser localStorage

**No server, no accounts, no setup. Pure frontend simplicity.**

---

## Core Features

### MVP (Lab Prototype)
- ✅ Three-column task board (To Do, In Progress, Done)
- ✅ Create, edit, delete tasks with title and description
- ✅ Drag-and-drop task movement between columns
- ✅ Keyboard shortcuts for common workflows (Ctrl+N create, Alt+→/← move, Delete)
- ✅ Multi-project support (assign tasks to projects, filter by project)
- ✅ localStorage persistence (data survives page reload, browser close/reopen)
- ✅ Responsive mobile layout
- ✅ Keyboard navigation and WCAG 2.1 Level AA accessibility
- ✅ Help section with keyboard shortcut documentation

### Out of Scope
- User authentication or multi-user collaboration
- Cloud sync or backend persistence
- Rich text editing or markdown
- Task priority, tags, or complex relationships
- Time tracking or estimates
- Email notifications
- Dark mode / theme customization

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 18 |
| **Build Tool** | Vite |
| **Language** | TypeScript |
| **Persistence** | Browser localStorage (JSON) |
| **Backend** | None |
| **Authentication** | None (local/single-user) |

---

## Key Metrics & Targets

| Metric | Target | How to Measure |
|--------|--------|---|
| Task Creation Speed | Create task in < 10 seconds (95% of users) | Instrument form submission; measure time to first task display |
| Task Move Speed | Move task between columns in < 3 seconds (95% of moves) | Measure drag-drop completion time from drop event to board update |
| Page Load Time | Load in < 2 seconds on modern browser (5 Mbps connection) | Browser DevTools Lighthouse, average across 5 loads |
| Data Persistence | 100% task recovery after page reload/browser restart | Manual test: create tasks, close browser, reopen, verify data intact |
| Accessibility Compliance | WCAG 2.1 Level AA (0 critical/high violations) | aXe, Lighthouse, manual screen reader testing |
| Code Coverage | ≥80% for task CRUD and board logic | Jest/Vitest coverage report |

---

## User Personas

### Persona 1: Solo Developer
- **Role:** Full-stack developer managing personal projects
- **Characteristics:** Values speed, simplicity, minimal setup friction
- **Pain Points:** Heavy tools like Jira; needs quick task capture and drag-drop organization
- **Goals:** Manage 2–3 projects with fast task creation and visual board

### Persona 2: Student Developer
- **Role:** Computer science student balancing coursework and practice projects
- **Characteristics:** Multi-device user (laptop, tablet, phone); appreciates documentation and learning resources
- **Pain Points:** Overwhelmed by feature-rich tools; needs accessibility and mobile support
- **Goals:** Track assignments, labs, and personal projects; work efficiently on any device

---

## Success Criteria (MVP)

✅ Users can create a task in < 10 seconds
✅ Users can move a task between columns in < 3 seconds via drag-drop or keyboard
✅ Task data persists reliably across browser sessions
✅ Board is fully usable via keyboard (no mouse required)
✅ Board works responsively on mobile (320px–1920px widths)
✅ App loads in < 2 seconds on modern browsers
✅ WCAG 2.1 Level AA accessibility compliance verified

---

## Deliverables (Lab Prototype)

### Phase 1: Core (Weeks 1–2)
- [x] PRD and epics (EPIC-01, EPIC-02, EPIC-03, EPIC-04)
- [ ] React component architecture and state management
- [ ] Task CRUD operations (create, edit, delete)
- [ ] Three-column board layout with task cards

### Phase 2: Interaction (Week 2–3)
- [ ] Drag-and-drop task movement
- [ ] Keyboard shortcuts (create, move, delete)
- [ ] localStorage persistence
- [ ] Multi-project support with filtering

### Phase 3: Polish (Week 3–4)
- [ ] Responsive mobile layout
- [ ] Keyboard navigation and focus management
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Help documentation and keyboard shortcut guide
- [ ] Testing (unit, integration, e2e)

---

## Related Documentation

- **PRD:** [specs/prds/prd-personal-task-board.md](specs/prds/prd-personal-task-board.md)
- **Epics:**
  - [specs/epics/EPIC-01-core-task-management.md](specs/epics/EPIC-01-core-task-management.md)
  - [specs/epics/EPIC-02-task-board-organization.md](specs/epics/EPIC-02-task-board-organization.md)
  - [specs/epics/EPIC-03-data-persistence-multiproject.md](specs/epics/EPIC-03-data-persistence-multiproject.md)
  - [specs/epics/EPIC-04-ux-accessibility.md](specs/epics/EPIC-04-ux-accessibility.md)
- **Stories:** [specs/stories/](specs/stories/) (25 user stories across 4 epics)
- **Templates:** [specs/templates/](specs/templates/)
- **Agents:** [agents.md](agents.md) — project conventions

---

## Assumptions

- React 18 + Vite + TypeScript development environment is configured and ready
- Target browsers: Chrome, Firefox, Safari (latest 2 versions)
- localStorage API available and enabled in all target browsers
- Single-user, local-only scope (no server, no multi-user sync)
- Developers are comfortable with keyboard navigation
- MVP scope: lab prototype, not production-grade multi-tenant system

---

## Open Questions

- Should projects be user-created or predefined set?
- Should project metadata include color/icon, or just name?
- Should app support dark mode in MVP or defer?
- Should task reordering within columns be supported (task priority)?
- Should export/import of tasks be included?

---

## Notes

- **Start Date:** May 5, 2026
- **Timeline:** Lab prototype, completed within module (4 weeks estimated)
- **Ownership:** Team (dev, design, QA)
- **Priority:** MVP scope; all features in scope list are required for prototype completion
