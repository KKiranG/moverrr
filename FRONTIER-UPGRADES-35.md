# moverrr — 120 Frontier Upgrades To Do Next

This file is a founder-grade backlog of improvements inspired mostly by the local `claude code src` material, with additional operating-loop ideas taken from `autoresearch`.

It is intentionally not a todo list for immediate implementation.
It is a structured bank of clear next moves you can later turn into real implementation tasks.

## How to use this file

- Treat each item as a candidate improvement, not a promise.
- Convert only the highest-value items into `todolist.md` later.
- Keep the product thesis in mind while selecting work:
  browse-first spare-capacity marketplace, not dispatch, not quote comparison, not bidding.
- Prefer items that strengthen trust, supply speed, customer clarity, and verification first.
- Use the `autoresearch` lesson here: baseline first, change one important thing, decide keep or discard from evidence.

## 1. Instruction Architecture And Project Memory

1. **Add `search-and-matching` scoped memory** — create `.claude/rules/search-and-matching.md` scoped to search and matching files so route-fit and disqualifier logic loads only when relevant.
2. **Add `payments-and-payouts` scoped memory** — create `.claude/rules/payments-and-payouts.md` scoped to Stripe, payouts, and webhook files so funds-flow rules are tighter than the current generic ops guidance.
3. **Add `supabase-schema` scoped memory** — create `.claude/rules/supabase-schema.md` for `supabase/**` and `src/types/database.ts` covering migrations, RPCs, rollback expectations, RLS, and type syncing.
4. **Add `analytics-and-metrics` scoped memory** — create `.claude/rules/analytics-and-metrics.md` so event work stays attached to business questions instead of becoming event clutter.
5. **Add `carrier-growth` scoped memory** — create a rule for carrier onboarding, activation, posting speed, and reuse patterns so supply-side changes stay focused on the real wedge.
6. **Add `customer-trust` scoped memory** — create a rule for booking clarity, pricing transparency, no-result handling, and post-booking trust signals.
7. **Add `admin-operations` scoped memory** — create a rule specifically for admin queues, dispute handling, carrier verification, and operational dashboards.
8. **Add `copy-and-positioning` scoped memory** — create a rule that preserves moverrr's browse-first language and prevents quote-engine or removalist drift in UI copy.
9. **Create a checked-in `DECISIONS.md`** — store short product and architecture decisions so important choices are not trapped in old chats.
10. **Create `OPEN-QUESTIONS.md`** — track unresolved product questions that agents should not silently "decide" through implementation.
11. **Create `METRICS.md`** — define the exact marketplace metrics that matter now so analytics work has a stable reference.
12. **Create `RISKS.md`** — keep the top product, operational, and technical risks visible in one place.
13. **Create a docs precedence note** — explicitly document which source wins when `CLAUDE.md`, `.claude/rules/`, `.agent-skills/`, and skills disagree.
14. **Document rule locality conventions** — write down where future scoped rules should live and how narrow their `paths` frontmatter should be.
15. **Document skill design conventions** — define when to create a skill versus a rule versus an `.agent-skills` reference note.

## 2. Agent Roles, Delegation, And Runtime Discipline

16. **Create a dedicated `product-researcher` agent** — add a role for reading shipped behavior and translating it into product insights without changing code.
17. **Create a dedicated `payments-verifier` agent** — make a high-caution role that only validates payment and payout behavior.
18. **Create a dedicated `mobile-verifier` agent** — add a role that specializes in iPhone-first UI verification and proof-upload flows.
19. **Create a dedicated `schema-reviewer` agent** — add a role that reviews migrations, policies, RPC shape, and database safety before merge.
20. **Create a dedicated `copy-guardian` agent** — add a role that protects product language and prevents marketplace-shape drift in copy and empty states.
21. **Document when to use the founder critic** — add a compact list of triggers so feature requests with wedge risk automatically get a scope review.
22. **Document when not to delegate** — make a repo-specific note that shallow understanding should never be outsourced to a sub-agent.
23. **Define worktree usage rules** — write down when agent work should happen in isolated worktrees versus the main tree.
24. **Define branch naming conventions for agent work** — standardize how major doc, feature, bugfix, and experiment branches should be named.
25. **Create a release-readiness skill** — make a reusable runbook that checks docs, verification, key flows, and open risks before any release candidate.
26. **Create a dispute-resolution-audit skill** — make a runbook for any change touching disputes, evidence review, or admin resolution paths.
27. **Create a saved-search-demand-review skill** — make a runbook for reading saved-search demand and recommending supply-side responses.
28. **Create an admin-queue-review skill** — make a workflow for periodic operational queue audits.
29. **Create a metrics-review skill** — make a workflow that turns current numbers into product decisions instead of just summaries.
30. **Create a postmortem skill** — make a workflow for writing clean product/ops/technical postmortems when something goes wrong.

## 3. Verification, Testing, And Adversarial QA

31. **Add a booking concurrency integration test** — prove only one booking can win the race on the same listing.
32. **Add a cancellation-capacity integration test** — verify capacity and listing state recover correctly after cancellation.
33. **Add a dispute-completion regression test** — prove unresolved disputes cannot reach `completed`.
34. **Add a booking pricing identity test suite** — expand coverage so the formula stays correct across helper and stairs combinations.
35. **Add a webhook replay harness** — allow Stripe event sequences to be replayed intentionally for debugging.
36. **Add a route-contract smoke suite** — quickly assert response shape and auth behavior for public, carrier, customer, and admin routes.
37. **Add a mobile proof-upload test harness** — specifically verify camera-first file behavior, HEIC support, and proof state transitions.
38. **Add a trip-template end-to-end test** — save template, quick-post from template, and verify resulting listing.
39. **Add a saved-search end-to-end test** — save no-result search, create matching listing, and exercise notification handling.
40. **Add a carrier onboarding smoke flow** — verify the main supply-activation path still works after relevant changes.
41. **Add an admin verification smoke flow** — verify carrier verification still functions end to end.
42. **Add a review-response flow test** — validate the post-completion review and carrier response path.
43. **Add manual verification templates** — require every meaningful task to record one happy-path check and one adversarial probe.
44. **Create verifier skills by surface** — add dedicated verifier skills for web UI, API, and possibly admin flows rather than one generic verifier.
45. **Add bug reproduction templates** — require every bug fix to record how the original issue is reproduced before claiming it is fixed.

## 4. Tooling, Observability, And Safety Rails

46. **Add invariant logging for booking state changes** — log current state, actor, requested transition, and resolution when a booking changes status.
47. **Add invariant logging for pricing breakdowns** — log mismatches when totals, payout, fee, and commission no longer line up.
48. **Add stuck-state detection for bookings** — surface bookings sitting too long in `pending`, `confirmed`, `delivered`, or `disputed`.
49. **Add stuck-state detection for carrier verification** — surface carriers that entered onboarding but are stalled in document or review states.
50. **Add notification failure visibility** — create an internal report for skipped, failed, or delayed notification sends.
51. **Add payment capture failure visibility** — surface payment-capture and payout failures in a clear admin report.
52. **Add saved-search match failure visibility** — report when a relevant listing appears but no saved-search notification goes out.
53. **Add supply-health diagnostics** — surface listings with stale or inconsistent `remaining_capacity_pct` values.
54. **Add geospatial query diagnostics** — log slow or suspicious search/matching queries so route-fit performance issues are visible.
55. **Add an "ops morning report" generator** — create a compact operational digest showing stuck states, failed jobs, and urgent trust issues.
56. **Add a "trust incidents" register** — document proof failures, disputes, payment confusion, and safety issues as a searchable internal record.
57. **Add a "last known good release" note** — make it easy to identify the last stable release or commit when something regresses badly.
58. **Add a migration safety checklist** — define exactly what must be checked before and after applying a schema change.
59. **Add a webhook debugging guide** — document how to replay and inspect payment-webhook behavior locally.
60. **Add a local environment health check script** — validate the presence or absence of the expected env and fallback behavior deliberately.

## 5. Product Metrics And Instrumentation

61. **Measure carrier time-to-post** — track time from wizard open to successful listing creation.
62. **Measure carrier onboarding completion rate** — track where prospective carriers drop off before verification.
63. **Measure time-to-first-post after verification** — track how quickly newly verified carriers create real inventory.
64. **Measure weekly active carriers** — track real supply activity, not just registered accounts.
65. **Measure template reuse rate** — track whether templates materially improve recurring posting behavior.
66. **Measure listing freshness** — track how many active listings are recent enough to matter to demand.
67. **Measure search no-result rate** — segment by route pair, day, and item category.
68. **Measure saved-search capture rate** — track how often empty-state users convert into saved-search demand.
69. **Measure saved-search to booking conversion** — understand whether saved searches are truly useful.
70. **Measure trip-card click-through rate** — verify whether search result presentation is clear enough.
71. **Measure trip-detail to booking-start rate** — track whether trust and pricing clarity are working on the detail page.
72. **Measure booking completion rate** — identify where users fall out of the booking funnel.
73. **Measure proof completion lag** — track time from pickup and delivery status changes to proof upload.
74. **Measure dispute rate per completed booking** — watch trust quality directly.
75. **Measure dispute resolution cycle time** — understand whether manual ops remain manageable.

## 6. Carrier Supply Growth And Activation

76. **Create a carrier activation scorecard** — define the minimum set of behaviors that signal a carrier is truly activated.
77. **Add a first-7-days carrier report** — track whether new carriers verify, post, repost, and complete jobs in their first week.
78. **Create a repeat-poster segment** — identify carriers posting weekly so product work can optimize for their habits.
79. **Create a stalled-carrier segment** — identify carriers who verified but stopped posting so reactivation work is targeted.
80. **Create a top-routes-by-supply dashboard** — show which routes have healthy inventory and which do not.
81. **Create a demand-without-supply report** — use saved searches and no-result routes to guide carrier outreach.
82. **Create a carrier interview template** — standardize how you learn why carriers do or do not repost.
83. **Create a post-first-trip feedback loop** — capture what the first posting experience felt like for new carriers.
84. **Create a post-first-job feedback loop** — capture what the first completed booking felt like operationally.
85. **Create a weekly supply review ritual** — use a short markdown format for new carriers, active carriers, repeat posters, stalled carriers, and empty-demand routes.

## 7. Customer Demand, Conversion, And Clarity

86. **Improve the no-result research loop** — analyze empty searches weekly and classify whether the problem was route, date, category, or pricing.
87. **Create a pricing clarity audit** — regularly inspect trip cards and detail pages to ensure the customer sees why the route is cheaper.
88. **Create a search-result clarity review** — validate that route fit, trust, timing, and price are obvious without opening a trip.
89. **Create a booking-dropoff analysis** — track where users stop during item details, addresses, review, or payment.
90. **Create a post-booking reassurance audit** — inspect whether confirmation messaging reduces uncertainty after booking.
91. **Create a customer interview template** — standardize how you learn why users booked, bounced, or disputed.
92. **Create a "why not booked" taxonomy** — classify no-booking sessions into no-results, low trust, price confusion, timing mismatch, or flow friction.
93. **Track dedicated-move comparison usage** — verify that the savings framing is actually seen and useful.
94. **Track route-fit message effectiveness** — measure whether clearer route-fit explanations improve booking intent.
95. **Create a trust-signal review** — regularly inspect how verification, proof expectations, ratings, and response clarity are presented to customers.

## 8. Trust, Admin, Proof, And Operations

96. **Create a trust review ritual** — once a week, review proof gaps, stuck bookings, payment failures, disputes, and carrier verification bottlenecks.
97. **Create an admin queue taxonomy** — classify admin work into verification, payment issue, dispute, proof issue, and manual override so tooling follows real work.
98. **Create a dispute reason taxonomy** — define categories so dispute trends can guide product fixes.
99. **Create a cancellation reason taxonomy** — define structured reasons for both carrier and customer cancellations.
100. **Create a payment-issue playbook** — document the exact first-response steps for failed capture, failed payout, webhook mismatch, and refund ambiguity.
101. **Create a proof-issue playbook** — document what to do when proof is missing, late, low quality, or disputed.
102. **Create a carrier verification playbook** — define the exact review sequence, required evidence, and exception handling path.
103. **Create a manual override log** — whenever admin overrides a normal workflow, record why and what system weakness it exposed.
104. **Create a "top friction in ops" report** — each week identify the top repeated admin pain points that deserve automation or product changes.
105. **Create a "trust debt" backlog** — track unresolved trust problems separately from polish work so they do not disappear into a generic enhancement list.

## 9. Experiment Design And Autoresearch-Style Learning Loops

106. **Create an experiment ledger** — record baseline, hypothesis, single major change, result, and keep/discard decision for every meaningful experiment.
107. **Create a standard baseline template** — require every experiment to name the current number or current user behavior before changing anything.
108. **Create a standard keep/discard rule** — require an explicit threshold before implementation so experiments do not become endless opinion wars.
109. **Create a "one major variable" rule** — document that most product experiments should change one major thing at a time.
110. **Create a near-miss review loop** — review experiments that almost worked and decide if they deserve a cleaner second pass.
111. **Create a simplification win log** — record where removing complexity kept or improved outcomes, because `autoresearch` treats simplification as a real win.
112. **Create a radical-idea bucket** — store larger product bets separately so they do not pollute near-term execution.
113. **Create a recurring experiment review ritual** — weekly or biweekly, review recent experiments and explicitly keep, discard, or reframe them.
114. **Create a "what we learned" digest** — turn experiment results into short reusable product knowledge, not just one-off notes.
115. **Create an "evidence before scale" rule** — document that new automation or broad feature expansion should happen only after manual evidence says the underlying behavior is real.

## 10. Simplification, Refactoring, And Code Health

116. **Add a simplify pass to major changes** — after substantial work, intentionally review for reuse, parameter sprawl, redundant state, and duplicate logic.
117. **Create a "reuse before invent" checklist** — before adding helpers or new patterns, check whether the repo already has a suitable primitive.
118. **Create a "locality first" refactor rule** — bias toward colocated, scope-specific abstractions before introducing broad shared layers.
119. **Create a "hot path caution" checklist** — explicitly inspect startup paths, per-request paths, and booking-critical code before adding expensive work.
120. **Create a recurring docs-and-memory refactor pass** — once a month prune stale docs, collapse duplicates, promote repeated workflow text into skills, and keep the instruction system sharper than the average codebase.
