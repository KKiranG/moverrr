import Link from "next/link";

import { AmbientMap } from "@/components/spec/chrome";
import { Button } from "@/components/ui/button";

const presets = [
  "Sofa pickup from FB",
  "Fridge Bondi -> Parramatta",
  "Bed pickup Marrickville",
];

export default function HomePage() {
  return (
    <main id="main-content" className="pb-8">
      <div className="relative">
        <AmbientMap />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[calc(12px+var(--safe-area-top))]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">MOVERRR</p>
          <Link
            href="/auth/login"
            className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-[var(--radius-sm)] px-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:text-[var(--text-primary)]"
          >
            Log in
          </Link>
        </div>
      </div>

      <section className="screen screen-wide -mt-6 space-y-4">
        <h1 className="text-[34px] font-semibold leading-10 text-[var(--text-primary)]">
          Your stuff,
          <br />
          on a trip already happening.
        </h1>
        <p className="body text-[var(--text-secondary)]">
          Cheaper moves across Sydney, on spare space going your way.
        </p>

        <div className="rounded-[var(--radius-xl)] bg-[var(--bg-elevated-1)] p-5">
          <div className="space-y-3">
            <input className="ios-input" placeholder="Pickup suburb or address" aria-label="Pickup address" />
            <input className="ios-input" placeholder="Drop-off suburb or address" aria-label="Drop-off address" />
            <Button asChild className="w-full" size="default">
              <Link href="/move/new/route">Find drivers</Link>
            </Button>
          </div>
        </div>

        <div>
          <p className="eyebrow">Popular moves</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {presets.map((item) => (
              <button
                key={item}
                type="button"
                className="min-h-[44px] min-w-[44px] shrink-0 rounded-[var(--radius-pill)] bg-[var(--bg-elevated-2)] px-3 py-2 text-left text-[13px] leading-[18px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-3)] hover:text-[var(--text-primary)] active:bg-[var(--bg-elevated-3)] active:text-[var(--text-primary)]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-1 space-y-2">
          <p className="title">How it works</p>
          <p className="caption">1. Tell us what you need moved</p>
          <p className="caption">2. We find drivers going your way</p>
          <p className="caption">3. Book, track, and relax</p>
        </div>

        <p className="caption">Verified drivers. Upfront prices. Payment protection.</p>
      </section>
    </main>
  );
}
