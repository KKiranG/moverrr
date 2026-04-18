"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyStateCard } from "@/components/spec/cards";
import { TopAppBar } from "@/components/spec/chrome";
import { activityItems } from "@/lib/spec-mocks";

type ActivityTab = "active" | "alerts" | "past";

const tabLabels: Record<ActivityTab, string> = {
  active: `Active (${activityItems.active.length})`,
  alerts: `Alerts (${activityItems.alerts.length})`,
  past: `Past (${activityItems.past.length})`,
};

export default function ActivityPage() {
  const [tab, setTab] = useState<ActivityTab>("active");

  const visibleItems = useMemo(() => activityItems[tab], [tab]);

  return (
    <main className="pb-8">
      <TopAppBar title="Your activity" />
      <section className="screen space-y-4">
        <div className="rounded-[var(--radius-pill)] bg-[var(--bg-elevated-1)] p-1">
          <div className="grid grid-cols-3 gap-1 text-center text-[13px]">
            {(Object.keys(tabLabels) as ActivityTab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`min-h-[44px] min-w-[44px] rounded-[var(--radius-pill)] ${
                  tab === key
                    ? "bg-[var(--bg-elevated-3)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]"
                }`}
              >
                {tabLabels[key]}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <EmptyStateCard title="Your moves will appear here" description="Start a new move request to begin." ctaHref="/move/new" ctaLabel="Start a move" />
        ) : (
          visibleItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="surface-1 block hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]"
            >
              <p className="title">{item.title}</p>
              <p className="caption mt-1">{item.subtitle}</p>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
