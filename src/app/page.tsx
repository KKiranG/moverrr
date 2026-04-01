import type { Metadata } from "next";
import Link from "next/link";

import { ConfigBanner } from "@/components/shared/config-banner";
import { SearchBar } from "@/components/search/search-bar";
import { TripCard } from "@/components/trip/trip-card";
import { hasSupabaseEnv } from "@/lib/env";
import { listPublicTrips } from "@/lib/data/trips";
import { getTodayIsoDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Browse Sydney spare-capacity trips",
  description:
    "Search live Sydney trips for furniture, boxes, appliances, and awkward-middle moves without the quote chase.",
};

const useCases = [
  {
    title: "Marketplace pickups",
    description:
      "Bought a sofa in Penrith and need it in Bondi without paying full removalist rates.",
  },
  {
    title: "Student moves",
    description:
      "A desk, a bookshelf, and a few boxes fit the awkward middle better than a whole truck.",
  },
  {
    title: "Business overflow",
    description:
      "Small runs for stock, produce, and equipment when dedicated courier pricing makes no sense.",
  },
];

export default async function HomePage() {
  const featuredTrips = await listPublicTrips(3);
  const sampleDate = getTodayIsoDate();
  const showDevBanner = process.env.NODE_ENV === "development" && !hasSupabaseEnv();

  return (
    <main id="main-content" className="page-shell">
      <section className="grid gap-6 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <p className="section-label">Sydney spare-capacity marketplace</p>
          <h1 className="max-w-2xl text-4xl leading-tight text-text sm:text-5xl">
            Browse posted truck space instead of waiting for quotes.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            moverrr is built for the awkward middle: sofas, desks, appliances,
            boxes, and small business runs that are too big for couriers and too
            small for a full removalist booking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#homepage-search"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white active:bg-[#0047b3]"
            >
              Search now
            </Link>
            <Link
              href="/become-a-carrier"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-text active:bg-black/[0.04] dark:active:bg-white/[0.08]"
            >
              Post your first trip
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="surface-card flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-label">Why this works</p>
                <h2 className="mt-1 text-xl text-text">Inventory first</h2>
              </div>
              <span className="rounded-xl border border-success/20 bg-success/10 px-3 py-2 text-sm font-medium text-success">
                Browse in seconds
              </span>
            </div>
            <p className="subtle-text">
              Carriers post where they are already going and how much space they
              have. Customers browse that inventory and book into it with a clear
              price, route, and time window upfront.
            </p>
          </div>

          <div id="homepage-search">
            <SearchBar />
          </div>
        </div>
      </section>

      {showDevBanner ? (
        <section>
          <ConfigBanner message="Add Supabase, Maps, and Stripe environment variables to switch this shell into the live MVP. The UI is ready, but the backend services need credentials." />
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Built for MVP validation</p>
            <h2 className="mt-1 text-2xl text-text">The jobs we need to win</h2>
          </div>
          <Link
            href={`/search?from=Penrith&to=Bondi&when=${sampleDate}&what=furniture`}
            className="inline-flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium text-accent active:bg-accent/10"
          >
            View sample search
          </Link>
        </div>
        <div className="grid gap-3">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="surface-card p-4">
              <h3 className="text-lg text-text">{useCase.title}</h3>
              <p className="mt-2 subtle-text">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 pb-10">
        <div>
          <p className="section-label">
            {featuredTrips.length > 0 ? "Live inventory" : "Grow the first route"}
          </p>
          <h2 className="mt-1 text-2xl text-text">
            {featuredTrips.length > 0
              ? "Trips customers can book now"
              : "Be the first to post spare capacity on this corridor"}
          </h2>
        </div>
        <div className="grid gap-4">
          {featuredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} href={`/trip/${trip.id}`} />
          ))}
        </div>
        {featuredTrips.length === 0 ? (
          <div className="surface-card p-4">
            <p className="subtle-text">
              No live trips are visible yet. If you already run this route, post your next spare-capacity trip and give early customers something real to book into.
            </p>
            <Link
              href="/become-a-carrier"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white active:bg-[#0047b3]"
            >
              Post your first trip
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
