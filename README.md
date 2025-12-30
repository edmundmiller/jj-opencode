# jj-opencode

> [!NOTE]
>
> *"Git worktrees are powerful but clunky. JJ workspaces are elegant but manual. This plugin makes parallel AI development feel like magic — describe what you're doing, implement, push, done. No staging, no stashing, no merge conflicts, no cleanup."*

<!-- <CENTERED SECTION FOR GITHUB DISPLAY> -->

<div align="center">

**Git worktrees are dead. Long live JJ workspaces.**

[![npm version](https://img.shields.io/npm/v/jj-opencode.svg?color=cb3837&labelColor=black&style=flat-square)](https://www.npmjs.com/package/jj-opencode)
[![GitHub Stars](https://img.shields.io/github/stars/dpshade/jj-opencode?color=ffcb47&labelColor=black&style=flat-square)](https://github.com/dpshade/jj-opencode/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?labelColor=black&style=flat-square)](https://opensource.org/licenses/MIT)

</div>

<!-- </CENTERED SECTION FOR GITHUB DISPLAY> -->

**The simplest way to do parallel AI-assisted development.**

No more `git worktree add`. No more `git stash`. No more merge conflicts. No more forgotten cleanup.

Just: **describe → implement → push → done**.

---

## Contents

- [Just Skip Reading This](#just-skip-reading-this)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Installation](#installation)
- [How It Works](#how-it-works)
- [Side-by-Side Comparison](#side-by-side-git-worktrees-vs-jj-opencode)
- [Available Tools](#available-tools)
- [Parallel Development](#parallel-development-with-workspaces)
- [Why JJ Over Git?](#why-jj-over-git)
- [Troubleshooting](#troubleshooting)
- [Author's Note](#authors-note)
- [Warnings](#warnings)

---

## Just Skip Reading This

### For LLM Agents

If you're an AI agent helping set up jj-opencode:

```bash
npm install -g jj-opencode
```

Add to `~/.config/opencode/config.json`:
```json
{ "plugin": ["jj-opencode"] }
```

Done. The plugin handles everything else. When the user asks you to edit files, you'll be prompted to describe the change first. Workspaces are created and cleaned up automatically.

### For Humans Who Don't Like Reading

1. Install: `npm install -g jj-opencode`
2. Add `"jj-opencode"` to your OpenCode plugins
3. Start coding — the plugin guides you through the rest

**That's it.** The AI handles workspace creation, cleanup, and all the JJ ceremony. You just say what you want to build.

---

## The Problem

Git worktrees let you work on multiple branches simultaneously. But they're a pain:

| What You Want | What Git Makes You Do |
|---------------|----------------------|
| Start a new feature | `git worktree add ../proj-feature -b feature-x` |
| Context switch | `git stash && cd ../other-worktree` |
| Come back | `cd ../original && git stash pop` |
| Finish up | `git rebase main` (pray for no conflicts) |
| Clean up | `git worktree remove ../proj-feature && git branch -d feature-x` |

**20+ commands** for something that should be: "work on this" → "now work on that" → "ship both".

---

## The Solution

<table>
<tr>
<th width="50%">Git Worktrees (~20 commands)</th>
<th width="50%">jj-opencode (4 requests)</th>
</tr>
<tr>
<td>

```bash
git worktree add ../proj-feature -b feature
git worktree add ../proj-hotfix -b hotfix
cd ../proj-feature
# work...
git add -p && git commit -m "WIP"
git stash
cd ../proj-hotfix
# work...
git add . && git commit -m "fix"
git push origin hotfix
cd ../proj-feature
git stash pop
# work...
git rebase main
git push origin feature
git worktree remove ../proj-hotfix
git branch -d hotfix
```

</td>
<td>

```
You: "Add authentication"
AI:  ✓ Workspace created
     ✓ Ready to edit

You: "Also fix that auth bug"
AI:  ✓ Sibling workspace created

You: "push the fix"
AI:  ✓ Pushed, cleaned up

You: "push the feature"
AI:  ✓ Pushed, cleaned up
     ✓ Back to clean state
```

</td>
</tr>
</table>

**No staging. No stashing. No rebasing. No manual cleanup. No merge conflicts.**

---

## Installation

```bash
# Install
npm install -g jj-opencode

# Add to OpenCode config (~/.config/opencode/config.json)
{
  "plugin": ["jj-opencode"]
}

# That's it. Start working.
```

### Requirements

- [JJ (Jujutsu)](https://github.com/jj-vcs/jj) — Git-compatible VCS
- [OpenCode](https://github.com/opencode-ai/opencode) — AI coding assistant

---

## How It Works

### The Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│  1. OPEN REPO                                                   │
│     Working copy is empty (clean from last session)             │
│     Gate is LOCKED — can't edit until you describe the work     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. BEGIN CHANGE                                                │
│     You: "Add input validation"                                 │
│     AI calls jj("Add input validation") → workspace created     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. IMPLEMENT                                                   │
│     Gate UNLOCKED — AI edits freely in isolated workspace       │
│     All changes tracked automatically                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
          ┌───────────────────┴───────────────────┐
          ↓                                       ↓
┌─────────────────────────┐         ┌─────────────────────────────┐
│  PARALLEL WORK          │         │  4. PUSH                    │
│  (optional)             │         │     You: "ship it"          │
│                         │         │     AI: confirms, pushes    │
│  Create more            │         │     Workspace auto-deleted  │
│  workspaces for         │         │     Back to clean state     │
│  other features         │         │     Gate LOCKS              │
└─────────────────────────┘         └─────────────────────────────┘
                                                  ↓
                              ┌────────────────────────────────────┐
                              │  CYCLE COMPLETE — ready for next   │
                              └────────────────────────────────────┘
```

**Key insight**: After push, workspace is deleted and you're back to a clean repo. No cruft accumulates. Ever.

### What Gets Blocked

Until you describe your change:
- File writes/edits
- LSP renames
- AST replacements

**Git commands are always blocked** — the plugin suggests JJ equivalents:

| You Type | Plugin Says |
|----------|-------------|
| `git status` | Use `jj st` |
| `git add && git commit` | Not needed — just `jj describe` |
| `git stash` | Not needed — just `jj new` |
| `git push` | Use `jj_push()` |

---

## Side-by-Side: Git Worktrees vs jj-opencode

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

---

## Available Tools

| Tool | What It Does |
|------|--------------|
| `jj("description")` | Create change, unlock editing |
| `jj_status()` | Show current state |
| `jj_push()` | Preview and push (requires confirmation) |
| `jj_workspace("description")` | Create parallel workspace |
| `jj_workspaces()` | List all workspaces |
| `jj_cleanup()` | Remove empty commits and stale workspaces |
| `jj_undo()` | Undo last operation |
| `jj_describe("new description")` | Update change description |
| `jj_abandon()` | Abandon current change |

### Push Requires Confirmation

The AI **cannot auto-push**. `jj_push()` always shows a preview first:

```
AI: Ready to push to main:
    
    Files changed (2):
      M src/auth.ts
      M src/validation.ts
    
    Description: "Add input validation"
    
    Confirm?

You: "yes"

AI: ✓ Pushed to main
```

---

## Parallel Development with Workspaces

Work on multiple features at once:

```
═══════════════════════════════════════════════════════════════════
You're working on feature A, but need to also do feature B
═══════════════════════════════════════════════════════════════════

[Currently in workspace: add-feature-a]

You: "I also need to fix that auth bug, but separately"

AI: Workspace created: .workspaces/fix-auth-bug/
    
    To work on it, open a new terminal:
    cd .workspaces/fix-auth-bug && opencode

═══════════════════════════════════════════════════════════════════
Now you have two parallel workspaces:
  .workspaces/add-feature-a/     ← current session
  .workspaces/fix-auth-bug/      ← new terminal
═══════════════════════════════════════════════════════════════════

# Push them independently, in any order
# Each push cleans up that workspace
# When all done, you're back to clean repo root
```

### Directory Structure

```
myproject/
├── .jj/                    # JJ internal storage
├── .workspaces/            # AI workspaces (gitignored, temporary)
│   ├── add-feature-a/      
│   └── fix-auth-bug/       
├── src/
└── ...
```

---

## Why JJ Over Git?

| Git Pain | JJ Solution |
|----------|-------------|
| Staging area | None — working copy IS the commit |
| `git stash` | Just `jj new` — everything's a commit |
| Merge conflicts | Auto-rebase, conflicts resolved in-place |
| Detached HEAD | Can't happen |
| Branch management | Bookmarks are just labels |
| Worktrees | Built-in workspaces, simpler |

**This plugin adds**:
- Automatic workspace creation/cleanup
- Gate enforcement (describe before implement)
- AI-friendly workflow
- Clean development cycles

### The Philosophy

Instead of:
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

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Edit blocked | `jj_status()` to check gate state |
| Wrong description | `jj_describe("new description")` |
| Start over | `jj_abandon()` then new change |
| Made a mistake | `jj_undo()` |
| Push fails | `jj_status()`, fix issues, try again |
| Cruft accumulated | `jj_cleanup()` |

---

## Author's Note

I built this because git worktrees are powerful but annoying, and AI agents kept getting confused about which directory they were in, what state the repo was in, and whether they'd cleaned up properly.

JJ fixes the VCS complexity. This plugin fixes the workflow complexity.

**The result**: You describe what you want to build. The AI builds it. You push. Done. No ceremony.

If you're still doing the `git stash && cd ../worktree && git stash pop` dance in 2025, I'm sorry. There's a better way now.

---

## Warnings

- You might ship features faster than your team can review them
- You might forget how painful git worktrees were
- You might start expecting other tools to be this simple

---

## JJ Concepts (For the Curious)

New to JJ? Quick primer:

- **Change ID**: Stable identifier that survives rebases (e.g., `skvrkxkk`)
- **Commit ID**: Git-style hash that changes on every edit
- **Working copy = commit**: Your edits are always in a commit context
- **`@`**: The current working-copy change
- **Bookmarks**: JJ's version of branches (just labels, easily moved)

---

## License

MIT
