import Link from "next/link";

import { CarrierScaffoldPage, KeyValueList, ScaffoldCard } from "@/components/spec/carrier-shell-scaffold";

const modeCopy = {
  activation: {
    title: "You are 3 steps from unlocking jobs",
    description: "Complete setup before posting or accepting requests.",
  },
  ready: {
    title: "Post your next route",
    description: "You are activated and ready to publish supply.",
  },
  active: {
    title: "Operational queue",
    description: "Prioritize decisions, today runsheet, and proof blockers first.",
  },
} as const;

export default function CarrierHomePage({
  searchParams,
}: {
  searchParams?: { mode?: "activation" | "ready" | "active" };
}) {
  const mode = searchParams?.mode ?? "activation";
  const content = modeCopy[mode];
  const primaryAction =
    mode === "activation"
      ? { href: "/carrier/activate", label: "Resume setup" }
      : mode === "ready"
        ? { href: "/carrier/trips/new", label: "Post your next route" }
        : { href: "/carrier/requests", label: "Review urgent requests" };

  return (
    <CarrierScaffoldPage
      eyebrow="Carrier home"
      title={content.title}
      description={content.description}
      actions={[
        { href: primaryAction.href, label: primaryAction.label, tone: "primary", operational: true },
        { href: "/carrier/trips/new", label: "Post trip", operational: true },
        { href: "/carrier/requests", label: "Open requests" },
        { href: "/carrier/trips", label: "Open trips" },
      ]}
    >
      <ScaffoldCard title="Home modes" description="Preview lifecycle-specific shell states.">
        <div className="grid grid-cols-3 gap-2">
          <Link className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]" href="/carrier?mode=activation">Activation</Link>
          <Link className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]" href="/carrier?mode=ready">Ready</Link>
          <Link className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]" href="/carrier?mode=active">Active ops</Link>
        </div>
      </ScaffoldCard>

      <ScaffoldCard title="Priority queue" description="Trust-first ordering for the active mode.">
        <KeyValueList
          items={[
            { label: "1", value: "Pending booking request" },
            { label: "2", value: "Trip happening today" },
            { label: "3", value: "Proof required for payout" },
            { label: "4", value: "Payout setup blocker" },
          ]}
        />
      </ScaffoldCard>
    </CarrierScaffoldPage>
  );
}
