import Link from "next/link";

import { CollapsibleResults, EmptyStateCard, InfoCard, ResultCard } from "@/components/spec/cards";
import { TopAppBar } from "@/components/spec/chrome";
import { nearbyDateOffers, possibleOffers, topOffers } from "@/lib/spec-mocks";

export default function MoveResultsPage() {
  const hasTopMatches = topOffers.length > 0;

  return (
    <main className="pb-28">
      <TopAppBar title="Your matches" backHref="/move/new/access" rightHref="/" rightLabel="✕" />
      <section className="screen space-y-4">
        <p className="eyebrow">6 drivers going your way</p>
        <p className="body text-[var(--text-secondary)]">Newtown - Burwood - Sofa - This weekend</p>
        <Link
          href="/move/new/route"
          className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-[var(--radius-pill)] bg-[var(--bg-elevated-2)] px-3 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:text-[var(--text-primary)]"
        >
          Edit search →
        </Link>

        {hasTopMatches ? (
          <>
            <div>
              <p className="title">Top matches</p>
              <div className="mt-3 space-y-3">
                {topOffers.map((offer) => (
                  <ResultCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>

            <CollapsibleResults title="Possible matches - needs approval" count={possibleOffers.length}>
              {possibleOffers.map((offer) => (
                <ResultCard key={offer.id} offer={offer} />
              ))}
            </CollapsibleResults>

            <CollapsibleResults title="Also available on nearby dates" count={nearbyDateOffers.length}>
              {nearbyDateOffers.map((offer) => (
                <ResultCard key={offer.id} offer={offer} />
              ))}
            </CollapsibleResults>

            <InfoCard
              title="In a hurry?"
              description="Send your request to your top 3 matches - first to accept wins."
              ctaLabel="Use Fast Match"
              href="/move/new/fastmatch"
            />
          </>
        ) : (
          <EmptyStateCard
            title="No direct matches yet"
            description="Alert the Network and we will notify drivers near your route right away."
            ctaHref="/move/alert"
            ctaLabel="Alert the Network"
          />
        )}
      </section>
    </main>
  );
}
