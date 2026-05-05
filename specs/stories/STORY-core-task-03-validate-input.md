# User Story: Validate Task Input & Show Error Messages

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-core-task-03
- Title: Validate Task Input & Show Error Messages

---

## 2. User Story

As a Solo Developer, I want input validation to prevent creating tasks without a title, so that all tasks are meaningful and searchable.

- Persona: Solo Developer
- Context / Preconditions: Task creation form is open

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN the task creation form is open with title field empty, WHEN the user clicks "Create", THEN an inline error message appears: "Task title is required".
2. AC-2: GIVEN an error message is displayed, WHEN the user types in the title field, THEN the error message disappears automatically.
3. AC-3: GIVEN the user has entered a non-empty title, WHEN they click "Create", THEN the form submits successfully (no error message appears).
4. AC-4: GIVEN the task creation form has focus, WHEN the user presses Enter with a valid title, THEN the task is created (keyboard submission support).

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Use form validation library or custom validation hook
  - Display error message in red text near title input field
  - "Create" button disabled state optional; prefer validation on click

- Data model changes:
  - No schema changes; validation happens at form layer

- Testing notes:
  - Unit test: Validate function returns error for empty string
  - Component test: Error message appears/disappears correctly
  - Keyboard test: Enter key submits form with valid title

---

## 5. Estimation

- Estimate: 2 story points (or 0.5 day)
- Confidence: HIGH
- Assumptions used for estimate: Simple string length validation; no complex rules in MVP

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on task creation form existing; pairs with Story 01
- **Negotiable:** YES — Error message wording, styling, and placement can be refined
- **Valuable:** YES — Prevents invalid data entry; improves user experience
- **Estimable:** YES — Simple validation logic; 0.5 day estimate
- **Small:** YES — Focused on validation rules and error display; completable within 1 day
- **Testable:** YES — Error conditions are measurable; message appearance confirmed

---

## Appendix / Links

- Related tickets: STORY-core-task-01 (Create Task with Title)
- Depends on: STORY-core-task-01
- Notes: Validation is for form submission only; no real-time character counting in MVP
