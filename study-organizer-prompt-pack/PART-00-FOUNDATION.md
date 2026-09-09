# PART 00 — FOUNDATION & CONVENTIONS

> READ THIS BEFORE EVERY OTHER PART. This file is the architectural source of truth for the
> Study Organizer project.

## 0.1 Product Definition

Build a personal study-organizer web application.

The application is a notebook-first experience, not a dashboard.

The main experience is a subject workspace:

- each subject is represented by a tab;
- each tab contains editable note cards;
- notes support rich text formatting;
- notes can contain uploaded images;
- images have user-defined titles;
- the same subject workspace contains an Artifacts area/panel for browsing images belonging
  to that subject;
- notes are ordered by most recently updated;
- clicking/focusing a note's text immediately switches that note into edit mode;
- users can create, edit, separate, and delete individual note cards;
- users can create additional subject tabs;
- a dedicated New Note page provides a clean notebook-only writing experience;
- a completed New Note can be appended to a selected subject as a new note card.

## 0.2 Explicit Non-Goals

Do NOT build:

- a dashboard;
- teacher/student/classroom functionality;
- grading;
- assessments;
- analytics;
- social features;
- comments;
- collaboration;
- chat;
- task management;
- calendar functionality;
- notifications;
- a separate image-management page;
- a separate note-management page for normal subject notes.

The Artifacts UI belongs inside the subject workspace.

## 0.3 Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Tiptap for rich-text editing
- React Router for page routing
- Axios for API communication

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM

### Database

- Neon serverless PostgreSQL
- Prisma migrations and Prisma Client

### File Storage

- UploadThing
- Images only for the first version

### Recommended editor representation

Persist Tiptap/ProseMirror JSON in PostgreSQL as JSON/JSONB.

Do not persist editor content as a rendered HTML string as the canonical format.

HTML may be generated for rendering/export later, but it is not the source of truth.

## 0.4 Current Documentation Baseline

The implementation should follow current official documentation for the selected stack.

Context7 was checked while creating this specification:

- React: use current React APIs and standard controlled/component state patterns.
- Express: use Express Router, `express.json()`, middleware, and centralized error handling.
  Express 5 supports rejected Promises from async handlers flowing to error middleware.
- Prisma: use Prisma schema models and Prisma Client; PostgreSQL is supported, including Neon.
  Keep migrations in Prisma.
- Neon: use PostgreSQL connection strings supplied through environment variables.
- UploadThing: define a typed file router, restrict the image route, authenticate/authorize the
  upload when authentication exists, and persist the resulting file URL/key metadata.
- Tiptap: use `useEditor`, `EditorContent`, StarterKit/extensions, editor JSON, and update events.
  The Image extension can render images inside the editor.

Do not copy obsolete examples blindly. If an API has changed, consult current documentation again.

## 0.5 Repository Shape

Use a clear separation between frontend and backend:

```text
/
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ features/
│  │  ├─ pages/
│  │  ├─ lib/
│  │  ├─ hooks/
│  │  ├─ types/
│  │  └─ App.tsx
│  └─ ...
├─ server/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ lib/
│  │  └─ server.ts
│  ├─ prisma/
│  │  └─ schema.prisma
│  └─ ...
├─ package.json
└─ README.md
```

Exact structure can be adjusted only when required by the chosen library integration.

## 0.6 Database Source of Truth

The Prisma schema is the literal source of truth for database model and field names.

### Prisma models

```text
Subject
- id
- name
- position
- createdAt
- updatedAt

Note
- id
- subjectId
- title
- content
- createdAt
- updatedAt

Artifact
- id
- subjectId
- noteId
- title
- fileKey
- fileUrl
- mimeType
- createdAt
- updatedAt
```

### Relationship rules

```text
Subject 1 ──< Note
Subject 1 ──< Artifact
Note    1 ──< Artifact
```

`Note.subjectId` is required for persisted subject notes.

The dedicated New Note page may hold a client-side draft before the user chooses a subject.
When the user appends it to a subject, create the Note with that subject's `id`.

An Artifact belongs to both a Subject and the Note that contains/owns it. This intentionally
allows the Artifacts panel to query directly by `subjectId`.

### Field semantics

#### Subject

- `name`: displayed subject-tab label.
- `position`: ordering value for subject tabs.
- `createdAt`: creation timestamp.
- `updatedAt`: last subject metadata update.

#### Note

- `subjectId`: parent subject.
- `title`: note-card title.
- `content`: Tiptap JSON document.
- `createdAt`: first creation time.
- `updatedAt`: last meaningful note update.

#### Artifact

- `subjectId`: subject that owns the artifact.
- `noteId`: note containing the artifact.
- `title`: human-readable image title entered by the user.
- `fileKey`: UploadThing file key.
- `fileUrl`: URL returned by UploadThing.
- `mimeType`: stored MIME type.
- `createdAt` / `updatedAt`: artifact lifecycle timestamps.

Do not add `description`, `status`, `tags`, `folderId`, `userId`, or other fields unless a later
explicit product decision adds them.

## 0.7 Prisma Constraints

Use UUID primary keys.

Use relations instead of manually joining IDs in application code.

The schema should enforce appropriate deletion behavior:

- deleting a Subject must not leave orphaned Notes or Artifacts;
- deleting a Note must not leave orphaned Artifacts.

Choose Prisma relation actions that match this behavior and verify the generated migration.

Create indexes that directly support the required queries, especially:

- Notes by `subjectId` ordered by `updatedAt`;
- Artifacts by `subjectId` ordered by `updatedAt`;
- Artifacts by `noteId`.

Do not add speculative indexes.

## 0.8 API Contract

Base API prefix:

```text
/api
```

Subject endpoints:

```text
GET    /api/subjects
POST   /api/subjects
PATCH  /api/subjects/:subjectId
DELETE /api/subjects/:subjectId
PATCH  /api/subjects/reorder
```

Note endpoints:

```text
GET    /api/subjects/:subjectId/notes
POST   /api/subjects/:subjectId/notes
GET    /api/notes/:noteId
PATCH  /api/notes/:noteId
DELETE /api/notes/:noteId
```

Artifact endpoints:

```text
GET    /api/subjects/:subjectId/artifacts
POST   /api/notes/:noteId/artifacts
PATCH  /api/artifacts/:artifactId
DELETE /api/artifacts/:artifactId
```

The UploadThing file router is a separate upload transport. Its successful upload result must
provide enough data for the application to create/update an Artifact.

## 0.9 API Rules

- Validate request bodies at the API boundary.
- Return JSON consistently.
- Use appropriate HTTP status codes.
- Do not expose database internals or stack traces in production responses.
- Use centralized Express error middleware.
- Controllers coordinate HTTP input/output.
- Services contain reusable business logic where useful.
- Prisma access stays server-side.
- Never send database credentials to React.
- Never trust `subjectId`, `noteId`, or `artifactId` from the client without checking that the
  related record exists and the relationship is valid.
- Do not allow an Artifact to be attached to a Note from a different Subject.

## 0.10 Rich Text Contract

Tiptap is the editor layer.

The canonical note `content` is JSON.

The minimum formatting scope:

- paragraph
- headings
- bold
- italic
- underline
- strike
- bullet list
- ordered list
- blockquote
- code
- horizontal rule
- undo/redo
- links

Images are supported through the image-upload flow.

Do not turn every image into a separate editor document. An uploaded image should be represented
as an image node in the note content, while its Artifact record stores the file metadata.

The Artifact record is the index/catalog entry; the Tiptap image node controls where the image
appears inside the note.

## 0.11 Note Editing Behavior

A note card has two visual states:

### Display state

- title and formatted content are visible;
- the card does not look like a form;
- there is no giant always-visible textarea.

### Edit state

Entering the note content area switches the card into editing mode.

Focus behavior:

- clicking/focusing note content starts editing;
- the editor receives focus;
- the existing content remains intact;
- clicking outside can exit editing mode after pending changes are saved;
- an explicit edit control may exist for accessibility, but it is not required for normal use.

Use React state plus refs/focus handling. Do not manipulate the DOM globally.

## 0.12 Save Behavior

The app should feel like a notebook, not a traditional CRUD form.

Use debounced autosave for note content/title changes.

Requirements:

- never save every keystroke as a separate request;
- debounce updates;
- indicate saving/saved/error state unobtrusively;
- flush pending changes before leaving the note when practical;
- avoid losing changes if an API request fails;
- preserve unsaved client state so the user can retry.

`updatedAt` must change when note content or title is successfully updated.

Notes are sorted by `updatedAt DESC`.

After a note is edited successfully, the UI should reflect its new position without requiring a
full page reload.

## 0.13 Subject Workspace Layout

A subject page/tab should keep the requested aspects together:

```text
Subject Workspace
├─ Subject tabs
├─ Current subject header
├─ Notebook
│  ├─ Note Card
│  ├─ Note Card
│  └─ Note Card
├─ Add Note
└─ Artifacts panel/menu
   └─ Image cards/thumbnails
```

The Artifacts panel is a sub-area of the subject workspace, not a separate top-level page.

Selecting an artifact should make it possible to identify which note it belongs to.

## 0.14 Dedicated New Note

Route:

```text
/new-note
```

The page is intentionally minimal:

```text
New Note
├─ Title
├─ Rich-text editor
├─ Image upload
├─ Save/append action
└─ Subject selector when finishing
```

The page must not contain the full subject notebook, artifact browser, or dashboard.

When the user finishes:

1. validate title/content;
2. ask/select the target Subject;
3. create the Note under that Subject;
4. preserve the complete Tiptap content, including image nodes;
5. create/retain Artifact records for uploaded images;
6. navigate to the selected subject workspace;
7. show the newly appended note in the correct most-recently-updated position.

## 0.15 Frontend State Rules

Prefer local component state for transient editor/UI state.

Use shared state only for data that genuinely needs to be shared between distant components.

Do not put the entire Tiptap JSON document into a global store on every keystroke.

Keep server data and editor state conceptually separate:

```text
Server data:
subjects, notes, artifacts

Local editor state:
current content, selection, focus, editing state, save status
```

## 0.16 Naming Conventions

TypeScript:

- Components: PascalCase.
- Hooks: `useSomething`.
- Functions/variables: camelCase.
- API route params: `subjectId`, `noteId`, `artifactId`.
- Database fields: exact Prisma camelCase names.
- Avoid abbreviations unless conventional.

Examples:

```text
SubjectTabs
NoteCard
RichTextEditor
ArtifactsPanel
NewNotePage
useAutosaveNote
```

## 0.17 Environment Variables

Never hardcode secrets.

Server-only:

```text
DATABASE_URL
UPLOADTHING_TOKEN
```

Client-safe configuration may use a Vite-prefixed variable where needed, for example:

```text
VITE_API_URL
```

Do not expose `DATABASE_URL` or `UPLOADTHING_TOKEN` to the client.

## 0.18 Error / Empty / Loading States

Every data-driven screen must account for:

- loading;
- empty;
- error;
- success.

Examples:

- no subjects yet → clear Add Subject action;
- subject has no notes → notebook empty state with Add Note;
- no artifacts → compact empty Artifacts state;
- image upload failed → retryable message;
- note save failed → visible unsaved/error state.

Do not use fake placeholder data in production code.

## 0.19 Acceptance Gate for Every PART

Before declaring a PART complete:

- [ ] Only this PART was implemented.
- [ ] Existing completed PART behavior still works.
- [ ] No unapproved schema field was added.
- [ ] No unapproved route was added.
- [ ] TypeScript/build passes.
- [ ] Relevant tests or manual checks pass.
- [ ] Loading/error/empty behavior is handled where applicable.
- [ ] No secret is exposed to the frontend.
- [ ] The implementation matches the terminology in this FOUNDATION.

## 0.20 Documentation Sources

Use current official documentation when implementation details need verification:

- React
- Express
- Prisma
- Neon
- UploadThing
- Tiptap

If documentation changes, update implementation details, not the product contract, unless the user
explicitly changes the product requirements.
