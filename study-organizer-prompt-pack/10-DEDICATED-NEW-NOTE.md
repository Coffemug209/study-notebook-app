# PART 10 — DEDICATED NEW NOTE PAGE

## Objective

Build `/new-note` as a clean, notebook-only writing page.

## Prerequisites

PART-08 complete.

## Scope

- title input;
- full RichTextEditor;
- image uploads;
- image titles;
- local draft state;
- finish/append action;
- subject selection at finish.

## UX

This page intentionally does not show:

- subject tabs;
- the subject notebook;
- the Artifacts panel;
- dashboard content.

It is a focused writing surface.

## Draft Rules

The draft can remain client-side until the user finishes.

Do not create a new persistent Draft database model.

## Acceptance Checklist

- [ ] user can write a complete note;
- [ ] rich formatting works;
- [ ] images work;
- [ ] image titles work;
- [ ] leaving/re-entering the editor does not erase local content unexpectedly;
- [ ] finish action opens/selects a subject target;
- [ ] no dashboard or subject notebook is shown on this page.
