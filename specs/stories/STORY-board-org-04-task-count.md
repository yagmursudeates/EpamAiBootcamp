# User Story: Display Task Count per Column

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-board-org-04
- Title: Display Task Count per Column

---

## 2. User Story

As a Solo Developer, I want to see the number of tasks in each column, so that I can gauge workload at a glance.

- Persona: Solo Developer
- Context / Preconditions: Task board is visible with one or more tasks

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN the task board is displayed, WHEN the user looks at each column header, THEN the count of tasks in that column is displayed (e.g., "To Do (5)", "In Progress (2)", "Done (1)").
2. AC-2: GIVEN a task is created, WHEN the task is added to a column, THEN the count for that column increments immediately.
3. AC-3: GIVEN a task is moved to another column, WHEN the move completes, THEN the count decrements for the source column and increments for the target column.
4. AC-4: GIVEN the board has no tasks in a column, WHEN the user inspects that column header, THEN the count shows 0 (e.g., "In Progress (0)").

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Filter tasks by status; use length of filtered array for count
  - Display count in column header using template: `{ColumnName} ({count})`
  - Update count reactively on task create, update, delete, move

- Data model changes:
  - No schema changes; computed from existing task list

- Performance considerations:
  - Use memoization or computed property to avoid unnecessary recalculations

- Testing notes:
  - Snapshot test: Count displays in column header
  - Functional test: Count updates on task create/move/delete
  - Edge case: Column with 0 tasks shows (0)

---

## 5. Estimation

- Estimate: 1 story point (or 0.25 day)
- Confidence: HIGH
- Assumptions used for estimate: Simple count calculation; minimal UI changes

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on board and task management; can be added quickly
- **Negotiable:** YES — Count display format, placement negotiable
- **Valuable:** YES — Provides quick workload visibility
- **Estimable:** YES — Simple feature; 0.25 day estimate
- **Small:** YES — Single UI addition; completable in minutes
- **Testable:** YES — Count accuracy and update behavior measurable

---

## Appendix / Links

- Related tickets: STORY-board-org-01 (Board Layout)
- Notes: Consider using CSS counter or JavaScript-based count; no external library needed
