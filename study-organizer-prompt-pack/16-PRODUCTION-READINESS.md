# PART 16 — PRODUCTION READINESS & DEPLOYMENT

## Objective

Prepare the finished Study Organizer for deployment.

## Prerequisites

PART-15 complete.

## Scope

- production environment variables;
- Neon production database;
- Prisma migration deployment;
- UploadThing production configuration;
- Express production settings;
- frontend API URL;
- CORS allowlist;
- logging;
- health check;
- build scripts;
- graceful startup/shutdown;
- basic backup/recovery notes.

## Deployment Rules

Do not commit secrets.

Do not run development migration commands against production casually.

Use the migration/deployment workflow appropriate to the installed Prisma version.

## Acceptance Checklist

- [ ] client production build succeeds;
- [ ] server production build/start succeeds;
- [ ] production database connection works;
- [ ] migrations are reproducible;
- [ ] UploadThing works in production;
- [ ] CORS is restricted appropriately;
- [ ] health check works;
- [ ] secrets are configured outside source control;
- [ ] final smoke test passes.
