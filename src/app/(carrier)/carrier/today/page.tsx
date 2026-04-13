import type { Metadata } from "next";
import Link from "next/link";

import { StatusUpdateActions } from "@/components/booking/status-update-actions";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requirePageSessionUser } from "@/lib/auth";
import {
  getCarrierPayoutDashboard,
  getCarrierTodaySnapshot,
  listCarrierBookings,
} from "@/lib/data/bookings";
import { listCarrierTrips } from "@/lib/data/trips";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types/booking";
import type { CarrierPayoutHold } from "@/types/carrier";
import type { Trip } from "@/types/trip";

export const metadata: Metadata = {
  title: "Today | Carrier",
  description:
    "Carrier operations view for live stops, proof packs, customer confirmation, and payout blockers.",
};

function formatTripDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getActionCardTone(count: number, urgency: "urgent" | "watch") {
  if (count === 0) {
    return "border-border bg-background";
  }

  return urgency === "urgent"
    ? "border-warning/30 bg-warning/10"
    : "border-accent/20 bg-accent/5";
}

function getBookingSortPriority(booking: Booking) {
  switch (booking.status) {
    case "confirmed":
      return 0;
    case "picked_up":
      return 1;
    case "in_transit":
      return 2;
    case "delivered":
      return 3;
    default:
      return 9;
  }
}

function getStopLabel(booking: Booking) {
  switch (booking.status) {
    case "confirmed":
      return "Next stop: pickup";
    case "picked_up":
      return "Next stop: loaded and moving";
    case "in_transit":
      return "Next stop: delivery handoff";
    case "delivered":
      return "Next stop: customer confirmation";
    default:
      return "Active stop";
  }
}

function getStopSummary(booking: Booking) {
  switch (booking.status) {
    case "confirmed":
      return "Head to pickup, capture pickup proof, and confirm what was loaded before you move on.";
    case "picked_up":
      return "Pickup proof is in. Keep delivery proof and exceptions inside moverrr while the run is live.";
    case "in_transit":
      return "Delivery is the next critical handoff. Capture proof and log any blocked access or mismatch immediately.";
    case "delivered":
      return "Delivery is logged. Watch customer confirmation and payout release without leaving moverrr.";
    default:
      return "Keep the booking moving through its next required proof or handoff step.";
  }
}

function buildRunsheetTrips(params: {
  bookings: Booking[];
  trips: Trip[];
  payoutHolds: CarrierPayoutHold[];
  todayIso: string;
}) {
  const payoutHoldByBookingId = new Map(
    params.payoutHolds.map((hold) => [hold.bookingId, hold]),
  );
  const tripById = new Map(params.trips.map((trip) => [trip.id, trip]));
  const activeBookings = params.bookings
    .filter((booking) => ["confirmed", "picked_up", "in_transit", "delivered"].includes(booking.status))
    .sort((left, right) => {
      const leftTripDate = tripById.get(left.listingId)?.tripDate ?? "";
      const rightTripDate = tripById.get(right.listingId)?.tripDate ?? "";

      return (
        leftTripDate.localeCompare(rightTripDate) ||
        getBookingSortPriority(left) - getBookingSortPriority(right) ||
        left.bookingReference.localeCompare(right.bookingReference)
      );
    });

  const grouped = new Map<
    string,
    {
      trip: Trip;
      stops: Array<{
        booking: Booking;
        payoutHold?: CarrierPayoutHold;
      }>;
    }
  >();

  for (const booking of activeBookings) {
    const trip = tripById.get(booking.listingId);

    if (!trip) {
      continue;
    }

    const current = grouped.get(trip.id) ?? { trip, stops: [] };
    current.stops.push({
      booking,
      payoutHold: payoutHoldByBookingId.get(booking.id),
    });
    grouped.set(trip.id, current);
  }

  return Array.from(grouped.values())
    .sort((left, right) => {
      const leftTodayDelta = left.trip.tripDate === params.todayIso ? 0 : 1;
      const rightTodayDelta = right.trip.tripDate === params.todayIso ? 0 : 1;

      return (
        leftTodayDelta - rightTodayDelta ||
        left.trip.tripDate.localeCompare(right.trip.tripDate) ||
        left.trip.route.label.localeCompare(right.trip.route.label)
      );
    })
    .map((entry) => ({
      ...entry,
      isToday: entry.trip.tripDate === params.todayIso,
    }));
}

export default async function CarrierTodayPage() {
  const user = await requirePageSessionUser();
  const [bookings, trips] = await Promise.all([
    listCarrierBookings(user.id),
    listCarrierTrips(user.id),
  ]);
  const [snapshot, payoutDashboard] = await Promise.all([
    getCarrierTodaySnapshot(user.id, { bookings, trips }),
    getCarrierPayoutDashboard(user.id, { bookings, trips }),
  ]);
  const todayIso = new Date().toISOString().slice(0, 10);
  const runsheetTrips = buildRunsheetTrips({
    bookings,
    trips,
    payoutHolds: payoutDashboard.payoutHolds,
    todayIso,
  });

  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        eyebrow="Today"
        title="Work the next stop, proof pack, and payout blocker in one place"
        description="Trip-day mode now leads with live stops and their next operational action instead of abstract trip-health summaries."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/carrier/dashboard">Back to carrier home</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/carrier/payouts">Open payouts</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {snapshot.todayActions.map((action) => (
          <Link
            key={action.key}
            href={action.href}
            className={`block min-h-[44px] rounded-2xl border p-4 active:opacity-95 ${getActionCardTone(action.count, action.urgency)}`}
          >
            <p className="text-sm font-medium text-text">{action.title}</p>
            <p className="mt-2 text-3xl text-text">{action.count}</p>
            <p className="mt-2 text-sm text-text-secondary">{action.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <p className="section-label">Runsheet</p>
              <h2 className="mt-1 text-lg text-text">Stop-by-stop work that still needs action</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Keep the run moving here with inline proof, exception logging, and payout context on every live stop.
              </p>
            </div>

            <div className="grid gap-3">
              {runsheetTrips.map((trip) => (
                <div key={trip.trip.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="section-label">{trip.isToday ? "Runs today" : "Upcoming active route"}</p>
                      <h2 className="mt-1 text-lg text-text">{trip.trip.route.label}</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        {formatTripDate(trip.trip.tripDate)} · {trip.stops.length} stop{trip.stops.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Button asChild variant="secondary">
                      <Link href={`/carrier/trips/${trip.trip.id}`}>Open trip detail</Link>
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {trip.stops.map(({ booking, payoutHold }, index) => (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-border bg-black/[0.02] p-3 dark:bg-white/[0.04]"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
                              Stop {index + 1}
                            </p>
                            <p className="mt-1 text-sm font-medium text-text">{booking.itemDescription}</p>
                            <p className="mt-1 text-sm text-text-secondary">
                              {booking.pickupAddress} to {booking.dropoffAddress}
                            </p>
                            <p className="mt-2 text-sm text-text">{getStopLabel(booking)}</p>
                            <p className="mt-1 text-sm text-text-secondary">{getStopSummary(booking)}</p>
                          </div>

                          <div className="sm:max-w-[240px]">
                            <p className="text-sm font-medium text-text">
                              Payout {formatCurrency(booking.pricing.carrierPayoutCents)}
                            </p>
                            {payoutHold ? (
                              <p className="mt-1 text-sm text-warning">
                                Blocked by {payoutHold.missingStep.toLowerCase()}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {payoutHold ? (
                          <div className="mt-3 rounded-xl border border-warning/20 bg-warning/10 p-3">
                            <p className="text-sm font-medium text-text">{payoutHold.missingStep}</p>
                            <p className="mt-1 text-sm text-text-secondary">{payoutHold.explanation}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-secondary">
                              Clears when
                            </p>
                            <p className="mt-1 text-sm text-text">{payoutHold.nextAction}</p>
                          </div>
                        ) : null}

                        <div className="mt-3">
                          <StatusUpdateActions bookingId={booking.id} currentStatus={booking.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {runsheetTrips.length === 0 ? (
                <div className="rounded-xl border border-border p-3">
                  <p className="section-label">Runsheet</p>
                  <h2 className="mt-1 text-lg text-text">No live stops right now</h2>
                  <p className="mt-2 text-sm text-text-secondary">
                    Confirmed, in-transit, and delivered jobs will appear here with inline proof and status actions as soon as they are active.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <p className="section-label">Payout blockers</p>
              <h2 className="mt-1 text-lg text-text">What is still holding money back</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Every hold shows the amount, the missing step, what happens next, and where to fix it.
              </p>
            </div>
            <div className="grid gap-3">
              {snapshot.payoutHolds.map((hold) => (
                <div key={hold.bookingId} className="rounded-xl border border-border p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-text">{hold.bookingReference}</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {hold.stage} · {hold.missingStep}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-text">
                      Held {formatCurrency(hold.heldCents)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary">{hold.explanation}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-secondary">
                    Clears when
                  </p>
                  <p className="mt-1 text-sm text-text">{hold.nextAction}</p>
                  <Button asChild variant="secondary" className="mt-3">
                    <Link href={hold.ctaHref}>{hold.ctaLabel}</Link>
                  </Button>
                </div>
              ))}
              {snapshot.payoutHolds.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No payout blockers right now. Keep proof and customer confirmation moving and payout release should stay clean.
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
