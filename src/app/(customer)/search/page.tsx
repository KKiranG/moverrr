import Link from "next/link";

import { WaitlistForm } from "@/components/customer/waitlist-form";
import { PageIntro } from "@/components/layout/page-intro";
import { SearchBar } from "@/components/search/search-bar";
import { TripCard } from "@/components/trip/trip-card";
import { searchTrips } from "@/lib/data/trips";
import type { ItemCategory } from "@/types/trip";

function getValue(
  value: string | string[] | undefined,
  fallback: string,
) {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const from = getValue(searchParams.from, "Penrith");
  const to = getValue(searchParams.to, "Bondi");
  const when = getValue(searchParams.when, "2026-03-26");
  const what = getValue(searchParams.what, "furniture") as ItemCategory;
  const results = await searchTrips({ from, to, when, what });

  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Browse & book"
        title="Search matching trips"
        description="Browse-first means customers see live listings first, with waitlist capture only when supply is missing."
        actions={
          <Link href="/" className="text-sm font-medium text-accent">
            Back to landing
          </Link>
        }
      />

      <SearchBar />

      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-secondary">
          {results.length} trips for {from} to {to} on {when}.
        </p>
        <div className="grid gap-4">
          {results.map((trip) => (
            <TripCard key={trip.id} trip={trip} href={`/trip/${trip.id}`} />
          ))}
        </div>
        {results.length === 0 ? (
          <div className="surface-card p-4">
            <div className="space-y-3">
              <p className="subtle-text">
                No live trips match that corridor yet. Join the waitlist so we can validate this
                lane, support concierge matching, and seed supply where demand is real.
              </p>
              <WaitlistForm from={from} to={to} when={when} what={what} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
