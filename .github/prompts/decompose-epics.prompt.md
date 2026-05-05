---
description: "Decompose PRD into Epics"
---

/ decompose-epics

Usage
Provide either a path to an existing PRD (relative to the repo root) or paste the PRD content after the command. Example:
/decompose-epics specs/prds/PRD-improve-onboarding.md

Or:
/decompose-epics
<paste full PRD markdown here>

Instructions for the assistant
1. Read the PRD provided (or at the path) and follow the epic template at specs/templates/epic-template.md exactly for formatting and sections.
2. Identify 3–4 high-level Epics that together implement the PRD. Each Epic must:
   - Deliver end-to-end user value (user can gain a tangible benefit when the epic ships)
   - Be independently deployable (has clear boundaries and minimal coupling)
   - Map to at least one Success Metric from the PRD (state the mapping)
   - Have clear scope and complexity estimate (S/M/L)
3. For each Epic, fill the epic-template.md fields: Title, Description (2–3 sentences), Primary Persona, Success Criteria (map to PRD metric), Scope/Complexity, Dependencies, and a User Stories placeholder.
4. Derive a short kebab-case name from the epic title and save each epic to: specs/epics/EPIC-{number}-{name}.md with number starting at 1. Example: specs/epics/EPIC-01-onboarding-email-verification.md
5. Include header metadata (Version, Author, Date) in each epic file. Use the current date if none provided.
6. If the PRD lacks explicit Success Metrics or primary persona, ask one concise clarifying question before generating the epics.
7. After creating files, output a short summary listing the saved file paths and any assumptions or missing info.

Quality checklist (validate before saving)
- Each epic delivers end-to-end value (YES/NO)
- Each epic maps to at least one PRD Success Metric (YES/NO) — list mapping
- Epics are independently deployable with clear boundaries (YES/NO)
- Scope/Complexity assigned (S/M/L) for each epic (YES/NO)

Output format
- Create 3–4 markdown files in specs/epics/ named EPIC-{NN}-{kebab-name}.md following specs/templates/epic-template.md.
- After file creation, print a concise list of created files and a 3-line summary: assumptions, missing info (if any), and saved filenames.

Notes for users
- Best results when PRD includes: primary persona, SMART success metrics, and a short prioritized feature list.
- If unsure, prefer asking one clarifying question rather than guessing.

