# movemate-review-packet

Use this skill to review a PR or work packet with MoveMate's review model.

## Pass 1: Mechanical Screen

Check:

- issue and PR scope match
- touched files match the intended surfaces
- overlap with open PRs or claimed lock groups
- lane and lock-group conflicts
- product or operating invariant violations
- validation evidence is credible

Possible outcomes:

- `merge-candidate`
- `needs-revision`
- `duplicate`
- `blocked`
- `needs-founder-decision`
- `reject`

## Pass 2: Frontier Adjudication

Required for:

- pricing
- booking
- payout/proof
- trust/safety
- matching
- migrations
- data model
- core product logic

State:

- verdict
- rationale
- explicit risk
- must-fix blockers
- queueable follow-ups
- founder decision needed, if any

## Pass 3: Founder Digest

Only escalate real decisions. The founder should see:

- what shipped or is ready
- what is blocked
- what needs a decision
- recommended decision and trade-off
- next ranked queue

## Packet Rules

- Findings come before summaries.
- Do not ask the founder to inspect raw diffs by default.
- Do not smuggle scope drift into the current PR.
- If verification is weak, say exactly what is unverified.

## Local Foundation Review Checklist

When reviewing movemateOS foundation or repo-operating-system changes:

1. Inspect `git status --short`, `git diff --stat`, `git diff --name-status`, and the relevant file diffs from `/Users/kiranghimire/Documents/movemate`.
2. Explicitly exclude unrelated/pre-existing local state from commit guidance, especially `.claude/settings.local.json` and `supabase/.temp/` when they appear as dirty local files.
3. Verify path hygiene: current local repo links should use `/Users/kiranghimire/Documents/movemate`; `/Users/kiranghimire/Documents/moverrr` should remain only as historical/deployed-alias context where explicitly justified.
4. Check that repo skills under `.agent-skills/**` remain canonical and that synced Hermes skills are runtime copies, not the source of truth.
5. After editing any `.agent-skills/movemate-*` skill, run `bash scripts/sync-hermes-skills.sh` or `npm run skills:sync:hermes` so Hermes runtime copies do not drift.
6. Watch for overbroad founder gating. Routine implementation, reversible docs/scripts work, tests, and shaped technical decisions should not require founder approval; founder gates should stay focused on high-impact product, pricing/economics, trust/safety, legal/privacy, irreversible migrations/cutovers, production-deploy policy, destructive GitHub actions, conflicting truths, and auto-merge/force-merge authority.
7. Re-run verification after any review-time fix: at minimum `git diff --check` and the relevant repo check command if available.
