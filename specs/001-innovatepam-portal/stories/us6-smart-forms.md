# User Story: Smart Submission Forms

**Story ID:** US-006  
**Epic:** EP-004 — Enhanced Submission Experience  
**Author:** Engineering team  
**Date:** 2026-05-13  
**Status:** Draft

---

## 1. User Story

> As a **logged-in submitter**,  
> I want the **submission form to reveal additional fields specific to the category I select**,  
> so that **I can provide richer, structured information without being overwhelmed by irrelevant fields**.

---

## 2. Acceptance Criteria

- [ ] **AC-1:** Given a submitter on `/submit`, when they select "Technical", then additional fields for "Technology Stack" and "Implementation Complexity" appear without a page reload.
- [ ] **AC-2:** Given a submitter on `/submit`, when they select "Process Improvement", then additional fields for "Affected Department" and "Estimated Time Saving" appear.
- [ ] **AC-3:** Given a submitter on `/submit`, when they select "Client Solutions", then additional fields for "Target Client Segment" and "Revenue Impact" appear.
- [ ] **AC-4:** Given a submitter on `/submit`, when they change the selected category, then previously entered category-specific values are cleared.
- [ ] **AC-5:** Given a submitter submitting with category-specific fields visible, when they leave a required category field blank, then inline validation prevents submission.

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/ideas` — extend to accept `categoryMetadata` object alongside existing fields.
- **Data / Schema:** `ideas.category_metadata TEXT` (JSON) column needed. Zod schema extended with a discriminated union per category.
- **Dependencies:** US-002 (IdeaForm component), EP-001 (auth).
- **Edge Cases:** If the user returns to edit a draft with category-specific data, the correct fields must be pre-populated. Category change must clear only category-specific fields, not the shared fields.
- **Security:** `categoryMetadata` treated as user-supplied JSON — validate shape with Zod before storing; never eval or render as HTML.

---

## 4. Estimation

**Estimate:** 5 story points

**Rationale:** Requires a per-category field definition map, conditional rendering logic in `IdeaForm`, a Zod discriminated union for server validation, and a schema migration — plus test coverage for each category.
