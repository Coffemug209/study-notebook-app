# Study Organizer — Deployment Guide

This guide covers deploying the Study Organizer to a production environment using **Neon** (PostgreSQL), **UploadThing** (image storage), a **Node.js host** (Railway / Render / Fly.io) for the API, and a **static host** (Vercel / Netlify) for the React client.

---

## Prerequisites

- Node.js ≥ 18
- A [Neon](https://neon.tech) account with a project and a database
- An [UploadThing](https://uploadthing.com) account and app
- (Optional) A domain or subdomain

---

## 1. Environment Variables

### Server (`server/.env`)

Copy `server/.env.example` → `server/.env`:

```bash
cp server/.env.example server/.env
```

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default: `5000`) |
| `NODE_ENV` | Set to `production` on deployed servers |
| `DATABASE_URL` | Neon **pooled** connection string |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string (Prisma migrations) |
| `UPLOADTHING_TOKEN` | From UploadThing dashboard → API Keys |
| `CORS_ORIGIN` | Comma-separated list of allowed client origins |

> **Never commit `.env` to source control.** Use your hosting platform's secrets/environment UI.

### Client (`client/.env`)

Copy `client/.env.example` → `client/.env`:

```bash
cp client/.env.example client/.env
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of the deployed API (no trailing slash) |

---

## 2. Database — Neon Setup

1. Create a project and database in the [Neon console](https://console.neon.tech).
2. Copy the **pooled** connection string to `DATABASE_URL`.
3. Copy the **direct** connection string to `DATABASE_URL_UNPOOLED`.

### Apply Migrations

Run database migrations against the production database (using the **direct** connection):

```bash
cd server
DATABASE_URL=$DATABASE_URL_UNPOOLED npx prisma migrate deploy
```

> Use `migrate deploy` (not `migrate dev`) in production. This applies any pending migrations without creating new ones.

---

## 3. UploadThing — Production Setup

1. Visit [uploadthing.com/dashboard](https://uploadthing.com/dashboard) and open your app.
2. Copy the **API key / token** to `UPLOADTHING_TOKEN` on your server host.
3. Add your production client domain to the **Allowed Origins** list in UploadThing settings.

---

## 4. Build

Build both server and client from the workspace root:

```bash
npm run build
```

This compiles:
- `server/dist/` — compiled Express server (ESM)
- `client/dist/` — Vite-compiled React SPA (static files)

---

## 5. Deploy the API (Server)

### Railway / Render / Fly.io

1. Connect your repository.
2. Set all required environment variables via the platform's secrets UI.
3. Set the **build command**: `npm run build:server` (or `npm run build`).
4. Set the **start command**: `npm run start` (runs `node dist/server.js`).
5. The server listens on `process.env.PORT` (auto-set by most platforms).

### CORS Configuration

Set `CORS_ORIGIN` to your client's deployed URL:

```
CORS_ORIGIN=https://your-app.vercel.app
```

Multiple origins (comma-separated):

```
CORS_ORIGIN=https://your-app.vercel.app,https://your-custom-domain.com
```

---

## 6. Deploy the Client (React SPA)

### Vercel

1. Import the repo and set the **root directory** to `client/`.
2. Set **build command**: `npm run build`
3. Set **output directory**: `dist`
4. Add environment variable: `VITE_API_URL=https://your-api.railway.app`

### Netlify

1. Set **base directory**: `client`
2. Set **build command**: `npm run build`
3. Set **publish directory**: `dist`
4. Add environment variable: `VITE_API_URL=https://your-api.railway.app`
5. Add a `client/public/_redirects` file with `/* /index.html 200` for SPA routing.

---

## 7. Health Check

Verify the API is up and connected to Neon:

```bash
curl https://your-api.railway.app/api/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected",
  "service": "Study Organizer API",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 42,
  "timestamp": "2026-09-09T15:00:00.000Z"
}
```

---

## 8. Final Smoke Test Checklist

After deployment, verify the following manually in a browser:

- [ ] Home page loads without errors
- [ ] Create a subject → it appears in the subject tabs
- [ ] Create a note → it appears in the subject workspace
- [ ] Edit note title and content → autosaves within ~1 second
- [ ] Upload an image in a note → it embeds in the editor and appears in the artifacts panel
- [ ] Navigate to `/new-note` → write a note, select a subject, click Finish
- [ ] Newly created note appears in the selected subject tab
- [ ] Refresh the browser → all data persists (Neon-backed)
- [ ] `/api/health` returns `"database": "connected"`
- [ ] No `DATABASE_URL`, `UPLOADTHING_TOKEN`, or stack traces in any API response body

---

## 9. Backup & Recovery Notes

- **Database**: Neon provides automatic branch-based point-in-time restore. Keep your schema migration files (`server/prisma/migrations/`) committed — they are the canonical source of truth for schema recovery.
- **Images**: UploadThing stores uploaded files durably in their CDN. File metadata (URLs, keys) is stored in the Neon `Artifact` table and is restored with any database backup.
- **Recovery**: To restore from a Neon backup, create a new branch from the desired restore point, update `DATABASE_URL` to point to the new branch, and re-run `prisma migrate deploy`.

---

## Quick Reference

| Command | Purpose |
|---|---|
| `npm run build` | Build server + client |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check (server + client) |
| `npx prisma migrate deploy` | Apply migrations to production DB |
| `npx prisma studio` | Browse/edit data visually |
| `curl /api/health` | Verify server + DB connectivity |
