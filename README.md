# jj-opencode

[![npm version](https://img.shields.io/npm/v/jj-opencode.svg)](https://www.npmjs.com/package/jj-opencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A simpler alternative to git worktrees for parallel AI-assisted development.**

OpenCode plugin that combines JJ's powerful VCS with automatic workspace management — no merge conflicts, no staging area, no manual branch juggling.

## Why Not Git Worktrees?

Git worktrees let you work on multiple branches simultaneously, but they come with friction:

| Git Worktrees | jj-opencode |
|---------------|-------------|
| Manual `git worktree add/remove` | Automatic workspace creation/cleanup |
| Must manage branch names | Auto-generated from descriptions |
| Merge conflicts on rebase | JJ auto-rebases, conflicts are rare |
| Staging area complexity | No staging — working copy IS the commit |
| Stash/unstash dance | Just `jj new` for a new change |
| Easy to leave stale worktrees | Auto-cleanup after push |
| Must remember which worktree you're in | Plugin tracks workspace state |

**The mental model is simpler**: describe what you're doing → implement → push → done. The plugin handles everything else.

## What It Does

1. **Blocks edits** until you describe what you're about to do
2. **Creates isolated workspaces** automatically (like worktrees, but managed for you)
3. **Auto-cleans up** after you push — no stale worktrees accumulating
4. **Parallel work just works** — create sibling workspaces, push them independently
5. **No merge conflicts** — JJ rebases automatically, and conflicts are resolved in-place

Under the hood, it ensures every change starts fresh from `main@origin`:
```bash
jj git fetch && jj new main@origin -m "description of work"
```

## Quick Start

```bash
# 1. Install
npm install -g jj-opencode

# 2. Add to OpenCode config (~/.config/opencode/config.json)
{ "plugin": ["jj-opencode"] }

# 3. Start working - the plugin handles the JJ workflow automatically:
#    - Blocks edits until you define what you're doing
#    - Creates isolated workspace for your change
#    - Pushes and cleans up when you're done
#    - Returns you to a clean state for the next task
```

## Installation

### From npm (recommended)

```bash
npm install -g jj-opencode
```

Then add to your OpenCode config (`~/.config/opencode/config.json`):

```json
{
  "plugin": ["jj-opencode"]
}
```

**Optional**: Install slash commands for explicit user control:
```bash
node -e "require('jj-opencode/bin/setup.js')"
```

### Local Development

Clone the repo and symlink:

```bash
git clone https://github.com/dpshade/jj-opencode
cd jj-opencode
bun install
bun run build

# Symlink the plugin
ln -s $(pwd) ~/.config/opencode/plugin/jj-opencode

# Install slash commands
node bin/setup.js
```

## How It Works

### The Solo Developer Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│  1. OPEN REPO                                                   │
│     Working copy is empty (clean from last session)             │
│     Gate is LOCKED                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. BEGIN CHANGE                                                │
│     You ask AI to implement something                           │
│     AI calls jj("description") → workspace auto-created         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. IMPLEMENT                                                   │
│     Gate UNLOCKED in workspace                                  │
│     AI edits files freely                                       │
│     All changes tracked in JJ change                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
          ┌───────────────────┴───────────────────┐
          ↓                                       ↓
┌─────────────────────────┐         ┌─────────────────────────────┐
│  3b. PARALLEL WORK      │         │  4. PUSH                    │
│  (optional)             │         │     jj_push() → confirm     │
│                         │         │     Changes pushed to main  │
│  Create sibling         │         │     Workspace auto-cleaned  │
│  workspaces for         │         │     Returns to default      │
│  other features         │         │     Gate LOCKS              │
└─────────────────────────┘         └─────────────────────────────┘
                                                  ↓
                              ┌────────────────────────────────────┐
                              │  Back to step 1 — ready for next   │
                              └────────────────────────────────────┘
```

**Key insight**: After pushing, the workspace is automatically cleaned up and you return to the default workspace with an empty working copy. The cycle repeats cleanly.

### Automatic Workspace Isolation

When `jj()` is called from the **default** workspace, the plugin:
1. Creates `.workspaces/feature-slug/` subdirectory
2. Moves the session to that workspace
3. Creates a JJ change with an auto-generated bookmark
4. Unlocks the gate

When you `jj_push()` from a workspace:
1. Changes are pushed to main (or specified bookmark)
2. Workspace is automatically forgotten and deleted
3. Session returns to the repo root
4. Gate locks — ready for next cycle

**Directory structure:**
```
myproject/
├── .jj/                    # JJ internal storage
├── .workspaces/            # AI agent workspaces (gitignored)
│   ├── add-auth/           # workspace for auth feature (temporary)
│   └── fix-bug-123/        # workspace for bug fix (temporary)
├── src/
└── ...
```

### Agent Mode Behavior

The plugin detects mode based on what tool is being blocked:

| Blocked Tool | Behavior |
|--------------|----------|
| `write`, `edit`, etc. | Announces description, proceeds automatically |
| Other tools | Suggests description, waits for approval |

## Available Tools

| Tool | Purpose |
|------|---------|
| `jj(description, bookmark?, from?)` | Create new JJ change, unlock editing |
| `jj_status()` | Show current change, gate state, workspace, and diff summary |
| `jj_push(bookmark?, confirm?)` | Preview then push (requires `confirm: true`) |
| `jj_workspace(description)` | Create workspace in .workspaces/ for parallel development |
| `jj_workspaces()` | List all workspaces with their status |
| `jj_cleanup(confirm?)` | Abandon empty commits and forget stale workspaces |
| `jj_undo()` | Undo last JJ operation - instant recovery |
| `jj_describe(message)` | Update description of current change |
| `jj_abandon()` | Abandon current change, reset gate |
| `jj_git_init()` | Initialize JJ in non-JJ repo |

### Optional Slash Commands

If you prefer explicit control, install the slash commands:

```bash
node -e "require('jj-opencode/bin/setup.js')"
```

| Command | Purpose |
|---------|---------|
| `/jj "description"` | Explicitly create a JJ change |
| `/jj-push` | Explicitly trigger push flow |

## Push Requires Confirmation

**Important**: The `/jj-push` command uses a two-step process:

1. First call shows a preview of changes and asks for permission
2. Only after you explicitly confirm does it actually push

The AI cannot auto-push without your approval.

## What's Blocked

Until a change is defined via `/jj` or `jj()`:
- File write/edit operations
- LSP rename/code action operations
- AST grep replace operations

**All git commands are blocked** (always) with JJ alternatives suggested:

| Git Command | JJ Alternative |
|-------------|----------------|
| `git status` | `jj st` |
| `git log` | `jj log` |
| `git diff` | `jj diff` |
| `git add` | (not needed) |
| `git commit` | `jj describe -m "..."` |
| `git push` | `/jj-push` or `jj_push()` |
| `git checkout` | `jj edit <change>` |
| `git branch` | `jj bookmark list` |
| `git stash` | (use `jj new`) |
| `git pull` | `jj git fetch && jj rebase` |

**Bash commands show warnings** (but execute anyway) when gate is locked:
- `jj new`, `jj describe` - Suggests using plugin tools instead
- File-modifying commands (sed -i, rm, mv, etc.) - Suggests calling `jj("description")` first

What's always allowed:
- Reading files
- Searching (grep, glob)
- LSP queries (hover, definitions)
- Web lookups
- Bash commands (with warnings when modifying files and gate locked)
- JJ commands (`jj log`, `jj st`, etc.)
- Spawning subagents (they inherit gate state)

## Description Quality

Descriptions must be at least 10 characters and more than one word. This ensures meaningful change context.

## Typical Workflow

Here's a complete session showing the full cycle:

```
═══════════════════════════════════════════════════════════════════
SESSION START — You open the repo (empty working copy from last time)
═══════════════════════════════════════════════════════════════════

You: "Add input validation to the signup form"

AI: Creating JJ change: "Add input validation to signup form"
    ✓ Workspace created: .workspaces/add-input-validation-to-signup-form/
    ✓ Session moved to workspace
    ✓ Change created (ID: kpxvmstq)
    ✓ Gate unlocked - editing enabled

AI: [reads files from workspace, makes edits]
    I've added email format validation and password strength checks.

You: "looks good, push it"

AI: Ready to push to main:
    
    Files changed (2):
      M src/signup.ts
      M src/validation.ts
    
    Description: "Add input validation to signup form"
    
    Confirm push?

You: "yes"

AI: ✓ Pushed to main
    ✓ Workspace cleaned up
    ✓ Returned to repo root
    ✓ Gate locked - ready for next task

═══════════════════════════════════════════════════════════════════
CYCLE COMPLETE — Back to clean state, ready for next feature
═══════════════════════════════════════════════════════════════════

You: "now add unit tests for that validation"

AI: Creating JJ change: "Add unit tests for signup validation"
    ✓ Workspace created: .workspaces/add-unit-tests-for-signup-validation/
    ✓ Session moved to workspace
    ✓ Change created (ID: mlqwxyzp)
    ✓ Gate unlocked - editing enabled

    [new workspace, new cycle, same pattern...]
```

### What Makes This Different

- **Always fresh** — Each change starts from `main@origin`, never from stale local state
- **Automatic cleanup** — Workspaces are deleted after push, no cruft accumulates
- **Intentional commits** — Every change has a description before any code is written
- **Clean cycles** — Gate locks after push, ensuring clean separation between tasks
- **Instant recovery** — Made a mistake? `jj_undo()` reverts the last operation

## Parallel Development with Workspaces

Work on multiple features simultaneously with sibling workspaces:

```
═══════════════════════════════════════════════════════════════════
SCENARIO: You're working on feature A, but need to also do feature B
═══════════════════════════════════════════════════════════════════

[Currently in workspace: add-feature-a]

You: "I also need to fix that auth bug, but separately"

AI: [calls jj_workspace("Fix authentication bypass vulnerability")]
    Workspace created: .workspaces/fix-authentication-bypass-vulnerability/
    
    To work in this workspace, start a new OpenCode session:
    cd .workspaces/fix-authentication-bypass-vulnerability && opencode

═══════════════════════════════════════════════════════════════════
Now you have two parallel workspaces:
  .workspaces/add-feature-a/                    ← current session
  .workspaces/fix-authentication-bypass-vulnerability/  ← new terminal
═══════════════════════════════════════════════════════════════════

[In the new terminal session]
AI: Creating JJ change: "Fix authentication bypass vulnerability"
    ✓ Change created in workspace
    ✓ Gate unlocked
    [implements fix, then...]

You: "push this fix"

AI: ✓ Pushed to main
    ✓ Workspace cleaned up
    ✓ Returned to repo root

[Back in original terminal - feature A workspace]
You: "ok finish up feature A"

AI: [completes work]

You: "push it"

AI: ✓ Pushed to main
    ✓ Workspace cleaned up  
    ✓ All workspaces cleared, back to clean repo root
```

### How Parallel Workspaces Work

- Each workspace is isolated — edits in one don't affect others
- All workspaces share the same repo (via JJ's workspace feature)
- Each `jj_push()` pushes that workspace's changes and cleans it up
- When all workspaces are pushed, you're back to a clean repo root

**Note**: Add `.workspaces/` to your `.gitignore`.

### Side-by-Side: Git Worktrees vs jj-opencode

<table>
<tr>
<th width="50%">Git Worktrees</th>
<th width="50%">jj-opencode</th>
</tr>
<tr>
<td>

```bash
# Create worktrees manually
git worktree add ../proj-feature -b feature
git worktree add ../proj-hotfix -b hotfix
cd ../proj-feature
```

</td>
<td>

```
You: "Add user authentication"

AI: ✓ Workspace created automatically
    ✓ Ready to edit
```

</td>
</tr>
<tr>
<td>

```bash
# Work, then need to context switch
git add -p  # careful staging
git commit -m "WIP"
git stash   # save incomplete work
cd ../proj-hotfix
```

</td>
<td>

```
You: "Also fix that auth bug"

AI: ✓ Sibling workspace created
    (open new terminal to work on it)
```

</td>
</tr>
<tr>
<td>

```bash
# Finish hotfix
git add . && git commit -m "fix"
git push origin hotfix
cd ../proj-feature
git stash pop  # restore state
```

</td>
<td>

```
[In hotfix terminal]
You: "push it"

AI: ✓ Pushed, workspace cleaned up
```

</td>
</tr>
<tr>
<td>

```bash
# Finish feature
git rebase main  # pray for no conflicts
git push origin feature

# Manual cleanup (often forgotten)
git worktree remove ../proj-hotfix
git branch -d hotfix
```

</td>
<td>

```
[Back to feature terminal]
You: "push it"

AI: ✓ Pushed, workspace cleaned up
    ✓ Back to clean repo root
```

</td>
</tr>
<tr>
<td>

**~20 commands**, manual cleanup, merge conflicts possible, stash/unstash dance

</td>
<td>

**4 natural language requests**, automatic cleanup, no conflicts, no stashing

</td>
</tr>
</table>

### Cleanup for Accumulated Cruft

If you abandon changes or workspaces accumulate, `jj_cleanup()` tidies up:

```
You: "clean up any stale stuff"

AI: [calls jj_cleanup()]
    
    Cleanup preview:
    
    Empty commits (3):
      kpxvmstq - (no description)
      mlqwxyzp - abandoned experiment
    
    Stale workspaces (1):
      fix-old-bug - already merged to main
    
    Confirm cleanup?

You: "yes"

AI: ✓ Abandoned 3 empty commits
    ✓ Removed 1 stale workspace
    ✓ Deleted bookmarks: fix-old-bug
```

### Named Bookmarks (Feature Branches)

For team workflows, push to a named bookmark instead of main:

```
jj("Add user settings page", bookmark: "user-settings")
```

This creates a change with bookmark `user-settings`. When you push, it goes to that branch instead of main.

### Branch from Specific Revision

Start from a different base (not main):

```
jj("Fix auth bug", from: "release-v2")
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Edit blocked unexpectedly | Run `jj_status()` to check gate state |
| Wrong change description | Run `jj_describe("new description")` |
| Want to start over | Run `jj_abandon()` then create new change |
| Made a mistake | Run `jj_undo()` to revert last operation |
| Push fails | Check `jj_status()`, fix issues, try `jj_push()` again |
| Empty commits cluttering log | Run `jj_cleanup()` to abandon empty commits |
| Stale workspaces | Run `jj_cleanup()` to forget workspaces whose changes merged |
| Plugin not loading | Verify `~/.config/opencode/config.json` includes `"plugin": ["jj-opencode"]` |

## JJ Concepts

New to JJ? Here are the key concepts:

- **Change ID**: Stable identifier that survives rebases (e.g., `skvrkxkk`)
- **Commit ID**: Git-style hash that changes on every edit (e.g., `52ba303b`)
- **Working copy = commit**: Your edits are always in a commit context
- **`@`**: Refers to the current working-copy change

## Why JJ Over Git?

JJ (Jujutsu) is a Git-compatible VCS that eliminates most of Git's complexity:

| Git Concept | JJ Equivalent |
|-------------|---------------|
| Staging area | None — working copy IS the commit |
| `git stash` | Just `jj new` — everything's a commit |
| Merge conflicts | Auto-rebase, conflicts resolved in-place |
| Detached HEAD | Can't happen — `@` always points somewhere |
| Branch management | Bookmarks are just labels, easily moved |
| Worktrees | Built-in workspaces, simpler model |

**This plugin adds**:
- Automatic workspace creation/cleanup
- Gate enforcement (describe before implement)
- AI-friendly workflow (agents inherit state)
- Clean development cycles

### The Philosophy

Every change starts with intent. Instead of:
```bash
git checkout -b feature-x
# ... forget what you were doing ...
git add -p  # what should I stage?
git commit -m "stuff"  # vague message after the fact
```

You get:
```bash
jj("Add input validation to signup form")  # intent declared upfront
# ... implement with full context ...
jj_push()  # clean push, workspace cleaned up
```

**Intentionality** → **Audit trail** → **Clean parallel work** → **No cruft**

## Requirements

- [JJ (Jujutsu)](https://github.com/jj-vcs/jj) installed and in PATH
- [OpenCode](https://github.com/opencode-ai/opencode) with plugin support

## License

MIT
