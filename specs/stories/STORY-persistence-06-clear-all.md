# User Story: Clear All Tasks and Reset Board

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-persistence-06
- Title: Clear All Tasks and Reset Board

---

## 2. User Story

As a Solo Developer, I want a "Clear All" option in settings to reset the board, so that I can start fresh if needed.

- Persona: Solo Developer
- Context / Preconditions: User has accumulated tasks and wants to reset

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN the app is open, WHEN the user accesses the settings or menu, THEN a "Clear All" or "Reset Board" option is visible.
2. AC-2: GIVEN the user clicks "Clear All", WHEN the click occurs, THEN a confirmation dialog appears: "Delete all tasks? This cannot be undone."
3. AC-3: GIVEN the confirmation dialog is open, WHEN the user clicks "Confirm" or "Yes", THEN all tasks are deleted and localStorage is cleared.
4. AC-4: GIVEN all tasks are cleared, WHEN the board is inspected, THEN three empty columns display (board shows empty state).
5. AC-5: GIVEN tasks are cleared and the page is refreshed, WHEN the page loads, THEN no tasks reappear (deletion is persisted).

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Add settings menu or gear icon to app header
  - Create dialog component for confirmation
  - Delete all tasks from state and clear localStorage key(s)
  - Also clear projects list if desired (or keep projects, just delete tasks)

- Data model changes:
  - No schema changes; deletion of all records

- Testing notes:
  - Functional test: Clear all → confirm → board empty
  - Persistence test: Refresh page; no tasks reappear
  - Regression test: Verify other operations unaffected

---

## 5. Estimation

- Estimate: 2 story points (or 0.5 day)
- Confidence: HIGH
- Assumptions used for estimate: Dialog component available; simple delete all operation

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on persistence (Story 01); settings UI separate concern
- **Negotiable:** YES — Settings menu location, confirmation wording, reset scope (tasks only vs tasks+projects) negotiable
- **Valuable:** YES — Provides data reset capability; important for testing and user control
- **Estimable:** YES — Clear scope; 0.5 day estimate
- **Small:** YES — Single reset action; completable within sprint
- **Testable:** YES — Deletion confirmed, persistence verified, empty state displayed

---

## Appendix / Links

- Related tickets: STORY-persistence-01 (Save to Storage)
- Notes: Consider adding warning: "This action cannot be undone" in settings UI
