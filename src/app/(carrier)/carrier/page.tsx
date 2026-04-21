import Link from "next/link";
import { ArrowRight, Sparkles, Plus } from "lucide-react";

import { requirePageSessionUser } from "@/lib/auth";
import { getCarrierActivationBlockers, isCarrierActivationLive } from "@/lib/carrier-activation";
import { getCarrierTodaySnapshot } from "@/lib/data/bookings";
import { listCarrierRequestCards } from "@/lib/data/booking-requests";
import { getCarrierByUserId } from "@/lib/data/carriers";
import { listCarrierTrips } from "@/lib/data/trips";
import { formatCurrency } from "@/lib/utils";
import { Wordmark } from "@/components/ui/wordmark";

// ── Activation mode ──────────────────────────────────────────

function ActivationScreen({
  blockers,
  hasCarrier,
}: {
  blockers: string[];
  hasCarrier: boolean;
}) {
  const steps = [
    { label: "Identity & licence", key: "identity" },
    { label: "Vehicle & capacity", key: "vehicle" },
    { label: "Payout — Stripe Connect", key: "payout" },
  ];

  const completedCount = Math.max(0, steps.length - blockers.length);

  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg-base)] pb-[calc(88px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[calc(14px+var(--safe-area-top))]">
        <Wordmark color="var(--text-primary)" />
        <span className="rounded-[var(--radius-pill)] border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          Driver
        </span>
      </div>

      <div className="flex-1 overflow-auto px-5 pt-9">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--warning-subtle)] px-3 py-1.5 text-[12px] font-[500] text-[var(--warning)]">
          {completedCount} of {steps.length} steps done
        </div>

        {/* Headline */}
        <h1
          className="mt-3.5 text-[36px] leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {hasCarrier
            ? "You're one step\nfrom unlocking jobs."
            : "Turn the road\nyou're already on\ninto income."}
        </h1>

        {/* Progress track */}
        <div className="mt-6 flex flex-col gap-2.5">
          {steps.map((step, i) => {
            const done = i < completedCount;
            return (
              <div
                key={step.key}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5"
                style={{
                  background: done
                    ? "var(--bg-elevated-1)"
                    : "var(--bg-elevated-2)",
                  borderColor: done
                    ? "var(--border-subtle)"
                    : "var(--border-strong)",
                }}
              >
                <div
                  className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: done ? "var(--text-primary)" : "transparent",
                    border: done
                      ? "none"
                      : "2px solid var(--border-strong)",
                  }}
                >
                  {done && (
                    <svg
                      width="11"
                      height="9"
                      viewBox="0 0 11 9"
                      fill="none"
                    >
                      <path
                        d="M1 4.5l3 3 6-6"
                        stroke="var(--bg-base)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="flex-1 text-[15px]"
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: done ? 400 : 600,
                  }}
                >
                  {step.label}
                </span>
                {!done && (
                  <ArrowRight
                    size={16}
                    className="text-[var(--text-secondary)]"
                    strokeWidth={1.8}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Blurred demand teaser */}
        <div className="mt-7">
          <p className="eyebrow mb-2.5">Waiting for drivers like you</p>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] p-4">
            {/* Blurred content */}
            <div className="pointer-events-none select-none blur-[6px]">
              <p className="text-[15px] font-[500] text-[var(--text-primary)]">
                Inner West → Northern Beaches
              </p>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                9 customers this week · avg $94 payout
              </p>
              <p className="mt-3.5 text-[15px] font-[500] text-[var(--text-primary)]">
                Parramatta → Sydney CBD
              </p>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                6 customers this week · avg $78 payout
              </p>
            </div>
            {/* Overlay gradient */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 30%, var(--bg-elevated-1) 90%)",
              }}
            />
            {/* Label */}
            <p className="absolute bottom-3.5 left-0 right-0 text-center text-[13px] font-[500] text-[var(--text-primary)]">
              Finish setup to see real jobs
            </p>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky-cta">
        <Link
          href="/carrier/activate"
          className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-[var(--radius-xl)] bg-[var(--text-primary)] text-[16px] font-[600] text-[var(--bg-base)] shadow-[0_8px_24px_rgba(20,18,15,0.22)] hover:opacity-90 active:opacity-80"
        >
          {hasCarrier ? "Resume setup" : "Start driver setup"}
          <ArrowRight size={18} strokeWidth={2} />
        </Link>
        <p className="mt-2.5 text-center text-[11px] text-[var(--text-tertiary)]">
          Manually reviewed · typically within 24 hr
        </p>
      </div>
    </main>
  );
}

// ── Ready mode ───────────────────────────────────────────────

function ReadyScreen({
  routes,
}: {
  routes: Array<{ id: string; label: string; lastPosted?: string }>;
}) {
  const demandSignals = [
    { corridor: "Inner West → Beaches", count: 11, avgPayout: 89 },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg-base)] pb-[calc(88px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[calc(14px+var(--safe-area-top))]">
        <Wordmark color="var(--text-primary)" />
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-subtle)] px-3 py-1 text-[12px] font-[500] text-[var(--success)]">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path
              d="M1 5l3.5 3.5L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Verified
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 pt-6">
        {/* Headline */}
        <h1
          className="text-[38px] leading-[1.04] tracking-[-0.04em] text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          Post your<br />next route.
        </h1>
        <p className="mt-2.5 text-[14px] text-[var(--text-secondary)]">
          {routes.length > 0
            ? `${routes.length} saved route${routes.length === 1 ? "" : "s"}. One-tap repost.`
            : "Quick-post a new trip in under 30 seconds."}
        </p>

        {/* Saved route templates */}
        {routes.length > 0 && (
          <div className="mt-6">
            <p className="eyebrow mb-2.5">Your routes</p>
            <div className="flex flex-col gap-2.5">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[16px] font-[600] leading-[1.2] tracking-[-0.02em] text-[var(--text-primary)]">
                      {route.label}
                    </p>
                    <Link
                      href={`/carrier/trips/new?templateRoute=${encodeURIComponent(route.label)}`}
                      className="flex-shrink-0 rounded-full bg-[var(--text-primary)] px-3.5 py-2 text-[13px] font-[600] text-[var(--bg-base)] hover:opacity-90 active:opacity-75"
                    >
                      Repost
                    </Link>
                  </div>
                  {route.lastPosted && (
                    <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
                      {route.lastPosted}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demand signal */}
        <div className="mt-6">
          <p className="eyebrow mb-2.5">Demand this week</p>
          {demandSignals.map((signal) => (
            <div
              key={signal.corridor}
              className="rounded-[var(--radius-lg)] border p-4"
              style={{
                background: "rgba(201,82,28,0.08)",
                borderColor: "rgba(201,82,28,0.25)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={14} color="var(--accent)" strokeWidth={2} />
                <p className="text-[14px] font-[500] text-[var(--text-primary)]">
                  {signal.corridor}
                </p>
              </div>
              <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">
                {signal.count} customers looking for moves this week. Average
                payout ${signal.avgPayout}.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky-cta">
        <Link
          href="/carrier/trips/new"
          className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-[var(--radius-xl)] bg-[var(--text-primary)] text-[16px] font-[600] text-[var(--bg-base)] shadow-[0_8px_24px_rgba(20,18,15,0.22)] hover:opacity-90 active:opacity-80"
        >
          <Plus size={18} strokeWidth={2.4} />
          Post a new trip
        </Link>
      </div>
    </main>
  );
}

// ── Active mode ──────────────────────────────────────────────

function RequestCard({
  description,
  explanation,
  accessSummary,
  payout,
}: {
  description: string;
  explanation: string;
  accessSummary: string;
  payout: number;
}) {
  return (
    <Link href="/carrier/requests" className="block">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] p-4 shadow-[var(--shadow-card)] hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-[600] leading-[1.2] text-[var(--text-primary)]">
              {description}
            </p>
            <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">
              {explanation} {accessSummary}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="tabular text-[20px] font-[600] leading-none tracking-[-0.03em] text-[var(--text-primary)]">
              {formatCurrency(payout)}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">payout</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] font-[500] text-[var(--text-primary)]">
          Review decision →
        </p>
      </div>
    </Link>
  );
}

function ActiveScreen({
  requests,
  todayTrips,
  payoutHold,
  snapshot,
}: {
  requests: Array<{
    id: string;
    itemDescription: string;
    fitExplanation: string;
    accessSummary: string;
    carrierPayoutCents: number;
  }>;
  todayTrips: Array<{ id: string; route: { label: string }; tripDate: string; timeWindow: string }>;
  payoutHold: { explanation: string } | null;
  snapshot: {
    todayActions: Array<{
      key: string;
      title: string;
      count: number;
      description: string;
      href: string;
    }>;
  };
}) {
  const heroHref =
    requests.length > 0
      ? "/carrier/requests"
      : todayTrips.length > 0
        ? `/carrier/trips/${todayTrips[0]?.id}/runsheet`
        : "/carrier/payouts";

  const heroLabel =
    requests.length > 0
      ? "Review requests"
      : todayTrips.length > 0
        ? "Open runsheet"
        : "Open payouts";

  const heroTitle =
    requests.length > 0
      ? "You have a new booking request."
      : todayTrips.length > 0
        ? "Today's route needs your attention."
        : "Clear the blocker to release payout.";

  const heroDesc =
    requests.length > 0
      ? "Review fit, access, and payout before the request expires."
      : todayTrips.length > 0
        ? "Runsheet mode has large tap targets and one-tap updates."
        : (payoutHold?.explanation ?? "One missing step is holding money back.");

  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg-base)] pb-[calc(88px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[calc(14px+var(--safe-area-top))]">
        <Wordmark color="var(--text-primary)" />
        <span className="rounded-[var(--radius-pill)] border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          Driver
        </span>
      </div>

      <div className="flex-1 overflow-auto px-5 pt-6">
        {/* Hero */}
        <p className="eyebrow">
          {requests.length > 0
            ? "Most urgent"
            : todayTrips.length > 0
              ? "Today"
              : "Payout blockers"}
        </p>
        <h1
          className="mt-2 text-[30px] leading-[1.1] tracking-[-0.04em] text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {heroTitle}
        </h1>
        <p className="mt-2 text-[14px] leading-[1.5] text-[var(--text-secondary)]">
          {heroDesc}
        </p>
        <Link
          href={heroHref}
          className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--text-primary)] px-5 text-[15px] font-[600] text-[var(--bg-base)] hover:opacity-90 active:opacity-80"
        >
          {heroLabel}
          <ArrowRight size={16} strokeWidth={2} />
        </Link>

        {/* Pending requests */}
        {requests.length > 0 && (
          <div className="mt-7">
            <p className="eyebrow mb-2.5">Pending requests</p>
            <div className="flex flex-col gap-2.5">
              {requests.slice(0, 2).map((req) => (
                <RequestCard
                  key={req.id}
                  description={req.itemDescription}
                  explanation={req.fitExplanation}
                  accessSummary={req.accessSummary}
                  payout={req.carrierPayoutCents}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today actions */}
        {snapshot.todayActions.filter((a) => a.count > 0).length > 0 && (
          <div className="mt-7">
            <p className="eyebrow mb-2.5">Today&apos;s queue</p>
            <div className="flex flex-col gap-2.5">
              {snapshot.todayActions
                .filter((a) => a.count > 0)
                .slice(0, 3)
                .map((action) => (
                  <Link key={action.key} href={action.href} className="block">
                    <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] px-4 py-3.5 hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]">
                      <div className="min-w-0">
                        <p className="text-[15px] font-[500] text-[var(--text-primary)]">
                          {action.title} · {action.count}
                        </p>
                        <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight size={16} className="flex-shrink-0 text-[var(--text-tertiary)]" strokeWidth={1.8} />
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Live trips */}
        {todayTrips.length > 0 && (
          <div className="mt-7">
            <p className="eyebrow mb-2.5">Live trips</p>
            <div className="flex flex-col gap-2.5">
              {todayTrips.slice(0, 2).map((trip) => (
                <Link key={trip.id} href={`/carrier/trips/${trip.id}`} className="block">
                  <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] px-4 py-3.5 hover:bg-[var(--bg-elevated-2)] active:bg-[var(--bg-elevated-3)]">
                    <div className="min-w-0">
                      <p className="text-[15px] font-[500] text-[var(--text-primary)]">
                        {trip.route.label}
                      </p>
                      <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">
                        {trip.tripDate} · {trip.timeWindow}
                      </p>
                    </div>
                    <ArrowRight size={16} className="flex-shrink-0 text-[var(--text-tertiary)]" strokeWidth={1.8} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default async function CarrierHomePage() {
  const user = await requirePageSessionUser();
  const [carrier, requests, trips, snapshot] = await Promise.all([
    getCarrierByUserId(user.id),
    listCarrierRequestCards(user.id),
    listCarrierTrips(user.id, { activeOnly: true }),
    getCarrierTodaySnapshot(user.id),
  ]);

  const activationLive = carrier ? isCarrierActivationLive(carrier.activationStatus) : false;
  const todayIso = new Date().toISOString().slice(0, 10);
  const liveTrips = trips.filter((trip) =>
    ["active", "booked_partial"].includes(trip.status ?? "active"),
  );
  const todayTrips = liveTrips.filter((trip) => trip.tripDate === todayIso);
  const activationBlockers = getCarrierActivationBlockers(carrier);

  const mode = !activationLive
    ? "activation"
    : requests.length > 0 || todayTrips.length > 0 || snapshot.payoutHolds.length > 0
      ? "active"
      : "ready";

  if (mode === "activation") {
    return (
      <ActivationScreen
        blockers={activationBlockers}
        hasCarrier={Boolean(carrier)}
      />
    );
  }

  if (mode === "ready") {
    const savedRoutes = liveTrips.slice(0, 3).map((trip) => ({
      id: trip.id,
      label: trip.route.label,
      lastPosted: `${trip.tripDate} · ${trip.timeWindow}`,
    }));
    return <ReadyScreen routes={savedRoutes} />;
  }

  return (
    <ActiveScreen
      requests={requests.slice(0, 2).map((r) => ({
        id: r.id,
        itemDescription: r.itemDescription,
        fitExplanation: r.fitExplanation,
        accessSummary: r.accessSummary,
        carrierPayoutCents: r.carrierPayoutCents,
      }))}
      todayTrips={todayTrips}
      payoutHold={snapshot.payoutHolds[0] ?? null}
      snapshot={snapshot}
    />
  );
}
