# movemate-worker-handoff

Use this skill when delegating MoveMate work to Codex, Claude, Hermes, subagents, or future tools.

## Handoff Shape

Include:

- `Intent`
- `Why it matters`
- `Exact scope`
- `Likely files / surfaces`
- `Non-goals`
- `Product invariants`
- `Lock Group`
- `Touches shared logic`
- `Safe for parallelism`
- `Validation commands`
- `Expected output`
- `Stop conditions`

## Worker Rules

- Workers are not product authority.
- Workers must not broaden scope without reporting it.
- Workers must not touch unrelated dirty files.
- Workers must list changed files and verification evidence.
- Workers must stop for founder-gated decisions.
- Workers must preserve existing user changes.

## Parallelism Rules

- One builder per lock group unless the issue explicitly says `Safe for parallelism: yes`.
- Use disjoint write sets for parallel work.
- Treat pricing, booking state, matching, data model, auth, migrations, and shared primitives as shared logic by default.

## Expected Return

Workers should return:

- files changed
- reason for each change
- commands run
- pass/fail status
- residual risk
- next recommended step
