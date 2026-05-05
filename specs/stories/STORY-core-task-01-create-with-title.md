# User Story: Create Task with Title

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-core-task-01
- Title: Create Task with Title

---

## 2. User Story

As a Solo Developer, I want to create a task by entering a title, so that I can quickly capture work items.

- Persona: Solo Developer
- Context / Preconditions: Task board is open; user sees the main board with three columns (To Do, In Progress, Done)

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN the task board is open, WHEN the user clicks the "Add Task" button, THEN a task creation form appears with a title input field focused and ready for input.
2. AC-2: GIVEN the task creation form is open, WHEN the user enters a task title (e.g., "Fix login bug") and clicks "Create", THEN a new task card appears in the "To Do" column within 2 seconds.
3. AC-3: GIVEN a task was successfully created, WHEN the creation completes, THEN the form clears and closes automatically.
4. AC-4: GIVEN a task is displayed in the "To Do" column, WHEN the user inspects the task card, THEN the task title matches what was entered.

---

## 4. Technical Notes (optional)

- Implementation hints: 
  - Use React form component with controlled input state
  - Task should default to "To Do" status
  - Generate unique task ID (uuid or timestamp-based)
  - Store task in React state; integrate with persistence layer (EPIC-03)

- Data model changes: 
  - Task object shape: `{ id, title, description, status: "todo" | "inprogress" | "done", project, createdAt }`
  - Form validation: title must be non-empty

- Testing notes: 
  - Unit test: Form submission with valid title creates task
  - Component test: Task appears in "To Do" column after creation
  - Edge case: Multiple rapid submissions should create separate tasks

---

## 5. Estimation

- Estimate: 3 story points (or 1 day)
- Confidence: HIGH
- Assumptions used for estimate: Form component library available; no complex styling required

---

## 6. INVEST Validation Checklist

- **Independent:** YES — Can be developed independently; does not depend on edit, delete, or board movement features
- **Negotiable:** YES — Form layout, button placement, and styling can be discussed during refinement
- **Valuable:** YES — Delivers core user value; users can create and see tasks
- **Estimable:** YES — Clear, small scope; estimated at 1 day
- **Small:** YES — Single feature: create form + task display; completable in 1 sprint
- **Testable:** YES — Acceptance criteria are specific and measurable (title appears, form clears, task in "To Do")

---

## Appendix / Links

- Related tickets: EPIC-01-core-task-management.md
- Mockups / Figma: [To be added]
- Dependencies: EPIC-03 (localStorage persistence, optional for MVP)
- Notes: Keep form minimal (title + optional description in follow-up story); no priority, tags, or due dates in MVP
