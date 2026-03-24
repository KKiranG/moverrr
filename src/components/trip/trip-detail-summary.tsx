import { BadgeCheck, Package2, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Trip } from "@/types/trip";

interface TripDetailSummaryProps {
  trip: Trip;
}

export function TripDetailSummary({ trip }: TripDetailSummaryProps) {
  const mapsHref =
    trip.route.originLatitude &&
    trip.route.originLongitude &&
    trip.route.destinationLatitude &&
    trip.route.destinationLongitude
      ? `https://www.google.com/maps/dir/?api=1&origin=${trip.route.originLatitude},${trip.route.originLongitude}&destination=${trip.route.destinationLatitude},${trip.route.destinationLongitude}`
      : null;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="section-label">Trip detail</p>
            <h1 className="text-2xl text-text">{trip.route.label}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
              <span>{formatDate(trip.tripDate)}</span>
              <span>{trip.timeWindow}</span>
              <span>Space {trip.spaceSize}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-medium text-text">
              {formatCurrency(trip.priceCents)}
            </p>
            <p className="text-sm text-savings">{trip.savingsPct}% cheaper</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
              <BadgeCheck className="h-4 w-4 text-accent" />
              {trip.carrier.businessName}
            </div>
            <p className="subtle-text">
              Rated {trip.carrier.averageRating.toFixed(1)} from{" "}
              {trip.carrier.ratingCount} reviews.
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
              <Truck className="h-4 w-4" />
              {trip.vehicle.type}
            </div>
            <p className="subtle-text">
              Up to {trip.availableVolumeM3}m3 and {trip.availableWeightKg}kg
              remaining.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {trip.rules.accepts.map((item) => (
            <Badge key={item}>
              <Package2 className="mr-1 h-3 w-3" />
              {item}
            </Badge>
          ))}
        </div>

        <p className="subtle-text">
          Pickup and dropoff should sit within {trip.detourRadiusKm}km of this
          route. Carrier notes: {trip.rules.specialNotes}
        </p>

        {mapsHref ? (
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-accent"
          >
            Open route in Google Maps
          </a>
        ) : null}
      </div>
    </Card>
  );
}
