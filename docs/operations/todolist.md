# MoveMate Strategic Backlog Snapshot

> Generated from GitHub on `2026-04-21T06:29:25.537Z` for `KKiranG/moverrr`.
>
> Derived artifact only. Update issues, labels, fields, and linked pull requests in GitHub instead of editing this file by hand.

---

Open issues: **2**

## State summary

- `state:blocked`: 1
- `state:needs-founder-decision`: 1

## Open issues by state

## state:blocked

### `#40` Ops follow-up: enable GitHub Project v2 fields once project scopes are available
- URL: [#40](https://github.com/KKiranG/moverrr/issues/40)
- Type: `type:builder-task`
- Lane: `lane:docs-sync`
- State: `state:blocked`
- Priority: `priority:p1`
- Size: `size:s`
- Risk: `risk:medium`
- Updated: 2026-04-21
- Lock group: `system-hygiene`
- Affected surfaces: `surface:ops`, `surface:github`
- Blocked by: GitHub token needs `read:project` and project-write scopes.
- Founder decision: No founder decision needed
- Linked PRs: none found
- Context: The repo now uses GitHub issues, labels, linked PRs, and derived digests as the live work system. Repo auth can manage labels and issues, but current token scopes do not include project access.
- Done when:
  - GitHub Project v2 fields are created.
  - Views reflect lane, lock group, and state-based routing.
  - Project setup docs are updated with the exact applied configuration.
- Safe parallelism: Product work can continue safely while this remains blocked.
- Latest activity: No comments yet.

## state:needs-founder-decision

### `#39` Founder decision: resolve MoveMate pricing blueprint vs code
- URL: [#39](https://github.com/KKiranG/moverrr/issues/39)
- Type: `type:founder-decision`
- Lane: `lane:trust-safety`
- State: `state:needs-founder-decision`
- Priority: `priority:p0`
- Size: `size:m`
- Risk: `risk:high`
- Updated: 2026-04-21
- Lock group: `matching-pricing-state`
- Affected surfaces: `surface:payments`
- Blocked by: none
- Founder decision: Founder decision required now
- Founder decision detail: Current code is frozen as canonical for this pass. The decision needed is whether a later migration should preserve that model or intentionally change it.
- Linked PRs: none found
- Context: Choose whether MoveMate should keep the current pricing implementation or move to a revised marketplace pricing model in a separate scoped change.
- Done when:
  - Founder confirms the pricing direction.
  - Follow-up implementation stays scoped to the chosen direction.
  - Canonical docs and reviewer rules are aligned.
- Safe parallelism: Other work can continue outside pricing economics, but no builder should silently change pricing rules while this decision is open.
- Latest activity: No comments yet.
