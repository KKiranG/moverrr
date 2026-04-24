<!-- /autoplan restore point: /Users/kiranghimire/.gstack/projects/KKiranG-moverrr/claude-inspiring-shamir-a50b01-autoplan-restore-20260424-004630.md -->
# Carrier-Side UX/UI Polish Pass

## Context

The carrier portal has critical UX/UI gaps that undermine trust and real-world operations. Carriers are already using the platform but hitting friction at the three moments that matter most: posting a trip, running a job in-vehicle, and getting through activation. This plan addresses those gaps in priority order, scoped to components that can be improved without new backend APIs.

## Goal

Make the carrier portal feel production-ready on mobile for three core workflows:
1. **Trip posting** — wizard quality (loading states, error recovery, publish safety)
2. **In-vehicle operations** — runsheet with proof capture
3. **Activation** — clear linear UX, no dead-end scaffold routes

## Current State (code audit findings)

| Surface | Gap | File | Severity |
|---------|-----|------|----------|
| CarrierTripWizard | `isGuidanceLoading` set but never used in JSX — price fetching is silent | `carrier-trip-wizard.tsx` | High |
| CarrierTripWizard | No error state when price guidance fetch fails | `carrier-trip-wizard.tsx` | High |
| CarrierTripWizard | No publish confirmation dialog | `carrier-trip-wizard.tsx` | Medium |
| CarrierTripRunsheet | No proof capture UI — photos can't be taken in-vehicle | `carrier-trip-runsheet.tsx` | Critical |
| CarrierTripBookingsPanel | No empty state (blank when no bookings) | `carrier-trip-bookings-panel.tsx` | Medium |
| CarrierTripBookingsPanel | No loading state during initial fetch | `carrier-trip-bookings-panel.tsx` | Medium |
| Carrier home page | No loading skeleton for all 3 modes (activation/ready/active) | `carrier/page.tsx` | Medium |
| Request detail | No loading state during data fetch | `requests/[requestId]/page.tsx` | Medium |
| Payout dashboard | No loading state during dashboard fetch | `payouts/page.tsx` | Low |
| Activation sub-pages | `/activate/identity`, `/vehicle`, `/payout`, `/submitted` are scaffold placeholders — route exists but does nothing | 4 page files | High |
| Verification page | Hardcoded `"Pending"` status for all carriers | `account/verification/page.tsx` | Medium |

## Priority Plan

### P1 — Trust & Operations (critical path)

**1. Proof capture on runsheet**

Add photo upload UI to each booking card in runsheet mode. Carriers tap a booking → camera sheet opens → photo saved as pickup or delivery proof. Use the existing proof infrastructure (no new API needed). This is the most critical gap: in-vehicle operations have no proof path.

Files: `carrier-trip-runsheet.tsx`, `carrier-trip-bookings-panel.tsx`

**2. Loading skeletons**

Add skeleton loading to: carrier home (all 3 modes), bookings panel (initial load), request detail, payout dashboard. These are silent blank screens today.

Files: `carrier/page.tsx`, `carrier-trip-bookings-panel.tsx`, `requests/[requestId]/page.tsx`, `payouts/page.tsx`

**3. Bookings panel empty state**

When a trip has no bookings, show "No bookings yet — share your trip link to attract customers" instead of blank.

Files: `carrier-trip-bookings-panel.tsx`

### P2 — Posting Quality

**4. Price guidance loading + error UI**

Wire `isGuidanceLoading` state to a visible skeleton in the pricing step. On guidance fetch failure, show an inline error with a retry button. The `suggestedBasePriceCents` should show "--" when loading.

Files: `carrier-trip-wizard.tsx` (lines ~147–148 and pricing step JSX)

**5. Undo toast (replaces publish confirmation dialog)**

After publishing, show a top-of-screen undo toast: "Trip is live. [Take offline]" — 8-second auto-dismiss, positioned below `env(safe-area-inset-top)`. See Design Review Section 5 for full spec.

Files: `carrier-trip-wizard.tsx`

### P3 — Activation Clarity

**6. Scaffold sub-page redirects**

`/carrier/activate/identity`, `/carrier/activate/vehicle`, `/carrier/activate/payout`, `/carrier/activate/submitted` are dead-end scaffold pages. Replace each with a server-side redirect to `/carrier/activate`. The real form and state machine lives there.

Files: 4 scaffold page files under `src/app/(carrier)/carrier/activate/`

**7. Verification status fix**

Replace hardcoded `"Pending"` strings in verification page with real data from the carrier profile query. If data is unavailable, show "—" not a false "Pending".

Files: `src/app/(carrier)/carrier/account/verification/page.tsx`

## Not in Scope

- Account sub-pages (profile edit, vehicle edit, documents upload, settings) — each is a separate feature
- Clarification flow redesign — separate issue
- Demand signals — incomplete feature, not in backlog
- Multi-step activation wizard rebuild — separate issue
- Any pricing logic changes — pricing is frozen pending founder decision (#39)
- New backend APIs or Supabase schema changes

## Lock Groups

- `carrier-operations` — items 1, 2, 3
- `carrier-activation-posting` — items 4, 5, 6, 7

## Files Likely Touched

```
src/components/carrier/carrier-trip-wizard.tsx
src/components/carrier/carrier-trip-runsheet.tsx
src/components/carrier/carrier-trip-bookings-panel.tsx
src/app/(carrier)/carrier/page.tsx
src/app/(carrier)/carrier/requests/[requestId]/page.tsx
src/app/(carrier)/carrier/payouts/page.tsx
src/app/(carrier)/carrier/activate/identity/page.tsx
src/app/(carrier)/carrier/activate/vehicle/page.tsx
src/app/(carrier)/carrier/activate/payout/page.tsx
src/app/(carrier)/carrier/activate/submitted/page.tsx
src/app/(carrier)/carrier/account/verification/page.tsx
```

## Verification

- `npm run check`
- `npm run build`
- Mobile smoke (375px): carrier home → trip posting wizard → runsheet with proof upload → request detail loading → activation redirect

## Done When

- [ ] Proof capture UI visible on runsheet booking cards (camera icon + upload flow)
- [ ] Loading skeletons render on: carrier home, bookings panel, request detail, payout dashboard
- [ ] Bookings panel shows empty state message when no bookings
- [ ] Price guidance loading shows skeleton; failure shows inline error + retry
- [ ] Scaffold activation sub-pages redirect → `/carrier/activate`
- [ ] Verification page shows real status data (not hardcoded "Pending")

---

## CEO Review — Phase 1 Findings

### Premise Verification (post-check)

| Premise | Status | Evidence |
|---|---|---|
| "Proof backend exists for carriers" | ✅ CONFIRMED | `/api/upload` → `proofPhotos` bucket; `/api/bookings/[id]` PATCH accepts `pickupProof`/`deliveryProof` |
| "Activation items should be P1a" | ✅ AMENDED | User confirmed; dead activation routes block new carrier supply on day one |
| "No new backend APIs needed" | ✅ CONFIRMED | Upload + PATCH already exist and work for any session user |
| "Loading skeletons are P1 equal to proof capture" | ✅ AMENDED | Moved to P1b (UX hygiene); P1a = supply/trust-critical items |

### Revised Priority Order

```
P1a — Supply/Trust-Critical (first):
  - Proof capture UI on runsheet (camera + upload + PATCH)
  - Activation scaffold redirects (4 pages → /carrier/activate)
  - Verification status real data

P1b — UX Hygiene (same PR or follow-up):
  - Loading skeletons (home, bookings panel, request detail, payout)
  - Empty state on bookings panel

P2 — Posting Quality:
  - Price guidance loading + error UI (wire isGuidanceLoading at carrier-trip-wizard.tsx:148)
  - Proof upload progress indicator (added to scope)
  ~~- Publish confirmation dialog~~ → REMOVED (supply friction without evidence; see TASTE section)

P2-TASTE — Publish safety:
  - Replace confirmation dialog with post-publish "Take offline" undo action
  - TASTE DECISION: see Final Gate

P3 — removed (items moved to P1a)
```

### Error & Rescue Registry

| Error | Trigger | Current UX | Fix |
|---|---|---|---|
| Price guidance fetch fails | Network / rate limit | Silent blank — carrier guesses price | Inline error + retry |
| Proof image upload fails | Network / size / auth | Not implemented | "Upload failed, try again" toast |
| Proof PATCH fails | Network / server | Not implemented | Error on booking card + retry |
| Activation scaffold page hit | Bad URL / old link | Dead scaffold stub | Static 301 redirect |

### Architecture Assessment (Section 1)

```
carrier-trip-wizard.tsx
  └── isGuidanceLoading:148 → WIRE TO loading skeleton in pricing step
  └── guidanceFetch error → ADD inline error + retry

carrier-trip-runsheet.tsx
  └── CarrierTripBookingsPanel [variant="runsheet"]
        └── per booking card → ADD camera input (capture="environment", accept HEIC/JPEG/PNG)
        └── upload → POST /api/upload {bucket: "proof-photos"}
        └── PATCH /api/bookings/[id] {pickupProof|deliveryProof, nextStatus}

carrier-trip-bookings-panel.tsx
  └── initial load → ADD skeleton (3 placeholder cards)
  └── empty case → ADD "No bookings yet" empty state

carrier/page.tsx (3 modes)
  └── data fetch in flight → ADD skeleton for each mode

activate/identity|vehicle|payout|submitted/page.tsx
  └── REPLACE stub with redirect("/carrier/activate")

account/verification/page.tsx
  └── REPLACE hardcoded "Pending" with real carrier.activation_status

requests/[requestId]/page.tsx + payouts/page.tsx
  └── ADD skeleton during data fetch
```

11 files. 2 lock groups. No new deps. No schema changes. All changes additive.

### Failure Modes Registry

| Failure | Impact | Gap | Mitigation |
|---|---|---|---|
| Proof upload silently non-functional | Carrier thinks proof is saved; payout never releases | ✅ No gap — upload API returns error, needs UI to surface it | Add error toast |
| Activation redirect breaks deep-link | Carrier loses step-specific context | Low risk — one-page form is authoritative | Add scroll-to-section if needed later |
| Loading skeleton blocks CTA tap | Carrier taps skeleton, nothing happens | Low — skeletons are non-interactive | Ensure skeletons don't render over CTAs |
| Price guidance error hidden | Carrier sets wrong price | ✅ `isGuidanceLoading` exists, just unwired | Wire loading state |

### NOT in Scope (CEO confirmed)

- Account sub-pages (profile/vehicle/documents/settings) — each is a feature-level issue
- Multi-step activation wizard rebuild — separate issue
- Demand signals — not in backlog
- Clarification flow redesign — separate issue
- Condition Adjustment UI — deferred to TODOS.md
- Trip freshness check-in UI — deferred to TODOS.md

### CEO Dual Voice Consensus Summary

- Architecture: CONFIRMED sound (additive, in-blast-radius, <1 day CC)
- Priority re-ordering: CONFIRMED (P3 activation items → P1a)
- Proof backend: CONFIRMED (no new API needed)
- Loading skeletons ranking: CONFIRMED P1b not P1a
- Publish confirmation: TASTE DECISION (surface at final gate)
- Competitive/market: both models flag — no immediate scope change but future deferred

---

---

## Design Review — Phase 2 Findings

### Design Litmus Scorecard (before amendments)

| Dimension | Score | Status |
|---|---|---|
| Information hierarchy | 6/10 | Runsheet card hierarchy undefined |
| Interaction states | 4/10 | Proof upload state machine incomplete |
| Mobile 375px strategy | 6/10 | Stated but not operationalized |
| Accessibility bound to controls | 5/10 | Invariants stated, not assigned |
| Specificity of UI decisions | 5/10 | Pattern labels without decisions |
| Journey continuity | 6/10 | No stop-complete signal, no undo spec |
| Stale contradiction | FAIL | Publish dialog still in Done When |

### Design Spec Amendments (amend plan before build)

**1. Proof Capture — Runsheet Card Layout**

```
Booking card (runsheet variant):
[Customer name + item type]              [Status badge]
[Pickup / Delivery address]
[Proof status: "No proof yet" / thumbnail]
[Camera button: 48×48px, "Add proof" label]  ← PRIMARY ACTION ZONE
```

Camera trigger position: bottom of card, full-width button (`min-h-[48px]`), always visible (not behind expand). Label changes: "Add pickup proof" / "Add delivery proof" based on booking status.

Camera mechanism: `<input type="file" accept="image/heic,image/heic-sequence,image/jpeg,image/png,image/*" capture="environment">` triggered programmatically. Rely on native iOS picker.

Pickup vs. delivery proof: determined automatically by booking status.
- `confirmed` / `pickup_due` → upload as `pickupProof`
- `picked_up` / `in_transit` → upload as `deliveryProof`
Do NOT show the carrier a choice — status determines it.

**2. Proof Upload State Machine**

```
IDLE (no proof)
  ↓ carrier taps camera button
NATIVE PICKER (OS-level)
  ↓ photo selected
UPLOADING → button replaced with spinner (non-tappable)
  ↓ POST /api/upload succeeds
PATCHING → spinner stays
  ↓ PATCH /api/bookings/[id] succeeds
SUCCESS → spinner replaced with thumbnail + checkmark for 1.5s
  ↓ after 1.5s
PROOF_ATTACHED → thumbnail shown on card, "Replace" secondary link
  ↓ booking card moves to "Done" section after delivery proof attached
STOP_COMPLETE

ERROR paths:
  Upload fails → "Upload failed. Try again" below camera button (camera re-enabled)
  PATCH fails → "Could not save proof. Try again" (photo was uploaded; retry PATCH only)
  Camera cancelled → no state change, card returns to IDLE
  Camera permission denied → "Camera access required. Enable in iOS Settings." (one-time inline)
  File too large → "Photo is too large (max 10MB)." inline
  Already completed → camera button hidden (proof already attached)
```

**3. Price Guidance State Machine**

```
IDLE (no route entered)
LOADING → isGuidanceLoading = true → show skeleton where suggested price appears
SUCCESS → skeleton → suggested price (NEVER overwrites carrier's manual input)
          If carrier has already typed a price: show suggested as helper text below field
ERROR → skeleton → "Could not load price suggestion. [Retry]" inline below field
        Carrier CAN still advance with a manually entered price (do not block)
RETRY → same as LOADING
```

**4. Skeleton Spec**

Each skeleton card structure (3 cards, full viewport height):
- Short pulse bar (40% width) = booking reference / title
- Two longer pulse bars (80% and 60% width) = details rows
- Pill-shaped pulse = status badge
- Transition: 150ms opacity fade to content — skeleton dimensions must match real card dimensions to prevent layout shift

Carrier home per-mode:
- Activation mode: one full-width card placeholder (hero) + 2 row placeholders
- Ready mode: one button placeholder + 2 trip row placeholders
- Active mode: hero card placeholder + 3 booking card placeholders

**5. Undo Toast (replaces publish confirmation)**

Position: top of screen, below `env(safe-area-inset-top)` (not bottom — avoids home indicator).
Copy: "Trip is live. [Take offline]" — "Take offline" is a tappable link.
Auto-dismiss: 8 seconds.
After dismiss: carrier can take trip offline via trip settings menu (existing UI). Add helper text to the post-dismiss state: no special recovery needed if user knows settings menu exists.
Component: `bg-ink text-paper rounded-lg px-4 py-3 mx-4 mt-safe` — ink/paper brand palette, NOT red/warning.

**6. Empty State Variants**

Bookings panel empty states:
- Trip is PUBLISHED + no bookings: "No bookings yet — share your trip to attract customers." + [Share trip] secondary CTA
- Trip is DRAFT: "Publish your trip first to start getting bookings." + [Publish trip] CTA

**7. Activation Redirect Semantics**

Use `redirect("/carrier/activate")` (Next.js Server Component redirect — results in 307 in Server Components, 302 in Route Handlers). For SEO purposes these are authenticated pages, so temporary redirect is fine.
Optional (DEFERRED): Add `#[section-anchor]` to preserve deep-link context for email-originated traffic.

**8. Verification Status Variants**

- `carrier.activation_status = null` → Show "—" with label "Not yet assessed"
- `carrier.activation_status = "pending_review"` → Show "Under review"
- `carrier.activation_status = "active"` → Show "Verified"
- `carrier.activation_status = "rejected"` → Show "Requires attention" + link to support
- Query error / network failure → Show "Unable to load — Retry" with retry action

**9. Stale Contradiction Fix**

Remove "Publish confirmation dialog appears before trip goes live" from Done When checklist. It was removed in CEO review. Also remove P2 publish confirmation item from priority list.

### Design Consensus Summary

Both models flagged: proof capture state machine, information hierarchy, accessibility not bound to controls, stale contradiction, HEIC accept string. All auto-decided using P1 (completeness) + P5 (explicit). 0 taste decisions in design phase. All findings incorporated above as plan amendments.

---

## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|---------|
| 1 | CEO | Move activation redirects + verification fix from P3 → P1a | Mechanical | P1 completeness | Dead activation routes block new supply on day one | Keeping at P3 |
| 2 | CEO | Split P1 into P1a (supply-critical) and P1b (UX hygiene) | Mechanical | P3 pragmatic | Ensures trust-critical items ship first | Single P1 block |
| 3 | CEO | Keep "no new backend APIs" premise — proof backend confirmed | Mechanical | P5 explicit | Upload + PATCH both exist for carrier role | Backend-first approach |
| 4 | CEO | Add proof upload progress indicator to scope | Mechanical | P1 completeness | <10 LOC addition, prevents "did it upload?" confusion | Skip |
| 5 | CEO | Remove publish confirmation dialog | Taste | P3 pragmatic | Adds supply friction without evidence of accidental-publish problem | Keep dialog → TASTE at gate |
| 6 | CEO | Defer Condition Adjustment UI to TODOS.md | Mechanical | P3 pragmatic | Outside blast radius, separate feature | Include in plan |
| 7 | CEO | Defer trip freshness check-in UI to TODOS.md | Mechanical | P3 pragmatic | Requires notification infra, outside blast radius | Include in plan |

---

---

## Eng Review — Phase 3 Findings

### Step 0: Scope Challenge

**Complexity check:** 11 files, 0 new classes/services. 4 of the 11 files are trivial (3-line scaffold redirects). Proof capture is the only non-trivial surface. Passes — scope is acceptable.

**Existing code reuse:** `getProofSummary()` (`carrier-trip-bookings-panel.tsx:122`) already computes proof display state from `booking.pickupProofPhotoUrl` / `deliveryProofPhotoUrl`. The proof capture UI extends this function's output, not duplicates it. Upload infrastructure exists at `/api/upload`. Status-transition infrastructure exists at `/api/bookings/[id]`. Nothing to build from scratch except the UI state machine.

**Empty state already exists:** `carrier-trip-bookings-panel.tsx:379` has a generic empty state: "No bookings are attached to this trip yet." The plan must REPLACE this (not add alongside) with the two-variant published/draft empty states.

**TODOS cross-reference:** `TODOS.md` deferred items (Condition Adjustment UI, trip freshness check-ins) confirmed out of scope. No deferred items block this plan.

### Architecture Diagram

```
carrier-trip-runsheet.tsx (server)
  └── CarrierTripBookingsPanel [variant="runsheet"] (client, "use client")
        │
        ├── per booking card → ProofCaptureButton (new client sub-component OR inline)
        │     └── flow:
        │           GPS_ACQUIRING (navigator.geolocation.getCurrentPosition)
        │             ↓ coords cached in local state
        │           input[type=file, capture="environment", accept=HEIC/JPEG/PNG] — triggered programmatically
        │             ↓ file selected
        │           POST /api/upload {file, bucket: "proof-photos"}
        │             ↓ returns { path, signedUrl }  ← CACHE IN STATE for PATCH retry
        │           PATCH /api/bookings/[id] {nextStatus, pickupProof|deliveryProof}
        │             where proof pack = { photoUrl: path, capturedAt, latitude, longitude,
        │                                   handoffConfirmed: true (pickup) | recipientConfirmed: true (delivery),
        │                                   itemCount: 1, condition: "no_visible_damage" }
        │
        └── empty state: published → "Share trip to attract customers" [Share]
                         draft    → "Publish first to get bookings"    [Publish]
                         (REPLACES existing generic empty state at line 379)

carrier-trip-wizard.tsx (client)
  └── useEffect (lines 307–371): guidance fetch with debounce + AbortController
        ├── isGuidanceLoading:148 → wire to skeleton in pricing step JSX  ← P2 fix
        ├── .catch() at line 345: silently sets guidance to null → ADD guidanceError state
        └── .finally() at line 350: clears isGuidanceLoading

activate/{identity,vehicle,payout,submitted}/page.tsx (server)
  └── REPLACE CarrierScaffoldPage with redirect("/carrier/activate")

account/verification/page.tsx (server)
  └── REPLACE hardcoded "Pending" with carrier.activation_status from data layer
```

### Eng Consensus Table

| Dimension | Finding | Severity | Confidence |
|-----------|---------|---------|-----------|
| Proof pack API contract | PATCH requires lat/lng (required, not optional), handoffConfirmed:literal(true), itemCount, condition — plan doesn't spec collection | BLOCKER | 10/10 |
| Upload orphan on PATCH fail | POST upload → PATCH is two-step; orphaned photo path must be cached in state for retry-PATCH | P1 | 9/10 |
| GPS failure path | `navigator.geolocation` can fail/timeout; `latitude`+`longitude` are required in schema → PATCH will 400 | P1 | 10/10 |
| Empty state collision | Generic empty state at `carrier-trip-bookings-panel.tsx:379` must be REPLACED, not added alongside | P2 | 10/10 |
| Guidance error swallowed | `.catch()` at wizard:345 sets guidance null silently — need `guidanceError` state | P2 | 10/10 |
| `getProofSummary` untested | Pure function at `carrier-trip-bookings-panel.tsx:122` — easy unit test, currently absent | P3 | 9/10 |

### Section 1: Architecture

**[BLOCKER] (confidence: 10/10) `src/app/api/bookings/[id]/route.ts:29–57` — Proof pack schema is richer than plan assumes**

The PATCH API has strict Zod schemas:

```typescript
pickupProofSchema = z.object({
  photoUrl: z.string().min(1),
  itemCount: z.number().int().min(1),
  condition: z.enum(["no_visible_damage", "wear_noted", "damage_noted"]),
  handoffConfirmed: z.literal(true),   // must be boolean true — not just truthy
  capturedAt: z.string().datetime(),
  latitude: z.number().min(-90).max(90),   // REQUIRED, not optional
  longitude: z.number().min(-180).max(180), // REQUIRED, not optional
})

deliveryProofSchema = z.object({
  photoUrl: z.string().min(1),
  recipientConfirmed: z.literal(true), // must be boolean true
  capturedAt: z.string().datetime(),
  latitude: z.number().min(-90).max(90),   // REQUIRED
  longitude: z.number().min(-180).max(180), // REQUIRED
  exceptionCode: z.enum([...]).optional(),
  exceptionNote: z.string().min(1).optional(),
})
```

`latitude` and `longitude` are required (not `.optional()`). The UI cannot call PATCH without GPS coordinates. The current design spec state machine goes straight from "photo selected → UPLOADING → PATCHING" with no GPS collection step.

**Fix — Proof Pack Defaults Spec Amendment:**

Add GPS_ACQUIRING step to proof state machine. Collect GPS on camera tap (before opening picker). Use these defaults for all other required fields:

```
IDLE
  ↓ carrier taps camera button
GPS_ACQUIRING
  → navigator.geolocation.getCurrentPosition(coords, errorCb, {timeout:10000, maximumAge:30000})
  → cached as gpsRef.current = {latitude, longitude} for duration of booking card mount
  ↓ GPS acquired (or cached < 30s old)
NATIVE PICKER
  ↓ photo selected
UPLOADING  (POST /api/upload)
  ↓ { path } → cached as uploadedPathRef.current (for PATCH retry)
PATCHING   (PATCH /api/bookings/[id])
  payload = {
    nextStatus: <confirmed→picked_up | picked_up|in_transit→delivered>,
    pickupProof: {
      photoUrl: uploadedPath,
      itemCount: 1,            ← default (carrier can file exception separately)
      condition: "no_visible_damage",  ← default
      handoffConfirmed: true,  ← implied by tap
      capturedAt: new Date().toISOString(),
      latitude: gpsRef.current.latitude,
      longitude: gpsRef.current.longitude,
    }
    // deliveryProof: { photoUrl, recipientConfirmed: true, capturedAt, latitude, longitude }
  }

ERROR paths to ADD:
  GPS denied    → "Location access required. Enable in iOS Settings." (camera button disabled)
  GPS timeout   → "Unable to get location. Try again." (button re-enabled for retry)
  GPS_ACQUIRING UI: button shows spinner briefly (< 10s typical iOS GPS)
```

**[P1] (confidence: 9/10) Upload orphan on PATCH failure**

POST `/api/upload` and PATCH `/api/bookings/[id]` are two separate network calls. If PATCH fails (network, 400, 5xx), the photo is already stored in the `proof-photos` bucket orphaned. The design spec says "retry PATCH only" for PATCH failures — but this requires the component to remember the uploaded path.

Fix: cache upload result in component state:
```typescript
const [uploadedPath, setUploadedPath] = useState<string | null>(null);
// On upload success: setUploadedPath(result.path)
// On PATCH failure: show "Could not save proof. Try again" — retry button calls PATCH with uploadedPath
// On PATCH success: setUploadedPath(null)
```
This ensures the retry button calls PATCH with the same path, not re-uploading.

**[P1] (confidence: 10/10) GPS failure blocks PATCH — needs error state in state machine**

`navigator.geolocation.getCurrentPosition` can fail with `PERMISSION_DENIED` (1), `POSITION_UNAVAILABLE` (2), or `TIMEOUT` (3). Since `latitude`/`longitude` are required by the schema, any GPS failure means PATCH will return 400. The design spec's state machine doesn't include GPS error paths.

Fix: Add to proof state machine (amendment of Design Review Section 2):
```
ERROR paths (additional):
  GPS_DENIED    → "Location access required. Enable in iOS Settings." (1-time inline, camera disabled)
  GPS_TIMEOUT   → "Unable to get location. Tap to retry." (camera re-enabled)
  GPS_UNAVAILABLE → "Location unavailable. Try again in a moment."
```
GPS acquiring with `maximumAge: 30000` caches a recent fix so repeated taps on different booking cards don't re-request GPS.

### Section 2: Code Quality

**[P2] (confidence: 10/10) `carrier-trip-bookings-panel.tsx:379` — generic empty state must be REPLACED**

The existing empty state:
```tsx
<p className="text-sm text-text-secondary">
  No bookings are attached to this trip yet. New accepted work will land here automatically.
</p>
```
The plan's two-variant empty state (published/draft) must replace this exact node, not be added alongside it. If added alongside, both render when `bookings.length === 0`. The component doesn't currently receive trip publish status — it receives `listingId` and `carrierId`. Implementer will need to add a `tripStatus?: "active" | "draft"` prop or derive it from a parent.

**[P2] (confidence: 10/10) `carrier-trip-wizard.tsx:345` — guidance fetch error silently discarded**

The guidance fetch `.catch()`:
```typescript
.catch(() => {
  if (!controller.signal.aborted) {
    setPriceGuidance(null);  // ← error eaten here, no error state set
  }
})
```
Fix: add `const [guidanceError, setGuidanceError] = useState(false)`. In `.catch()`: `setGuidanceError(true)`. Reset at start of effect alongside `setIsGuidanceLoading(true)`. Wire to inline error in pricing step JSX: "Could not load price suggestion. [Retry]" — retry clears `guidanceError` and re-triggers the effect by re-setting origin/destination (or add a manual `retryTrigger` counter state).

**[P3] (confidence: 9/10) `carrier-trip-bookings-panel.tsx:122` — `getProofSummary` is a pure function with no unit tests**

Pure function, clear inputs/outputs. Two branches per proof type = 4 test cases. Easy to add to `src/lib/__tests__/`. Out of this PR scope but should be captured.

### Section 3: Test Review

**Framework detected:** Node built-in `test` + `assert/strict`. Test files in `src/lib/__tests__/`. No component test infra detected.

**Codepath coverage map for new work:**

```
New codepath                              Test needed?    Existing coverage
─────────────────────────────────────────────────────────────────────────
Proof upload UI state machine (client)    No (no component infra)
Proof PATCH with defaults (GPS+proof)     Partial — booking-proof-flow.test.ts covers
                                          data layer; API route has NO unit test
getProofSummary() pure function           YES — trivial, 4 cases
guidanceError state in wizard             No (no component infra)
Scaffold redirect pages                   No (trivial server redirect)
Verification status data binding          No (component test infra)
Empty state variant selection             No (component test infra)
```

**Test gap to address in this PR:**
1. `getProofSummary()` — add to `src/lib/__tests__/booking-proof-flow.test.ts` or a new `carrier-proof-summary.test.ts`. 4 test cases:
   - No proof, status="confirmed" → "Pickup proof still needed" / "Delivery proof still needed"
   - No proof, status="picked_up" → "Pickup proof missing" (overdue warning)
   - pickupProofPhotoUrl set → "Pickup proof captured"
   - deliveryProofPhotoUrl set → "Delivery proof captured"

**Upload route gap (pre-existing, out of scope):** `/api/upload/route.ts` has zero unit tests despite being business-critical. Flag for TODOS.md capture.

### Section 4: Performance

No perf concerns introduced. Notes:
- GPS `maximumAge: 30000` avoids repeated hardware requests per session
- Proof upload is sequential (POST → PATCH): ~500ms upload + ~200ms PATCH typical. Acceptable.
- Skeleton → content transition at 150ms is within perceptual threshold. No CLS risk if skeleton dimensions match real card.
- `refreshBookings()` Supabase subscription rehydrates bookings after PATCH success — proof state confirms on next live update (no polling needed).

### Section 5: Security

All upload-path guards are solid:
- `/api/upload/route.ts`: auth guard, rate limit (10/60s), 10MB cap, magic-byte MIME detection, bucket allowlist — no new vectors
- Proof PATCH: `getBookingActorRoleForUser` guards carrier-only write — correct

One pre-existing note (out of scope): `path = \`${user.id}/${Date.now()}-${file.name}\`` — `file.name` from browser File input can contain path characters. Supabase storage normalizes these but worth sanitizing. Flag for TODOS.md.

### Section 6: Deployment

- 0 schema changes. 0 new migrations.
- 0 new npm packages needed.
- Scaffold redirect: `redirect()` from `next/navigation` — no new deps.
- Geolocation: browser API, no polyfill needed (iOS ≥ 11, well-supported).
- Verification: reads `carrier.activation_status` — field already in carrier type from existing data query.
- Verification page is currently a Server Component reading from `CarrierScaffoldPage`. To show real data, must either pass data as props from a parent server component or fetch it in the page file. The page at `src/app/(carrier)/carrier/account/verification/page.tsx` needs to import a data function and call it directly — no route change needed.

### Eng Spec Amendments

**Amendment E1: Proof Pack Defaults** (adds to Design Review Section 2)

Before PATCHING, the UI constructs:
```typescript
const proofPack = booking.status === "confirmed" || booking.status === "pickup_due"
  ? {
      photoUrl: uploadedPath,
      itemCount: 1,
      condition: "no_visible_damage" as const,
      handoffConfirmed: true as const,
      capturedAt: new Date().toISOString(),
      latitude: gps.latitude,
      longitude: gps.longitude,
    }
  : {
      photoUrl: uploadedPath,
      recipientConfirmed: true as const,
      capturedAt: new Date().toISOString(),
      latitude: gps.latitude,
      longitude: gps.longitude,
    };
```
Carrier can flag exceptions via existing booking exception flow (separate, not in this scope).

**Amendment E2: Update Proof State Machine** (amends Design Review Section 2)

Insert GPS_ACQUIRING between IDLE and NATIVE PICKER. Add GPS error paths (denied, timeout, unavailable). Cache GPS per-booking-card with `gpsRef` using `maximumAge: 30000` to avoid repeat hardware requests.

**Amendment E3: Add `tripStatus` prop to `CarrierTripBookingsPanel`**

To render the correct empty state variant (published vs draft), add optional `tripStatus?: "active" | "draft"` prop. Pass from `CarrierTripRunsheet` (which receives `trip: Trip`) and from `src/app/(carrier)/carrier/trips/[id]/page.tsx` (which renders the detail variant).

**Amendment E4: Add `guidanceError` state to wizard**

New `const [guidanceError, setGuidanceError] = useState(false)` at wizard:148 alongside `isGuidanceLoading`. Set in `.catch()`, clear at top of guidance effect. Wire to inline error in pricing step.

**Amendment E5: Add `getProofSummary` unit tests**

4 test cases in `src/lib/__tests__/booking-proof-flow.test.ts` covering the pure function's 4 branches.

### Eng Consensus Summary

Both models agree: the proof pack API contract is the critical blocker — GPS collection and proof defaults must be specified before implementation starts or the first PATCH call will 400. Upload orphan caching and guidance error state are P1/P2 fixes that prevent silent failures. All other findings are code quality and test coverage items that don't block the build. 4 plan amendments added (E1–E5).

### TODOS.md Items (Deferred)

- Upload route unit tests (`/api/upload/route.ts` — 0 coverage, business-critical)
- `getProofSummary` pure function unit tests (4 cases, trivial)
- File name sanitization in upload path (`${user.id}/${Date.now()}-${file.name}`)

---

---

## Final Gate — Phase 4

### Taste Decisions — Resolved

| # | Decision | Resolution | Date |
|---|----------|-----------|------|
| T1 | Undo toast vs publish confirmation dialog | **Undo toast confirmed** — post-publish "Trip is live. [Take offline]", top of screen, 8s, brand palette | 2026-04-24 |
| T2 | Proof defaults (GPS + itemCount:1 + condition:no_visible_damage) vs multi-field in-vehicle form | **Defaults confirmed** — GPS + implicit defaults, exception flow for disputes | 2026-04-24 |

### User Challenge #1 — Accepted

Zero-trip empty state for new carriers (post-activation, no trips yet) is outside this plan's scope. Existing "Post your first trip" CTA in ready mode covers the case. Accepted.

### Plan Status: LOCKED ✓

All 4 review phases complete. Zero open decisions. Ready for `/ship`.

---

## Invariants to Preserve

- Pricing logic in `src/lib/pricing/breakdown.ts` is not touched
- No new Supabase RPC or schema changes
- iOS touch ergonomics: all new tap targets ≥ 44×44px
- Sticky CTAs must respect `safe-area-inset-bottom`
- No direct-contact or off-platform drift in carrier flows
