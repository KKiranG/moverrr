---
name: monthly-memory-refactor
description: Audit MoveMate's rules, skills, agents, and root docs for stale paths, duplicate truth, and bloated always-loaded memory before any cleanup edit.
when_to_use: Use when the repo instruction system needs a periodic cleanup pass, a markdown drift audit, or a docs architecture review.
argument-hint: [focus: rules|agents|skills|all]
allowed-tools: [Read, Glob, Grep]
effort: high
---

# Monthly Memory Refactor

Use this workflow to produce a sharp docs and memory cleanup plan before editing anything.

## Read First

1. `AGENTS.md` — universal contract (product thesis, invariants, parallelism)
2. `CLAUDE.md` — Claude overlay (gstack skills, session-start, hooks)
3. `.claude/operating-system.md` — Claude cheatsheet / pointer
4. `.claude/capability-index.md`
5. `TASK-RULES.md`
6. The focus area requested in `$ARGUMENTS`

Default focus: `all`

## Audit For

- dead paths or dead commands
- duplicate truth across layers
- future-tense docs for already shipped behavior
- always-loaded files that should move to narrower scopes
- skills or agents that exist on disk but are missing from indexes
- stale backlog references to shipped operating-system work

## Output Format

- files inspected
- stale or duplicate findings with exact file paths
- what the canonical source should be
- proposed rewrite, move, or deletion
- items that need user confirmation before editing

Do not edit anything until the user confirms the cleanup plan.
