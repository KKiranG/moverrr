# moverrr — Active Backlog

> Last refreshed: `2026-04-01` — rewritten from live Chrome testing at 375px and 1280px viewports
> Format governed by `TASK-RULES.md`. Work top-to-bottom within each priority level.
> Move completed items to `completed.md` — never mark done in this file.

---

## Product Guardrails (Read Before Touching Any Item)

- moverrr is a **browse-first spare-capacity marketplace**. Not dispatch, not removalist booking, not AI matching.
- Commission math in `src/lib/pricing/breakdown.ts` is frozen unless explicitly discussed.
- iPhone-first rules are non-negotiable: `min-h-[44px]`, `active:` alongside every `hover:`, `capture="environment"` on proof inputs, safe-area insets on fixed elements.
- Trust beats cleverness. Supply speed beats polish.

---

## 🔴 P0 — Production Blocking

---

## 🟠 P1 — User-Facing Bugs

---

## 🟡 P2 — UX & Conversion

---

## 🟢 P3 — Enhancements

### ES — Supply-Side Enhancements

- [ ] **ES4** — Multi-vehicle support groundwork
  - **File(s):** `src/components/carrier/carrier-onboarding-form.tsx`, `src/app/(carrier)/carrier/trips/page.tsx`, `src/lib/data/listings.ts`
  - **What:** Remove remaining single-vehicle assumptions from carrier flows so trips can be associated with one of several vehicles later without another UX rewrite.
  - **Why:** Strong carriers will outgrow the single-vehicle model first; deferring the groundwork too long turns the first serious fleet into a migration project.
  - **Done when:** Carrier flows no longer assume exactly one vehicle exists and `npm run check` passes cleanly.

- [ ] **ES5** — No "pause listing" action — only draft/active/cancel
  - **File(s):** `src/components/carrier/trip-edit-form.tsx`, `src/lib/validation/trip.ts`
  - **What:** The trip status select in `TripEditForm` only allows `draft`, `active`, `cancelled`. There is no `paused` state. A carrier who needs to hold a trip (injury, vehicle issue, date uncertainty) must cancel and repost, losing their listing position and booking history.
  - **Why:** Cancelling and reposting is high-friction. A "Pause (temporarily hidden from search)" state reduces unnecessary cancellations.
  - **Done when:** A `paused` status is added to the status machine and trip update schema, paused trips are excluded from `listPublicTrips` and `searchTrips`, and the TripEditForm shows the pause option with a clear explanation.

### ED — Demand-Side Enhancements

- [ ] **ED4** — Booking-confirmed customer notification still needs end-to-end verification
  - **File(s):** `src/lib/data/bookings.ts`, `src/lib/notifications.ts`
  - **What:** The confirmed-booking email flow exists in code, but it still needs a full booking → carrier confirm → email verification run against real env wiring.
  - **Why:** Booking confirmation is the top trust moment in the customer journey. Silence after authorization feels like failure.
  - **Done when:** Manual booking flow confirms the customer receives the confirmed-booking email with booking reference, route, date, price, and next steps.

- [ ] **ED6** — Web push notifications for booking updates
  - **File(s):** `src/lib/notifications.ts`, `new file: public/service-worker.js`, `new file: src/hooks/usePushNotifications.ts`
  - **What:** Add opt-in web push for booking confirmed, trip-day reminder, and delivery-confirmed milestones.
  - **Why:** Same-day logistics needs faster-than-email notification loops before the native iOS app exists.
  - **Done when:** Opted-in customers and carriers receive push notifications for key booking milestones and VAPID env vars are wired.

### EP — Platform and Infrastructure Enhancements

- [ ] **EP1** — Trip search uses `ilike` suburb matching, not geospatial radius
  - **File(s):** `src/lib/data/trips.ts` (`queryTripsByDateWindow`), `src/lib/matching/filter.ts`
  - **What:** The date-window fallback search uses `.ilike("origin_suburb", "%Bondi%")` — a substring match. "Bondi" matches "Bondi", "Bondi Beach", "North Bondi", "Bondi Junction" with equal weight. The geospatial RPC is only used in the primary search path; fallback drops to suburb text matching.
  - **Why:** A carrier who posts a Bondi Beach to Sydney CBD trip appears for a "Bondi Junction" search when they may be 3km apart. Mismatched routes lead to cancellations.
  - **Done when:** Fallback search uses a geospatial bounding box or suburb-centre coordinates rather than text `ilike`.

- [ ] **EP2** — No pagination on search results — SEARCH_PAGE_SIZE cap is silent
  - **File(s):** `src/app/(customer)/search/page.tsx`, `src/lib/constants.ts`
  - **What:** `searchTrips` applies a `SEARCH_PAGE_SIZE` limit. If there are more results than the limit, the extra trips are silently hidden with no "Load more" or page indicator. A customer searching a popular route sees 20 trips and assumes that's all of them.
  - **Why:** On a route with 30+ listings, hiding 10 trips means some carriers never receive bookings despite being live and priced well.
  - **Done when:** Search results show "Showing 20 of 34 trips" with a "Show more" button that appends the next page, or infinite scroll.

- [ ] **EP4** — `getPrivilegedSupabaseClient` in bookings still allows unsafe fallback paths
  - **File(s):** `src/lib/data/bookings.ts`
  - **What:** Remove silent privileged-client fallbacks for admin-only booking operations so background or cross-user mutations fail loudly instead of no-oping under RLS.
  - **Why:** Silent no-ops leave stale capacity, incomplete audit events, and false confidence in staging or automation flows.
  - **Done when:** Admin-only booking operations hard-fail without service-role access and `npm run check` passes.

- [ ] **EP5** — Analytics events still have no dedupe guard for repeated mounts/actions
  - **File(s):** `src/lib/analytics.ts`, `src/app/api/search/route.ts`, `src/app/api/bookings/route.ts`
  - **What:** Search and booking-started events are inserted directly with no idempotency or dedupe key, so strict-mode/dev retries and repeated action paths can double-count funnel steps.
  - **Why:** Inflated analytics make browse-to-book conversion baselines noisy before launch.
  - **Done when:** Search and booking-started events are idempotent per real action in both development and production paths.

- [ ] **EP9** — Input sanitization audit is still incomplete on non-trip/booking write paths
  - **File(s):** `src/lib/utils.ts`, `src/app/api/**`, `src/lib/data/carriers.ts`, `src/lib/data/feedback.ts`
  - **What:** Trip and booking routes sanitize key freetext fields, but the wider audit is not finished. Carrier/admin/review mutations still need route-by-route confirmation that `sanitizeText()` is applied before persistence.
  - **Why:** One missed admin-facing or public-profile field is enough to leave a stored-XSS hole in the trust and ops surfaces.
  - **Done when:** All mutating freetext routes consistently sanitize before persistence and `npm run check` passes.

- [ ] **EP10** — Offline-first proof upload with service worker queue
  - **File(s):** `new file: public/service-worker.js`, `new file: src/hooks/useOfflineUpload.ts`, proof upload components under `src/components/booking/`
  - **What:** Queue proof-photo uploads for retry when a carrier is on poor mobile data instead of failing immediately.
  - **Why:** Trip-day proof capture happens in the least reliable network conditions; queued retry is safer than manual re-upload.
  - **Done when:** Offline proof uploads show a queued state and auto-retry when connectivity returns.

- [ ] **EP12** — Metadata coverage is improved but still incomplete on many internal pages
  - **File(s):** `src/app/layout.tsx`, page-level files under `src/app/(admin)`, `src/app/(carrier)`, `src/app/(customer)/bookings*`, `src/app/(customer)/saved-searches/page.tsx`, `src/app/(auth)/verify/page.tsx`
  - **What:** Homepage, search, trip detail, carrier profile, auth, marketing, and 404 pages now have page-specific metadata. Many internal pages still fall back to the layout default title instead of exporting their own metadata.
  - **Why:** Distinct titles matter for tab clarity, indexing, and ops usability when multiple moverrr tabs are open.
  - **Done when:** Internal admin, carrier, bookings, saved-searches, and verify pages export page-specific `metadata.title` or `generateMetadata()`.

### EA — Admin and Ops Enhancements

- [ ] **EA2** — Admin carriers page has no "bulk verify" for batches of similar carriers
  - **File(s):** `src/app/(admin)/admin/carriers/page.tsx`
  - **What:** Each carrier requires an individual click-through to verify. When onboarding a cohort of 10 carriers at once (launch day), admin must repeat the same verify flow 10 times individually.
  - **Why:** Supply onboarding events require batch tooling. Manual one-by-one verification is the bottleneck at the most critical supply moment.
  - **Done when:** Admin carrier list supports multi-select checkboxes and a "Verify selected" bulk action that calls the verify endpoint for each selected carrier.

- [ ] **EA5** — Manual ops override audit trail
  - **File(s):** `src/app/(admin)/admin/bookings/[id]/page.tsx`, `src/lib/data/bookings.ts`, `booking_events` table usage
  - **What:** Require an admin-entered reason for forced status changes, refunds, and other manual overrides, then persist that reason and actor ID to `booking_events`.
  - **Why:** Manual interventions need a durable audit trail for later support reviews and liability questions.
  - **Done when:** Every admin booking override writes `actor`, `action`, `reason`, and `timestamp` to `booking_events`.

- [ ] **EA6** — No "assign to admin" on disputes — all disputes are unowned
  - **File(s):** `src/app/(admin)/admin/disputes/page.tsx`, `disputes` table schema
  - **What:** Disputes don't have an `assigned_to` field. All open disputes appear in one shared queue. When two ops team members are working simultaneously, they may both respond to the same dispute.
  - **Why:** Duplicate dispute resolution responses confuse customers and create inconsistent outcomes.
  - **Done when:** Disputes have an `assigned_to_admin_id` field, ops can claim a dispute from the queue, and the queue shows unassigned vs. assigned separately.

- [ ] **EA7** — Admin payments page has no manual capture override
  - **File(s):** `src/app/(admin)/admin/payments/page.tsx`, `src/lib/data/bookings.ts`
  - **What:** Payment capture happens automatically when a booking moves to `completed`. If the webhook fails or a booking is stuck in `delivered` state, admin has no manual "Capture payment now" button. They would need a Stripe dashboard bypass outside the app.
  - **Why:** Revenue hangs on the correct operation of `stripe.paymentIntents.capture()`. When that fails (webhook miss, Stripe downtime), admin needs an in-app recovery path.
  - **Done when:** Admin booking detail page has a "Capture payment" manual override button that calls the capture path with Sentry logging, visible only when `payment_status = "authorized"` and booking is `completed`.

- [ ] **EA8** — Admin carrier notes and internal tags
  - **File(s):** `src/app/(admin)/admin/carriers/[id]/page.tsx`, `src/lib/data/carriers.ts`, `supabase/migrations/`
  - **What:** Add separate internal notes and tags such as trusted, probation, flagged, and VIP to carrier admin views.
  - **Why:** Ops needs internal context beyond verification notes without leaking those labels into carrier-facing APIs.
  - **Done when:** Admin carrier detail persists internal notes/tags and they remain invisible to carrier-facing responses.

### EQ — Code Quality and Test Coverage

- [ ] **EQ3** — Atomic booking concurrency integration test
  - **File(s):** `new file: src/lib/__tests__/bookings.integration.test.ts`, local Supabase setup
  - **What:** Prove two simultaneous `create_booking_atomic` attempts against one listing only allow one winner.
  - **Why:** The oversell fix is too important to trust without a real concurrency regression test.
  - **Done when:** Local Supabase integration test reliably shows one success, one `listing_not_bookable`, and correct remaining capacity.

- [ ] **EQ4** — Payment webhook contract tests
  - **File(s):** `new file: src/app/api/payments/webhook/__tests__/route.test.ts`
  - **What:** Cover webhook handling for payment failure, capturable updates, succeeded intents, missing booking metadata, replay-safe paths, and invalid signatures.
  - **Why:** Payment webhooks are a silent-failure hotspot and need fixture-backed contract coverage.
  - **Done when:** Contract tests pass for all target Stripe event cases and invalid signatures return 400.

- [ ] **EQ5** — WCAG 2.1 AA audit and remediation
  - **File(s):** `src/components/**`, `src/app/**`
  - **What:** Run an automated accessibility audit and remediate Level AA issues across browse, booking, and carrier posting flows.
  - **Why:** Accessibility gaps are user-experience gaps on iPhone too, and they compound quickly once more UI ships.
  - **Done when:** Automated audit reports zero AA violations on the search, booking, and carrier-posting flows.

- [ ] **EQ6** — API route input validation coverage audit
  - **File(s):** `src/app/api/**`
  - **What:** Finish converting every mutating API route to named Zod schemas parsed before any DB access.
  - **Why:** Inconsistent validation is a security and data-quality risk, even after the highest-risk routes have been hardened.
  - **Done when:** All mutating API routes use named Zod schemas at the boundary and `npm run check` passes.

- [ ] **EQ7** — `booking-form.tsx` and `carrier-trip-wizard.tsx` form state tests
  - **File(s):** `new file: src/components/booking/__tests__/booking-form.test.tsx`, `new file: src/components/carrier/__tests__/carrier-trip-wizard.test.tsx`
  - **What:** Add unit tests covering: draft persistence/restoration, payment retry state, file upload with WebP/HEIC, form disable during submission, step validation blocking, and options-adjusted price updates.
  - **Why:** Both forms are the highest-traffic, highest-impact components and have zero test coverage today.
  - **Done when:** Tests pass and cover all states enumerated above, with `npm run check` clean.

- [ ] **EQ8** — Admin route error-boundary coverage
  - **File(s):** `src/app/(admin)/admin/**`, `src/components/shared/error-boundary.tsx`
  - **What:** Wrap admin page sections so a partial loader failure degrades to a retry card instead of crashing the full admin surface.
  - **Why:** Ops needs partial visibility during incidents more than it needs a perfect all-or-nothing dashboard render.
  - **Done when:** Admin sections fail independently with retryable UI and the full admin page no longer hard-crashes on one loader error.

### EV — Visual / Design System

- [ ] **V1** — Consistent card border radius and shadow system
  - **File(s):** `tailwind.config.ts`, `src/components/ui/card.tsx`, `src/components/trip/trip-card.tsx`
  - **What:** Define one shared card token for radius, shadow, and hover/active lift, then apply it everywhere cards appear.
  - **Why:** A cleaner, repeatable card system reduces visual drift as more ops and marketplace surfaces ship.
  - **Done when:** Major card surfaces use one shared token and visual audit at 375px reads as a single system.

- [ ] **V2** — Typography scale constrained on mobile
  - **File(s):** `tailwind.config.ts`, `src/app/globals.css`, major page components
  - **What:** Normalize mobile pages onto a three-size semantic typography scale.
  - **Why:** Too many font sizes make the iPhone layouts feel noisy and less trustworthy.
  - **Done when:** Mobile pages use three or fewer text sizes per page without losing hierarchy.

- [ ] **V3** — `section-label` eyebrow text is overused — appears on 10+ cards per page
  - **File(s):** `src/app/globals.css`, all page components
  - **What:** Every card on the carrier dashboard, booking detail, and trip detail uses `.section-label` as an eyebrow. The pattern loses meaning when it appears 15 times on one page. Reserve it for primary section headers only.
  - **Why:** Overuse of eyebrow labels makes every section feel equally important — nothing is highlighted as primary.
  - **Done when:** `section-label` is used ≤3 times per page, and secondary card content uses `subtle-text` or plain `text-sm text-text-secondary` instead.

- [ ] **V4** — Loading state standardization (spinner to skeleton)
  - **File(s):** components using spinner-based loading under `src/components/**`
  - **What:** Replace remaining spinner-only loading states with skeletons or structured Suspense fallbacks.
  - **Why:** Skeletons preserve layout and feel faster on mobile than floating spinners.
  - **Done when:** Spinner-only loading states are removed from shared components in favor of skeleton or Suspense patterns.

- [ ] **V6** — Safe-area CSS audit for all sticky elements
  - **File(s):** `src/app/globals.css`, sticky/fixed UI components under `src/components/**`
  - **What:** Finish the audit so every sticky header, footer, CTA bar, and sheet clears the iPhone home indicator and notch areas.
  - **Why:** One missed sticky element can make the app feel broken on the exact devices MVP users are testing on.
  - **Done when:** All sticky elements respect safe-area insets on iPhone 14/15 class viewports.

- [ ] **V7** — Hover-only state sweep across all components
  - **File(s):** `src/components/**`
  - **What:** Complete the touch-feedback audit so every `hover:` treatment has an `active:` counterpart.
  - **Why:** Hover-only feedback is invisible on iOS and makes taps feel unresponsive.
  - **Done when:** Interactive components no longer rely on hover-only feedback and `npm run check` passes.

- [ ] **V8** — Dark mode: `bg-surface` and `bg-background` contrast insufficient in dark theme
  - **File(s):** `tailwind.config.ts`, `src/app/globals.css`
  - **What:** Dark mode is enabled via `dark:` Tailwind variants throughout the codebase, but the contrast ratio between `bg-surface` (card background) and `bg-background` (page background) in dark mode may be below WCAG AA ratio of 4.5:1 for text and insufficient card differentiation.
  - **Why:** Carriers using the app on trip day in low-light (van interior, car park) rely on dark mode for readability. Insufficient contrast in dark mode is an accessibility and safety concern.
  - **Done when:** Dark mode color pairs pass contrast checking for all text-on-background combinations, verified with a tool like `axe` or Chrome DevTools contrast checker.

### EX — External / Infrastructure

- [ ] **X1** — Vercel environment variable audit
  - **File(s):** `.env.example`, Vercel project settings
  - **What:** Verify production and preview environments contain every required runtime variable documented in the repo.
  - **Why:** Missing deployment env vars are the fastest path to "works locally, fails in production" incidents.
  - **Done when:** `.env.example` is current and Vercel production/preview env sets are confirmed against it.

- [ ] **X2** — No structured Sentry source maps for production builds
  - **File(s):** `src/lib/sentry.ts`, `next.config.js`, `package.json`
  - **What:** Sentry is initialized but source maps may not be uploaded at build time. Without source maps, Sentry error reports show minified stack traces that are unreadable.
  - **Why:** Production bugs captured by Sentry are uninvestigable without source maps. The error capture investment is wasted.
  - **Done when:** `@sentry/nextjs` is configured with `sentry.server.config.ts` and `sentry.client.config.ts`, build CI uploads source maps to Sentry, and a test error shows readable stack traces in Sentry.

- [ ] **X3** — Resend domain verification and production sender
  - **File(s):** `.env.example`, `src/lib/notifications.ts`, Resend dashboard, DNS provider
  - **What:** Verify the sending domain and switch lifecycle email to a branded production sender address.
  - **Why:** Branded deliverability matters for booking confirmations and dispute communication trust.
  - **Done when:** SPF/DKIM pass and lifecycle emails arrive from the branded sender in inboxes.

- [ ] **X4** — Health endpoint exists, but external degraded-state monitoring is not wired
  - **File(s):** `src/app/api/health/route.ts`, monitoring config outside repo
  - **What:** `/api/health` now returns structured component status for env, Supabase, Stripe, and Redis. The remaining gap is wiring an external monitor that alerts when the response reports a degraded dependency.
  - **Why:** Component-level health is only useful if someone gets paged before users notice the outage.
  - **Done when:** A monitoring tool polls `/api/health`, alerts on `"overall":"degraded"`, and is documented alongside the endpoint contract.

- [ ] **X6** — Deployment preview URLs for PRs
  - **File(s):** `.github/workflows/ci.yml`, Vercel project settings
  - **What:** Confirm each PR gets a live Vercel preview URL surfaced back into GitHub for review.
  - **Why:** Mobile-first UI review is materially faster with a live preview than a code-only pass.
  - **Done when:** Every PR against `main` shows a working Vercel preview URL in GitHub checks.

---

## ⚪ P4 — Post-MVP / Deferred

*Good ideas, not now. One line each — documented so they are not lost.*

- [ ] **P4-01** — LLM item classification from customer photo or description
- [ ] **P4-02** — Fixed price per item category (sofa, fridge, etc.) instead of carrier-set price
- [ ] **P4-03** — Percentage-based booking fee (3%) replacing the flat $5 — review after 50+ jobs
- [ ] **P4-04** — In-app messaging between carrier and customer
- [ ] **P4-05** — Interactive map view of active listings (pins on a map)
- [ ] **P4-06** — Live GPS tracking of carrier on trip day
- [ ] **P4-07** — Bidding / counter-offer flow for price negotiation
- [ ] **P4-08** — Surge pricing on high-demand routes or dates
- [ ] **P4-09** — Native iOS app (Swift / React Native) — web is for testing only at MVP
- [ ] **P4-10** — Native Android app
- [ ] **P4-11** — Multi-stop trip support (more than one pickup or dropoff)
- [ ] **P4-12** — Corporate/B2B accounts for business relocations
- [ ] **P4-13** — Carrier insurance-verification API integration (auto-check expiry)
- [ ] **P4-14** — Automated payout release via Stripe Connect scheduled transfers
- [ ] **P4-15** — Customer loyalty / repeat-booking discount
- [ ] **P4-16** — Carrier referral program ("refer another carrier, earn $50")
- [ ] **P4-17** — Freight broker / 3PL integration for large-volume shippers
- [ ] **P4-18** — National expansion beyond Sydney metro
- [ ] **P4-19** — Two-way carrier verification via government API (digital licence check)
- [ ] **P4-20** — Embedded insurance option for customer items
- [ ] **P4-21** — Customer item storage (short-term warehousing via carrier network)
- [ ] **P4-22** — Route optimization suggestions for carriers with multiple bookings
- [ ] **P4-23** — "Paused" trip status (temporarily hidden from search without cancelling)
- [ ] **P4-24** — Carrier earnings export as CSV for tax/accounting
- [ ] **P4-25** — Customer booking history PDF export
