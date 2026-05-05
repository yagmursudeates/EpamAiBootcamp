# User Story: Filter or Switch Between Projects

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-persistence-04
- Title: Filter or Switch Between Projects

---

## 2. User Story

As a Solo Developer, I want to view tasks for a specific project, so that I can focus on one project's work at a time.

- Persona: Solo Developer
- Context / Preconditions: Multiple projects exist with tasks assigned to them

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN the task board is open, WHEN the user inspects the board header, THEN a "Select Project" dropdown or filter button is visible.
2. AC-2: GIVEN the project selector is clicked, WHEN the dropdown opens, THEN a list of all available projects is shown (or "All Projects" option).
3. AC-3: GIVEN a specific project is selected, WHEN the selection completes, THEN only tasks belonging to that project are displayed in the board (tasks from other projects are hidden).
4. AC-4: GIVEN a project is selected, WHEN the page is refreshed, THEN the selected project is remembered and the board still shows only tasks from that project.
5. AC-5: GIVEN the user selects "All Projects", WHEN the selection completes, THEN all tasks from all projects are displayed.

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Track selected project in React state (e.g., `selectedProject: string | null`)
  - Filter task array by `task.project === selectedProject` before rendering columns
  - Persist selected project to localStorage or sessionStorage for remember-me behavior
  - Dropdown component reuses project list from Story 03

- Data model changes:
  - Optional: Add `selectedProject` field to app state

- Testing notes:
  - Functional test: Select project; verify only that project's tasks display
  - Persistence test: Refresh page; selected project remembered
  - Edge case: Project with no tasks (empty columns)

---

## 5. Estimation

- Estimate: 2 story points (or 0.5 day)
- Confidence: HIGH
- Assumptions used for estimate: Filtering logic simple; project list already exists (Story 03)

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on project management (Story 03); filtering logic decoupled
- **Negotiable:** YES — Filter UI (dropdown, buttons, sidebar), default project negotiable
- **Valuable:** YES — Enables project-focused workflows; important for multi-project users
- **Estimable:** YES — Filter logic straightforward; 0.5 day estimate
- **Small:** YES — Single filtering feature; completable within sprint
- **Testable:** YES — Filtered display accuracy, persistence measurable

---

## Appendix / Links

- Related tickets: STORY-persistence-03 (Multi-Project Support)
- Depends on: STORY-persistence-03
- Notes: Future: Add search/filter by task title in addition to project
