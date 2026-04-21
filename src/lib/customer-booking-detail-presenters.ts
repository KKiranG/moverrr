import { DELIVERY_AUTO_RELEASE_HOURS } from "@/lib/constants";
import {
  getBookingPaymentStateSummary,
  getPendingExpiryTimestamp,
} from "@/lib/booking-presenters";
import type {
  Booking,
  BookingEvent,
  BookingExceptionCode,
  BookingPaymentLifecyclePhase,
} from "@/types/booking";
import type { Dispute } from "@/types/dispute";

export type CustomerBookingPrimaryActionKind =
  | "confirm_receipt"
  | "retry_payment"
  | "none";

export interface CustomerBookingPrimaryAction {
  kind: CustomerBookingPrimaryActionKind;
  label?: string;
  anchorId?: string;
}

export interface CustomerBookingHeroState {
  eyebrow: string;
  title: string;
  description: string;
  tone: "neutral" | "success" | "warning" | "error";
  primaryAction: CustomerBookingPrimaryAction;
  showPendingExpiry: boolean;
}

export interface CustomerBookingTimelineEntry {
  key: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface CustomerBookingProofSummary {
  photoUrl: string | null;
  capturedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  itemCount: number | null;
  condition: string | null;
  recipientConfirmed: boolean | null;
  exceptionCode: BookingExceptionCode | null;
  exceptionNote: string | null;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function getPaymentLifecyclePhase(booking: Booking): BookingPaymentLifecyclePhase {
  const paymentStatus = booking.paymentStatus ?? "pending";

  if (booking.paymentFailureCode === "condition_adjustment_accepted") {
    return "authorization_failed";
  }

  if (paymentStatus === "failed") {
    return "authorization_failed";
  }

  if (paymentStatus === "authorization_cancelled") {
    return "hold_released";
  }

  if (paymentStatus === "capture_failed") {
    return "manual_review";
  }

  if (paymentStatus === "refunded") {
    return "refunded";
  }

  if (paymentStatus === "captured") {
    return "paid";
  }

  if (booking.status === "delivered" || booking.status === "disputed") {
    return "release_pending";
  }

  if (paymentStatus === "authorized") {
    return "funds_held";
  }

  return "authorization_pending";
}

export function getCustomerBookingHeroState(
  booking: Booking,
  disputes: Dispute[],
): CustomerBookingHeroState {
  const paymentSummary = getBookingPaymentStateSummary(booking);

  if (paymentSummary.retryable) {
    return {
      eyebrow: "Payment issue",
      title: paymentSummary.title,
      description: paymentSummary.description,
      tone: paymentSummary.tone === "error" ? "error" : "warning",
      primaryAction: {
        kind: "retry_payment",
        label: "Retry payment",
        anchorId: "payment-recovery",
      },
      showPendingExpiry: booking.status === "pending",
    };
  }

  switch (booking.status) {
    case "pending":
      return {
        eyebrow: "Awaiting carrier decision",
        title: "This booking is still inside the response window",
        description:
          "MoveMate is holding the request, payment trail, and proof record together while the carrier confirms or declines it.",
        tone: "warning",
        primaryAction: { kind: "none" },
        showPendingExpiry: Boolean(getPendingExpiryTimestamp(booking)),
      };
    case "confirmed":
      return {
        eyebrow: "Confirmed",
        title: "Your move is confirmed and ready for handoff",
        description:
          "Keep the item, access details, and contact timing aligned. Pickup and delivery proof stay attached to this booking record from here.",
        tone: "success",
        primaryAction: { kind: "none" },
        showPendingExpiry: false,
      };
    case "picked_up":
      return {
        eyebrow: "Pickup recorded",
        title: "The item is now with the carrier",
        description:
          "Pickup proof is captured. Keep this page handy for the delivery handoff, proof review, and receipt confirmation step.",
        tone: "neutral",
        primaryAction: { kind: "none" },
        showPendingExpiry: false,
      };
    case "in_transit":
      return {
        eyebrow: "In transit",
        title: "The booking is moving toward delivery",
        description:
          "Delivery proof and any issue reporting still happen here so the payout trail stays tied to the same booking record.",
        tone: "neutral",
        primaryAction: { kind: "none" },
        showPendingExpiry: false,
      };
    case "delivered":
      return {
        eyebrow: "Delivered",
        title: "Delivery proof is in. Confirm receipt if everything looks right.",
        description: `MoveMate keeps payout held until you confirm the handoff or the ${DELIVERY_AUTO_RELEASE_HOURS}-hour dispute window closes with proof still intact.`,
        tone: disputes.some((dispute) => dispute.status === "open" || dispute.status === "investigating")
          ? "warning"
          : "success",
        primaryAction: {
          kind: "confirm_receipt",
          label: "Confirm receipt",
          anchorId: "confirm-receipt",
        },
        showPendingExpiry: false,
      };
    case "disputed":
      return {
        eyebrow: "Dispute open",
        title: "MoveMate is holding payout while the issue is reviewed",
        description:
          "Proof, timestamps, and the booking timeline stay attached here so support can resolve the dispute without off-platform guesswork.",
        tone: "error",
        primaryAction: { kind: "none" },
        showPendingExpiry: false,
      };
    case "completed":
      return booking.customerConfirmedAt
        ? {
            eyebrow: "Completed",
            title: "Receipt confirmed and the booking is closed",
            description:
              "Your confirmation closed the trust trail cleanly. Payment capture and payout release can complete against the same proof-backed record.",
            tone: "success",
            primaryAction: { kind: "none" },
            showPendingExpiry: false,
          }
        : {
            eyebrow: "Completed",
            title: "The proof window closed and MoveMate completed the booking",
            description: `No dispute interrupted the proof-backed release path within ${DELIVERY_AUTO_RELEASE_HOURS} hours, so the booking closed automatically.`,
            tone: "success",
            primaryAction: { kind: "none" },
            showPendingExpiry: false,
          };
    case "cancelled":
      return {
        eyebrow: "Cancelled",
        title: "This booking closed before completion",
        description:
          booking.cancellationReason ??
          "No proof, payout release, or completion flow will continue from this cancelled booking record.",
        tone: "warning",
        primaryAction: { kind: "none" },
        showPendingExpiry: false,
      };
    default:
      return {
        eyebrow: "Booking update",
        title: "MoveMate is keeping this booking record current",
        description:
          "Use this page as the source of truth for booking status, proof, and payout-release context.",
        tone: "neutral",
        primaryAction: { kind: "none" },
        showPendingExpiry: false,
      };
  }
}

function getLatestProof(
  booking: Booking,
  key: "pickupProof" | "deliveryProof",
): CustomerBookingProofSummary | null {
  const matchingEvent = [...(booking.events ?? [])]
    .reverse()
    .find((event) => {
      const metadata = asRecord(event.metadata);
      return Boolean(metadata && asRecord(metadata[key]));
    });

  const proof = matchingEvent ? asRecord(asRecord(matchingEvent.metadata)?.[key]) : null;

  if (!proof) {
    const fallbackPath =
      key === "pickupProof" ? booking.pickupProofPhotoUrl : booking.deliveryProofPhotoUrl;

    if (!fallbackPath) {
      return null;
    }

    return {
      photoUrl: fallbackPath,
      capturedAt: null,
      latitude: null,
      longitude: null,
      itemCount: null,
      condition: null,
      recipientConfirmed: null,
      exceptionCode: null,
      exceptionNote: null,
    };
  }

  return {
    photoUrl: asString(proof.photoUrl),
    capturedAt: asString(proof.capturedAt),
    latitude: asNumber(proof.latitude),
    longitude: asNumber(proof.longitude),
    itemCount: asNumber(proof.itemCount),
    condition: asString(proof.condition),
    recipientConfirmed: asBoolean(proof.recipientConfirmed),
    exceptionCode: (asString(proof.exceptionCode) as BookingExceptionCode | null) ?? null,
    exceptionNote: asString(proof.exceptionNote),
  };
}

export function getCustomerBookingProofSummary(booking: Booking) {
  return {
    pickup: getLatestProof(booking, "pickupProof"),
    delivery: getLatestProof(booking, "deliveryProof"),
  };
}

function getStatusEventDescription(event: BookingEvent, booking: Booking) {
  const metadata = asRecord(event.metadata);

  switch (event.eventType) {
    case "status_confirmed":
      return {
        title: "Carrier accepted",
        description:
          "The booking moved out of the waiting queue and into live fulfilment inside MoveMate.",
      };
    case "status_picked_up": {
      const pickupProof = metadata ? asRecord(metadata.pickupProof) : null;
      const itemCount = asNumber(pickupProof?.itemCount);
      return {
        title: "Pickup proof captured",
        description:
          itemCount && itemCount > 0
            ? `Pickup handoff was recorded for ${itemCount} item${itemCount === 1 ? "" : "s"}.`
            : "Pickup handoff was recorded inside the booking proof trail.",
      };
    }
    case "status_in_transit":
      return {
        title: "In transit",
        description:
          "The carrier marked the item as on the way to the delivery address.",
      };
    case "status_delivered": {
      const deliveryProof = metadata ? asRecord(metadata.deliveryProof) : null;
      const exceptionCode = asString(deliveryProof?.exceptionCode);
      return {
        title: "Delivery proof captured",
        description:
          exceptionCode && exceptionCode !== "none"
            ? "Delivery proof was recorded with an issue note so payout stays inside review."
            : `Delivery proof was recorded and the ${DELIVERY_AUTO_RELEASE_HOURS}-hour confirmation window started.`,
      };
    }
    case "status_completed":
      return {
        title: booking.customerConfirmedAt ? "Receipt confirmed" : "Booking completed",
        description: booking.customerConfirmedAt
          ? "Customer confirmation closed the handoff and payout-release path."
          : "The proof-backed release path completed without a blocking dispute.",
      };
    case "status_cancelled":
      return {
        title: "Booking cancelled",
        description:
          asString(metadata?.adminReason) ??
          booking.cancellationReason ??
          "The booking closed before completion.",
      };
    case "review_created":
      return {
        title: "Review submitted",
        description: "A post-booking review was recorded against this booking.",
      };
    case "review_responded":
      return {
        title: "Carrier review response added",
        description: "The carrier posted a response to the completed-booking review.",
      };
    case "payment_intent_created":
      return {
        title: "Payment hold started",
        description:
          "MoveMate created the card authorization trail tied to this booking.",
      };
    default:
      return null;
  }
}

export function buildCustomerBookingTimeline(
  booking: Booking,
  disputes: Dispute[],
): CustomerBookingTimelineEntry[] {
  const entries: CustomerBookingTimelineEntry[] = [];

  if (booking.createdAt) {
    entries.push({
      key: "booking_created",
      title: "Booking recorded",
      description:
        "MoveMate created the booking record and kept pricing, proof, and payout inside the same trail.",
      createdAt: booking.createdAt,
    });
  }

  const orderedEvents = [...(booking.events ?? [])].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );

  for (const event of orderedEvents) {
    if (event.eventType === "status_disputed") {
      continue;
    }

    if (event.eventType === "dispute_raised") {
      const category = asString(asRecord(event.metadata)?.category);
      entries.push({
        key: `${event.id}:dispute`,
        title: "Dispute opened",
        description: category
          ? `A ${category.replaceAll("_", " ")} issue was raised and payout stayed held for review.`
          : "A dispute was raised and payout stayed held for review.",
        createdAt: event.createdAt,
      });
      continue;
    }

    const detail = getStatusEventDescription(event, booking);

    if (!detail) {
      continue;
    }

    entries.push({
      key: `${event.id}:${event.eventType}`,
      title: detail.title,
      description: detail.description,
      createdAt: event.createdAt,
    });
  }

  for (const dispute of disputes) {
    if (
      entries.some(
        (entry) =>
          entry.title === "Dispute opened" &&
          new Date(entry.createdAt).getTime() === new Date(dispute.createdAt).getTime(),
      )
    ) {
      continue;
    }

    entries.push({
      key: `${dispute.id}:dispute-fallback`,
      title: "Dispute opened",
      description: `A ${dispute.category.replaceAll("_", " ")} issue was raised and payout stayed held for review.`,
      createdAt: dispute.createdAt,
    });
  }

  return entries.sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export function getCustomerBookingTrustNotes(booking: Booking, disputes: Dispute[]) {
  const paymentPhase = getPaymentLifecyclePhase(booking);
  const openDispute = disputes.find(
    (dispute) => dispute.status === "open" || dispute.status === "investigating",
  );
  const notes: string[] = [];

  if (booking.pickupProofPhotoUrl || booking.deliveryProofPhotoUrl) {
    notes.push("Proof is attached to this booking record rather than living in side-channel chat.");
  }

  if (paymentPhase === "funds_held") {
    notes.push("Card authorization is active, but MoveMate has not finalized payout release yet.");
  }

  if (paymentPhase === "release_pending") {
    notes.push(`MoveMate is holding payout until confirmation or the ${DELIVERY_AUTO_RELEASE_HOURS}-hour proof window closes.`);
  }

  if (paymentPhase === "manual_review") {
    notes.push("Payment capture hit a manual-review path, so ops intervention is still required before payout release.");
  }

  if (openDispute) {
    notes.push(
      `A ${openDispute.category.replaceAll("_", " ")} dispute is open, so proof and timeline evidence stay preserved for review.`,
    );
  }

  if (notes.length === 0) {
    notes.push("Keep all proof, payment, and issue handling inside MoveMate so the trust trail stays intact.");
  }

  return notes;
}
