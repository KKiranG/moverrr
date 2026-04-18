import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { OfferCard, PriceLine, TimelineStep } from "@/lib/spec-mocks";
import { cn } from "@/lib/utils";

const matchClassStyle: Record<OfferCard["matchClass"], string> = {
  direct: "bg-[var(--success)]",
  near: "bg-[var(--accent)]",
  partial: "bg-[var(--text-tertiary)]",
};

export function ResultCard({ offer }: { offer: OfferCard }) {
  return (
    <Link
      href={`/move/new/results/${offer.id}`}
      className="block rounded-[var(--radius-md)] bg-[var(--bg-elevated-1)] p-4 hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="title">{offer.carrierName}</p>
          <p className="caption">{offer.ratingLabel}</p>
          <p className="caption">{offer.vehicle}</p>
        </div>
        <p className="tabular text-[22px] font-semibold leading-7 text-[var(--text-primary)]">
          {offer.total}
          <span className="ml-1 text-[13px] font-medium text-[var(--text-secondary)]">all-in</span>
        </p>
      </div>
      <p className="mt-3 body">{offer.route}</p>
      <p className="caption">{offer.schedule}</p>
      <div className="mt-3 flex items-start gap-2">
        <span className={cn("mt-[5px] h-2.5 w-2.5 rounded-full", matchClassStyle[offer.matchClass])} />
        <p className="caption">{offer.why}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="caption">{offer.fit}</p>
        <ChevronRight size={20} className="text-[var(--text-secondary)]" />
      </div>
    </Link>
  );
}

export function CollapsibleResults({
  title,
  count,
  children,
  openByDefault = false,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  openByDefault?: boolean;
}) {
  return (
    <details open={openByDefault} className="rounded-[var(--radius-md)] bg-[var(--bg-elevated-1)] p-3">
      <summary className="flex min-h-[44px] min-w-[44px] list-none items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 text-[15px] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]">
        <span>{title}</span>
        <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
          +{count}
          <ChevronDown size={18} />
        </span>
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

export function InfoCard({
  title,
  description,
  ctaLabel,
  href,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  href?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--bg-elevated-1)] p-4">
      <p className="title">{title}</p>
      <p className="mt-2 caption">{description}</p>
      {href && ctaLabel ? (
        <Link
          href={href}
          className="mt-3 inline-flex min-h-[44px] min-w-[44px] items-center rounded-[var(--radius-sm)] px-3 text-[13px] font-medium text-[var(--accent)] hover:bg-[var(--accent-subtle)] active:bg-[var(--accent-subtle)]"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function PriceBreakdown({
  lines,
  total,
}: {
  lines: ReadonlyArray<PriceLine>;
  total: string;
}) {
  return (
    <div className="surface-1 space-y-1 text-[15px] leading-[22px]">
      {lines.map((line) => (
        <p key={line.label} className="tabular flex justify-between">
          <span>{line.label}</span>
          <span>{line.value}</span>
        </p>
      ))}
      <p className="tabular mt-2 flex justify-between pt-2 text-[17px] font-semibold">
        <span>Total</span>
        <span>{total}</span>
      </p>
    </div>
  );
}

export function Timeline({ steps }: { steps: ReadonlyArray<TimelineStep> }) {
  return (
    <div className="surface-1">
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.title} className="flex gap-3">
            <span
              className={cn(
                "mt-1 h-3 w-3 rounded-full",
                step.state === "complete" && "bg-[var(--accent)]",
                step.state === "current" && "animate-pulse bg-[var(--accent)]",
                step.state === "future" && "border border-[var(--text-tertiary)] bg-transparent",
              )}
            />
            <div>
              <p className={cn("body", step.state === "future" ? "text-[var(--text-tertiary)]" : "")}>{step.title}</p>
              {step.note ? <p className="caption">{step.note}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyStateCard({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="surface-1 text-center">
      <p className="title">{title}</p>
      <p className="mt-2 caption">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-3 inline-flex min-h-[44px] min-w-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-2)] px-3 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated-3)] active:bg-[var(--bg-elevated-3)]"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
