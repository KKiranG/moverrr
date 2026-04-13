import type { Metadata } from "next";
import Link from "next/link";

import { ManagePaymentMethodButton } from "@/components/customer/manage-payment-method-button";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requirePageSessionUser } from "@/lib/auth";
import { getCustomerPaymentProfileForUser } from "@/lib/data/customer-payments";
import { listUnmatchedRequestsForCustomer } from "@/lib/data/unmatched-requests";
import { hasResendEnv } from "@/lib/env";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  description: "View your moverrr account details and jump into bookings or alerts.",
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function CustomerAccountPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePageSessionUser();
  const params = searchParams ? await searchParams : {};
  const focus = getSearchValue(params.focus);
  const returnTo = getSearchValue(params.returnTo);
  const paymentSetup = getSearchValue(params.paymentSetup);
  const checkoutSessionId = getSearchValue(params.session_id);
  const focusPayments = focus === "payments";
  const supportEmail = "hello@moverrr.com.au";
  const supabase = createServerSupabaseClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const paymentProfile = await getCustomerPaymentProfileForUser({
    userId: user.id,
    checkoutSessionId:
      paymentSetup === "success" && checkoutSessionId ? checkoutSessionId : undefined,
  });
  const matchedAlertCount = customer?.id
    ? (await listUnmatchedRequestsForCustomer(customer.id)).filter(
        (request) => request.status === "matched",
      ).length
    : 0;
  const paymentUpdatedAt = paymentProfile.defaultPaymentMethod?.updatedAt
    ? new Date(paymentProfile.defaultPaymentMethod.updatedAt).toLocaleString("en-AU")
    : null;

  return (
    <main id="main-content" className="page-shell">
      <PageIntro
        eyebrow="Account"
        title="Your customer account"
        description="Use this space for your account details, payment-prep shortcuts, and trust-critical customer support entry points."
        actions={
          returnTo ? (
            <Button asChild variant="secondary">
              <Link href={returnTo}>Return to your request</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="p-4">
          <p className="section-label">Signed in as</p>
          <h2 className="mt-1 text-lg text-text">{user.email ?? "Customer account"}</h2>
            <p className="mt-2 text-sm text-text-secondary">
              This account can manage bookings, route alerts, and future move requests.
            </p>
          </Card>

        <Card className={`p-4 ${focusPayments ? "border-accent bg-accent/5" : ""}`}>
          <p className="section-label">Payment preparation</p>
          <h2 className="mt-1 text-lg text-text">Manage the saved card before a request turns live</h2>
          <div className="mt-3 grid gap-3 text-sm text-text-secondary">
            {paymentSetup === "success" ? (
              <p className="rounded-xl border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
                Saved card updated. You can head back to the request flow without losing your move details.
              </p>
            ) : null}
            {paymentSetup === "cancelled" ? (
              <p className="rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-text">
                Secure card setup was cancelled. Your request draft is still safe if you want to try again.
              </p>
            ) : null}
            {paymentProfile.stripeConfigured ? (
              <div className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-medium text-text">Saved payment method</p>
                {paymentProfile.defaultPaymentMethod ? (
                  <div className="mt-2 grid gap-1 text-sm text-text-secondary">
                    <p className="text-text">
                      {paymentProfile.defaultPaymentMethod.brand.toUpperCase()} ending in{" "}
                      {paymentProfile.defaultPaymentMethod.last4}
                    </p>
                    <p>
                      moverrr can reuse this card when a request becomes a live booking and needs payment setup or recovery.
                    </p>
                    {paymentUpdatedAt ? <p>Last updated {paymentUpdatedAt}</p> : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-text-secondary">
                    No saved card yet. Add one now so accepted bookings do not stall on payment recovery later.
                  </p>
                )}
              </div>
            ) : (
              <p>
                Stripe is not configured in this environment, so the secure add/update-card flow is hidden here.
              </p>
            )}
            <p>
              moverrr keeps your in-progress request draft on this device, so you can step out to account and come back without losing the move details you entered.
            </p>
            {paymentProfile.stripeConfigured ? (
              <ManagePaymentMethodButton
                returnTo={returnTo || "/account?focus=payments"}
                label={
                  paymentProfile.hasSavedPaymentMethod
                    ? "Replace saved card securely"
                    : "Add a saved card securely"
                }
              />
            ) : null}
            {returnTo ? (
              <Button asChild className="min-h-[44px] justify-start">
                <Link href={returnTo}>Return to your saved request draft</Link>
              </Button>
            ) : null}
          </div>
        </Card>

        <Card className="p-4">
          <p className="section-label">Quick links</p>
          <div className="mt-3 grid gap-2">
            <Link
              href="/bookings"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-border px-4 py-3 text-sm text-text active:bg-black/[0.04] dark:active:bg-white/[0.08]"
            >
              Open bookings
            </Link>
            <Link
              href="/alerts"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-border px-4 py-3 text-sm text-text active:bg-black/[0.04] dark:active:bg-white/[0.08]"
            >
              Open alerts{matchedAlertCount > 0 ? ` (${matchedAlertCount})` : ""}
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-border px-4 py-3 text-sm text-text active:bg-black/[0.04] dark:active:bg-white/[0.08]"
            >
              Start a new move
            </Link>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <p className="section-label">Support and disputes</p>
          <h2 className="mt-1 text-lg text-text">Use the on-platform trust paths first</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-sm font-medium text-text">Booking support</p>
              <p className="mt-2 text-sm text-text-secondary">
                Open a booking record to review proof, payment state, request history, or raise a
                dispute with evidence.
              </p>
              <div className="mt-3">
                <Button asChild variant="secondary" className="min-h-[44px] w-full">
                  <Link href="/bookings">Open bookings</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-sm font-medium text-text">Customer support</p>
              <p className="mt-2 text-sm text-text-secondary">
                Use email for account, billing, or access help that does not belong inside a single
                booking trail.
              </p>
              <div className="mt-3">
                <Button asChild variant="secondary" className="min-h-[44px] w-full">
                  <a href={`mailto:${supportEmail}`}>Email support</a>
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-sm font-medium text-text">Policies</p>
              <p className="mt-2 text-sm text-text-secondary">
                Keep the privacy, payments, and dispute rules close at hand before the move turns
                into a live booking.
              </p>
              <div className="mt-3 grid gap-2">
                <Button asChild variant="secondary" className="min-h-[44px] w-full">
                  <Link href="/terms">Open terms</Link>
                </Button>
                <Button asChild variant="ghost" className="min-h-[44px] w-full">
                  <Link href="/privacy">Open privacy policy</Link>
                </Button>
              </div>
            </div>
          </div>
          {!hasResendEnv() ? (
            <p className="mt-3 text-xs text-text-secondary">
              Local note: transactional email is not configured here, but the support path and
              booking dispute flow still remain visible in the product.
            </p>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
