# PART 04 — FRONTEND FOUNDATION & APPLICATION SHELL

## Objective

Create the notebook-first application shell without implementing the complete notebook.

## Prerequisites

PART-03 complete.

## Routes

```text
/
 /new-note
```

`/` is the subject workspace entry point.

## Scope

- React Router;
- API client;
- application layout;
- simple top navigation;
- page container;
- loading/error primitives;
- empty-state primitives;
- Tailwind design tokens/utilities;
- responsive layout foundation.

## Product Constraint

There is no dashboard.

The home page must feel like a notebook workspace.

## Acceptance Checklist

- [ ] `/` renders the workspace shell;
- [ ] `/new-note` renders a placeholder notebook shell;
- [ ] API client uses `VITE_API_URL`;
- [ ] no secret appears in client code;
- [ ] responsive container works.
