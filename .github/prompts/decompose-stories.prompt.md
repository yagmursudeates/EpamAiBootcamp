---
description: "Break Epic into User Stories"
---

You are a senior product manager and agile coach. Your task is to decompose an existing Epic into 5–7 User Stories, each formatted using the project's User Story template.

## Instructions

1. **Read the User Story template** at `specs/templates/story-template.md` to understand the required structure.
2. **Read the Epic** specified by the user (see `## Input` below). Note the Epic ID, primary persona, success criteria, and any placeholder stories already listed.
3. **Produce 5–7 User Stories** by applying the decomposition rules and INVEST checklist below.
4. **Apply the quality checklist** before writing final output; revise failing items before proceeding.
5. **Save each story** to `specs/stories/STORY-{epic}.{number}-{name}.md`, where:
   - `{epic}` is the zero-padded Epic number (e.g., `01`)
   - `{number}` is the zero-padded story sequence within the Epic (e.g., `01`, `02`)
   - `{name}` is a kebab-case slug of the story title (e.g., `register-account`)
   - Example: `specs/stories/STORY-01.03-register-account.md`

Create the `specs/stories/` directory if it does not already exist.

---

## Input

> Provide the path to the Epic you want to decompose, or paste its contents directly.

[EPIC PATH or EPIC CONTENT]

---

## Decomposition Rules

Apply all rules when writing each story. A story that fails any rule must be revised or split before it is saved.

### Rule 1 — Single Persona, Single Action

Each story is written from the perspective of exactly one named persona (use a persona from the parent Epic or its PRD). The action must be a single, atomic thing the user does — not a workflow or a list of features.

### Rule 2 — Completable in 1–3 Days

If a story would take more than 3 developer-days to implement, split it into two smaller stories. Prefer thin vertical slices (UI + API + DB for one small feature) over horizontal layers (e.g., "build all API endpoints").

### Rule 3 — Acceptance Criteria are Testable

Write exactly 3–5 acceptance criteria per story using Given/When/Then format. Each criterion must describe an observable, deterministic outcome. Reject vague language: "works correctly", "is fast", "looks good" are not acceptable.

### Rule 4 — Benefit is Explicit

The "so that [benefit]" clause must describe a concrete outcome for the persona — not a technical outcome. Bad: "so that the data is stored". Good: "so that I can return to my draft later without losing progress".

### Rule 5 — No Overlap

Stories within the same Epic must not duplicate functionality. If two candidate stories cover the same behaviour, merge them or tighten the scope of each so boundaries are clear.

---

## INVEST Checklist (applied per story)

Before finalising each story, verify:

- [ ] **Independent** — Can be developed without depending on another in-progress story in this Epic.
- [ ] **Negotiable** — The "how" is open; only the "what" and "why" are fixed.
- [ ] **Valuable** — Delivers a visible outcome to the named persona when deployed alone.
- [ ] **Estimable** — The team has enough information to size it (≤ 3 story points or ≤ 3 days).
- [ ] **Small** — Fits within one sprint; if not, split it.
- [ ] **Testable** — Every acceptance criterion is independently verifiable by a tester.

---

## Quality Checklist

Verify every item across the full set of stories before writing final output.

- [ ] **Count** — Between 5 and 7 stories are produced.
- [ ] **Format** — Every story uses the exact "As a / I want / so that" format; no deviations.
- [ ] **Size** — Every story is estimated at ≤ 3 story points (or ≤ 3 days) with a one-sentence rationale.
- [ ] **AC count** — Each story has exactly 3–5 acceptance criteria; none uses vague language.
- [ ] **Benefit clause** — Every "so that" clause names a persona-level outcome, not a technical side effect.
- [ ] **Epic traceability** — Each story file references the parent Epic ID in its frontmatter.
- [ ] **No overlap** — No two stories in the set describe the same user action or outcome.
- [ ] **IDs are sequential** — Story IDs follow `US-{epic}{number}` (e.g., `US-0101`, `US-0102`).

---

## Output Format

Produce one Markdown file per story, following `specs/templates/story-template.md` exactly. Add the following to each file:

- Set **Status** to `Draft` and fill in today's date.
- Set **Epic** to the parent Epic ID and title (e.g., `EP-001 — User Authentication`).
- Set **Story ID** using the format `US-{epic}{number}` (e.g., `US-0101`).

After generating all story files, output a brief **Decomposition Summary** in the chat (do not save it to a file):

```
## Story Decomposition Summary

| Story ID | Title | Persona | Estimate | File |
|----------|-------|---------|----------|------|
| US-0101  | ...   | ...     | 2 pts    | specs/stories/STORY-01.01-....md |
```

This summary helps verify full Epic coverage and total sprint load before refinement.
