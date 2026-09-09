# PART 02 — DATABASE SCHEMA & PRISMA/NEON

## Objective

Implement the PostgreSQL schema described in PART-00 using Prisma and connect it to Neon.

## Prerequisites

PART-01 complete.

## Database Models Used

Only:

- Subject
- Note
- Artifact

Use the exact fields from PART-00.

## Scope

- configure Prisma;
- create `schema.prisma`;
- define UUID IDs;
- define Subject → Note;
- define Subject → Artifact;
- define Note → Artifact;
- configure deletion behavior;
- add required indexes;
- create the initial migration;
- verify Prisma Client generation;
- verify a development connection to Neon.

## Important

Do not add User, Session, Tag, Folder, Attachment, or Draft models.

The New Note draft is client-side in this version.

## Acceptance Checklist

- [ ] Prisma schema matches FOUNDATION exactly.
- [ ] migration applies successfully to Neon.
- [ ] Prisma Client can connect.
- [ ] required relations work.
- [ ] deleting a Subject cannot orphan Notes or Artifacts.
- [ ] deleting a Note cannot orphan Artifacts.
- [ ] indexes exist for required list queries.
