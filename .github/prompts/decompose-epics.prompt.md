---
description: "Decompose PRD into Epics"
---

You are a senior product manager and solutions architect. Your task is to decompose an existing PRD into 3–4 well-scoped Epics, each formatted using the project's Epic template.

## Instructions

1. **Read the Epic template** at `specs/templates/epic-template.md` to understand the required structure.
2. **Read the PRD** specified by the user (see `## Input` below).
3. **Identify 3–4 Epics** by applying the decomposition rules below.
4. **Apply the quality checklist** before producing output; revise until all items pass.
5. **Save each Epic** to `specs/epics/EPIC-{number}-{name}.md`, where `{number}` is zero-padded (e.g., `01`) and `{name}` is a kebab-case slug (e.g., `EPIC-01-user-authentication.md`).

Create the `specs/epics/` directory if it does not already exist.

---

## Input

> Provide the path to the PRD you want to decompose, or paste its contents directly.

[PRD PATH or PRD CONTENT]

---

## Decomposition Rules

Apply all four rules when carving out Epics. If a candidate Epic fails any rule, split or merge it until it passes.

### Rule 1 — End-to-End Value

Each Epic must deliver a slice of working software that provides visible value to at least one named persona from the PRD. An Epic that only sets up infrastructure or "enables" future work is not independently valuable — fold it into the first Epic that uses it.

### Rule 2 — Independent Deployability

Each Epic must be deployable to a staging environment and demonstrated to a stakeholder without depending on an in-progress sibling Epic. Shared foundations (database schema, auth) belong in the first Epic; later Epics may depend on completed ones.

### Rule 3 — Success Metric Traceability

Each Epic must map to at least one Success Metric from the PRD. Include the metric ID or name in the Epic's Success Criteria. If an Epic cannot be traced to any metric, it is likely out of scope — flag it and ask the user whether to include or defer it.

### Rule 4 — Clear Boundaries

For each Epic, the "Out of Scope" list must explicitly name at least two features that a reader might assume are included. This prevents scope creep during sprint planning.

---

## Quality Checklist

Verify each item before writing final output. Revise failing items before proceeding.

- [ ] **Count** — Exactly 3–4 Epics are produced (not more, not fewer unless the PRD scope justifies it).
- [ ] **Value** — Each Epic description names the persona who benefits and the outcome they receive.
- [ ] **Deployability** — Dependencies between Epics are captured in the Dependencies table; no circular dependencies exist.
- [ ] **Metric link** — Every Epic's Success Criteria section references at least one PRD Success Metric by name or ID.
- [ ] **Boundaries** — Each Epic's Out of Scope list contains at least two explicit exclusions.
- [ ] **Size** — Each Epic is sized S, M, or L with a one-sentence justification. No Epic is sized larger than L; if one would be, split it.
- [ ] **User Stories seeded** — Each Epic's User Stories table contains at least 2 placeholder stories in "As a / I want / so that" format, even if not yet fully refined.
- [ ] **IDs are sequential** — Epic IDs follow the format `EP-001`, `EP-002`, etc., matching the filenames.

---

## Output Format

Produce one Markdown file per Epic, following `specs/templates/epic-template.md` exactly. Add the following to each file:

- Set **Status** to `Draft` and fill in today's date.
- Set **Related PRD** to the path or filename of the source PRD.
- In the Description, include a sentence of the form:  
  `"This epic maps to the PRD success metric: [METRIC NAME]."`

After generating all Epic files, output a brief **Decomposition Summary** in the chat (do not save it to a file):

```
## Decomposition Summary

| Epic ID | Title | Size | PRD Metric | File |
|---------|-------|------|------------|------|
| EP-001  | ...   | M    | ...        | specs/epics/EPIC-01-....md |
```

This summary helps the user verify coverage before proceeding to story writing.
