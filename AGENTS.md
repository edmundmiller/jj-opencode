---
name: jj-opencode
description: "JJ VCS integration - enforces 'define change before implementation'"
alwaysApply: true
---

# jj-opencode Plugin

This plugin enforces JJ's workflow philosophy: **define what you're doing before you do it**.

## Why This Exists

JJ (Jujutsu) treats the working copy as an implicit commit. The `jj new -m "description"` command declares your intent BEFORE you start implementing. This plugin enforces that pattern at the tooling level - no file modifications are allowed until you define your change.

## Gate Behavior

**Before any file modification**, you must define your change:

1. Call `jj("description of your work")`
2. This runs: `jj git fetch && jj new main@origin -m "description"`
3. Gate unlocks - you can now edit files
4. When done, call `jj_push()` to push
5. Gate locks again - next task requires new change

## Agent Mode Behavior

The plugin detects mode based on the tool being blocked:

| Blocked Tool | Behavior |
|--------------|----------|
| `write`, `edit`, `lsp_rename`, etc. | **Execution**: Announce description, proceed automatically |
| Other (bash, todowrite, etc.) | **Planning**: Suggest description, wait for approval |

This means agents with file-writing capabilities proceed autonomously, while others ask first.

## Available Tools

| Tool | Purpose | When Available |
|------|---------|----------------|
| `jj(description, bookmark?, from?)` | Create new change, unlock gate | Always |
| `jj_status()` | Show change ID, description, diff summary, gate state | Always |
| `jj_push(bookmark?, confirm?)` | Validate and push - **REQUIRES explicit user permission** | After jj |
| `jj_workspace(description)` | Create sibling workspace for parallel development | Always |
| `jj_workspaces()` | List all workspaces with status | Always |
| `jj_git_init()` | Initialize JJ in non-JJ repo | Only if not JJ repo |
| `jj_undo()` | Undo last JJ operation - instant recovery | Always |
| `jj_describe(message)` | Update description of current change | After jj |
| `jj_abandon()` | Abandon current change, reset gate | After jj |

## Push Requires User Permission

**CRITICAL**: The `jj_push` tool ALWAYS requires explicit user permission.

1. `jj_push()` - Shows preview, requests user approval
2. **Wait for user to grant permission** - Never auto-confirm
3. `jj_push(confirm: true)` - Only after user explicitly approves

The AI must NEVER call `jj_push(confirm: true)` without receiving explicit user permission first.

## Description Quality

Descriptions must be:
- At least 10 characters
- More than one word

This ensures meaningful change descriptions that provide context.

## What's Blocked (Until Gate Unlocked)

- `write`, `edit` - File creation/modification
- `lsp_rename`, `lsp_code_action_resolve` - LSP modifications
- `ast_grep_replace` - AST-based replacements
- `bash` commands that modify files (sed -i, rm, mv, cp, redirects, etc.)
- `todowrite` - State modifications

## Git Commands Are Blocked (Always)

**All git commands are intercepted and blocked** with JJ equivalents suggested:

| Git Command | JJ Equivalent |
|-------------|---------------|
| `git status` | `jj st` |
| `git log` | `jj log` |
| `git diff` | `jj diff` |
| `git add` | (not needed - JJ auto-tracks) |
| `git commit` | `jj describe -m "message"` |
| `git push` | `jj_push()` or `jj git push` |
| `git checkout` | `jj edit <change>` or `jj new` |
| `git branch` | `jj bookmark list` |
| `git stash` | (not needed - use `jj new`) |
| `git pull` | `jj git fetch && jj rebase` |

This enforces JJ-native workflow and prevents mixing git/jj commands.

## What's Always Allowed

- `read`, `glob`, `grep` - File reading and searching
- `lsp_hover`, `lsp_goto_definition`, `lsp_find_references` - LSP queries
- `ast_grep_search` - AST searches (not replace)
- `webfetch`, `context7_*`, `websearch_*` - External lookups
- `task`, `background_task`, `call_omo_agent` - Agent orchestration
- `bash` read-only commands (ls, cat, jj log, etc.)
- All `jj_*` tools from this plugin

## Workflow Example

```
Session starts
    ↓
Gate is LOCKED
    ↓
User: "Add a validation function to utils.ts"
    ↓
You attempt to edit → BLOCKED
    ↓
You call: jj("Add input validation function to utils.ts")
    ↓
Gate UNLOCKS, change ID assigned
    ↓
You edit utils.ts freely
    ↓
Work complete → jj_push()
    ↓
User confirms → pushed
    ↓
Gate LOCKS again (checkpoint complete)
    ↓
Next task? Call jj("description") to start new checkpoint
```

## Natural Conversation Flow

When working with users, the flow should feel seamless:

```
User: "Refactor the auth module to use JWT"

You: Creating JJ change: "Refactor auth module to use JWT"
     [calls jj("Refactor auth module to use JWT")]
     
     Now I'll update the authentication logic...
     [proceeds with edits]

User: "Ship it"

You: [calls jj_push() to show preview]
     Ready to push:
     - Modified: src/auth.ts, src/middleware.ts
     - Description: "Refactor auth module to use JWT"
     
     Confirm?

User: "yes"

You: [calls jj_push(confirm: true)]
     ✓ Pushed successfully. Gate locked for next task.
```

## Subagent Behavior

Subagents spawned via `task` tool **inherit the parent session's gate state**.

- If parent called `jj()`, subagents can edit files
- All edits go to the same JJ change
- No need for subagents to call `jj()` again

## Workspace Support (Parallel Development)

Workspaces allow multiple OpenCode sessions to work on different features simultaneously:

```
jj_workspace("Add authentication system")
→ Creates: ../project--add-authentication-system/
→ User starts new OpenCode session in that directory
→ Both workspaces share the same repo but have isolated working copies
```

### Workspace Workflow

1. **Create workspace**: `jj_workspace("feature description")`
2. **User opens new terminal**: `cd ../project--feature-slug && opencode`
3. **Work in workspace**: Call `jj("task description")` to unlock, make edits
4. **Push from workspace**: `jj_push()` pushes to named bookmark
5. **Auto-cleanup**: After push, workspace is removed from tracking

### Key Details

- Workspaces are sibling directories: `../projectname--feature-slug/`
- Each workspace has its own working copy but shares the repo
- Bookmarks are auto-generated from descriptions: `"Add JWT auth"` → `add-jwt-auth`
- Gate still requires `jj()` call in new workspace sessions

## Named Bookmarks (Feature Branches)

For team workflows, use named bookmarks instead of pushing directly to main:

```
jj("Add user settings page", bookmark: "user-settings")
→ Creates change with bookmark `user-settings`
→ jj_push() pushes to `user-settings` branch (not main)
```

Or branch from a specific revision:

```
jj("Fix auth bug", from: "release-v2")
→ Creates change from release-v2 instead of main@origin
```

## Non-JJ Repository Handling

If the working directory is not a JJ repository:

1. Plugin detects this on session start
2. On first edit attempt, offers to run `jj_git_init()`
3. After init, immediately prompts for change description
4. Workflow continues normally

## Error Recovery

| Situation | Solution |
|-----------|----------|
| Edit blocked unexpectedly | Call `jj_status()` to check gate state |
| Wrong description | Call `jj_describe("new description")` |
| Want to start over | Call `jj_abandon()` then `jj("new description")` |
| Push fails | Check `jj_status()`, fix issues, try `jj_push()` again |
| Made a mistake | Call `jj_undo()` to revert last operation |

## JJ Concepts

- **Change ID**: Stable identifier that survives rebases (e.g., `skvrkxkk`)
- **Commit ID**: Hash that changes on every edit (e.g., `52ba303b`)
- **Working copy = commit**: Your edits are always in a commit context
- **`@`**: Refers to the current working-copy commit

## Why "Define Before Implement"?

1. **Forces intentionality**: You must think about what you're doing before doing it
2. **Creates audit trail**: Every change has a description from the start
3. **Enables parallel work**: Multiple changes can be siblings from main
4. **Aligns with JJ philosophy**: The tool enforces what JJ was designed for
