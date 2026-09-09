# PART 12 — AUTOSAVE, SORTING & PERSISTENCE

## Objective

Make the notebook feel continuously saved while protecting against data loss.

## Prerequisites

PART-11 complete.

## Scope

- debounced title/content saves;
- save status;
- retry behavior;
- stale-request protection;
- reorder notes after successful updates;
- artifact refresh after uploads/deletes;
- preserve local unsaved state during recoverable errors.

## Rules

- debounce editor updates;
- do not send one request per keystroke;
- latest successful update controls `updatedAt`;
- note ordering is `updatedAt DESC`;
- avoid race conditions where an older request overwrites a newer edit.

## Acceptance Checklist

- [ ] rapid typing does not create a request per keystroke;
- [ ] save status is understandable;
- [ ] failed saves are visible;
- [ ] retry works;
- [ ] edited notes move to the top after successful save;
- [ ] stale responses cannot overwrite newer editor state;
- [ ] refresh after successful save restores the same content.
