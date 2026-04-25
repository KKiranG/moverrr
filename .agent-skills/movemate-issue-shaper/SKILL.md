# movemate-issue-shaper

Use this skill to turn vague work into a build-ready MoveMate GitHub issue.

## Required Fields

Every build-ready issue must define:

- `Outcome`
- `Why it matters`
- `Non-goals`
- `Lane`
- `Lock Group`
- `Priority`
- `Size`
- `Risk level`
- `Files or surfaces likely touched`
- `Blocked by`
- `Safe for parallelism`
- `Touches shared logic`
- `Founder decision needed`
- `Acceptance criteria`
- `Invariants to preserve`
- `Verification`
- `Rollout / fallback`
- `Rollback risk`

## Lane And Lock Group

Pick one owning lane. If several lanes apply, record secondary lanes in the body.

Use lock groups from `.claude/lock-groups.md`:

- `customer-acquisition`
- `customer-booking-lifecycle`
- `carrier-activation-posting`
- `carrier-operations`
- `matching-pricing-state`
- `admin-operator`
- `system-hygiene`

Default `Safe for parallelism: no` when shared pricing, booking state, matching, schema, auth, or core primitives are touched.

## Shaping Rules

- Keep scope small enough for one PR.
- List non-goals explicitly.
- Include exact verification commands or manual checks.
- Preserve MoveMate invariants from `AGENTS.md` and the blueprint.
- Send founder-gated decisions to `movemate-founder-review` instead of hiding them in acceptance criteria.

## Ready Definition

An issue is `Ready` only when a builder can start without re-deriving product truth, guessing touched surfaces, or asking for basic verification criteria.
