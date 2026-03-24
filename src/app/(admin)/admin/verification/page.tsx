import { requirePageAdminUser } from "@/lib/auth";
import { PageIntro } from "@/components/layout/page-intro";
import { Card } from "@/components/ui/card";

const checks = [
  "Licence photo uploaded",
  "Insurance document uploaded",
  "Vehicle details complete",
  "Service area makes sense for Sydney MVP",
];

export default async function AdminVerificationPage() {
  await requirePageAdminUser();

  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Admin verification"
        title="Review carrier trust signals"
        description="Verification should be fast, manual, and consistent while supply quality matters more than scale."
      />

      <Card className="p-4">
        <div className="grid gap-2">
          {checks.map((check) => (
            <div key={check} className="rounded-xl border border-border px-3 py-2">
              <span className="text-sm text-text">{check}</span>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
