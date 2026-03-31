# Skill: Carrier Trip Templates (Feature 2)

**Agent:** FeatureBuilder
**Risk:** Medium — new DB table, new API routes, UI additions to critical carrier flow
**Estimated turns:** 12-16

## Context

Carriers frequently post the same routes (e.g., Sydney CBD → Wollongong every Thursday). Currently they must fill the full 3-step wizard each time. Trip Templates let a carrier save a common route and post from it in one tap — critical for supply-side retention.

**Business value:** This directly addresses the "carrier posting speed <60 seconds" requirement in CLAUDE.md. A template post should take <10 seconds.

## Pre-Flight Checks

1. Read `CLAUDE.md` — commission math, database rules, iOS contract
2. Read `.agent-skills/CARRIER-FLOW.md` — understand existing posting wizard
3. Read `src/lib/data/bookings.ts` and `src/lib/data/trips.ts` — understand existing data patterns
4. Read `supabase/migrations/` — find latest migration number
5. Read `src/types/database.ts` — understand existing DB types

## Step 1: Database Migration

Create `supabase/migrations/NNN_trip_templates.sql`:

```sql
-- Trip Templates: saved carrier routes for quick re-posting
CREATE TABLE trip_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- Carrier-defined name: "Weekly Wollongong Run"

  -- Route (same as capacity_listings)
  origin_suburb TEXT NOT NULL,
  origin_postcode TEXT NOT NULL,
  origin_point GEOGRAPHY(POINT, 4326),
  destination_suburb TEXT NOT NULL,
  destination_postcode TEXT NOT NULL,
  destination_point GEOGRAPHY(POINT, 4326),

  -- Capacity
  space_size TEXT NOT NULL CHECK (space_size IN ('S', 'M', 'L', 'XL')),
  available_volume_m3 NUMERIC(5,2),
  max_weight_kg INTEGER,
  detour_radius_km INTEGER NOT NULL DEFAULT 5,

  -- Pricing defaults (carrier can override when posting)
  suggested_price_cents INTEGER NOT NULL,
  stairs_extra_cents INTEGER DEFAULT 0,
  helper_extra_cents INTEGER DEFAULT 0,
  helper_available BOOLEAN DEFAULT false,

  -- Rules
  accepts TEXT[] DEFAULT '{}',  -- item categories accepted
  time_window TEXT DEFAULT 'flexible' CHECK (time_window IN ('morning', 'afternoon', 'evening', 'flexible')),
  notes TEXT,

  -- Metadata
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX trip_templates_carrier_id_idx ON trip_templates(carrier_id);
CREATE INDEX trip_templates_carrier_last_used_idx ON trip_templates(carrier_id, last_used_at DESC NULLS LAST);

-- Spatial indexes
CREATE INDEX trip_templates_origin_idx ON trip_templates USING GIST(origin_point);
CREATE INDEX trip_templates_destination_idx ON trip_templates USING GIST(destination_point);

-- RLS
ALTER TABLE trip_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carriers_manage_own_templates" ON trip_templates
  FOR ALL TO authenticated
  USING (carrier_id IN (SELECT id FROM carriers WHERE user_id = auth.uid()))
  WITH CHECK (carrier_id IN (SELECT id FROM carriers WHERE user_id = auth.uid()));

-- Admin read-all
CREATE POLICY "admins_read_all_templates" ON trip_templates
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
```

## Step 2: TypeScript Types

Add to `src/types/database.ts` (in the Tables interface):
```typescript
trip_templates: {
  Row: {
    id: string
    carrier_id: string
    name: string
    origin_suburb: string
    origin_postcode: string
    destination_suburb: string
    destination_postcode: string
    space_size: 'S' | 'M' | 'L' | 'XL'
    available_volume_m3: number | null
    max_weight_kg: number | null
    detour_radius_km: number
    suggested_price_cents: number
    stairs_extra_cents: number
    helper_extra_cents: number
    helper_available: boolean
    accepts: string[]
    time_window: 'morning' | 'afternoon' | 'evening' | 'flexible'
    notes: string | null
    times_used: number
    last_used_at: string | null
    created_at: string
    updated_at: string
  }
  Insert: Omit<Row, 'id' | 'times_used' | 'last_used_at' | 'created_at' | 'updated_at'>
  Update: Partial<Insert>
}
```

Add a `TripTemplate` type to `src/types/carrier.ts`.

## Step 3: Data Layer

Create `src/lib/data/templates.ts`:

```typescript
export async function listCarrierTemplates(carrierId: string)
// Returns: TripTemplate[] ordered by last_used_at DESC, then created_at DESC

export async function createTemplate(carrierId: string, data: CreateTemplateInput)
// Returns: TripTemplate

export async function createTemplateFromTrip(tripId: string, carrierId: string, name: string)
// Reads a capacity_listing by ID, maps its fields to a template, creates it
// Returns: TripTemplate

export async function createTripFromTemplate(templateId: string, carrierId: string, overrides: {
  trip_date: string
  time_window?: string
  price_cents?: number
})
// Reads template, creates a capacity_listing with template values + overrides
// Increments template.times_used and updates last_used_at
// Returns: CapacityListing

export async function deleteTemplate(templateId: string, carrierId: string)
// Soft-delete or hard-delete (hard-delete is fine for templates)
```

## Step 4: API Routes

Create `src/app/api/trips/templates/route.ts`:
```typescript
GET  → listCarrierTemplates (requires carrier auth)
POST → createTemplate (requires carrier auth)
```

Create `src/app/api/trips/templates/[id]/route.ts`:
```typescript
DELETE → deleteTemplate (requires carrier auth, verifies ownership)
```

Create `src/app/api/trips/templates/[id]/post/route.ts`:
```typescript
POST → createTripFromTemplate (requires carrier auth, verifies ownership)
     body: { trip_date: string, time_window?: string, price_cents?: number }
     Returns: the new capacity_listing
```

## Step 5: UI — "Save as Template" on Trip Detail

In `src/app/(carrier)/carrier/trips/[id]/page.tsx`, add a "Save as Template" button in the trip actions area.

On click, show an inline form asking for a template name (default: "{origin} → {destination}"). On submit, call `POST /api/trips/templates` with the trip data.

Show success toast: "Template saved — post this route in one tap from your dashboard."

## Step 6: UI — "Post from Template" on Dashboard

In the carrier dashboard (`src/app/(carrier)/carrier/dashboard/page.tsx`), add a "Quick Post" section above the active trips list.

If the carrier has templates:
```
┌─────────────────────────────────────┐
│ Quick Post from Template            │
│                                     │
│ [Sydney CBD → Wollongong    → Post] │
│ [Parramatta → City           → Post]│
│                                     │
│ + Save new template                 │
└─────────────────────────────────────┘
```

"Post" button opens a minimal modal/sheet (not the full wizard) asking only:
- Trip date (date picker, defaults to tomorrow)
- Time window (defaults to template's value)
- Price (defaults to template's `suggested_price_cents`)

On confirm, calls `POST /api/trips/templates/[id]/post` and shows: "Trip posted! View your listing →"

**iOS requirement:** The "Post" button must be `min-h-[44px]`. The modal must work at 375px width.

## Step 7: Update Agent Skills

Update `.agent-skills/CARRIER-FLOW.md` to add:

```markdown
## Trip Templates (Quick Post)

Carriers can save common routes as templates. From the dashboard:
1. Tap "Post" next to a template
2. Confirm date, time window, and price (pre-filled from template)
3. Trip is posted immediately

To create a template: from any trip detail page, tap "Save as Template".
Templates are private to each carrier.
```

## Step 8: Verify

```bash
npm run check
npm run supabase:db:push
```

Manual test:
1. Post a trip via the wizard
2. Save it as a template
3. From the dashboard, post from the template with a different date
4. Verify new listing appears in search results
5. Verify template `times_used` incremented
6. Verify original trip unchanged

## Rollback

The template table can be dropped without affecting any existing data. API routes return 404 gracefully if the table doesn't exist.
