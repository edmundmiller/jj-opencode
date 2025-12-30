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
2. Moves the `main` bookmark to the current change
3. Pushes to the remote

## Two-Step Confirmation

The first call shows a preview. To actually push, the tool must be called with `confirm: true`.

## Action

Call the `jj_push` tool:

```
jj_push()
```

If the preview looks good, follow up with:

```
jj_push(confirm: true)
```
