# User Story: [STORY TITLE]

**Story ID:** US-[###]  
**Epic:** [EP-### — Epic Title]  
**Author:** [AUTHOR NAME]  
**Date:** [YYYY-MM-DD]  
**Status:** [Draft | Ready | In Progress | Done]

---

## 1. User Story

<!-- Follow the standard format exactly. Replace each bracket section.
     - [persona]  → a role from the PRD (e.g., "submitter", "admin", "guest")
     - [action]   → what the user wants to do (start with a verb)
     - [benefit]  → the value or outcome the user gains (start with "I can" or "I don't have to…") -->

> As a **[persona]**,  
> I want **[action]**,  
> so that **[benefit]**.

---

## 2. Acceptance Criteria

<!-- Write 3–5 conditions that must ALL be true for this story to be considered done.
     Use "Given / When / Then" (BDD) or plain declarative statements.
     Each criterion must be independently verifiable by a tester with no ambiguity.
     Avoid criteria that say "works correctly" or "looks good" — be specific. -->

- [ ] **AC-1:** [Given [context], when [action], then [observable outcome].]
- [ ] **AC-2:** [Given [context], when [action], then [observable outcome].]
- [ ] **AC-3:** [Given [context], when [action], then [observable outcome].]
- [ ] **AC-4:** [Given [context], when [action], then [observable outcome]. — optional]
- [ ] **AC-5:** [Given [context], when [action], then [observable outcome]. — optional]

---

## 3. Technical Notes

<!-- Optional. Add implementation hints, constraints, or decisions relevant to this story.
     This section is for the development team — it should NOT restate acceptance criteria.
     Leave blank or remove if there is nothing relevant to note. -->

- **API / Endpoint:** [e.g., POST /api/[resource] — describe expected request/response shape if known]
- **Data / Schema:** [e.g., Requires a new `[field]` column on the `[table]` table]
- **Dependencies:** [e.g., Depends on US-### being merged; requires [library/service]]
- **Edge Cases:** [e.g., What happens when [unusual input or state]?]
- **Security:** [e.g., Endpoint must be authenticated; validate and sanitise all inputs]

---

## 4. Estimation

<!-- Choose story points OR days — be consistent within your team.
     Add a brief rationale so the estimate can be challenged during planning. -->

**Estimate:** [1 | 2 | 3 | 5 | 8 | 13 story points] — or — [[N] days]

**Rationale:** [One sentence explaining the effort level — e.g., straightforward CRUD with no external integrations]

---

<!--
═══════════════════════════════════════════════════
INVEST VALIDATION CHECKLIST (remove before merging)
═══════════════════════════════════════════════════
Use this checklist during backlog refinement to confirm the story is ready for a sprint.

[ ] INDEPENDENT   — This story can be developed and delivered without depending on
                    another in-progress story. (Reorder or split if there is tight coupling.)

[ ] NEGOTIABLE    — The HOW is open to discussion between the team and the product owner.
                    Only the WHAT and WHY are fixed.

[ ] VALUABLE      — The story delivers clear value to the persona named above.
                    If the benefit is vague, rewrite the "so that" clause.

[ ] ESTIMABLE     — The team has enough information to size this story.
                    If it cannot be estimated, it needs more detail or should be spiked first.

[ ] SMALL         — The story can be completed within one sprint (typically ≤ 5 story points
                    or ≤ 3 days). If larger, split it into smaller stories.

[ ] TESTABLE      — Every acceptance criterion can be verified by a tester independently.
                    If any AC contains "should", "might", or "could", make it concrete.
═══════════════════════════════════════════════════
-->
