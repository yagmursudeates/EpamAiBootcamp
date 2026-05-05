# User Story: Move Task via Drag and Drop

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-board-org-02
- Title: Move Task via Drag and Drop

---

## 2. User Story

As a Solo Developer, I want to drag a task card to another column, so that I can quickly update task status.

- Persona: Solo Developer
- Context / Preconditions: Task board is visible with at least one task in any column

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN a task card is visible, WHEN the user clicks and holds on the task card, THEN the card enters drag mode and becomes semi-transparent or shows a drag indicator.
2. AC-2: GIVEN a task is being dragged, WHEN the user hovers over another column, THEN the target column shows a drop zone visual indicator (highlight, border, or background change).
3. AC-3: GIVEN a task is dragged and dropped into a target column, WHEN the drop completes, THEN the task moves to the target column and updates its status (e.g., "to do" → "inprogress").
4. AC-4: GIVEN a task move completes, WHEN the user inspects the board, THEN the move happens within 3 seconds from drop to visual update.
5. AC-5: GIVEN a task is dropped outside a valid column, WHEN the drop occurs, THEN the task returns to its original column (no change).

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Use native HTML5 drag API or react-beautiful-dnd library
  - Set draggable="true" on task card element
  - Implement dragover, drop event handlers on columns
  - Update task status on successful drop

- Data model changes:
  - Update task.status property on drop: "todo" | "inprogress" | "done"

- Performance considerations:
  - Debounce dragover events to avoid excessive re-renders
  - Test with 100+ tasks; ensure drag performance remains smooth

- Testing notes:
  - Functional test: Drag task from column A to column B; verify status updates
  - Performance test: Drag-drop with 100 tasks; measure time to update (< 3 sec)
  - Edge case: Drop outside columns; task snaps back to original

---

## 5. Estimation

- Estimate: 5 story points (or 1.5 days)
- Confidence: MEDIUM
- Assumptions used for estimate: Drag-drop library available or native API sufficient; styling defined

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on board layout (Story 01) and task creation
- **Negotiable:** YES — Drag handle styling, drop indicator appearance negotiable
- **Valuable:** YES — Core workflow; primary way to update task status
- **Estimable:** YES — Scope is clear but complexity medium; 1.5 day estimate
- **Small:** YES — Focused drag-drop feature; completable within sprint
- **Testable:** YES — Task movement, status update, timing measurable

---

## Appendix / Links

- Related tickets: STORY-board-org-01 (Board Layout)
- Notes: Touch support (mobile drag-drop) deferred to EPIC-04 (Accessibility)
