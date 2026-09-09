# PART 15 — INTEGRATION TESTING & QA

## Objective

Verify the complete study workflow from subject creation to note persistence and artifact browsing.

## Prerequisites

PART-14 complete.

## Test Matrix

### Subjects

- create subject;
- rename subject;
- reorder subjects;
- delete subject;
- empty subject state.

### Notes

- create note;
- edit title;
- edit rich text;
- focus-to-edit;
- delete note;
- newest-updated sorting;
- failed save/retry.

### Images

- upload valid image;
- reject invalid file;
- set image title;
- image renders after refresh;
- artifact appears in subject panel;
- delete artifact.

### New Note

- write note;
- add formatting;
- upload image;
- finish;
- select subject;
- verify note appears in selected subject;
- verify image/artifact relationship.

### Persistence

- refresh browser;
- restart server;
- verify Neon-backed data remains.

## Acceptance Checklist

- [ ] all major flows pass;
- [ ] no console errors during normal use;
- [ ] no network request sends secrets;
- [ ] no orphaned records are produced by supported delete flows;
- [ ] mobile layout remains usable;
- [ ] no dashboard or unrelated feature has appeared.
