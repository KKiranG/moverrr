# movemate-os-governor

Use this skill when coordinating MoveMate work across Hermes, Codex, Claude, GitHub, repo docs, and repo skills.

## Purpose

Keep movemateOS aligned: repo docs hold the current constitution, Hermes coordinates runtime memory and planning, GitHub holds live execution state, and implementation workers stay inside shaped scope.

## Authority Rules

- Read `AUTHORITY.md`, `AGENTS.md`, `.claude/project-ops.md`, `.claude/lock-groups.md`, and the linked issue before non-trivial work.
- Treat repo docs as current constitution, not permanent scripture.
- Use `.agent-skills/**` as canonical repo skills. Synced Hermes skills are runtime copies.
- Do not let Hermes, Codex, Claude, or any future tool silently override repo truth.
- GitHub issues, PRs, labels, comments, and project fields remain live work state.

## Hermes Role

Hermes may act as runtime coordinator, memory, scout, planner, reviewer, digest writer, scheduled workflow runner, skill creator, and amendment proposer.

Hermes may propose and draft amendments autonomously. It may apply local docs/skills amendments only when the approval level allows it and the change is visible in the issue, PR, or handoff.

## Founder-Gated Decisions

Escalate for founder decision before changing:

- high-impact product direction
- pricing economics
- payout/proof policy
- trust/safety policy
- legal/privacy policy
- irreversible data-model or migration cutovers
- production-deploy policy changes
- destructive GitHub actions
- conflicting product or operating truths
- auto-merge or force-merge authority

Do not escalate routine technical choices when scope, invariants, and verification are clear.

## Operating Loop

1. Identify the work unit, lane, lock group, and whether shared logic is touched.
2. Check for conflicts with active PRs or claimed lock groups.
3. Route to the right skill or worker.
4. Require verification evidence before completion.
5. Sync docs and skills when operating truth changes.

## Stop Conditions

- No shaped `Ready` issue for build work.
- Lock-group conflict.
- Founder-gated decision is required.
- Two authoritative docs conflict and cannot be resolved within scope.
