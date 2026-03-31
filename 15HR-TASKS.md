# moverrr — 15 Tasks for 15-Hour Claude Session (~3PM 2026-04-01)

> **Run these in a fresh Claude web session.** The project is at /Users/kiranghimire/Documents/moverrr, branch claude/trusting-sutherland. Each task is independent and ordered by business value. Run `npm run check` after each task. Commit after each group.

---

## GROUP 1 — Supply-Side Retention (Highest ROI)

### Task 1: Trip Templates — Full Feature (Feature 2)

Implement carrier trip templates end-to-end. This is the highest-value supply-side retention feature: carriers save common routes and re-post in one tap.

**Follow the skill file at:** `.claude/skills/carrier-trip-templates.md`

The skill file contains the complete step-by-step implementation including:
- Database migration (new `trip_templates` table with full RLS)
- TypeScript types update in `src/types/database.ts`
- Data layer: `src/lib/data/templates.ts` (listCarrierTemplates, createTemplateFromTrip, createTripFromTemplate)
- API routes: `GET/POST /api/trips/templates`, `POST /api/trips/templates/[id]/post`
- UI: "Save as template" button on carrier trip detail page
- UI: "Quick Post" section on carrier dashboard
- Update `.agent-skills/CARRIER-FLOW.md`

**Success criteria:** Carrier can save a trip as a template and re-post it in under 10 seconds. `npm run check` passes.

---

### Task 2: Carrier Trip Duplication (Enhancement)

Add a "Re-post this route" button to carrier trip detail pages for expired or cancelled trips.

**Files to modify:**
- `src/app/(carrier)/carrier/trips/[id]/page.tsx` — Add the button when status is `expired` or `cancelled`
- `src/app/(carrier)/carrier/post/page.tsx` — Read query params on mount to pre-fill the wizard

**Implementation:**
1. Read `src/app/(carrier)/carrier/trips/[id]/page.tsx` to understand the page structure
2. When trip.status is 'expired' or 'cancelled', show:
   ```tsx
   <Button asChild variant="outline" className="min-h-[44px] active:opacity-80">
     <Link href={`/carrier/post?from=${encodeURIComponent(trip.originSuburb)}&to=${encodeURIComponent(trip.destinationSuburb)}&space=${trip.spaceSize}&price=${trip.priceCents}`}>
       Re-post this route
     </Link>
   </Button>
   ```
3. Read `src/app/(carrier)/carrier/post/page.tsx` and find where the initial wizard state is set. On mount, read `useSearchParams()` and use `from`, `to`, `space`, `price` to pre-fill `formData`.

**Success criteria:** Carrier clicks "Re-post this route" from a past trip, wizard opens pre-filled. `npm run check` passes.

---

### Task 3: Carrier Onboarding Progress Tracker (Enhancement)

Show carriers exactly what's missing and why verification may be blocked.

**Files to modify:**
- `src/app/(carrier)/carrier/onboarding/page.tsx`

**Implementation:**
1. Read the full onboarding page to understand the form sections
2. Add a progress banner at the top of the form:
   ```tsx
   const sections = [
     { label: 'Business details', complete: Boolean(formData.businessName && formData.abn && formData.phone) },
     { label: 'Documents uploaded', complete: Boolean(licenseUrl && insuranceUrl) },
     { label: 'Vehicle added', complete: Boolean(vehicleType) },
   ];
   const completedCount = sections.filter(s => s.complete).length;
   ```
   Show: `"{completedCount} of {sections.length} sections complete"` with a progress bar (`<div style={{ width: `${(completedCount/sections.length)*100}%` }}>`).
   List incomplete sections with a red dot and a brief reason why they're needed.
3. If `completedCount < sections.length`, disable the submit button and show: "Complete all sections to submit for verification."

**Success criteria:** Carrier sees exactly what's missing. Submit button disabled until all sections done. `npm run check` passes.

---

## GROUP 2 — Platform Reliability

### Task 4: Atomic Booking RPC — Database Migration

Write the PostgreSQL function that prevents inventory oversell via row-level locking.

**Follow the skill file at:** `.claude/skills/fix-booking-race-condition.md`

The skill file contains the full PL/pgSQL function. Key points:
- Migration file: `supabase/migrations/008_atomic_booking_function.sql`
- Function name: `create_booking_atomic`
- Uses `SELECT ... FOR UPDATE` on `capacity_listings` to acquire row lock
- Validates listing status, carrier match, calculates pricing identically to `calculateBookingBreakdown`
- Inserts booking, updates `remaining_capacity_pct`, writes `booking_events` audit row
- Returns the new booking UUID, or raises exception with code: `listing_not_bookable`, `listing_not_found`, `carrier_mismatch`

After writing the migration, update `src/lib/data/bookings.ts` `createBookingForCustomer` to call `supabase.rpc('create_booking_atomic', {...})` instead of the two-step read-then-write. Map RPC exceptions to `AppError` codes.

**Success criteria:** Migration file exists. `createBookingForCustomer` calls the RPC. `npm run check` passes. Apply migration with `npm run supabase:db:push` if Supabase is running locally.

---

### Task 5: Supabase Realtime — Carrier Dashboard Live Updates (Enhancement)

Carrier dashboard shows new bookings without manual refresh.

**Files to modify:**
- `src/app/(carrier)/carrier/dashboard/page.tsx`

**Implementation:**
1. Read the dashboard page to understand how bookings are fetched
2. Convert the bookings list section to use Supabase Realtime. The page is likely a Server Component — convert the bookings list to a Client Component:

Create `src/components/carrier/live-bookings-list.tsx` ('use client'):
```tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Booking } from '@/types/booking';

export function LiveBookingsList({ carrierId, initialBookings }: {
  carrierId: string;
  initialBookings: Booking[];
}) {
  const [bookings, setBookings] = useState(initialBookings);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('carrier-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `carrier_id=eq.${carrierId}`,
      }, (payload) => {
        // Refetch bookings on any change
        supabase
          .from('bookings')
          .select('*')
          .eq('carrier_id', carrierId)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) setBookings(data as unknown as Booking[]);
          });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [carrierId]);

  // Render bookings list using same UI as before
  return <>{/* existing bookings list JSX */}</>;
}
```

3. Show a pulsing green dot ("Live") next to the "Your Bookings" heading when realtime is connected.

**Success criteria:** New booking appears on carrier dashboard without refresh. `npm run check` passes.

---

### Task 6: Redis Rate Limiting with Upstash (Enhancement)

Replace in-memory rate limiting with Redis-backed rate limiting that survives serverless cold starts.

**Files to modify:**
- `package.json` — add `@upstash/redis` and `@upstash/ratelimit`
- `src/lib/rate-limit.ts` — rewrite to use Upstash with in-memory fallback

**Implementation:**
1. Install: `npm install @upstash/redis @upstash/ratelimit`
2. Read `src/lib/rate-limit.ts` to understand the current `enforceRateLimit(key, limit, windowMs)` signature
3. Rewrite rate-limit.ts to keep the same exported `enforceRateLimit` signature but use Redis when available:
```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-memory fallback (existing code — keep it)
const windows = new Map<string, number[]>();
function inMemoryRateLimit(key: string, limit: number, windowMs: number) { /* existing */ }

// Redis-backed rate limiting
function createRedisRateLimit(limit: number, windowMs: number) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
  });
}

export async function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const ratelimit = createRedisRateLimit(limit, windowMs);
  if (!ratelimit) return inMemoryRateLimit(key, limit, windowMs);

  const { success, reset } = await ratelimit.limit(key);
  return {
    allowed: success,
    retryAfterMs: success ? 0 : Math.max(0, reset - Date.now()),
  };
}
```
4. The function was synchronous before — it's now async. Update all callers:
   - `src/app/api/upload/route.ts` — `await enforceRateLimit(...)`
   - `src/app/api/payments/webhook/route.ts` — `await enforceRateLimit(...)`
   - `src/app/api/search/route.ts` — check if enforceRateLimit is used here too
5. Add to `.env.example`:
   ```
   UPSTASH_REDIS_REST_URL=    # Upstash Redis REST URL
   UPSTASH_REDIS_REST_TOKEN=  # Upstash Redis REST token
   ```

**Success criteria:** `npm run check` passes. Rate limiting still works without Upstash env vars (falls back to in-memory).

---

## GROUP 3 — Customer Trust & Clarity

### Task 7: Saved Searches & Route Alerts — Full Feature (Feature 1)

Implement saved searches with email notifications when matching trips appear.

**Follow the skill file at:** `.claude/skills/saved-searches.md`

The skill file contains the complete step-by-step implementation including:
- Database migration (`saved_searches` table with RLS + service role policy)
- TypeScript types
- Data layer: `src/lib/data/saved-searches.ts`
- API routes: `GET/POST /api/saved-searches`, `DELETE /api/saved-searches/[id]`
- UI: Search empty state "Save this search" form
- Supabase Edge Function: `notify-saved-searches` (triggered on new listing insert)
- Update `.agent-skills/CUSTOMER-FLOW.md`

**Success criteria:** Empty search state shows "Save this search." Creating a saved search writes to DB. Edge function skeleton exists in `supabase/functions/`. `npm run check` passes.

---

### Task 8: Customer Booking Status — Vertical Stepper (Frontend Fix)

Replace the text-only booking status with a visual progress stepper.

**Files:**
- Create `src/components/booking/booking-status-stepper.tsx`
- Modify `src/app/(customer)/bookings/[id]/page.tsx`

**Implementation:**
1. Create the stepper component:
```tsx
import type { BookingStatus } from '@/types/booking';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS: { status: BookingStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Awaiting Confirmation', description: 'Carrier has 2 hours to confirm' },
  { status: 'confirmed', label: 'Confirmed', description: 'Carrier has accepted your booking' },
  { status: 'picked_up', label: 'Picked Up', description: 'Item collected from pickup address' },
  { status: 'in_transit', label: 'In Transit', description: 'On the way to delivery address' },
  { status: 'delivered', label: 'Delivered', description: 'Item delivered — please confirm receipt' },
  { status: 'completed', label: 'Complete', description: 'Booking successfully completed' },
];

const STATUS_ORDER: BookingStatus[] = ['pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'completed'];

export function BookingStatusStepper({ status }: { status: BookingStatus }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  if (status === 'cancelled') {
    return <p className="text-red-600 font-medium">Booking cancelled</p>;
  }
  if (status === 'disputed') {
    return <p className="text-orange-600 font-medium bg-orange-50 border border-orange-200 rounded px-3 py-2">
      ⚠ Dispute open — our team will be in touch
    </p>;
  }

  return (
    <ol className="space-y-4">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.status} className="flex gap-3">
            <div className={cn(
              'flex-none w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mt-0.5',
              done && 'bg-green-500 text-white',
              active && 'bg-blue-600 text-white',
              !done && !active && 'bg-gray-100 text-gray-400',
            )}>
              {done ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <div>
              <p className={cn('font-medium', active ? 'text-gray-900' : done ? 'text-gray-700' : 'text-gray-400')}>
                {step.label}
              </p>
              {active && <p className="text-sm text-gray-500">{step.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```
2. Read `src/app/(customer)/bookings/[id]/page.tsx` and replace the status text display with `<BookingStatusStepper status={booking.status} />`

**Success criteria:** Customer booking page shows a vertical stepper. `npm run check` passes.

---

### Task 9: Proof Upload — Camera-Primary on Mobile (iOS Fix)

Ensure iPhone users get the rear camera as the default proof upload action.

**Files to find and modify:**
Search for `<input type="file"` across `src/components/booking/` and `src/app/(carrier)/` to find all proof upload inputs.

**Implementation:**
For each proof upload input (pickup photo, delivery photo — NOT carrier document uploads):

Replace single file input with two options — show both but styled differently:
```tsx
{/* On mobile: camera button is primary */}
<div className="flex flex-col sm:flex-row gap-3">
  <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] bg-blue-600 text-white rounded-lg cursor-pointer active:bg-blue-700 font-medium">
    <Camera className="w-4 h-4" />
    Take Photo
    <input
      type="file"
      accept="image/*,image/heic,image/heif"
      capture="environment"
      className="sr-only"
      onChange={handleFileChange}
    />
  </label>
  <label className="flex-1 flex items-center justify-center gap-2 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg cursor-pointer active:bg-gray-50 font-medium sm:flex hidden">
    <Upload className="w-4 h-4" />
    Upload File
    <input
      type="file"
      accept="image/*,image/heic,image/heif"
      className="sr-only"
      onChange={handleFileChange}
    />
  </label>
</div>
```

Import `Camera` and `Upload` from `lucide-react`.

**Success criteria:** Carrier on iPhone sees "Take Photo" as primary button. File opens rear camera. `npm run check` passes.

---

## GROUP 4 — Admin & Operations

### Task 10: Admin Analytics Dashboard (Enhancement)

Give the admin team key metrics at a glance.

**Files to modify:**
- `src/app/(admin)/admin/dashboard/page.tsx` — Read it first to understand current structure

**Implementation:**
The `getValidationMetrics()` function already exists in `src/lib/data/admin.ts` and returns metrics. Read the admin dashboard page and ensure it:

1. Displays each metric in a card grid (2-col on mobile, 4-col on desktop):
   - Active listings
   - Completed bookings
   - Carrier reuse (repeat carriers)
   - Open disputes
   - Search-to-booking conversion %

2. Add three additional derived metrics that don't require new DB queries:
   - "Fill rate target": Show "50 completed / 50 goal = X%" where 50 is the MVP target from CLAUDE.md
   - "Avg job value": If you have total completed bookings value, divide by count (add this query to `getValidationMetrics`)
   - "Dispute rate": open disputes / completed bookings × 100 (add this calculation in the function)

3. Each metric card: large number, label, optional trend indicator. Use existing `<Card>` component from `src/components/ui/card.tsx`.

4. Add a "Last updated" timestamp showing when the metrics were fetched.

**Success criteria:** Admin dashboard shows at least 5 metric cards. `npm run check` passes.

---

### Task 11: Admin Carrier Verification — Document Preview Modal (Frontend Fix)

Admin can view carrier documents without leaving the verification queue page.

**Files to modify:**
- `package.json` — install `@radix-ui/react-dialog`
- `src/app/(admin)/admin/verification/page.tsx`

**Implementation:**
1. Install: `npm install @radix-ui/react-dialog`
2. Create `src/components/ui/dialog.tsx` wrapping Radix Dialog with Tailwind styles (similar to how `button.tsx` uses CVA). Minimal implementation:
```tsx
'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function DocumentPreviewDialog({ triggerLabel, documentUrl }: {
  triggerLabel: string;
  documentUrl: string;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="text-blue-600 underline text-sm min-h-[44px] active:opacity-70">
          {triggerLabel}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full bg-white rounded-xl z-50 overflow-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="font-semibold">{triggerLabel}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="min-h-[44px] min-w-[44px] flex items-center justify-center active:opacity-70">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          <img src={documentUrl} alt={triggerLabel} className="w-full rounded" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```
3. Read `src/app/(admin)/admin/verification/page.tsx` and replace document URL links with `<DocumentPreviewDialog triggerLabel="View License" documentUrl={carrier.licensePhotoUrl} />`.

**Success criteria:** Clicking a document link opens a modal with the image. `npm run check` passes.

---

## GROUP 5 — Code Quality & Accessibility

### Task 12: React Error Boundaries on Major Page Sections (Enhancement)

Prevent full-page crashes by adding error boundaries to key sections.

**Files:**
- Create `src/components/shared/error-boundary.tsx`
- Modify `src/app/(customer)/search/page.tsx`
- Modify `src/app/(carrier)/carrier/dashboard/page.tsx`
- Modify `src/app/(customer)/bookings/page.tsx`

**Implementation:**
1. Create the ErrorBoundary class component:
```tsx
'use client';
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="text-center py-12 px-4">
          <p className="text-gray-500">Something went wrong. Please refresh the page.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 text-blue-600 underline min-h-[44px] active:opacity-70"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```
2. Wrap the results section in each page with `<ErrorBoundary>`.

**Success criteria:** ErrorBoundary component exists and is used in at least 3 pages. `npm run check` passes.

---

### Task 13: Skeleton Loading Components (Enhancement)

Replace any blank loading states with skeleton UI.

**Files:**
- Create `src/components/search/search-results-skeleton.tsx`
- Create `src/components/carrier/trip-list-skeleton.tsx`
- Use in search page and carrier dashboard

**Implementation:**
1. Search results skeleton — 3 skeleton trip cards:
```tsx
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-xl p-4 animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
```
2. Create similar skeleton for carrier trip list
3. Read each page and use `<Suspense fallback={<SearchResultsSkeleton />}>` or use loading state to show the skeleton

**Success criteria:** Loading states show skeleton cards. `npm run check` passes.

---

### Task 14: SEO Meta Tags for Trip Listing Pages (Enhancement)

Dynamic Open Graph tags so sharing trip links shows rich previews.

**Files to modify:**
- `src/app/(customer)/trip/[id]/page.tsx`

**Implementation:**
1. Read the trip detail page to understand how trip data is fetched and what the page exports
2. Add/update the `generateMetadata` export:
```ts
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  // Fetch trip data (same function used by the page)
  const trip = await getTrip(params.id);

  if (!trip) {
    return { title: 'Trip not found — moverrr' };
  }

  const price = `$${Math.round(trip.priceCents / 100)}`;
  const title = `Move from ${trip.originSuburb} to ${trip.destinationSuburb} · ${price} — moverrr`;
  const description = `${trip.carrier.businessName} has spare space on ${trip.tripDate}. ${trip.spaceSize} capacity · Verified carrier · Save vs. dedicated truck.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'moverrr',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}
```
3. Import `Metadata` from `'next'`.

**Success criteria:** Trip detail pages have dynamic title and OG tags. `npm run check` passes.

---

### Task 15: WCAG Accessibility Audit & Fixes (Enhancement)

Fix the most common accessibility issues across the app.

**Files to audit and modify:** All files in `src/components/` and `src/app/`

**Specific fixes to implement:**

1. **Icon-only buttons** — Search for `<button` or `<Button` containing only Lucide icons with no visible text. Add `aria-label` to each. Use grep: `grep -rn "aria-label" src/components/` to see what's already labelled, then find what's missing.

2. **Form labels** — Search for `<input` without an associated `<label>` or `aria-label`. Add labels to all form inputs. Focus on: search form, booking form, carrier wizard.

3. **Link text** — Search for `<Link>` or `<a>` with text like "here", "click here", "read more". Replace with descriptive text.

4. **Image alt text** — Search for `<img` without `alt` attribute. Add descriptive alt text. For decorative images, add `alt=""`.

5. **Focus management** — In any modal or dialog that opens programmatically, ensure focus moves to the first interactive element inside the modal on open.

6. **Color contrast** — Check that secondary text (`text-gray-400` or lighter) has sufficient contrast on white. `text-gray-500` on white is borderline — where used for important information (not placeholder), change to `text-gray-600`.

7. **Skip link** — Add a skip navigation link in the root layout:
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white border border-gray-200 rounded px-4 py-2 text-sm font-medium z-50"
>
  Skip to main content
</a>
```
Add `id="main-content"` to the `<main>` element.

**Success criteria:** No console accessibility warnings. All icon-only buttons have aria-labels. All form inputs have labels. Skip link exists. `npm run check` passes.

---

## Final Step After All Tasks

```bash
cd /Users/kiranghimire/Documents/moverrr/.claude/worktrees/trusting-sutherland
npm run check
git add -A
git commit -m "Major enhancements: trip templates, saved searches, realtime, a11y, SEO

- Feature: carrier trip templates (quick re-post from dashboard)
- Feature: saved searches + email alerts (Edge Function)
- Feature: atomic booking RPC migration (inventory race condition fix)
- Enhancement: carrier dashboard Supabase Realtime live updates
- Enhancement: Redis rate limiting with Upstash + in-memory fallback
- Enhancement: admin analytics dashboard with key metrics
- Enhancement: admin document preview modal (Radix Dialog)
- Enhancement: React error boundaries on search, dashboard, bookings
- Enhancement: skeleton loading for search results and carrier dashboard
- Enhancement: SEO meta tags on trip listing pages
- Enhancement: WCAG accessibility audit + fixes (aria-labels, skip link, labels)
- Frontend: booking status vertical stepper
- Frontend: proof upload camera-primary on mobile (capture=environment)
- Frontend: carrier onboarding progress tracker
- iOS: carrier trip duplication (re-post route from expired trip)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin claude/trusting-sutherland
```
