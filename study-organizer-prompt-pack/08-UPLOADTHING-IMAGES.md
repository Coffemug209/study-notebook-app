# PART 08 — IMAGE UPLOADS & UPLOADTHING

## Objective

Allow users to upload images into notes and store their metadata in Artifact.

## Prerequisites

PART-07 complete.

## Scope

- configure UploadThing image route;
- restrict accepted files to images;
- apply a reasonable file-size/count limit;
- upload from the editor;
- receive UploadThing result;
- create Artifact metadata through the Express API;
- insert the resulting image URL into the Tiptap document;
- allow the user to give the image an Artifact title.

## Data Contract

Artifact must use only the FOUNDATION fields.

The Artifact's `fileKey` and `fileUrl` come from UploadThing.

## Security

Never expose UploadThing server credentials to React.

If authentication is later introduced, enforce authorization in the upload middleware.

## Acceptance Checklist

- [ ] image upload succeeds;
- [ ] non-image files are rejected;
- [ ] upload failures are recoverable;
- [ ] Artifact record is created;
- [ ] image appears at the intended location in the note;
- [ ] image title is stored;
- [ ] refresh preserves the image.
