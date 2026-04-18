import Link from "next/link";
import { CalendarCheck2, Home, Inbox, ListChecks, User, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";

type TabItem = {
  href: string;
  label: string;
  icon: "home" | "activity" | "inbox" | "account" | "requests" | "trips" | "payouts";
};

const iconMap = {
  home: Home,
  activity: CalendarCheck2,
  inbox: Inbox,
  account: User,
  requests: ListChecks,
  trips: CalendarCheck2,
  payouts: Wallet,
} as const;

export function TopAppBar({
  title,
  backHref,
  rightLabel,
  rightHref,
}: {
  title?: string;
  backHref?: string;
  rightLabel?: string;
  rightHref?: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-[var(--bg-base)] px-4 pt-[var(--safe-area-top)]">
      <div className="w-10">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-1)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]"
            aria-label="Go back"
          >
            ←
          </Link>
        ) : null}
      </div>
      <p className="title text-center">{title ?? ""}</p>
      <div className="w-10 text-right">
        {rightHref && rightLabel ? (
          <Link
            href={rightHref}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-2)] hover:text-[var(--text-primary)] active:bg-[var(--bg-elevated-3)] active:text-[var(--text-primary)]"
          >
            {rightLabel}
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function BottomTabBar({
  tabs,
  pathname,
}: {
  tabs: TabItem[];
  pathname: string;
}) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex h-14 w-full max-w-[430px] -translate-x-1/2 items-center justify-around border-t border-[var(--border-subtle)] bg-[color:rgba(20,20,20,0.9)] px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-[12px]"
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = iconMap[tab.icon];

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] px-2 hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]",
              active ? "text-[var(--accent)]" : "text-[var(--text-secondary)]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={24} strokeWidth={1.75} />
            <span className={cn("text-[11px] leading-[14px]", active ? "font-semibold" : "font-normal")}>{tab.label}</span>
            <span className={cn("h-1 w-1 rounded-full", active ? "bg-[var(--accent)]" : "bg-transparent")} />
          </Link>
        );
      })}
    </nav>
  );
}

export function AmbientMap() {
  return (
    <div className="relative h-[40vh] min-h-[240px] w-full overflow-hidden bg-[#0f0f0f]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(58,58,58,0.32), rgba(15,15,15,0.9) 62%), repeating-linear-gradient(135deg, #111 0 16px, #141414 16px 32px)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--bg-base)]" />
    </div>
  );
}
