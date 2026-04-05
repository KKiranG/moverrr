import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCarrierNudgeAuditEvent,
  getCarrierNudgeEmailConfig,
  selectCarrierNextStepNudges,
  type CarrierNextStepBookingRow,
} from "../../../supabase/functions/carrier-next-step-nudges/shared";

function createRow(
  overrides: Partial<CarrierNextStepBookingRow> = {},
): CarrierNextStepBookingRow {
  return {
    id: overrides.id ?? "booking-1",
    booking_reference: overrides.booking_reference ?? "MOV-001",
    status: overrides.status ?? "pending",
    payment_status: overrides.payment_status ?? "authorized",
    pending_expires_at:
      overrides.pending_expires_at ?? "2026-04-05T10:45:00.000Z",
    pickup_proof_photo_url: overrides.pickup_proof_photo_url ?? null,
    delivery_proof_photo_url: overrides.delivery_proof_photo_url ?? null,
    delivered_at: overrides.delivered_at ?? null,
    updated_at: overrides.updated_at ?? "2026-04-05T07:00:00.000Z",
    listing_id: overrides.listing_id ?? "listing-1",
    carrier: overrides.carrier ?? {
      email: "carrier@example.com",
      stripe_onboarding_complete: true,
      business_name: "Carrier Co",
    },
    listing: overrides.listing ?? {
      trip_date: "2026-04-05",
      origin_suburb: "Marrickville",
      destination_suburb: "Bondi",
    },
  };
}

test("selectCarrierNextStepNudges picks each required nudge case", () => {
  const now = new Date("2026-04-05T10:00:00.000Z");
  const nudges = selectCarrierNextStepNudges(
    [
      createRow({
        id: "pending-booking",
        booking_reference: "MOV-100",
        status: "pending",
        pending_expires_at: "2026-04-05T10:30:00.000Z",
      }),
      createRow({
        id: "pickup-proof",
        booking_reference: "MOV-200",
        status: "confirmed",
        pending_expires_at: null,
      }),
      createRow({
        id: "delivery-proof",
        booking_reference: "MOV-300",
        status: "picked_up",
        pending_expires_at: null,
        updated_at: "2026-04-05T07:30:00.000Z",
      }),
      createRow({
        id: "payout-setup",
        booking_reference: "MOV-400",
        status: "delivered",
        pending_expires_at: null,
        updated_at: "2026-04-05T09:30:00.000Z",
        carrier: {
          email: "carrier@example.com",
          stripe_onboarding_complete: false,
          business_name: "Carrier Co",
        },
      }),
    ],
    now,
  );

  assert.equal(nudges.length, 4);
  assert.deepEqual(
    nudges.map((nudge) => nudge.type),
    [
      "pending_booking_expiring",
      "pickup_proof_stalled",
      "delivery_proof_stalled",
      "payout_setup_blocked",
    ],
  );
  assert.equal(
    nudges.find((nudge) => nudge.type === "pending_booking_expiring")?.actionHref,
    "/carrier/trips?filter=pending",
  );
  assert.equal(
    nudges.find((nudge) => nudge.type === "payout_setup_blocked")?.actionHref,
    "/carrier/payouts",
  );
});

test("selectCarrierNextStepNudges ignores rows that are not actually due", () => {
  const now = new Date("2026-04-05T10:00:00.000Z");
  const nudges = selectCarrierNextStepNudges(
    [
      createRow({
        id: "pending-late",
        status: "pending",
        pending_expires_at: "2026-04-05T12:30:00.000Z",
      }),
      createRow({
        id: "confirmed-future",
        status: "confirmed",
        pending_expires_at: null,
        listing: {
          trip_date: "2026-04-06",
          origin_suburb: "Marrickville",
          destination_suburb: "Bondi",
        },
      }),
      createRow({
        id: "delivery-recent",
        status: "in_transit",
        pending_expires_at: null,
        updated_at: "2026-04-05T09:15:00.000Z",
      }),
      createRow({
        id: "payout-ready",
        status: "completed",
        pending_expires_at: null,
        payment_status: "captured",
        carrier: {
          email: "carrier@example.com",
          stripe_onboarding_complete: false,
          business_name: "Carrier Co",
        },
      }),
    ],
    now,
  );

  assert.equal(nudges.length, 0);
});

test("getCarrierNudgeEmailConfig gracefully skips when resend config is missing", () => {
  assert.deepEqual(getCarrierNudgeEmailConfig({}), {
    skipped: true,
    reason: "missing_resend",
  });

  const config = getCarrierNudgeEmailConfig({
    resendApiKey: "re_test",
    resendFromEmail: "hello@moverrr.com.au",
    siteUrl: "https://moverrr.example",
  });

  assert.equal(config.skipped, false);
  if (!config.skipped) {
    assert.equal(config.config.siteUrl, "https://moverrr.example");
  }
});

test("buildCarrierNudgeAuditEvent returns a stable audit payload shape", () => {
  const [nudge] = selectCarrierNextStepNudges(
    [
      createRow({
        id: "pending-booking",
        booking_reference: "MOV-100",
        status: "pending",
        pending_expires_at: "2026-04-05T10:30:00.000Z",
      }),
    ],
    new Date("2026-04-05T10:00:00.000Z"),
  );

  assert.ok(nudge);

  const event = buildCarrierNudgeAuditEvent({
    nudge,
    outcome: "skipped",
    reason: "missing_resend",
    recipientEmail: "carrier@example.com",
    dedupeKey: "booking-1:pending",
  });

  assert.equal(event.booking_id, "pending-booking");
  assert.equal(event.actor_role, "system");
  assert.equal(event.event_type, "carrier_next_step_nudge_skipped");
  assert.deepEqual(event.metadata, {
    nudgeType: "pending_booking_expiring",
    bookingReference: "MOV-100",
    bookingStatus: "pending",
    paymentStatus: "authorized",
    routeLabel: "Marrickville -> Bondi",
    tripDate: "2026-04-05",
    missingStep: "Carrier decision still missing",
    actionHref: "/carrier/trips?filter=pending",
    actionLabel: "Review pending booking",
    outcome: "skipped",
    reason: "missing_resend",
    recipientEmail: "carrier@example.com",
    dedupeKey: "booking-1:pending",
    providerMessageId: null,
  });
});
