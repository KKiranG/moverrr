import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { PendingBookingsAlert } from "@/components/carrier/pending-bookings-alert";
import { Card } from "@/components/ui/card";
import { requirePageSessionUser } from "@/lib/auth";
import { listCarrierRequestCards } from "@/lib/data/booking-requests";

export const metadata: Metadata = {
  title: "Carrier requests",
  description: "Review open customer requests that still need a carrier decision.",
};

export default async function CarrierRequestsPage() {
  const user = await requirePageSessionUser();
  const requests = await listCarrierRequestCards(user.id);

  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        eyebrow="Requests"
        title="Review the work that still needs a decision"
        description="Open requests now live in their own queue with payout, fit, access, and clarification context on every decision card."
      />

      {requests.length > 0 ? (
        <PendingBookingsAlert requests={requests} compact />
      ) : (
        <Card className="p-4">
          <p className="section-label">Requests</p>
          <h2 className="mt-1 text-lg text-text">No open requests right now</h2>
          <p className="mt-2 text-sm text-text-secondary">
            When customers ask for space on your active trips, those decisions will appear here with payout, fit, and clarification context first.
          </p>
        </Card>
      )}
    </main>
  );
}
