# Skill: Saved Searches & Route Alerts (Feature 1)

**Agent:** FeatureBuilder
**Risk:** Medium — new DB table, new Edge Function, email notifications
**Estimated turns:** 14-18

## Context

When customers search for a route and find no matching trips, they leave. Saved Searches captures that demand signal and re-engages customers when a matching carrier posts. This is also the platform's first demand-side retention mechanism.

**Business value:** Converts "no results" from a dead end into a waitlist. The supply team uses saved search data to identify routes that need carrier outreach.

## Pre-Flight Checks

1. Read `CLAUDE.md` — database rules, email patterns
2. Read `.agent-skills/CUSTOMER-FLOW.md` — existing search flow
3. Read `src/lib/notifications.ts` — understand Resend email pattern
4. Read `src/app/api/search/route.ts` — understand search API
5. Read `supabase/migrations/` — find latest migration number

## Step 1: Database Migration

Create `supabase/migrations/NNN_saved_searches.sql`:

```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Search criteria (mirrors search API params)
  from_suburb TEXT NOT NULL,
  from_postcode TEXT,
  to_suburb TEXT NOT NULL,
  to_postcode TEXT,
  item_category TEXT,  -- NULL means any category

  -- Date range (NULL means any date)
  date_from DATE,
  date_to DATE,

  -- Notification
  notify_email TEXT NOT NULL,  -- email to notify (defaults to user's email)
  last_notified_at TIMESTAMPTZ,
  notification_count INTEGER DEFAULT 0,

  -- Soft expiry
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX saved_searches_user_id_idx ON saved_searches(user_id);
CREATE INDEX saved_searches_active_idx ON saved_searches(is_active, expires_at) WHERE is_active = true;
-- Index for matching against new listings
CREATE INDEX saved_searches_from_suburb_idx ON saved_searches(from_suburb) WHERE is_active = true;
CREATE INDEX saved_searches_to_suburb_idx ON saved_searches(to_suburb) WHERE is_active = true;

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Authenticated users manage their own
CREATE POLICY "users_manage_own_saved_searches" ON saved_searches
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Anonymous saves are not supported (must be logged in)

-- Admin read
CREATE POLICY "admins_read_all_saved_searches" ON saved_searches
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Service role for Edge Function
CREATE POLICY "service_role_full_access" ON saved_searches
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

## Step 2: TypeScript Types

Add to `src/types/database.ts`:
```typescript
saved_searches: {
  Row: {
    id: string
    user_id: string | null
    from_suburb: string
    from_postcode: string | null
    to_suburb: string
    to_postcode: string | null
    item_category: string | null
    date_from: string | null
    date_to: string | null
    notify_email: string
    last_notified_at: string | null
    notification_count: number
    expires_at: string
    is_active: boolean
    created_at: string
  }
  Insert: Omit<Row, 'id' | 'notification_count' | 'last_notified_at' | 'created_at'>
  Update: Partial<Pick<Row, 'is_active' | 'expires_at' | 'last_notified_at' | 'notification_count'>>
}
```

## Step 3: Data Layer

Create `src/lib/data/saved-searches.ts`:

```typescript
export async function createSavedSearch(
  userId: string,
  params: {
    fromSuburb: string
    fromPostcode?: string
    toSuburb: string
    toPostcode?: string
    itemCategory?: string
    dateFrom?: string
    dateTo?: string
    notifyEmail: string
  }
): Promise<SavedSearch>

export async function listUserSavedSearches(userId: string): Promise<SavedSearch[]>
// Returns active, non-expired saved searches, ordered by created_at DESC

export async function deleteSavedSearch(id: string, userId: string): Promise<void>
// Verifies ownership before deleting

export async function deactivateSavedSearch(id: string): Promise<void>
// Used by Edge Function after max notifications reached
```

## Step 4: API Routes

Create `src/app/api/saved-searches/route.ts`:
```typescript
GET  → listUserSavedSearches (requires auth)
POST → createSavedSearch (requires auth)
     body: { fromSuburb, toSuburb, itemCategory?, dateFrom?, dateTo? }
     Auto-fills notifyEmail from user's email
```

Create `src/app/api/saved-searches/[id]/route.ts`:
```typescript
DELETE → deleteSavedSearch (requires auth, verifies ownership)
```

## Step 5: UI — Empty Search State

In the search results component (find the empty state section — likely in `src/components/search/`), replace the simple "No trips match" message with:

```tsx
<div className="text-center py-12">
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    No trips available yet for this route
  </h3>
  <p className="text-gray-500 mb-6">
    We'll email you as soon as a carrier posts a matching trip.
  </p>

  {user ? (
    <SaveSearchForm
      fromSuburb={searchParams.fromSuburb}
      toSuburb={searchParams.toSuburb}
      itemCategory={searchParams.itemCategory}
      userEmail={user.email}
    />
  ) : (
    <div>
      <p className="text-sm text-gray-500 mb-3">Sign in to save this search</p>
      <Button asChild>
        <Link href={`/login?redirect=/search?${searchParams}`}>
          Sign in to get notified
        </Link>
      </Button>
    </div>
  )}
</div>
```

The `SaveSearchForm` component is a small inline form with:
- Confirm email (pre-filled from user.email, editable)
- "Notify me" button (44px height minimum)
- On success: "✓ We'll notify you at {email}" inline confirmation

## Step 6: Supabase Edge Function

Create `supabase/functions/notify-saved-searches/index.ts`:

```typescript
// Triggered by database webhook on capacity_listings INSERT
// Finds matching saved searches and sends notification emails

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const payload = await req.json()
  const newListing = payload.record  // The new capacity_listing row

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Find active saved searches that match this listing
  // Match on: from_suburb ≈ listing origin suburb, to_suburb ≈ listing destination suburb
  // Optional: item_category match
  const { data: matches } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .ilike('from_suburb', `%${newListing.origin_suburb}%`)
    .ilike('to_suburb', `%${newListing.destination_suburb}%`)

  if (!matches || matches.length === 0) {
    return new Response(JSON.stringify({ notified: 0 }), { status: 200 })
  }

  // Send email to each match via Resend
  let notified = 0
  for (const search of matches) {
    // Send email (implement using fetch to Resend API directly in Deno)
    const emailResponse = await sendNotificationEmail(search, newListing)

    if (emailResponse.ok) {
      // Update last_notified_at and increment count
      await supabase.from('saved_searches')
        .update({
          last_notified_at: new Date().toISOString(),
          notification_count: search.notification_count + 1,
          // Deactivate after 5 notifications to avoid spam
          is_active: search.notification_count + 1 < 5
        })
        .eq('id', search.id)

      notified++
    }
  }

  return new Response(JSON.stringify({ notified }), { status: 200 })
})
```

Register the database webhook in the Supabase dashboard (or via migration):
- Table: `capacity_listings`
- Event: `INSERT`
- Function: `notify-saved-searches`

## Step 7: Email Template

The notification email should include:
- Subject: "A trip matching your search just posted on moverrr"
- Body: carrier name, route (origin → destination), date, price, space size
- CTA: "View trip" → deep link to the trip detail page
- Footer: "Unsubscribe" → DELETE /api/saved-searches/[id]

## Step 8: Update Agent Skills

Update `.agent-skills/CUSTOMER-FLOW.md` to add:

```markdown
## Saved Searches

When search returns no results, customers can save the search:
1. See "No trips yet for this route" message
2. Enter email (pre-filled if logged in) → "Notify me"
3. Receive email notification when a matching trip is posted
4. Email contains direct link to the new listing

Saved searches expire after 90 days. Max 5 notifications per search.
```

## Step 9: Verify

```bash
npm run check
npm run supabase:db:push
```

Manual test:
1. Search for a route with no results
2. Save the search
3. Verify row in `saved_searches` table
4. Post a new trip matching that route (from carrier account)
5. Manually trigger the Edge Function
6. Verify email received and `last_notified_at` updated

## Notes

- The Edge Function uses fuzzy suburb matching (`ILIKE`) which is intentionally loose for MVP. A carrier posting "Sydney CBD" will match a saved search for "CBD". This is acceptable until PostGIS-based saved search matching is warranted.
- Rate limiting on saved search creation: max 10 saved searches per user (enforce in API route).
