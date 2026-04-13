import {
  BOOKING_PAYMENT_LABELS,
  BOOKING_CANCELLATION_REASONS,
  DELIVERY_AUTO_RELEASE_HOURS,
  PENDING_BOOKING_HOLD_MS,
} from "@/lib/constants";
import { getBookingPaymentLifecyclePhase } from "@/lib/status-machine";
import type {
  Booking,
  BookingCancellationReasonCode,
} from "@/types/booking";

export function getCancellationReasonLabel(
  code: BookingCancellationReasonCode | null | undefined,
) {
  return (
    BOOKING_CANCELLATION_REASONS.find((reason) => reason.value === code)?.label ?? "Cancelled"
  );
}

export function getPendingExpiryTimestamp(booking: Booking) {
  if (booking.pendingExpiresAt) {
    return booking.pendingExpiresAt;
  }

  if (!booking.createdAt) {
    return null;
  }

  return new Date(new Date(booking.createdAt).getTime() + PENDING_BOOKING_HOLD_MS).toISOString();
}

export function getBookingPaymentStateSummary(booking: Booking) {
  const paymentStatus = booking.paymentStatus ?? "pending";
  const lifecyclePhase = getBookingPaymentLifecyclePhase({
    bookingStatus: booking.status,
    paymentStatus,
  });

  if (lifecyclePhase === "authorization_failed") {
    return {
      badge: BOOKING_PAYMENT_LABELS.failed,
      tone: "error" as const,
      title: "Payment needs another card or retry",
      description:
        booking.paymentFailureReason ??
        "The first authorization did not go through. Your booking is still saved and can be retried.",
      retryable: true,
    };
  }

  if (lifecyclePhase === "hold_released") {
    return {
      badge: BOOKING_PAYMENT_LABELS.authorization_cancelled,
      tone: "warning" as const,
      title: "The card hold was released",
      description:
        "No charge was captured. If you still want this trip, restart payment setup from this booking.",
      retryable: booking.status === "pending",
    };
  }

  if (lifecyclePhase === "release_pending") {
      return {
        badge: BOOKING_PAYMENT_LABELS.authorized,
        tone: "warning" as const,
        title: "Release pending while proof and the dispute window close",
        description: `moverrr is holding the authorized amount while proof is reviewed and the ${DELIVERY_AUTO_RELEASE_HOURS}-hour dispute window runs.`,
        retryable: false,
      };
  }

  if (lifecyclePhase === "funds_held") {
    return {
      badge: BOOKING_PAYMENT_LABELS.authorized,
      tone: "success" as const,
      title: "Authorization hold is active",
      description:
        "The card hold is active. moverrr only finalizes the charge after delivery proof and the release path are complete.",
      retryable: false,
    };
  }

  if (lifecyclePhase === "paid") {
    if (booking.status === "completed") {
      return {
        badge: BOOKING_PAYMENT_LABELS.captured,
        tone: "success" as const,
        title: "Paid after the release window closed",
        description: "The job is complete, the release window closed, and moverrr finalized the booking payment.",
        retryable: false,
      };
    }

    return {
      badge: BOOKING_PAYMENT_LABELS.captured,
      tone: "success" as const,
      title: "Paid through moverrr",
      description: "The booking charge is finalized and attached to the proof and payout trail.",
      retryable: false,
    };
  }

  if (lifecyclePhase === "refunded") {
    return {
      badge: BOOKING_PAYMENT_LABELS.refunded,
      tone: "neutral" as const,
      title: "Payment refunded",
      description: "Money was captured and then returned to the original payment method.",
      retryable: false,
    };
  }

  if (lifecyclePhase === "manual_review") {
    return {
      badge: BOOKING_PAYMENT_LABELS.capture_failed,
      tone: "warning" as const,
      title: "Manual payment review required",
      description:
        booking.paymentFailureReason ??
        "The release path hit a capture problem, so moverrr is holding payout until ops reviews it.",
      retryable: false,
    };
  }

  return {
    badge: BOOKING_PAYMENT_LABELS.pending,
    tone: "neutral" as const,
    title: "Authorization still pending",
    description:
      "Stripe has not confirmed the authorization yet. Keep this page open or retry payment setup if needed.",
    retryable: booking.status === "pending",
  };
}

export function getConfirmedBookingChecklist() {
  return [
    "Have the item packed, wrapped, or ready to move before the time window starts.",
    "Make sure someone is available at the pickup address during the posted window.",
    "Keep building access details, gate codes, and loading instructions handy.",
    "Have ID or proof-of-ownership available if the carrier needs a handoff photo.",
  ];
}
