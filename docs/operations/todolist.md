# MoveMate Strategic Backlog Snapshot

> Generated from GitHub on `2026-04-21T06:32:31.737Z` for `KKiranG/moverrr`.
>
> Derived artifact only. Update issues, labels, fields, and linked pull requests in GitHub instead of editing this file by hand.

---

Open issues: **3**

## State summary

- `state:pr-open`: 1
- `state:blocked`: 1
- `state:needs-founder-decision`: 1

## Open issues by state

## state:pr-open

### `#41` MoveMate revamp pass: repo OS, GitHub live workflow, and product hardening baseline
- URL: [#41](https://github.com/KKiranG/moverrr/issues/41)
- Type: `type:builder-task`
- Lane: `lane:docs-sync`
- State: `state:pr-open`
- Priority: `priority:p0`
- Size: `size:xl`
- Risk: `risk:high`
- Updated: 2026-04-21
- Lock group: `system-hygiene`
- Affected surfaces: `surface:customer-web`, `surface:carrier-web`, `surface:ops`, `surface:github`, `surface:docs`
- Blocked by: none
- Founder decision: No founder decision needed for the revamp pass itself. Pricing economics remain frozen separately in issue #39.
- Founder decision detail: Issue #39 handles the unresolved pricing direction. Issue #40 handles GitHub Project v2 scopes.
- Linked PRs: none found
- Context: The repo had conflicting operating docs, stale naming, markdown backlog drift, broken package/tooling assumptions, and partially mounted product flows. This work unifies the control plane and ships the core hardening ne...
- Done when:
  - Canonical repo docs agree on authority, lock groups, review packets, and GitHub-first live state.
  - Issue forms, PR template, label bootstrap, and backlog sync scripts are in place.
  - `docs/operations/todolist.md` and `docs/operations/completed.md` are derived from GitHub.
  - `npm run check`, `npm run test`, and `npm run build` pass.
  - Customer `/move/new` is a single MoveMate declaration surface feeding live results.
  - Key carrier activate/post/detail/runsheet routes are mounted to real data-driven surfaces.
  - Product-facing naming is aligned to MoveMate where safe.
- Safe parallelism: No. This work crosses the repo operating system, GitHub workflow, and shared product flows.
- Latest activity: No comments yet.

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
