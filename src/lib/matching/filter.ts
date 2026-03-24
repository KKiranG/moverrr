import type { ItemCategory, Trip } from "@/types/trip";

export function categoryMatches(trip: Trip, category?: ItemCategory) {
  if (!category || category === "other") {
    return true;
  }

  return trip.rules.accepts.includes(category);
}

export function filterCandidateTrips(trips: Trip[], category?: ItemCategory) {
  return trips.filter((trip) => categoryMatches(trip, category));
}
