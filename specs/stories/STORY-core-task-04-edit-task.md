# User Story: Edit Task Title and Description

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-core-task-04
- Title: Edit Task Title and Description

---

## 2. User Story

As a Solo Developer, I want to edit a task's title and description after creation, so that I can update details as work evolves.

- Persona: Solo Developer
- Context / Preconditions: At least one task exists on the board

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN a task card is visible, WHEN the user clicks on the task card, THEN an edit mode appears with title and description fields pre-populated with current values and focus on title.
2. AC-2: GIVEN the task is in edit mode, WHEN the user modifies the title or description and clicks "Save", THEN the task card updates with the new values.
3. AC-3: GIVEN the task is in edit mode, WHEN the user clicks "Cancel" or presses Escape, THEN the edit form closes without saving changes.
4. AC-4: GIVEN a task has been edited, WHEN the board is inspected, THEN the updated title and description are visible on the task card.

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Use modal or inline edit mode (inline preferred for simplicity)
  - Populate form with existing task data before user edits
  - Use same form component as create story (reuse validation)

- Data model changes:
  - Add `updatedAt` timestamp to Task object (optional for MVP)
  - Update task object in state on save

- Testing notes:
  - Component test: Edit form appears with correct pre-filled data
  - Unit test: Save operation updates task in state
  - Regression test: Verify create story still works after edit code added

---

## 5. Estimation

- Estimate: 3 story points (or 1 day)
- Confidence: MEDIUM
- Assumptions used for estimate: Reuses form component; modal/inline UI pattern defined

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on task creation (Story 01); can be done after core create
- **Negotiable:** YES — Edit UI pattern (modal vs inline), button labels, styling negotiable
- **Valuable:** YES — Users can refine task details; important for workflow
- **Estimable:** YES — Scope is clear; 1 day estimate
- **Small:** YES — Single task update feature; completable within sprint
- **Testable:** YES — Form fields update, save persists changes, cancel discards

---

## Appendix / Links

- Related tickets: STORY-core-task-01 (Create Task with Title)
- Depends on: STORY-core-task-01
- Notes: No edit history in MVP; consider "last edited" timestamp for future
