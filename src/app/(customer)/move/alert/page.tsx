import Link from "next/link";

import { TopAppBar } from "@/components/spec/chrome";
import { Button } from "@/components/ui/button";

export default function AlertNetworkPage() {
  return (
    <main>
      <TopAppBar title="Alert the Network" backHref="/move/new/results" />
      <section className="screen space-y-4">
        <h1 className="heading">No direct matches for now</h1>
        <p className="body text-[var(--text-secondary)]">
          We&apos;ll alert verified drivers near your route and notify you the moment a match appears.
        </p>
        <div className="surface-1">
          <p className="caption">Sofa · Newtown → Burwood · this week</p>
          <Link
            href="/move/new/route"
            className="mt-2 inline-flex min-h-[44px] min-w-[44px] items-center rounded-[var(--radius-sm)] px-2 text-[13px] font-medium text-[var(--accent)] hover:bg-[var(--accent-subtle)] active:bg-[var(--accent-subtle)]"
          >
            Edit →
          </Link>
        </div>
        <label className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--bg-elevated-1)] px-3">
          <input type="checkbox" className="h-4 w-4" />
          <span className="caption">Also broaden my dates by ±3 days</span>
        </label>
        <label className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--bg-elevated-1)] px-3">
          <input type="checkbox" defaultChecked className="h-4 w-4" />
          <span className="caption">Notify me via email too</span>
        </label>
        <Button asChild className="w-full">
          <Link href="/activity">Alert the Network</Link>
        </Button>
      </section>
    </main>
  );
}
