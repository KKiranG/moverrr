import assert from "node:assert/strict";
import test, { mock } from "node:test";
import proxyquire from "proxyquire";

test("createPaymentIntentForBooking recovers from 'no such payment_intent' error and creates a new intent", async () => {
  const userId = "user-123";
  const bookingId = "booking-456";

  const originalEnv = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "sk_test_123";

  const mockBooking = {
    id: bookingId,
    bookingReference: "REF-123",
    listingId: "listing-789",
    stripePaymentIntentId: "pi_invalid_123",
    pricing: { totalPriceCents: 10000, basePriceCents: 10000, platformFeeCents: 0, gstCents: 0, carrierPayoutCents: 10000, platformCommissionCents: 0 }
  };

  const mockStripe = {
    paymentIntents: {
      retrieve: mock.fn(async () => {
        throw new Error("No such payment_intent: 'pi_invalid_123'");
      }),
      create: mock.fn(async () => {
        return { id: "pi_new_123", status: "requires_payment_method" };
      }),
    },
  };

  const mockSupabase = {
    from: mock.fn((table) => {
      const q = {
        select: mock.fn(() => q),
        eq: mock.fn(() => q),
        maybeSingle: mock.fn(async () => {
          if (table === "customers") return { data: { id: "customer-1" } };
          if (table === "carriers") return { data: { id: "carrier-1" } };
          if (table === "bookings") return { data: { id: bookingId, stripe_payment_intent_id: "pi_invalid_123", customer_id: "customer-1", carrier_id: "carrier-1", events: [] } };
          return { data: null };
        }),
        update: mock.fn(() => q),
        insert: mock.fn(() => q),
      };
      return q;
    })
  };

  const bookingsModule = proxyquire("../data/bookings.ts", {
    "@/lib/stripe/client": {
      getStripeServerClient: () => mockStripe,
      "@noCallThru": true,
    },
    "@/lib/env": {
      hasSupabaseEnv: () => true,
      hasSupabaseAdminEnv: () => true,
      "@noCallThru": true,
    },
    "@/lib/supabase/server": {
      createClient: () => mockSupabase,
      "@noCallThru": true,
    },
    "@/lib/supabase/admin": {
      createAdminClient: () => mockSupabase,
      "@noCallThru": true,
    },
    "@/lib/data/mappers": {
        toBooking: () => mockBooking,
        "@noCallThru": true,
    }
  });

  const { createPaymentIntentForBooking } = bookingsModule.default || bookingsModule;
  const result = await createPaymentIntentForBooking(userId, bookingId);

  assert.equal(result.id, "pi_new_123");
  assert.equal(mockStripe.paymentIntents.retrieve.mock.callCount(), 1);
  assert.equal(mockStripe.paymentIntents.create.mock.callCount(), 1);

  process.env.STRIPE_SECRET_KEY = originalEnv;
});

test("createPaymentIntentForBooking throws error if stripe.paymentIntents.retrieve throws an unknown error", async () => {
  const userId = "user-123";
  const bookingId = "booking-456";

  const originalEnv = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "sk_test_123";

  const mockBooking = {
    id: bookingId,
    bookingReference: "REF-123",
    listingId: "listing-789",
    stripePaymentIntentId: "pi_valid_123",
    pricing: { totalPriceCents: 10000, basePriceCents: 10000, platformFeeCents: 0, gstCents: 0, carrierPayoutCents: 10000, platformCommissionCents: 0 }
  };

  const mockStripe = {
    paymentIntents: {
      retrieve: mock.fn(async () => {
        throw new Error("Rate limit exceeded");
      }),
      create: mock.fn(),
    },
  };

  const mockSupabase = {
    from: mock.fn((table) => {
      const q = {
        select: mock.fn(() => q),
        eq: mock.fn(() => q),
        maybeSingle: mock.fn(async () => {
          if (table === "customers") return { data: { id: "customer-1" } };
          if (table === "carriers") return { data: { id: "carrier-1" } };
          if (table === "bookings") return { data: { id: bookingId, stripe_payment_intent_id: "pi_valid_123", customer_id: "customer-1", carrier_id: "carrier-1", events: [] } };
          return { data: null };
        }),
        update: mock.fn(() => q)
      };
      return q;
    })
  };

  const bookingsModule = proxyquire("../data/bookings.ts", {
    "@/lib/stripe/client": {
      getStripeServerClient: () => mockStripe,
      "@noCallThru": true,
    },
    "@/lib/env": {
      hasSupabaseEnv: () => true,
      "@noCallThru": true,
    },
    "@/lib/supabase/server": {
      createClient: () => mockSupabase,
      "@noCallThru": true,
    },
    "@/lib/data/mappers": {
        toBooking: () => mockBooking,
        "@noCallThru": true,
    }
  });

  const { createPaymentIntentForBooking } = bookingsModule.default || bookingsModule;

  await assert.rejects(
    () => createPaymentIntentForBooking(userId, bookingId),
    (err: Error) => {
      assert.match(err.message, /Rate limit exceeded/);
      return true;
    }
  );

  assert.equal(mockStripe.paymentIntents.retrieve.mock.callCount(), 1);
  assert.equal(mockStripe.paymentIntents.create.mock.callCount(), 0);

  process.env.STRIPE_SECRET_KEY = originalEnv;
});
