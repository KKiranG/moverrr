import Link from "next/link";

import { TopAppBar } from "@/components/spec/chrome";

const rows = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/payment", label: "Payment methods" },
  { href: "/account/help", label: "Notifications" },
  { href: "/account/help", label: "Help & policies" },
  { href: "/account/advanced", label: "Advanced" },
];

export default function AccountPage() {
  return (
    <main className="pb-8">
      <TopAppBar title="Account" />
      <section className="screen space-y-3">
        <div className="surface-1">
          <p className="title">Ava Parker</p>
          <p className="caption">ava@example.com</p>
        </div>
        {rows.map((row) => (
          <Link
            key={`${row.href}-${row.label}`}
            href={row.href}
            className="flex min-h-[52px] min-w-[44px] items-center justify-between rounded-[var(--radius-md)] bg-[var(--bg-elevated-1)] px-4 text-[15px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]"
          >
            {row.label}
            <span className="text-[var(--text-secondary)]">→</span>
          </Link>
        ))}

        <Link
          href="https://carrier.moverrr.com/auth/signup"
          className="mt-4 inline-flex min-h-[44px] min-w-[44px] items-center rounded-[var(--radius-sm)] px-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:text-[var(--text-primary)]"
        >
          Drive with Moverrr
        </Link>
      </section>
    </main>
  );
}
