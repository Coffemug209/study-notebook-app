# PART 11 — APPEND NEW NOTE TO A SUBJECT

## Objective

Persist the completed New Note into the selected subject.

## Prerequisites

PART-10 complete.

## Flow

```text
New Note
  ↓
Finish
  ↓
Select Subject
  ↓
POST /api/subjects/:subjectId/notes
  ↓
Persist title + Tiptap JSON
  ↓
Persist/associate Artifact records
  ↓
Navigate to selected Subject Workspace
  ↓
New note appears first
```

## Important

The resulting note is an ordinary Note. There is no special "appended note" type.

## Acceptance Checklist

- [ ] selected subject is required;
- [ ] title/content are persisted;
- [ ] images remain embedded;
- [ ] Artifact records remain associated with the correct subject/note;
- [ ] user lands on the selected subject;
- [ ] new note appears according to `updatedAt DESC`;
- [ ] failed persistence does not silently discard the draft.
