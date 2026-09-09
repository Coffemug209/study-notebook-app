# PART 07 — RICH TEXT EDITOR

## Objective

Integrate Tiptap into NoteCard and provide the required notebook formatting.

## Prerequisites

PART-06 complete.

## Required Formatting

- paragraph;
- headings;
- bold;
- italic;
- underline;
- strike;
- bullet list;
- ordered list;
- blockquote;
- code;
- horizontal rule;
- links;
- undo/redo.

## Scope

- create reusable `RichTextEditor`;
- toolbar;
- keyboard shortcuts supported by Tiptap;
- Tiptap JSON serialization;
- initial content loading;
- editor update handling;
- focus behavior.

## Important

Persist JSON, not HTML.

Do not save on every keystroke. The autosave contract is handled in PART-12.

## Acceptance Checklist

- [ ] formatting buttons work;
- [ ] keyboard editing works;
- [ ] existing JSON restores correctly;
- [ ] editor focus works when a note enters edit mode;
- [ ] content can be converted with `editor.getJSON()`;
- [ ] no HTML-only persistence was introduced.
