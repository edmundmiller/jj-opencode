# jj-opencode

OpenCode plugin that enforces JJ's "define change before implementation" workflow.

## What It Does

This plugin prevents file modifications until you define what change you're making. It enforces the pattern:

```bash
jj git fetch && jj new main@origin -m "description of work"
```

**Before** you can edit any files.

## Installation

Add to your OpenCode config:

```json
{
  "plugin": ["jj-opencode"]
}
```

Or for local development, symlink to `~/.config/opencode/plugin/jj-opencode`.

## How It Works

1. **Session starts** → Gate is LOCKED
2. **You try to edit** → BLOCKED with helpful message
3. **You call `jj_init("add feature X")`** → Gate UNLOCKS
4. **You edit freely** → All changes tracked in JJ change
5. **You call `jj_push()`** → Validates and pushes to remote

## Available Tools

| Tool | Purpose |
|------|---------|
| `jj_init(description)` | Create new JJ change, unlock editing |
| `jj_new(description)` | Create sequential change (for multi-step work) |
| `jj_status()` | Show current change and gate state |
| `jj_describe(message)` | Update change description |
| `jj_push(bookmark?, confirm?)` | Preview then push (requires confirm:true) |
| `jj_abandon()` | Abandon change, reset gate |
| `jj_git_init()` | Initialize JJ in non-JJ repo |

## What's Blocked

Until `jj_init` is called:
- File write/edit operations
- Bash commands that modify files (sed -i, rm, mv, etc.)
- LSP rename/code action operations
- AST grep replace operations

**All git commands are blocked** with JJ alternatives suggested:
- `git status` → `jj st`
- `git log` → `jj log`
- `git commit` → `jj describe -m "..."`
- `git push` → `jj_push()`

What's always allowed:
- Reading files
- Searching (grep, glob)
- LSP queries (hover, definitions)
- Web lookups
- JJ commands (`jj log`, `jj st`, etc.)
- Spawning subagents (they inherit gate state)

## Description Quality

Descriptions must be at least 10 characters and more than one word. This ensures meaningful change context.

## Why?

JJ (Jujutsu) treats the working copy as an implicit commit. The `jj new -m "description"` command declares your intent BEFORE you start implementing. This plugin enforces that pattern at the tooling level.

Benefits:
- **Intentionality**: Forces you to think before coding
- **Audit trail**: Every change has a description from the start
- **Parallel work**: Multiple changes as siblings from main
- **JJ philosophy**: The tool enforces what JJ was designed for

## Requirements

- [JJ](https://github.com/jj-vcs/jj) installed and in PATH
- OpenCode with plugin support

## License

MIT
