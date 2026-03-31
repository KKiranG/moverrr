# Skill: Fix Booking Race Condition (Atomic Booking RPC)

**Agent:** BugFixer
**Risk:** High — touches payment-critical booking creation path
**Estimated turns:** 6-8

## Problem

`createBookingForCustomer` in `src/lib/data/bookings.ts` reads `capacity_listings` to validate capacity, then writes a `bookings` row in a separate operation. Between these two steps, a concurrent request can create a second booking against the same listing, overselling capacity. The `remaining_capacity_pct` column exists but is never updated.

## Pre-Flight Checks

Before writing any code:
1. Read `src/lib/data/bookings.ts` — understand exact current flow of `createBookingForCustomer`
2. Read `src/lib/pricing/breakdown.ts` — the RPC must replicate this math exactly
3. Read `supabase/migrations/` — find the latest migration number to name the new one
4. Read `src/types/database.ts` — understand the `capacity_listings` and `bookings` types

## Step 1: Write the Migration

Create `supabase/migrations/NNN_atomic_booking_function.sql` (where NNN = next sequential number).

The function must:

```sql
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_listing_id UUID,
  p_customer_id UUID,
  p_carrier_id UUID,
  p_item_description TEXT,
  p_item_category TEXT,
  p_needs_stairs BOOLEAN,
  p_needs_helper BOOLEAN,
  p_pickup_address TEXT,
  p_pickup_suburb TEXT,
  p_pickup_postcode TEXT,
  p_pickup_lat DOUBLE PRECISION,
  p_pickup_lng DOUBLE PRECISION,
  p_dropoff_address TEXT,
  p_dropoff_suburb TEXT,
  p_dropoff_postcode TEXT,
  p_dropoff_lat DOUBLE PRECISION,
  p_dropoff_lng DOUBLE PRECISION,
  p_stripe_payment_intent_id TEXT,
  p_item_volume_m3 DOUBLE PRECISION DEFAULT NULL,
  p_item_weight_kg INTEGER DEFAULT NULL,
  p_item_dimensions TEXT DEFAULT NULL,
  p_special_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_base_price_cents INTEGER;
  v_stairs_fee_cents INTEGER;
  v_helper_fee_cents INTEGER;
  v_commission_cents INTEGER;
  v_booking_fee_cents INTEGER := 500;
  v_total_price_cents INTEGER;
  v_carrier_payout_cents INTEGER;
  v_booking_id UUID;
  v_new_capacity_pct NUMERIC;
BEGIN
  -- Acquire row-level lock on listing to prevent concurrent oversell
  SELECT * INTO v_listing
  FROM capacity_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'listing_not_found';
  END IF;

  IF v_listing.status NOT IN ('active', 'booked_partial') THEN
    RAISE EXCEPTION 'listing_not_bookable';
  END IF;

  IF v_listing.carrier_id != p_carrier_id THEN
    RAISE EXCEPTION 'carrier_mismatch';
  END IF;

  -- Replicate calculateBookingBreakdown logic exactly
  v_base_price_cents := v_listing.price_cents;
  v_stairs_fee_cents := CASE WHEN p_needs_stairs AND v_listing.helper_available THEN COALESCE(v_listing.stairs_extra_cents, 0) ELSE 0 END;
  v_helper_fee_cents := CASE WHEN p_needs_helper AND v_listing.helper_available THEN COALESCE(v_listing.helper_extra_cents, 0) ELSE 0 END;
  v_commission_cents := ROUND(v_base_price_cents * 0.15);
  v_total_price_cents := v_base_price_cents + v_stairs_fee_cents + v_helper_fee_cents + v_booking_fee_cents;
  v_carrier_payout_cents := v_base_price_cents + v_stairs_fee_cents + v_helper_fee_cents - v_commission_cents;

  -- Insert the booking
  INSERT INTO bookings (
    listing_id, customer_id, carrier_id,
    item_description, item_category,
    needs_stairs, needs_helper,
    pickup_address, pickup_suburb, pickup_postcode,
    pickup_point,
    dropoff_address, dropoff_suburb, dropoff_postcode,
    dropoff_point,
    base_price_cents, stairs_fee_cents, helper_fee_cents,
    booking_fee_cents, platform_commission_cents,
    total_price_cents, carrier_payout_cents,
    stripe_payment_intent_id,
    item_volume_m3, item_weight_kg, item_dimensions, special_notes,
    status, payment_status
  ) VALUES (
    p_listing_id, p_customer_id, p_carrier_id,
    p_item_description, p_item_category,
    p_needs_stairs, p_needs_helper,
    p_pickup_address, p_pickup_suburb, p_pickup_postcode,
    ST_SetSRID(ST_MakePoint(p_pickup_lng, p_pickup_lat), 4326)::geography,
    p_dropoff_address, p_dropoff_suburb, p_dropoff_postcode,
    ST_SetSRID(ST_MakePoint(p_dropoff_lng, p_dropoff_lat), 4326)::geography,
    v_base_price_cents, v_stairs_fee_cents, v_helper_fee_cents,
    v_booking_fee_cents, v_commission_cents,
    v_total_price_cents, v_carrier_payout_cents,
    p_stripe_payment_intent_id,
    p_item_volume_m3, p_item_weight_kg, p_item_dimensions, p_special_notes,
    'pending', 'pending'
  ) RETURNING id INTO v_booking_id;

  -- Update remaining capacity (approximate: reduce by booking fee volume or fixed pct)
  -- If item_volume_m3 provided, use it; otherwise decrement by 25% of available
  v_new_capacity_pct := GREATEST(0, v_listing.remaining_capacity_pct -
    CASE
      WHEN p_item_volume_m3 IS NOT NULL AND v_listing.available_volume_m3 > 0
        THEN (p_item_volume_m3 / v_listing.available_volume_m3) * 100
      ELSE 25
    END
  );

  UPDATE capacity_listings SET
    remaining_capacity_pct = v_new_capacity_pct,
    status = CASE WHEN v_new_capacity_pct <= 0 THEN 'booked_full' ELSE 'booked_partial' END
  WHERE id = p_listing_id;

  -- Write audit event
  INSERT INTO booking_events (booking_id, event_type, actor_role, actor_user_id)
  VALUES (v_booking_id, 'booking_created', 'customer', p_customer_id);

  RETURN v_booking_id;
END;
$$;
```

## Step 2: Update Application Code

In `src/lib/data/bookings.ts`, replace the body of `createBookingForCustomer` to call the RPC:

```typescript
const { data: bookingId, error } = await supabase
  .rpc('create_booking_atomic', {
    p_listing_id: params.listingId,
    p_customer_id: params.customerId,
    p_carrier_id: listing.carrierId,
    // ... map all params
  })

if (error) {
  if (error.message === 'listing_not_bookable') throw new AppError(409, 'listing_not_bookable', ...)
  if (error.message === 'listing_not_found') throw new AppError(404, 'listing_not_found', ...)
  throw error
}
```

## Step 3: Update TypeScript Types

If `src/types/database.ts` has a `Functions` type, add `create_booking_atomic` with correct args and return type.

## Step 4: Write the Test

Create `src/lib/__tests__/bookings-concurrent.test.ts`:

```typescript
// Test: two concurrent booking attempts against same listing
// Only one should succeed; second should throw listing_not_bookable
// Use Vitest's concurrent test utilities
```

Note: This test requires a real Supabase instance (not mocked) to validate the lock. Mark it as an integration test.

## Step 5: Verify

```bash
npm run check
# Apply migration: npm run supabase:db:push
# Manually create two bookings in quick succession against same listing
# Verify only one booking exists in DB
```

## Rollback

If the migration causes issues, the rollback migration should `DROP FUNCTION create_booking_atomic` and the application code reverts to the previous two-step flow.
