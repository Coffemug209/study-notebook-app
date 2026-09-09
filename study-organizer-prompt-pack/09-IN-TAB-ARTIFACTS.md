# PART 09 — IN-TAB ARTIFACTS PANEL

## Objective

Add an Artifacts sub-area inside the active subject workspace.

## Prerequisites

PART-08 complete.

## Product Constraint

Artifacts must remain inside the subject workspace.

Do not create a separate top-level Artifacts page.

## Scope

- fetch artifacts by active `subjectId`;
- show image thumbnails/cards;
- show each image title;
- show which note contains the artifact;
- sort by `updatedAt DESC`;
- open a larger preview when useful;
- provide artifact delete;
- keep the panel compact enough that it does not dominate the notebook.

## Acceptance Checklist

- [ ] panel exists inside the subject page;
- [ ] images are scoped to the active subject;
- [ ] newest updated artifacts appear first;
- [ ] title is visible;
- [ ] owning note can be identified;
- [ ] deleting an artifact removes its DB record and handles the stored file appropriately;
- [ ] no separate artifacts route/page is required for normal use.
