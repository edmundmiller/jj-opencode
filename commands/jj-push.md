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
3. Moves the `main` bookmark to the current change
4. Pushes to the remote

## User Permission Required

**IMPORTANT**: This tool ALWAYS requires explicit user permission before pushing.

1. First call (`jj_push()`) shows preview and asks for user approval
2. You MUST wait for the user to grant permission
3. Only after user confirms, call `jj_push(confirm: true)`

**NEVER auto-confirm**. The user must explicitly approve the push.

## Action

Call the `jj_push` tool:

```
jj_push()
```

Wait for user to review and approve. Then:

```
jj_push(confirm: true)
```
