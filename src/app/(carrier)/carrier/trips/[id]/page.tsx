import { notFound } from "next/navigation";

import { DisputeForm } from "@/components/booking/dispute-form";
import { ReviewForm } from "@/components/booking/review-form";
import { StatusUpdateActions } from "@/components/booking/status-update-actions";
import { TripEditForm } from "@/components/carrier/trip-edit-form";
import { requirePageSessionUser } from "@/lib/auth";
import { listCarrierBookings } from "@/lib/data/bookings";
import { getBookingFeedbackForUser } from "@/lib/data/feedback";
import { getTripById } from "@/lib/data/trips";
import { PageIntro } from "@/components/layout/page-intro";
import { Card } from "@/components/ui/card";

export default async function CarrierTripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requirePageSessionUser();
  const trip = await getTripById(params.id);

  if (!trip) {
    notFound();
  }

  const bookings = (await listCarrierBookings(user.id)).filter(
    (booking) => booking.listingId === trip.id,
  );
  const feedbackEntries = await Promise.all(
    bookings.map(async (booking) => [
      booking.id,
      await getBookingFeedbackForUser(user.id, booking.id),
    ] as const),
  );
  const feedbackByBookingId = new Map(feedbackEntries);

  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Carrier trip detail"
        title={trip.route.label}
        description="Edit live inventory, then manage proof-backed status changes for each booking on the run."
      />

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
            <div key={booking.id} className="rounded-xl border border-border p-3">
              <h2 className="text-base text-text">{booking.itemDescription}</h2>
              <p className="mt-2 subtle-text">
                {booking.pickupAddress} to {booking.dropoffAddress}
              </p>
              <div className="mt-3">
                <StatusUpdateActions bookingId={booking.id} currentStatus={booking.status} />
              </div>
              {booking.status === "completed" && !feedbackByBookingId.get(booking.id)?.userReview ? (
                <div className="mt-4 space-y-2">
                  <p className="section-label">Review customer</p>
                  <ReviewForm bookingId={booking.id} />
                </div>
              ) : null}
              <div className="mt-4 space-y-2">
                <p className="section-label">Dispute intake</p>
                <DisputeForm bookingId={booking.id} />
              </div>
            </div>
          ))}
          {bookings.length === 0 ? (
            <p className="subtle-text">No bookings on this trip yet.</p>
          ) : null}
        </div>
      </Card>
    </main>
  );
}
