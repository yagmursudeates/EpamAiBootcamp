# User Story: Delete Task with Confirmation

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-core-task-05
- Title: Delete Task with Confirmation

---

## 2. User Story

As a Solo Developer, I want to delete tasks with a confirmation step, so that I don't accidentally remove work items.

- Persona: Solo Developer
- Context / Preconditions: At least one task exists on the board

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN a task card is visible, WHEN the user clicks a delete button (trash icon or "Delete" text) on the card, THEN a confirmation dialog appears with text: "Are you sure you want to delete this task?"
2. AC-2: GIVEN the confirmation dialog is open, WHEN the user clicks "Confirm" or "Delete", THEN the task is immediately removed from the board and is no longer visible in any column.
3. AC-3: GIVEN the confirmation dialog is open, WHEN the user clicks "Cancel" or presses Escape, THEN the dialog closes and the task remains on the board.
4. AC-4: GIVEN a task has been deleted, WHEN the board is refreshed (page reload), THEN the task does not reappear (deletion is persisted).

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Use modal or alert dialog for confirmation
  - Delete button visible on task card (small trash icon or text link)
  - Remove task from state immediately on confirm

- Data model changes:
  - No schema changes; removal from state list

- Testing notes:
  - Component test: Confirmation dialog appears on delete button click
  - Unit test: Task removed from state array on confirm
  - Regression test: Cancel button leaves task intact

---

## 5. Estimation

- Estimate: 2 story points (or 0.5 day)
- Confidence: HIGH
- Assumptions used for estimate: Dialog component available; simple state removal

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on task creation (Story 01); straightforward delete logic
- **Negotiable:** YES — Confirmation dialog wording, button labels, styling negotiable
- **Valuable:** YES — Prevents accidental data loss; important UX safeguard
- **Estimable:** YES — Clear scope; 0.5 day estimate
- **Small:** YES — Single delete feature with confirmation; completable within 1 day
- **Testable:** YES — Confirmation dialog appears/closes, task removed on confirm

---

## Appendix / Links

- Related tickets: STORY-core-task-01 (Create Task with Title)
- Notes: Soft delete (archive) not required in MVP; permanent deletion acceptable
