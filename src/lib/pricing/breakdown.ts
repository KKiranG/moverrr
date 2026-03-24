import type { BookingPriceBreakdown } from "@/types/booking";

const BOOKING_FEE_CENTS = 500;
const PLATFORM_COMMISSION_RATE = 0.15;

export function calculateBookingBreakdown(params: {
  basePriceCents: number;
  needsStairs: boolean;
  stairsExtraCents: number;
  needsHelper: boolean;
  helperExtraCents: number;
}): BookingPriceBreakdown {
  const stairsFeeCents = params.needsStairs ? params.stairsExtraCents : 0;
  const helperFeeCents = params.needsHelper ? params.helperExtraCents : 0;
  const totalBeforeFees =
    params.basePriceCents + stairsFeeCents + helperFeeCents;
  const platformCommissionCents = Math.round(
    params.basePriceCents * PLATFORM_COMMISSION_RATE,
  );

  return {
    basePriceCents: params.basePriceCents,
    stairsFeeCents,
    helperFeeCents,
    bookingFeeCents: BOOKING_FEE_CENTS,
    totalPriceCents: totalBeforeFees + BOOKING_FEE_CENTS,
    carrierPayoutCents:
      params.basePriceCents + stairsFeeCents + helperFeeCents - platformCommissionCents,
    platformCommissionCents,
  };
}
