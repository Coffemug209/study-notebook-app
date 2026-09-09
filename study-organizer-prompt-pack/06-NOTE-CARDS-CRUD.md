# PART 06 — NOTEBOOK NOTE CARDS & NOTE CRUD

## Objective

Build the editable note-card experience inside a subject.

## Prerequisites

PART-05 complete.

## Scope

- list notes for active subject;
- create a note;
- render note cards;
- edit title;
- delete note;
- show created/updated information where useful;
- sort by `updatedAt DESC`.

## Note Card Behavior

Display state should resemble a notebook card, not a form.

When the user focuses/clicks the note's text area, switch immediately into edit mode.

Separate notes visually and structurally so each note can be edited independently.

## Acceptance Checklist

- [ ] notes are scoped to the active subject;
- [ ] notes are ordered newest-updated first;
- [ ] a note can be created;
- [ ] a note can be edited;
- [ ] a note can be deleted;
- [ ] clicking note content enters edit mode;
- [ ] editing one note does not accidentally edit another.
