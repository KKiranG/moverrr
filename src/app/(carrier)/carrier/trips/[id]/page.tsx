import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DisputeForm } from "@/components/booking/dispute-form";
import { CarrierReviewResponseForm } from "@/components/booking/carrier-review-response-form";
import { ConditionAdjustmentTriggerForm } from "@/components/booking/condition-adjustment-trigger-form";
import { ReviewForm } from "@/components/booking/review-form";
import { StatusUpdateActions } from "@/components/booking/status-update-actions";
import { SaveTripTemplateAction } from "@/components/carrier/save-trip-template-action";
import { TripEditForm } from "@/components/carrier/trip-edit-form";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requirePageSessionUser } from "@/lib/auth";
import { getBookingPaymentStateSummary } from "@/lib/booking-presenters";
import { listCarrierBookings } from "@/lib/data/bookings";
import { getCarrierByUserId } from "@/lib/data/carriers";
import { getBookingFeedbackForUser } from "@/lib/data/feedback";
import { listConditionAdjustmentsForBookingUser } from "@/lib/data/condition-adjustments";
import { getTripById } from "@/lib/data/trips";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getConditionAdjustmentReasonLabel } from "@/lib/validation/condition-adjustment";
import type { ConditionAdjustment } from "@/types/condition-adjustment";

export const metadata: Metadata = {
  title: "Carrier trip detail",
};

type CarrierBooking = Awaited<ReturnType<typeof listCarrierBookings>>[number];
type BookingFeedback = Awaited<ReturnType<typeof getBookingFeedbackForUser>>;

function buildRepostHref(trip: NonNullable<Awaited<ReturnType<typeof getTripById>>>) {
  const params = new URLSearchParams({
    vehicleId: trip.vehicle.id,
    from: trip.route.originSuburb,
    to: trip.route.destinationSuburb,
    space: trip.spaceSize,
    price: Math.round(trip.priceCents / 100).toString(),
    detour: trip.detourRadiusKm.toString(),
    tripDate: trip.tripDate,
    timeWindow: trip.timeWindow,
    volume: trip.availableVolumeM3.toString(),
    weight: trip.availableWeightKg.toString(),
    accepts: trip.rules.accepts.join(","),
    isReturn: trip.isReturnTrip ? "1" : "0",
    stairsOk: trip.rules.stairsOk ? "1" : "0",
    stairsExtra: (trip.rules.stairsExtraCents / 100).toString(),
    helperAvailable: trip.rules.helperAvailable ? "1" : "0",
    helperExtra: (trip.rules.helperExtraCents / 100).toString(),
  });

  if (trip.rules.specialNotes) {
    params.set("notes", trip.rules.specialNotes);
  }

  if (trip.route.originPostcode) {
    params.set("originPostcode", trip.route.originPostcode);
  }

  if (trip.route.destinationPostcode) {
    params.set("destinationPostcode", trip.route.destinationPostcode);
  }

  if (trip.route.originLatitude !== undefined) {
    params.set("originLat", String(trip.route.originLatitude));
  }

  if (trip.route.originLongitude !== undefined) {
    params.set("originLng", String(trip.route.originLongitude));
  }

  if (trip.route.destinationLatitude !== undefined) {
    params.set("destinationLat", String(trip.route.destinationLatitude));
  }

  if (trip.route.destinationLongitude !== undefined) {
    params.set("destinationLng", String(trip.route.destinationLongitude));
  }

  return `/carrier/post?${params.toString()}`;
}

function getBookingOperationsSummary(booking: CarrierBooking) {
  if (booking.status === "pending") {
    return {
      tone: "border-warning/20 bg-warning/10",
      eyebrow: "Pending decision",
      title: "Confirm or decline before the pending hold expires",
      description:
        "This request is still waiting on the carrier decision. Keep payment, contact, and any price changes on moverrr while it is pending.",
    };
  }

  if (booking.status === "confirmed") {
    return {
      tone: "border-border bg-black/[0.02] dark:bg-white/[0.04]",
      eyebrow: "Next required action",
      title: "Pickup proof is the next trust checkpoint",
      description:
        "Capture pickup proof before moving the booking into transit. Important operational replies should still land within 24 hours.",
    };
  }

  if (booking.status === "picked_up" || booking.status === "in_transit") {
    return {
      tone: "border-border bg-black/[0.02] dark:bg-white/[0.04]",
      eyebrow: "Next required action",
      title: "Delivery proof still sits between this booking and payout release",
      description:
        "Use the delivery proof flow at handoff and capture any access, item-fit, or damage evidence immediately so it can be logged in moverrr.",
    };
  }

  if (booking.status === "delivered") {
    return {
      tone: "border-accent/20 bg-accent/5",
      eyebrow: "Waiting on customer",
      title: "Funds stay held until receipt is confirmed",
      description:
        "The delivery is done, but payout stays on hold until the customer confirms receipt or a dispute is resolved.",
    };
  }

  if (booking.status === "completed") {
    return booking.paymentStatus === "capture_failed"
      ? {
          tone: "border-error/20 bg-error/5",
          eyebrow: "Ops review required",
          title: "Payment capture failed after completion",
          description:
            "The job is complete, but ops still needs to resolve the Stripe capture before payout can move.",
        }
      : {
          tone: "border-success/20 bg-success/5",
          eyebrow: "Booking complete",
          title: "Proof, confirmation, and payout flow are closed",
          description:
            "Keep any follow-up inside moverrr so the trust record stays complete for future jobs.",
        };
  }

  if (booking.status === "disputed") {
    return {
      tone: "border-error/20 bg-error/5",
      eyebrow: "Dispute hold",
      title: "Completion and payout stay blocked during dispute review",
      description:
        "Add calm, factual evidence only. Do not move the conversation or payment resolution off-platform.",
    };
  }

  return {
    tone: "border-border bg-black/[0.02] dark:bg-white/[0.04]",
    eyebrow: "Booking state",
    title: booking.status.replaceAll("_", " "),
    description: "Keep the booking updated in moverrr so ops and proof history stay legible.",
  };
}

function getTripFreshnessSummary(
  trip: NonNullable<Awaited<ReturnType<typeof getTripById>>>,
  freshnessParam?: string,
) {
  if (freshnessParam === "24h-confirmed") {
    return {
      tone: "border-success/20 bg-success/5",
      eyebrow: "Freshness confirmed",
      title: "24-hour reconfirmation was recorded",
      description:
        "This route stays fully eligible while moverrr waits for the final 2-hour reconfirmation window closer to departure.",
    };
  }

  if (freshnessParam === "2h-confirmed") {
    return {
      tone: "border-success/20 bg-success/5",
      eyebrow: "Freshness confirmed",
      title: "2-hour reconfirmation was recorded",
      description:
        "This route is live again for fulfilment and ops only steps in if another trust or timing issue appears.",
    };
  }

  if (freshnessParam === "failed") {
    return {
      tone: "border-error/20 bg-error/5",
      eyebrow: "Freshness update failed",
      title: "moverrr could not record the reconfirmation link",
      description:
        "Use the trip detail and ops trail here as the source of truth while the reconfirmation issue is resolved.",
    };
  }

  if (trip.status === "suspended") {
    return {
      tone: "border-error/20 bg-error/5",
      eyebrow: "Route suspended",
      title: "This trip is suspended until ops finishes freshness review",
      description:
        "New customers will not see this route while it is suspended. Keep all updates in moverrr and wait for ops to manually unsuspend it after reconfirmation.",
    };
  }

  if (trip.checkin2hRequestedAt && !trip.checkin2hConfirmed) {
    return {
      tone: "border-warning/20 bg-warning/10",
      eyebrow: "Freshness required now",
      title: "The 2-hour reconfirmation window is open",
      description:
        "Confirm that the trip is still running now. If moverrr misses this check, ops will suspend the route and affected customers will be notified.",
    };
  }

  if (trip.checkin24hRequestedAt && !trip.checkin24hConfirmed) {
    return {
      tone: "border-warning/20 bg-warning/10",
      eyebrow: "Freshness due soon",
      title: "The 24-hour reconfirmation window is open",
      description:
        "Confirm that the route is still on so moverrr can keep matching it normally before the tighter 2-hour check starts.",
    };
  }

  return {
    tone: "border-success/20 bg-success/5",
    eyebrow: "Freshness healthy",
    title: "This route is currently confirmed",
    description:
      "No freshness action is waiting right now. Keep any timing or access changes inside moverrr so ops can see the latest route state.",
  };
}

function CarrierBookingCard({
  booking,
  feedback,
  isFocused,
  adjustment,
}: {
  booking: CarrierBooking;
  feedback: BookingFeedback | undefined;
  isFocused: boolean;
  adjustment?: ConditionAdjustment;
}) {
  const paymentSummary = getBookingPaymentStateSummary(booking);
  const canOpenDispute = ["delivered", "completed", "disputed"].includes(booking.status);
  const operationsSummary = getBookingOperationsSummary(booking);

  return (
    <div
      id={`booking-${booking.id}`}
      className={`rounded-xl border p-3 ${isFocused ? "border-accent bg-accent/5" : "border-border"}`}
    >
      <h2 className="text-base text-text">{booking.itemDescription}</h2>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
        {booking.bookingReference}
      </p>
      <p className="mt-2 subtle-text">
        {booking.pickupAddress} to {booking.dropoffAddress}
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        {paymentSummary.badge} · {paymentSummary.description}
      </p>
      <div className={`mt-3 rounded-xl border p-3 ${operationsSummary.tone}`}>
        <p className="section-label">{operationsSummary.eyebrow}</p>
        <p className="mt-1 text-sm font-medium text-text">{operationsSummary.title}</p>
        <p className="mt-2 text-sm text-text-secondary">{operationsSummary.description}</p>
      </div>
      <div className="mt-3 rounded-xl border border-border bg-black/[0.02] p-3">
        <p className="text-sm font-medium text-text">Carrier payout breakdown</p>
        <div className="mt-2 grid gap-1 text-sm text-text-secondary">
          <div className="flex items-center justify-between">
            <span>Base fare</span>
            <span>{formatCurrency(booking.pricing.basePriceCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Add-ons</span>
            <span>{formatCurrency(booking.pricing.stairsFeeCents + booking.pricing.helperFeeCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Commission</span>
            <span>-{formatCurrency(booking.pricing.platformCommissionCents)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 font-medium text-text">
            <span>Carrier payout</span>
            <span>{formatCurrency(booking.pricing.carrierPayoutCents)}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Day-of-job extras stay inside the listed add-ons or an admin-reviewed exception. Do not
          rewrite price in chat or off-platform.
        </p>
      </div>
      <div className="mt-3">
        <StatusUpdateActions bookingId={booking.id} currentStatus={booking.status} />
      </div>
      {booking.status === "confirmed" && !adjustment ? (
        <div className="mt-4">
          <ConditionAdjustmentTriggerForm bookingId={booking.id} />
        </div>
      ) : null}
      {adjustment ? (
        <div className="mt-4 rounded-xl border border-warning/20 bg-warning/10 p-3">
          <p className="section-label">Condition adjustment</p>
          <p className="mt-1 text-sm font-medium text-text">
            {getConditionAdjustmentReasonLabel(adjustment.reasonCode)} · {adjustment.status.replaceAll("_", " ")}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Amount {formatCurrency(adjustment.amountCents)}
            {adjustment.note ? ` · ${adjustment.note}` : ""}
          </p>
          {adjustment.customerResponseNote ? (
            <p className="mt-2 text-sm text-text-secondary">
              Customer note: {adjustment.customerResponseNote}
            </p>
          ) : null}
        </div>
      ) : null}
      {booking.status === "completed" && !feedback?.userReview ? (
        <div className="mt-4 space-y-2">
          <p className="section-label">Review customer</p>
          <ReviewForm bookingId={booking.id} />
        </div>
      ) : null}
      {feedback?.reviews
        .filter((review) => review.reviewerType === "customer")
        .map((review) => (
          <div key={review.id} className="mt-4 space-y-2 rounded-xl border border-border p-3">
            <p className="section-label">Customer review</p>
            <p className="text-sm text-text">
              {review.rating}/5 {review.comment ? `· ${review.comment}` : ""}
            </p>
            {review.carrierResponse ? (
              <p className="text-sm text-text-secondary">
                Carrier response: {review.carrierResponse}
              </p>
            ) : (
              <CarrierReviewResponseForm reviewId={review.id} />
            )}
          </div>
        ))}
      {canOpenDispute ? (
        <div className="mt-4 space-y-2">
          <p className="section-label">Issue or suspicious behaviour</p>
          <p className="text-sm text-text-secondary">
            Use this immediately for no-show, wrong item, damage, unsafe access, or off-platform
            payment requests so ops gets a timestamped record.
          </p>
          <DisputeForm bookingId={booking.id} />
        </div>
      ) : null}
    </div>
  );
}

export default async function CarrierTripDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePageSessionUser();
  const [trip, carrier] = await Promise.all([
    getTripById(params.id),
    getCarrierByUserId(user.id),
  ]);

  if (!trip) {
    notFound();
  }

  if (!carrier || trip.carrier.id !== carrier.id) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const focusValue = resolvedSearchParams.focus;
  const focusBookingId = Array.isArray(focusValue) ? focusValue[0] : focusValue;
  const freshnessValue = resolvedSearchParams.freshness;
  const freshnessParam = Array.isArray(freshnessValue) ? freshnessValue[0] : freshnessValue;
  const savingsCents = trip.dedicatedEstimateCents - trip.priceCents;
  const repostHref = buildRepostHref(trip);
  const bookings = await listCarrierBookings(user.id, { listingId: trip.id });
  const feedbackEntries = await Promise.all(
    bookings.map(async (booking) => [
      booking.id,
      await getBookingFeedbackForUser(user.id, booking.id),
    ] as const),
  );
  const feedbackByBookingId = new Map<string, BookingFeedback>(feedbackEntries);
  const adjustmentEntries = await Promise.all(
    bookings.map(async (booking) => [
      booking.id,
      (await listConditionAdjustmentsForBookingUser(user.id, booking.id))[0] ?? null,
    ] as const),
  );
  const adjustmentByBookingId = new Map<string, ConditionAdjustment | null>(adjustmentEntries);
  const freshnessSummary = getTripFreshnessSummary(trip, freshnessParam);

  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        eyebrow="Carrier trip detail"
        title={trip.route.label}
        description="Edit the live route, then manage proof-backed status changes for each booking on the run."
      />

      {savingsCents > 0 ? (
        <Card className="border-success/20 bg-success/5 p-4">
          <p className="section-label">Route value</p>
          <h2 className="mt-1 text-lg text-text">
            Customers usually save {formatCurrency(savingsCents)} compared with a dedicated truck
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            That estimate is based on moverrr&apos;s dedicated-route benchmarks for this space size.
          </p>
        </Card>
      ) : null}

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SaveTripTemplateAction
            tripId={trip.id}
            defaultName={`${trip.route.originSuburb} → ${trip.route.destinationSuburb}`}
          />
          <Button asChild variant="secondary" className="min-h-[44px] active:opacity-80">
            <Link href={repostHref}>
              {trip.status === "expired" || trip.status === "cancelled"
                ? "Re-post this route"
                : "Post this route again"}
            </Link>
          </Button>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Current vehicle: {trip.vehicle.type.replaceAll("_", " ")}
          {trip.vehicle.make ? ` · ${trip.vehicle.make}` : ""}
          {trip.vehicle.model ? ` ${trip.vehicle.model}` : ""}
        </p>
      </Card>

      <Card className={`p-4 ${freshnessSummary.tone}`}>
        <div className="space-y-3">
          <div>
            <p className="section-label">{freshnessSummary.eyebrow}</p>
            <h2 className="mt-1 text-lg text-text">{freshnessSummary.title}</h2>
          </div>
          <p className="text-sm text-text-secondary">{freshnessSummary.description}</p>
          <div className="grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
            <p>
              Route status {trip.status?.replaceAll("_", " ") ?? "active"}
              {trip.freshnessSuspensionReason
                ? ` · reason ${trip.freshnessSuspensionReason.replaceAll("_", " ")}`
                : ""}
            </p>
            <p>
              Freshness misses {trip.freshnessMissCount ?? 0}
              {trip.lastFreshnessConfirmedAt
                ? ` · last confirmed ${formatDateTime(trip.lastFreshnessConfirmedAt)}`
                : ""}
            </p>
            {trip.checkin24hRequestedAt ? (
              <p>24-hour window opened {formatDateTime(trip.checkin24hRequestedAt)}</p>
            ) : null}
            {trip.checkin2hRequestedAt ? (
              <p>2-hour window opened {formatDateTime(trip.checkin2hRequestedAt)}</p>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <p className="section-label">Listing controls</p>
            <h2 className="mt-1 text-lg text-text">Adjust date, price, capacity, and publish state</h2>
          </div>
          <TripEditForm trip={trip} />
        </div>
      </Card>

      <Card className="p-4">
        <p className="section-label">Bookings on this trip</p>
        <div className="mt-4 grid gap-3">
          {bookings.map((booking) => (
            <CarrierBookingCard
              key={booking.id}
              booking={booking}
              feedback={feedbackByBookingId.get(booking.id)}
              isFocused={focusBookingId === booking.id}
              adjustment={adjustmentByBookingId.get(booking.id) ?? undefined}
            />
          ))}
          {bookings.length === 0 ? (
            <p className="subtle-text">No bookings on this trip yet.</p>
          ) : null}
        </div>
      </Card>
    </main>
  );
}
