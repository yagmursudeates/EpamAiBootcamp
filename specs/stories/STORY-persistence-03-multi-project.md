# User Story: Create and Manage Multiple Projects

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-persistence-03
- Title: Create and Manage Multiple Projects

---

## 2. User Story

As a Solo Developer, I want to create tasks under different projects, so that I can organize work across my concurrent projects.

- Persona: Solo Developer
- Context / Preconditions: User is creating a new task

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN the task creation form is open, WHEN the user inspects the form, THEN a "Project" dropdown or selector is visible.
2. AC-2: GIVEN the project selector is visible, WHEN the user clicks on it, THEN a list of existing projects appears (or option to create a new project).
3. AC-3: GIVEN a project is selected, WHEN the task is created, THEN the task is assigned to that project and persisted to localStorage with the project field populated.
4. AC-4: GIVEN a task card is displayed, WHEN the user inspects the card, THEN the assigned project is shown on the card (e.g., "Project: Web App").
5. AC-5: GIVEN the user creates a new project during task creation, WHEN the project is created, THEN the new project is available in the dropdown for future tasks.

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Add `project` field to Task object (string: project name or ID)
  - Create Project model with `id` and `name` fields
  - Store projects list in localStorage (e.g., "taskboard_projects")
  - Project dropdown uses data binding or static list

- Data model changes:
  - Task object: add `project: string` field
  - New Project object: `{ id: string, name: string, createdAt: timestamp }`
  - localStorage keys: "taskboard_tasks", "taskboard_projects"

- Testing notes:
  - Functional test: Create task with project selection; verify project persists
  - Data test: Multiple tasks can share same project
  - Edge case: Project with special characters (e.g., "C++", "Node.js")

---

## 5. Estimation

- Estimate: 3 story points (or 1 day)
- Confidence: MEDIUM
- Assumptions used for estimate: UI for project selection straightforward; no complex filtering in MVP

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on task creation (EPIC-01) and persistence (Story 01)
- **Negotiable:** YES — Project selector UI (dropdown, list, modal), creation flow negotiable
- **Valuable:** YES — Multi-project support critical for solo developers
- **Estimable:** YES — Scope is clear; 1 day estimate
- **Small:** YES — Project assignment logic; completable within sprint
- **Testable:** YES — Project assignment, persistence, display measurable

---

## Appendix / Links

- Related tickets: STORY-core-task-01 (Create), STORY-persistence-01 (Save)
- Depends on: STORY-persistence-01
- Notes: Project hierarchy (nested projects) not in MVP; project metadata (color, icon) deferred
