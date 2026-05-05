# User Story: Move Task via Keyboard Shortcut

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-board-org-03
- Title: Move Task via Keyboard Shortcut

---

## 2. User Story

As a Solo Developer, I want keyboard shortcuts to move tasks between columns, so that I can manage tasks efficiently without a mouse.

- Persona: Solo Developer
- Context / Preconditions: Task board is visible; a task is focused/selected

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN a task is focused (highlighted or selected), WHEN the user presses Alt+Right Arrow, THEN the task moves to the next column (e.g., "To Do" → "In Progress").
2. AC-2: GIVEN a task is in "In Progress" and focused, WHEN the user presses Alt+Left Arrow, THEN the task moves to the previous column ("In Progress" → "To Do").
3. AC-3: GIVEN a task is in the "Done" column and focused, WHEN the user presses Alt+Right Arrow, THEN nothing happens (no movement; already in last column).
4. AC-4: GIVEN a task is in "To Do" and focused, WHEN the user presses Alt+Left Arrow, THEN nothing happens (no movement; already in first column).
5. AC-5: GIVEN shortcuts are used, WHEN the task moves, THEN the move completes within 1 second and updates the board visually.

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Add keyboard event listeners to task card or document level
  - Detect Alt key + Arrow keys
  - Update task status on key press
  - Maintain focus on task after move (or shift focus appropriately)

- Data model changes:
  - No schema changes; status update logic reused from drag-drop

- Testing notes:
  - Unit test: Keyboard event triggers status update (todo → inprogress → done)
  - Functional test: Alt+Right/Left moves task correctly
  - Edge case: Shortcut at column boundary does nothing
  - Accessibility test: Shortcuts work on all browsers (Chrome, Firefox, Safari)

---

## 5. Estimation

- Estimate: 3 story points (or 1 day)
- Confidence: HIGH
- Assumptions used for estimate: Event listener pattern familiar; no library dependency

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on board layout and task selection mechanism
- **Negotiable:** YES — Keyboard shortcut keys (could use different combinations), behavior on boundary negotiable
- **Valuable:** YES — Enables keyboard-only users to move tasks; important accessibility feature
- **Estimable:** YES — Clear scope; 1 day estimate
- **Small:** YES — Keyboard event handler; completable within sprint
- **Testable:** YES — Shortcut functionality, boundary behavior, timing measurable

---

## Appendix / Links

- Related tickets: STORY-board-org-01 (Board Layout), STORY-board-org-02 (Drag-Drop)
- Notes: Keyboard navigation (focus) part of EPIC-04 (Accessibility)
