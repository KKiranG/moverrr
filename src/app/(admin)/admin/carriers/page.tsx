import { VerifyCarrierActions } from "@/components/admin/verify-carrier-actions";
import { requirePageAdminUser } from "@/lib/auth";
import { listAdminCarriers } from "@/lib/data/carriers";
import { PageIntro } from "@/components/layout/page-intro";
import { Card } from "@/components/ui/card";

export default async function AdminCarriersPage() {
  await requirePageAdminUser();
  const carriers = await listAdminCarriers();

  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Admin carriers"
        title="Carrier verification queue"
        description="Approve or reject carriers manually in the MVP while we learn what good supply looks like."
      />

      <div className="grid gap-4">
        {carriers.map((carrier) => (
          <Card key={carrier.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg text-text">{carrier.businessName}</h2>
                <p className="mt-2 subtle-text">{carrier.bio}</p>
              </div>
              <div className="space-y-2 text-right">
                <span className="inline-flex rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
                  {carrier.verificationStatus}
                </span>
                <VerifyCarrierActions carrier={carrier} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
