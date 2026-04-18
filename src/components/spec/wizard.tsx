import Link from "next/link";

import { Button } from "@/components/ui/button";

export function WizardHeader({
  step,
  backHref,
  closeHref = "/",
}: {
  step: 1 | 2 | 3 | 4;
  backHref: string;
  closeHref?: string;
}) {
  return (
    <header className="sticky top-0 z-20 bg-[var(--bg-base)] px-5 pb-3 pt-[calc(var(--safe-area-top)+8px)]">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-1)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]"
          aria-label="Back"
        >
          ←
        </Link>
        <div className="flex items-center gap-2" aria-label={`Step ${step} of 4`}>
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className={`h-2 w-2 rounded-full ${item <= step ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated-3)]"}`}
            />
          ))}
        </div>
        <Link
          href={closeHref}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-1)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]"
          aria-label="Close"
        >
          ✕
        </Link>
      </div>
    </header>
  );
}

export function StickyCta({ href, label }: { href: string; label: string }) {
  return (
    <div className="sticky-cta">
      <Button asChild className="w-full">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
