import Link from "next/link";

import { StickyCta, WizardHeader } from "@/components/spec/wizard";

const categories = [
  { label: "Boxes & parcels", icon: "📦", href: "/move/new/timing" },
  { label: "Sofa & furniture", icon: "🛋️", href: "/move/new/timing" },
  { label: "Bed & mattress", icon: "🛏️", href: "/move/new/timing" },
  { label: "Appliance", icon: "❄️", href: "/move/new/timing" },
  { label: "Sport & outdoor", icon: "🚴", href: "/move/new/timing" },
  { label: "Other", icon: "❓", href: "#other" },
] as const;

export default function MoveItemPage() {
  return (
    <main className="pb-28">
      <WizardHeader step={2} backHref="/move/new/route" />
      <section className="screen screen-wide space-y-5">
        <h1 className="heading">What are you moving?</h1>

        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className="flex min-h-[112px] min-w-[44px] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--bg-elevated-1)] px-2 text-center text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-2)] hover:text-[var(--text-primary)] active:bg-[var(--bg-elevated-3)] active:text-[var(--text-primary)]"
            >
              <span className="text-2xl">{category.icon}</span>
              <span>{category.label}</span>
            </Link>
          ))}
        </div>

        <div id="other" className="surface-1 space-y-3">
          <p className="title">Tell us what you&apos;re moving</p>
          <textarea className="ios-input min-h-[92px]" placeholder='e.g. "Large mirror, 1.8m tall"' />
          <label className="flex min-h-[96px] min-w-[44px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-2)] text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-3)] active:bg-[var(--bg-elevated-3)]">
            + Add photo
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/heic,image/heif" capture="environment" />
          </label>
        </div>

        <div className="surface-1">
          <p className="title">How many?</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="touch-52 rounded-[var(--radius-sm)] bg-[var(--bg-elevated-3)] text-xl hover:brightness-110 active:brightness-90"
            >
              -
            </button>
            <p className="tabular text-xl font-semibold">1</p>
            <button
              type="button"
              className="touch-52 rounded-[var(--radius-sm)] bg-[var(--bg-elevated-3)] text-xl hover:brightness-110 active:brightness-90"
            >
              +
            </button>
          </div>
        </div>
      </section>
      <StickyCta href="/move/new/timing" label="Continue" />
    </main>
  );
}
