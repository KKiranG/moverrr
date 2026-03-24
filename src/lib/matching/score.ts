import type { MatchBreakdown } from "@/types/trip";

export interface MatchInput {
  pickupDistanceKm: number;
  dropoffDistanceKm: number;
  detourRadiusKm: number;
  carrierRating: number;
  priceCents: number;
  spaceMatch: boolean;
  categoryMatch: boolean;
}

export interface MatchResult {
  score: number;
  breakdown: MatchBreakdown;
  eligible: boolean;
  disqualifyReason?: string;
}

export function scoreMatch(input: MatchInput): MatchResult {
  if (input.pickupDistanceKm > input.detourRadiusKm) {
    return {
      score: 0,
      eligible: false,
      disqualifyReason: "Pickup too far from route",
      breakdown: { routeFit: 0, destinationFit: 0, reliability: 0, priceFit: 0 },
    };
  }

  if (input.dropoffDistanceKm > input.detourRadiusKm) {
    return {
      score: 0,
      eligible: false,
      disqualifyReason: "Dropoff too far from route",
      breakdown: { routeFit: 0, destinationFit: 0, reliability: 0, priceFit: 0 },
    };
  }

  if (!input.spaceMatch) {
    return {
      score: 0,
      eligible: false,
      disqualifyReason: "Item too large for available space",
      breakdown: { routeFit: 0, destinationFit: 0, reliability: 0, priceFit: 0 },
    };
  }

  if (!input.categoryMatch) {
    return {
      score: 0,
      eligible: false,
      disqualifyReason: "Carrier does not accept this item type",
      breakdown: { routeFit: 0, destinationFit: 0, reliability: 0, priceFit: 0 },
    };
  }

  const routeFit = Math.max(
    0,
    (1 - input.pickupDistanceKm / input.detourRadiusKm) * 35,
  );
  const destinationFit = Math.max(
    0,
    (1 - input.dropoffDistanceKm / input.detourRadiusKm) * 35,
  );
  const reliability = (input.carrierRating / 5) * 20;
  const priceFit = Math.max(0, (1 - input.priceCents / 30000) * 10);

  return {
    score: routeFit + destinationFit + reliability + priceFit,
    breakdown: { routeFit, destinationFit, reliability, priceFit },
    eligible: true,
  };
}
