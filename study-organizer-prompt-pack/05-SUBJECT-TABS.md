# PART 05 — SUBJECT TABS & SUBJECT MANAGEMENT

## Objective

Implement the subject-tab system.

## Prerequisites

PART-04 complete.

## Scope

- fetch subjects;
- display subjects as tabs;
- select active subject;
- create a subject;
- rename a subject;
- delete a subject with confirmation;
- reorder tabs;
- persist tab position.

## API

Use only the Subject routes from FOUNDATION.

## UX

The tabs are the primary navigation of the study organizer.

If there are no subjects, show an empty notebook state and a clear Add Subject action.

Do not create a dashboard or subject-management page.

## Acceptance Checklist

- [ ] subjects load from Neon through Express;
- [ ] active subject is obvious;
- [ ] adding a subject creates a real DB record;
- [ ] renaming persists;
- [ ] deleting removes dependent notes/artifacts according to schema behavior;
- [ ] tab order persists;
- [ ] no separate management page was created.
