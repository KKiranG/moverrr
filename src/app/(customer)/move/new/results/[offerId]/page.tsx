import Link from "next/link";

import { PriceBreakdown } from "@/components/spec/cards";
import { AmbientMap, TopAppBar } from "@/components/spec/chrome";
import { StickyCta } from "@/components/spec/wizard";
import { standardPriceLines, topOffers } from "@/lib/spec-mocks";
import { Button } from "@/components/ui/button";

export default function OfferDetailPage({ params }: { params: { offerId: string } }) {
  const offer = topOffers.find((item) => item.id === params.offerId) ?? topOffers[0];

  return (
    <main className="pb-28">
      <TopAppBar title="" backHref="/move/new/results" rightHref="/move/new/fastmatch" rightLabel="↗" />
      <div className="h-[30vh] min-h-[220px] overflow-hidden">
        <AmbientMap />
      </div>

      <section className="screen space-y-4">
        <p className="tabular text-[34px] font-semibold leading-10">{offer.total} all-in</p>
        <p className="caption">{offer.schedule}, this week</p>

        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/move/new/fastmatch">Add to Fast Match</Link>
        </Button>

        <div className="surface-1">
          <p className="eyebrow">Driver</p>
          <p className="title mt-1">{offer.carrierName}</p>
          <p className="caption mt-1">Verified · 12 trips · 4.8★ · Member since Jan 2025</p>
          <p className="caption mt-1">On time · Careful handler</p>
        </div>

        <div className="surface-1">
          <p className="eyebrow">Vehicle</p>
          <p className="title mt-1">{offer.vehicle}</p>
          <p className="caption mt-1">Fits most furniture · Max item length 2m · Ground floor and 1-2 flights OK</p>
        </div>

        <div className="surface-1">
          <p className="eyebrow">Route</p>
          <p className="caption mt-1">{offer.route}</p>
          <p className="caption">Your pickup is on the direct route · Drop-off ~2km detour</p>
        </div>

        <div>
          <p className="eyebrow mb-2">What&apos;s included</p>
          <PriceBreakdown lines={standardPriceLines} total="$101.20" />
        </div>

        <div className="surface-1 space-y-2">
          <p className="eyebrow">Cancellation & misdescription</p>
          <p className="caption">
            Inaccurate item descriptions or undisclosed access difficulties may result in cancellation.
          </p>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-[var(--radius-sm)] px-2 text-[13px] font-medium text-[var(--accent)] hover:bg-[var(--accent-subtle)] active:bg-[var(--accent-subtle)]"
          >
            Read full policy →
          </button>
        </div>
      </section>

      <StickyCta href={`/move/new/book/${params.offerId}/item`} label="Request this driver" />
    </main>
  );
}
