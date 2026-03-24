import Link from "next/link";

import { requirePageSessionUser } from "@/lib/auth";
import { listCarrierTrips } from "@/lib/data/trips";
import { PageIntro } from "@/components/layout/page-intro";
import { Card } from "@/components/ui/card";

export default async function CarrierTripsPage() {
  const user = await requirePageSessionUser();
  const trips = await listCarrierTrips(user.id);

  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Carrier trips"
        title="Manage posted inventory"
        description="Listings are the core inventory unit. This view becomes the operational heart of supply-side usage."
      />

      <div className="grid gap-4">
        {trips.map((trip) => (
          <Link key={trip.id} href={`/carrier/trips/${trip.id}`}>
            <Card className="p-4">
              <h2 className="text-lg text-text">{trip.route.label}</h2>
              <p className="mt-2 subtle-text">
                {trip.tripDate} · {trip.timeWindow} · Remaining {trip.remainingCapacityPct}%
              </p>
            </Card>
          </Link>
        ))}
        {trips.length === 0 ? (
          <Card className="p-4">
            <p className="subtle-text">No trips yet. Post your first route to start receiving bookings.</p>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
