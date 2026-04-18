import Link from "next/link";

import { WizardHeader } from "@/components/spec/wizard";

const options = [
  "Today or tomorrow",
  "This weekend",
  "Pick a specific date",
  "Flexible within a week",
  "Flexible - anytime",
];

export default function MoveTimingPage() {
  return (
    <main>
      <WizardHeader step={3} backHref="/move/new/item" />
      <section className="screen screen-wide">
        <h1 className="heading">When do you need this moved?</h1>
        <div className="mt-4 space-y-2">
          {options.map((option) => {
            const highlighted = option === "Flexible within a week";

            return (
              <Link
                key={option}
                href="/move/new/access"
                className={`flex min-h-[52px] min-w-[44px] items-center justify-between rounded-[var(--radius-md)] px-4 text-[15px] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)] ${
                  highlighted
                    ? "bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-elevated-1)] text-[var(--text-primary)]"
                }`}
              >
                {option}
                <span className="text-[var(--text-secondary)]">→</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
