import type { BookingPriceBreakdown } from "@/types/booking";

const PLATFORM_COMMISSION_RATE = 0.15;
const GST_RATE = 0.1;

export function calculateBookingBreakdown(params: {
  basePriceCents: number;
  needsStairs: boolean;
  stairsExtraCents: number;
  needsHelper: boolean;
  helperExtraCents: number;
  detourAdjustmentCents?: number;
}): BookingPriceBreakdown {
  if ((params.detourAdjustmentCents ?? 0) > 0) {
    throw new RangeError(
      "Automatic detour pricing is blocked pending an explicit founder decision.",
    );
  }

  const stairsFeeCents = params.needsStairs ? params.stairsExtraCents : 0;
  const helperFeeCents = params.needsHelper ? params.helperExtraCents : 0;
  const subtotalCents = params.basePriceCents + stairsFeeCents + helperFeeCents;
  const platformFeeCents = Math.round(
    params.basePriceCents * PLATFORM_COMMISSION_RATE,
  );
  const gstCents = Math.round((subtotalCents + platformFeeCents) * GST_RATE);

  return {
    basePriceCents: params.basePriceCents,
    stairsFeeCents,
    helperFeeCents,
    platformFeeCents,
    gstCents,
    totalPriceCents: subtotalCents + platformFeeCents + gstCents,
    carrierPayoutCents: subtotalCents,
    platformCommissionCents: platformFeeCents,
    bookingFeeCents: 0,
  };
}
