# movemate-founder-review

Use this skill when a decision requires founder judgment instead of routine engineering execution.

## Decision Threshold

Founder review is required for:

- high-impact product direction
- pricing commission, fees, surcharge policy, or economics
- payout release, proof, dispute, or payment-policy changes
- trust/safety, direct-contact, legal, or privacy policy
- irreversible data-model or migration cutovers, or production-deploy policy changes
- destructive GitHub actions
- auto-merge, force-merge, or authority-reduction policy
- unresolved conflict between canonical docs

Founder review is not required for:

- routine implementation inside a shaped issue
- local docs cleanup that preserves existing truth
- tests, refactors, or scripts that do not change product or operating authority
- obvious stale path repairs

## Packet Shape

Write founder packets with:

- `Issue / PR`
- `What changed`
- `Why it matters`
- `Product or operating invariant affected`
- `Options`
- `Recommendation`
- `Trade-off`
- `Files affected`
- `Validation evidence`
- `Exact founder decision needed`
- `Risk if we wait`
- `Risk if we choose wrong`

## Output Rules

- Give 2-3 real options, not one disguised choice.
- State the recommendation plainly.
- Separate merge blockers from later queue items.
- After the decision, update the canonical doc or skill that carries the durable truth.
- Do not preserve raw chat as the only decision record.
