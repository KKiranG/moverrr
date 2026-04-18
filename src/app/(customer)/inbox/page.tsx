"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyStateCard } from "@/components/spec/cards";
import { TopAppBar } from "@/components/spec/chrome";
import { inboxThreads } from "@/lib/spec-mocks";

type InboxTab = "all" | "unread";

export default function InboxPage() {
  const [tab, setTab] = useState<InboxTab>("all");

  const threads = useMemo(() => {
    if (tab === "unread") {
      return inboxThreads.filter((thread) => thread.unread);
    }

    return inboxThreads;
  }, [tab]);

  return (
    <main className="pb-8">
      <TopAppBar title="Inbox" />
      <section className="screen space-y-4">
        <div className="rounded-[var(--radius-pill)] bg-[var(--bg-elevated-1)] p-1">
          <div className="grid grid-cols-2 gap-1 text-center text-[13px]">
            {([
              ["all", "All"],
              ["unread", "Unread"],
            ] as const).map(([key, label]) => (
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
                {label}
              </button>
            ))}
          </div>
        </div>

        {threads.length === 0 ? (
          <EmptyStateCard title="No messages yet" description="We'll show booking and system updates here." />
        ) : (
          threads.map((thread) => (
            <Link
              key={thread.id}
              href={thread.href}
              className="block rounded-[var(--radius-md)] bg-[var(--bg-elevated-1)] p-4 hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="title">{thread.title}</p>
                <p className="caption">{thread.timestamp}</p>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="caption">{thread.preview}</p>
                {thread.unread ? <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> : null}
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
