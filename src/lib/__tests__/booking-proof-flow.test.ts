import assert from "node:assert/strict";
import test from "node:test";

import {
  logBookingExceptionForActor,
  updateBookingStatusForActor,
} from "@/lib/data/bookings";
import { AppError } from "@/lib/errors";
import {
  createBookingRow,
  createCarrierRow,
  createCustomerRow,
  installSupabaseRestHarness,
} from "@/lib/__tests__/helpers/supabase-rest-harness";

test("rejects picked_up without the full pickup proof pack", async () => {
  const harness = installSupabaseRestHarness({
    bookings: [
      createBookingRow({
        id: "booking-pickup-proof",
        status: "confirmed",
        payment_status: "authorized",
      }),
    ],
    carriers: [createCarrierRow()],
    customers: [createCustomerRow()],
  });

  try {
    await assert.rejects(
      updateBookingStatusForActor({
        userId: "admin-user-1",
        bookingId: "booking-pickup-proof",
        nextStatus: "picked_up",
        actorRole: "admin",
        pickupProof: {
          photoUrl: "proofs/pickup.jpg",
          itemCount: 1,
          condition: "no_visible_damage",
          handoffConfirmed: false,
          capturedAt: "2026-04-02T10:00:00.000Z",
          latitude: -33.8688,
          longitude: 151.2093,
        } as never,
        skipStatusEmails: true,
      }),
      (error: unknown) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.code === "pickup_proof_required",
    );

    assert.equal(harness.getBooking("booking-pickup-proof")?.status, "confirmed");
    assert.equal(harness.state.bookingEvents.length, 0);
  } finally {
    harness.restore();
  }
});

test("rejects delivered without the full delivery proof pack", async () => {
  const harness = installSupabaseRestHarness({
    bookings: [
      createBookingRow({
        id: "booking-delivery-proof",
        status: "in_transit",
        payment_status: "authorized",
      }),
    ],
    carriers: [createCarrierRow()],
    customers: [createCustomerRow()],
  });

  try {
    await assert.rejects(
      updateBookingStatusForActor({
        userId: "admin-user-1",
        bookingId: "booking-delivery-proof",
        nextStatus: "delivered",
        actorRole: "admin",
        deliveryProof: {
          photoUrl: "proofs/delivery.jpg",
          recipientConfirmed: true,
          exceptionCode: "damage",
          capturedAt: "2026-04-02T10:00:00.000Z",
          latitude: -33.8688,
          longitude: 151.2093,
        },
        skipStatusEmails: true,
      }),
      (error: unknown) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.code === "delivery_proof_required",
    );

    assert.equal(harness.getBooking("booking-delivery-proof")?.status, "in_transit");
    assert.equal(harness.state.bookingEvents.length, 0);
  } finally {
    harness.restore();
  }
});

test("accepts valid pickup and delivery proof packs and persists metadata to booking events", async () => {
  const harness = installSupabaseRestHarness({
    bookings: [
      createBookingRow({
        id: "booking-picked-up",
        status: "confirmed",
        payment_status: "authorized",
      }),
      createBookingRow({
        id: "booking-delivered",
        status: "in_transit",
        payment_status: "authorized",
      }),
    ],
    carriers: [createCarrierRow()],
    customers: [createCustomerRow()],
  });

  try {
    const pickedUpBooking = await updateBookingStatusForActor({
      userId: "admin-user-1",
      bookingId: "booking-picked-up",
      nextStatus: "picked_up",
      actorRole: "admin",
      pickupProof: {
        photoUrl: "proofs/pickup-pack.jpg",
        itemCount: 2,
        condition: "wear_noted",
        handoffConfirmed: true,
        capturedAt: "2026-04-02T10:00:00.000Z",
        latitude: -33.8688,
        longitude: 151.2093,
      },
      skipStatusEmails: true,
    });

    const deliveredBooking = await updateBookingStatusForActor({
      userId: "admin-user-1",
      bookingId: "booking-delivered",
      nextStatus: "delivered",
      actorRole: "admin",
      deliveryProof: {
        photoUrl: "proofs/delivery-pack.jpg",
        recipientConfirmed: true,
        exceptionCode: "damage",
        exceptionNote: "Small chip noted on the front edge at handoff.",
        capturedAt: "2026-04-02T11:15:00.000Z",
        latitude: -33.889,
        longitude: 151.225,
      },
      skipStatusEmails: true,
    });

    assert.equal(pickedUpBooking.status, "picked_up");
    assert.equal(deliveredBooking.status, "delivered");
    assert.equal(
      harness.getBooking("booking-picked-up")?.pickup_proof_photo_url,
      "proofs/pickup-pack.jpg",
    );
    assert.equal(
      harness.getBooking("booking-delivered")?.delivery_proof_photo_url,
      "proofs/delivery-pack.jpg",
    );

    const pickupEvent = harness.state.bookingEvents.find(
      (event) =>
        event.booking_id === "booking-picked-up" && event.event_type === "status_picked_up",
    );
    const deliveryEvent = harness.state.bookingEvents.find(
      (event) =>
        event.booking_id === "booking-delivered" && event.event_type === "status_delivered",
    );

    assert.deepEqual(pickupEvent?.metadata, {
      previousStatus: "confirmed",
      pickupProof: {
        photoUrl: "proofs/pickup-pack.jpg",
        itemCount: 2,
        condition: "wear_noted",
        handoffConfirmed: true,
        capturedAt: "2026-04-02T10:00:00.000Z",
        latitude: -33.8688,
        longitude: 151.2093,
      },
    });
    assert.deepEqual(deliveryEvent?.metadata, {
      previousStatus: "in_transit",
      deliveryProof: {
        photoUrl: "proofs/delivery-pack.jpg",
        recipientConfirmed: true,
        exceptionCode: "damage",
        exceptionNote: "Small chip noted on the front edge at handoff.",
        capturedAt: "2026-04-02T11:15:00.000Z",
        latitude: -33.889,
        longitude: 151.225,
      },
    });
  } finally {
    harness.restore();
  }
});

test("logs booking exceptions with valid codes and persists audit metadata", async () => {
  const harness = installSupabaseRestHarness({
    bookings: [
      createBookingRow({
        id: "booking-exception-log",
        status: "in_transit",
        payment_status: "authorized",
      }),
    ],
    carriers: [createCarrierRow()],
    customers: [createCustomerRow()],
  });

  try {
    const exception = await logBookingExceptionForActor({
      userId: "admin-user-1",
      bookingId: "booking-exception-log",
      actorRole: "admin",
      code: "damage",
      note: "Corner scuff noticed while unloading at the destination.",
      photoUrls: ["proofs/exception-1.jpg", "proofs/exception-2.jpg"],
    });

    assert.equal(exception.code, "damage");
    assert.equal(exception.bookingStatus, "in_transit");

    const event = harness.state.bookingEvents.at(-1);
    assert.equal(event?.event_type, "exception_reported");
    assert.deepEqual(event?.metadata, {
      code: "damage",
      note: "Corner scuff noticed while unloading at the destination.",
      photoUrls: ["proofs/exception-1.jpg", "proofs/exception-2.jpg"],
      bookingStatus: "in_transit",
    });
  } finally {
    harness.restore();
  }
});
