---
description: "Push the current JJ change to remote"
---

# /jj-push Command

Validate and push the current JJ change to the remote repository.

## Usage

```
/jj-push
```

## What This Does

1. Shows a preview of changes to be pushed (files modified, diff summary)
2. **Requests explicit user permission** to proceed
3. Moves the bookmark to the current change (defaults to `main`)
4. Pushes to the remote
5. **From workspaces:** Cleans up the workspace and returns to repo root

## Arguments

**Optional:**
- `bookmark` - Bookmark name to push (defaults to `main`)
- `confirm` - Set to `true` ONLY after user grants permission

## User Permission Required

**IMPORTANT**: This tool ALWAYS requires explicit user permission before pushing.

1. First call (`jj_push()`) shows preview and asks for user approval
2. You MUST wait for the user to grant permission
3. Only after user confirms, call `jj_push(confirm: true)`

**NEVER auto-confirm**. The user must explicitly approve the push.

## Workspace Cleanup

When pushing from a non-default workspace (`.workspaces/feature-slug/`):

1. Push completes successfully
2. Workspace is forgotten from JJ tracking
3. Workspace directory is deleted (`rm -rf .workspaces/feature-slug/`)
4. `jj git fetch` runs on repo root to get latest
5. `jj new main@origin` creates a fresh empty change
6. Session returns to repo root
7. Gate locks, ready for next task

**Result**: You're back at a clean repo root with an empty working copy, ready for the next feature.

## Action

Call the `jj_push` tool:

```
jj_push()
```

Wait for user to review and approve. Then:

```
jj_push(confirm: true)
```

With custom bookmark:

```
jj_push(bookmark: "feature-branch")
```
