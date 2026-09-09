# Study Organizer — Prompt Pack

This folder is the structured build specification for the Study Organizer web app.

The purpose of splitting the specification into PART files is to keep an AI coding assistant
focused on one feature area at a time. Each session should read `PART-00-FOUNDATION.md` and the
single PART currently being implemented. Do not ask the AI to build the entire application from
all PART files at once.

## Source of Truth

The source of truth is:

1. `PART-00-FOUNDATION.md` — architecture, naming rules, database schema, API conventions,
   editor format, and non-negotiable product behavior.
2. The current `PART-XX.md` — scope and acceptance criteria for the current implementation session.
3. Earlier completed PARTs — only as implementation dependencies; do not modify their contracts
   unless the current PART explicitly requires it.

If this prompt pack conflicts with an older implementation, follow the current prompt pack unless
the user explicitly asks to preserve the old behavior.

## Required Order

Work through the parts in order:

01. Project Bootstrap & Tooling
02. Database Schema & Prisma/Neon
03. Express Backend Foundation
04. Frontend Foundation & Application Shell
05. Subject Tabs & Subject Management
06. Notebook Note Cards & Note CRUD
07. Rich Text Editor
08. Image Uploads & UploadThing
09. In-Tab Artifacts Panel
10. Dedicated New Note Page
11. Append New Note to a Subject
12. Autosave, Sorting & Persistence
13. UX, Keyboard Behavior & Responsive Layout
14. Validation, Security & Error Handling
15. Integration Testing & QA
16. Production Readiness & Deployment

## How to Use Each Session

Send the AI:

- `PART-00-FOUNDATION.md`
- exactly one `PART-XX.md`
- the existing project code, when relevant

Tell it to implement only the requested PART and stop after the acceptance checklist.

## Anti-Drift Rules

If the AI invents a model, field, endpoint, component contract, or behavior:

1. Stop implementation.
2. Compare it with `PART-00-FOUNDATION.md`.
3. If the requested requirement is not represented there, ask before adding it.
4. Never silently rename a schema field or API route.
5. Never replace the rich-text JSON format with HTML or Markdown without an explicit decision.
6. Never create a separate page for functionality that the specification says must remain together
   inside the subject notebook.
7. Never add a dashboard, classroom/teacher system, grading system, social system, or unrelated
   productivity feature.

## Definition of Done

A PART is complete only when:

- its acceptance checklist passes;
- existing functionality still works;
- no unrelated PART was implemented;
- database/API/UI contracts remain aligned with FOUNDATION;
- obvious loading, empty, validation, and error states are handled where applicable.
