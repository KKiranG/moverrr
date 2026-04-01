"use client";

import { useState } from "react";

import { BookingForm } from "@/components/booking/booking-form";
import { PriceBreakdown } from "@/components/booking/price-breakdown";
import { Card } from "@/components/ui/card";
import { calculateBookingBreakdown } from "@/lib/pricing/breakdown";
import { formatCurrency } from "@/lib/utils";
import type { Trip } from "@/types/trip";

export function BookingCheckoutPanel({
  trip,
  isAuthenticated,
}: {
  trip: Trip;
  isAuthenticated: boolean;
}) {
  const [needsStairs, setNeedsStairs] = useState(false);
  const [needsHelper, setNeedsHelper] = useState(false);

  const pricing = calculateBookingBreakdown({
    basePriceCents: trip.priceCents,
    needsStairs,
    stairsExtraCents: trip.rules.stairsExtraCents,
    needsHelper,
    helperExtraCents: trip.rules.helperExtraCents,
  });
  const savingsCents = Math.max(0, trip.dedicatedEstimateCents - pricing.totalPriceCents);

  return (
    <div className="space-y-4">
      <div>
        <p className="section-label">Booking form</p>
        <h2 className="mt-1 text-lg text-text">Item and address details</h2>
      </div>
      <Card className="border-success/20 bg-success/5 p-4">
        <p className="section-label">Savings context</p>
        {savingsCents > 0 ? (
          <>
            <h3 className="mt-1 text-lg text-text">
              You save {formatCurrency(savingsCents)} versus a dedicated van
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              That estimate compares this spare-capacity trip with the typical dedicated-truck
              price for the same size job.
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-1 text-lg text-text">
              Spare-capacity pricing keeps this route lean
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              We only show a savings callout when this listing is clearly below a dedicated truck.
            </p>
          </>
        )}
      </Card>

      <Card className="p-4">
        <details className="group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 text-left [&::-webkit-details-marker]:hidden">
            <div>
              <p className="section-label">What happens next</p>
              <h3 className="mt-1 text-lg text-text">Know the booking timeline before you pay</h3>
            </div>
            <span className="text-xs uppercase tracking-[0.18em] text-text-secondary group-open:hidden">
              Open
            </span>
            <span className="hidden text-xs uppercase tracking-[0.18em] text-text-secondary group-open:block">
              Close
            </span>
          </summary>
          <div className="mt-3 space-y-2 text-sm text-text-secondary">
            <p>1. The carrier confirms the booking, usually within 24 hours.</p>
            <p>2. Pickup happens on the trip date during the listed time window.</p>
            <p>3. You confirm receipt after delivery so payout can be released.</p>
          </div>
        </details>
      </Card>

      <PriceBreakdown
        basePriceCents={trip.priceCents}
        needsStairs={needsStairs}
        stairsExtraCents={trip.rules.stairsExtraCents}
        needsHelper={needsHelper}
        helperExtraCents={trip.rules.helperExtraCents}
        dedicatedEstimateCents={trip.dedicatedEstimateCents}
      />

      <BookingForm
        trip={trip}
        isAuthenticated={isAuthenticated}
        id="booking-form"
        onOptionsChange={({ needsStairs: nextNeedsStairs, needsHelper: nextNeedsHelper }) => {
          setNeedsStairs(nextNeedsStairs);
          setNeedsHelper(nextNeedsHelper);
        }}
      />
    </div>
  );
}
