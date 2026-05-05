# Product Requirements Document (PRD) — Personal Task Board

Version: 1.0
Author: Copilot Assistant
Date: 2026-05-05

## Table of Contents
- Overview
- User Personas
- Use Cases
- Functional Requirements
- Non-Functional Requirements
- Success Metrics
- Scope

---

## 1. Overview

### Purpose
Provide a lightweight, frontend-only task board for solo developers who need a fast, low-friction way to manage tasks across 2–3 projects without heavyweight tools.

### Problem Statement
Developers waste 5–10 minutes setting up heavy issue trackers when they could start working immediately. Solo developers and students juggling 2–3 projects face friction from enterprise tools like Jira that require server setup, database management, and complex onboarding. They need a lightweight, frontend-only Kanban board that works in under 10 seconds with zero infrastructure.

### Goals
- Enable a solo developer to create and organize tasks across projects in under 5 minutes for initial setup.
- Support fast day-to-day task flow: create, move, and complete a task in under 60 seconds.
- Persist state reliably in browser localStorage across sessions.

---

## 2. User Personas (Who are we building for?)

- **Persona 1: Solo Developer**
  - Role: Full-stack developer managing personal projects
  - Key characteristics: Values speed and simplicity; avoids heavy tools; prefers keyboard efficiency; uses Chrome, Firefox, Safari on desktop
  - Needs: Quick task capture (< 10 sec), simple Kanban workflow, offline-first persistence, multi-project support
  - Pain Points: Jira/Asana too heavy; needs fast drag-drop task movement

- **Persona 2: Student Developer**
  - Role: Computer science student managing coursework, labs, and personal coding projects
  - Key characteristics: Multi-device user (laptop, tablet, phone); appreciates documentation; values accessibility; learns best with minimal friction
  - Needs: Track assignments and practice projects; keyboard navigation; responsive mobile layout; help documentation
  - Pain Points: Overwhelmed by feature-rich tools; needs accessibility and mobile support

Notes: No multi-user collaboration required for the MVP. Both personas are single-user, local-only workflows.

---

## 3. Use Cases (Key scenarios)

- Use Case: Create Task
  - Actor: Solo Developer
  - Preconditions: Board for project exists or user creates new project
  - Main Flow:
    1. User clicks "New Task" or presses shortcut
    2. Enters title/optional description and saves
    3. Task appears in "To Do"
  - Alternative Flows: Validation error if title empty
  - Postconditions: Task persisted in localStorage

- Use Case: Move Task via Drag & Drop
  - Actor: Solo Developer
  - Preconditions: Task exists in a column
  - Main Flow:
    1. User drags card to target column
    2. UI animates move and updates underlying data
  - Postconditions: New column state persisted

- Use Case: Keyboard Shortcut Task Management
  - Actor: Solo Developer
  - Preconditions: Board is focused
  - Main Flow:
    1. User presses shortcut to create, edit, or move task
    2. Action performs without mouse
  - Postconditions: Changes persisted and undoable where applicable

Repeat for import/export, search/filter, and project switching.

---

## 4. Functional Requirements (What the system must do)

- FR-001: The system shall provide a Kanban board with columns: To Do, In Progress, Done.
  - Acceptance Criteria: Board displays three columns by default; user can rename columns via settings.

- FR-002: The system shall allow creating, editing, and deleting tasks (cards).
  - Acceptance Criteria: New task dialog opens via button and keyboard shortcut; saved tasks appear in column and persist.

- FR-003: The system shall support drag-and-drop to reorder and move tasks between columns.
  - Acceptance Criteria: Dragging a card moves it visually and updates stored order; operations complete without page reload.

- FR-004: The system shall provide keyboard shortcuts for common actions (create task, move task, focus search).
  - Acceptance Criteria: Documented shortcuts in help overlay; keyboard flows perform the same state changes as mouse actions.

- FR-005: The system shall persist all boards, projects, and cards in browser localStorage and restore state on reload.
  - Acceptance Criteria: After reload, last-open board and all cards are restored exactly as before.

- FR-006: The system shall allow switching between multiple project boards (2–3 recommended)
  - Acceptance Criteria: Project selector exists; switching updates active board and persists selection.

- FR-007: The system shall provide a responsive mobile layout that adapts from 320px (mobile) to 1920px (desktop) widths.
  - Acceptance Criteria: Columns stack vertically on mobile; task cards display correctly on all screen sizes; touch targets are ≥44px.

- FR-008: The system shall provide a help section documenting all keyboard shortcuts and basic usage.
  - Acceptance Criteria: Help accessible from main UI (e.g., "?" icon); lists all shortcuts with descriptions; includes basic usage guide (<500 words).

- FR-009: The system shall support keyboard navigation (Tab, Shift+Tab) and keyboard-only workflows.
  - Acceptance Criteria: All interactive elements are keyboard focusable; focus indicators are visible; workflows (create, move, delete) completable via keyboard.

Dependencies: browser localStorage API, browser drag-and-drop or a lightweight DnD library, React 18 + Vite + TypeScript.

---

## 5. Non-Functional Requirements (Performance, security, etc.)

- Performance:
  - Target: App loads in < 2 seconds on modern browser (5 Mbps connection); task creation completes in < 10 seconds; task moves between columns in < 3 seconds.
  - Measurement: Lighthouse DevTools (average 5 loads); client-side timing instrumentation; user testing.

- Reliability & Availability:
  - Availability target: N/A (frontend-only). Data durability: 100% task recovery across page reloads and browser restarts.
  - localStorage quota: Monitor and handle quota exceeded errors gracefully.

- Security & Privacy:
  - Data stored locally only in browser localStorage; no data transmitted to servers.
  - Sensitive data: advise users not to store secrets in task descriptions.

- Scalability:
  - Expect up to 500 cards per user; ensure UI remains responsive via virtualization if necessary.

- Maintainability & Operability:
  - Code in TypeScript with unit tests for core logic; logging to console for client-side errors; include simple export/import JSON for backups.

- Accessibility:
  - Target: WCAG 2.1 Level AA compliance (0 critical/high violations).
  - Requirements: Keyboard navigation (Tab, focus management), ARIA labels, semantic HTML, color contrast ≥4.5:1, focus indicators visible.
  - Measurement: aXe/Lighthouse audit; manual screen reader testing (NVDA, JAWS, VoiceOver).

- Localization: English only for v1.

---

## 6. Success Metrics (How we measure success)

- **Metric 1: Task Creation Speed**
  - Target: 95% of task creation actions completed in < 10 seconds
  - Measurement Method: Instrument form submission; measure time from "New Task" click to task appearing in board
  - Owner: Engineering Lead

- **Metric 2: Task Move Speed**
  - Target: 95% of drag-and-drop move actions completed in < 3 seconds
  - Measurement Method: Measure drag-drop completion time from drop event to board update
  - Owner: Engineering Lead

- **Metric 3: Page Load Time**
  - Target: App loads in < 2 seconds on modern browser (5 Mbps connection)
  - Measurement Method: Browser DevTools Lighthouse, average across 5 page loads
  - Owner: Engineering Lead

- **Metric 4: Data Persistence & Recovery**
  - Target: 100% of task data persists across page reloads and browser close/reopen
  - Measurement Method: Manual test: create tasks → close browser → reopen → verify data intact
  - Owner: QA / Engineering

- **Metric 5: Accessibility Compliance**
  - Target: WCAG 2.1 Level AA compliance (0 critical/high violations)
  - Measurement Method: aXe/Lighthouse audit; manual keyboard navigation and screen reader testing
  - Owner: QA / Product

- **Metric 6: Code Coverage**
  - Target: ≥80% coverage for task CRUD and board logic
  - Measurement Method: Jest/Vitest coverage report
  - Owner: Engineering Lead

Baseline: Current time with heavy tools (Jira, Asana) >10 minutes for setup and first task.

---

## 7. Scope (What's in, what's out)

### In Scope
- Single-user Kanban boards with To Do / In Progress / Done columns
- Drag & drop task movement and reordering
- Keyboard shortcuts for all core workflows (Ctrl+N create, Alt+→/← move, Delete, Esc cancel)
- Full keyboard navigation and focus management
- Persistence in browser localStorage (JSON format)
- Multi-project support (assign tasks to projects, filter by project)
- Responsive mobile layout (320px–1920px)
- WCAG 2.1 Level AA accessibility compliance
- Help section with keyboard shortcut documentation
- Input validation and error handling
- Visual feedback on task operations (success messages, spinners)

### Out of Scope
- Multi-user collaboration and syncing across devices
- Server-side storage or backend authentication
- Cloud sync or backup
- Complex workflows (subtasks, dependencies, sprints, WIP limits)
- Rich text editing or markdown formatting
- Task priority, tags, or custom fields
- Time tracking or estimates
- Email notifications
- Dark mode or theme customization
- Export/import of task data (defer to v2)

### Assumptions
- Users run the app in a modern desktop browser with localStorage enabled.
- Solo developers will not require cross-device sync initially.

### Constraints
- **Frontend-only:** No backend; all persistent data stored in browser localStorage (~5–10 MB quota).
- **Browser support:** Chrome, Firefox, Safari (latest 2 versions); Edge (latest 2 versions)
- **Single-user scope:** No multi-user login, syncing, or collaboration
- **Timeline:** Lab prototype, 4-week delivery (May 5–June 2, 2026)
- **Tech stack:** React 18 + Vite + TypeScript (no external backends or complex infrastructure)

---

## Appendix
- Glossary: Kanban, Card, Board, localStorage
- Open Questions:
  - Do users need import formats (CSV, Trello JSON)?
  - Are mobile layouts required for v1?
- Related Documents: specs/templates/prd-template.md

---

## Quality Checklist
- Problem statement includes numbers or quantifiable impact: YES
- Primary personas are named and described: YES
- Goals are tied to measurable metrics: YES
- Success metrics are SMART with targets and owners: YES
- Functional requirements are atomic and testable: YES
- Scope clearly lists what's in and out: YES

---

Saved file: specs/prds/PRD-personal-task-board.md
