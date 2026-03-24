import { scoreMatch } from "@/lib/matching/score";
import type { ItemCategory, Trip, TripSearchResult } from "@/types/trip";

function normaliseSuburb(value: string) {
  return value.trim().toLowerCase();
}

function estimateDistanceKm(search: string, primary: string, via: string[]) {
  const needle = normaliseSuburb(search);

  if (!needle) {
    return 5;
  }

  if (normaliseSuburb(primary) === needle) {
    return 1;
  }

  if (via.some((stop) => normaliseSuburb(stop) === needle)) {
    return 4;
  }

  return 16;
}

export function rankTrips(params: {
  trips: Trip[];
  from: string;
  to: string;
  category?: ItemCategory;
}) {
  const results: TripSearchResult[] = [];

  for (const trip of params.trips) {
    const match = scoreMatch({
      pickupDistanceKm: estimateDistanceKm(
        params.from,
        trip.route.originSuburb,
        trip.route.via,
      ),
      dropoffDistanceKm: estimateDistanceKm(
        params.to,
        trip.route.destinationSuburb,
        trip.route.via,
      ),
      detourRadiusKm: trip.detourRadiusKm,
      carrierRating: trip.carrier.averageRating,
      priceCents: trip.priceCents,
      spaceMatch: true,
      categoryMatch:
        !params.category ||
        params.category === "other" ||
        trip.rules.accepts.includes(params.category),
    });

    if (!match.eligible) {
      continue;
    }

    results.push({
      ...trip,
      matchScore: Number(match.score.toFixed(1)),
      breakdown: match.breakdown,
    });
  }

  return results.sort((left, right) => right.matchScore - left.matchScore);
}
