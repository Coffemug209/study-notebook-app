# PART 14 — VALIDATION, SECURITY & ERROR HANDLING

## Objective

Harden the application around user input, uploads, relationships, and API failures.

## Prerequisites

PART-13 complete.

## Scope

- validate subject names;
- validate note titles;
- validate note content shape at the API boundary;
- validate IDs;
- verify Subject/Note/Artifact relationships;
- restrict image uploads;
- configure production-safe CORS;
- sanitize/validate data before persistence;
- centralize API errors;
- handle missing resources with 404 responses.

## Important

Do not expose:

- DATABASE_URL;
- UPLOADTHING_TOKEN;
- stack traces;
- raw database errors.

## Acceptance Checklist

- [ ] invalid input returns useful 4xx responses;
- [ ] missing records return 404;
- [ ] cross-subject artifact association is rejected;
- [ ] secrets remain server-only;
- [ ] production error responses are safe;
- [ ] upload validation is enforced server-side.
