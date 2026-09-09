# PART 03 — EXPRESS BACKEND FOUNDATION

## Objective

Build the Express API foundation and Prisma singleton.

## Prerequisites

PART-02 complete.

## Scope

- Express app;
- JSON parsing;
- CORS configuration;
- environment loading;
- Prisma singleton;
- route registration;
- centralized error handling;
- health endpoint;
- consistent JSON response shape.

## Routes

Only establish the route modules from PART-00. Feature behavior can remain minimal until its
corresponding PART.

## Architecture

```text
route → controller → service → Prisma
```

Do not introduce a second ORM, raw SQL, or a query builder.

## Acceptance Checklist

- [ ] server boots;
- [ ] `/api/health` returns success;
- [ ] Prisma connection can be checked;
- [ ] errors reach centralized middleware;
- [ ] JSON body parsing works;
- [ ] CORS is configurable;
- [ ] route modules are separated cleanly.
