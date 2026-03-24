import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { BookingPriceBreakdown } from "@/types/booking";

interface PriceBreakdownProps {
  pricing: BookingPriceBreakdown;
  dedicatedEstimateCents?: number;
}

export function PriceBreakdown({
  pricing,
  dedicatedEstimateCents,
}: PriceBreakdownProps) {
  const savings = dedicatedEstimateCents
    ? Math.max(0, dedicatedEstimateCents - pricing.totalPriceCents)
    : null;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <p className="section-label">Price breakdown</p>
          <h2 className="mt-1 text-lg text-text">Transparent before checkout</h2>
        </div>
        <dl className="space-y-2 text-sm text-text-secondary">
          <div className="flex items-center justify-between gap-4">
            <dt>Carrier price</dt>
            <dd className="text-text">{formatCurrency(pricing.basePriceCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Stairs</dt>
            <dd className="text-text">{formatCurrency(pricing.stairsFeeCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Helper</dt>
            <dd className="text-text">{formatCurrency(pricing.helperFeeCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Booking fee</dt>
            <dd className="text-text">{formatCurrency(pricing.bookingFeeCents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
            <dt className="font-medium text-text">Customer total</dt>
            <dd className="text-base font-medium text-text">
              {formatCurrency(pricing.totalPriceCents)}
            </dd>
          </div>
        </dl>
        {savings ? (
          <p className="rounded-xl border border-success/20 bg-success/10 px-3 py-2 text-sm font-medium text-success">
            Dedicated estimate {formatCurrency(dedicatedEstimateCents ?? 0)}.
            You save {formatCurrency(savings)} on this route-fit booking.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
