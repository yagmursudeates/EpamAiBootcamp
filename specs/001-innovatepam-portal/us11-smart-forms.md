# User Story 11 — Smart Submission Forms / Dynamic Category Fields (Course Phase 2)

**Feature Branch**: `course_project`
**Created**: 2026-05-14
**Status**: Draft
**Priority**: P2
**Depends on**: US2 (idea submission), Phase 1 MVP

---

## Overview

When a submitter selects a category on the idea submission form, 2 additional
category-specific fields appear dynamically. The values are stored as JSON in the
existing `category_metadata` column and are displayed on the idea detail page for
both submitters and admins.

---

## Functional Requirements

| ID      | Requirement                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------- |
| FR-S01  | Selecting a category reveals exactly 2 additional fields specific to that category.                  |
| FR-S02  | Switching category clears the previously filled dynamic field values.                                |
| FR-S03  | Dynamic field values are submitted as `categoryMetadata` and stored in `category_metadata` as JSON.  |
| FR-S04  | Dynamic fields are optional — the form can be submitted without filling them.                        |
| FR-S05  | The idea detail page (submitter + admin) displays filled category metadata as labelled key-value rows.|

---

## Category Field Definitions

| Category             | Field key            | Label                       | Type     | Options (if select)                                              |
| -------------------- | -------------------- | --------------------------- | -------- | ---------------------------------------------------------------- |
| Technical            | `techStack`          | Technology / Stack          | text     | —                                                                |
| Technical            | `estimatedTimeline`  | Estimated Timeline          | select   | 1 week, 1 month, 3 months, 6+ months                            |
| Process Improvement  | `currentProcess`     | Current Process Description | textarea | —                                                                |
| Process Improvement  | `estimatedGain`      | Estimated Efficiency Gain   | text     | —                                                                |
| Client Solutions     | `clientIndustry`     | Client Industry / Sector    | text     | —                                                                |
| Client Solutions     | `problemSolved`      | Problem Being Solved        | text     | —                                                                |
| Cost Reduction       | `currentCost`        | Current Annual Cost         | text     | —                                                                |
| Cost Reduction       | `projectedSavings`   | Projected Savings           | text     | —                                                                |
| Employee Experience  | `targetAudience`     | Target Audience             | text     | —                                                                |
| Employee Experience  | `impactArea`         | Impact Area                 | select   | Wellbeing, Productivity, Learning & Development, Diversity & Inclusion |

---

## Acceptance Scenarios

1. **Given** a submitter on `/submit`, **when** no category is selected, **then** no dynamic fields are visible.
2. **Given** a submitter selects "Technical", **when** the category field changes, **then** "Technology / Stack" and "Estimated Timeline" fields appear.
3. **Given** a submitter selects "Technical" then switches to "Cost Reduction", **when** the category changes, **then** the Technical fields disappear and Cost Reduction fields appear with empty values.
4. **Given** a submitter fills dynamic fields and submits, **when** the API processes the request, **then** `category_metadata` is stored as valid JSON containing the field values.
5. **Given** an idea with `category_metadata`, **when** viewed on the detail page, **then** each metadata key is displayed with a human-readable label and its value.

---

## Out of Scope

- Validation rules on dynamic fields (they are always optional)
- More than 2 dynamic fields per category
- Admin-configurable field definitions
