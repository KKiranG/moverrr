import Stripe from "stripe";

import { getAppUrl, hasStripeEnv, hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { getStripeServerClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

interface CustomerPaymentRow {
  id: string;
  stripe_customer_id: string | null;
  stripe_default_payment_method_id: string | null;
  stripe_default_payment_method_brand: string | null;
  stripe_default_payment_method_last4: string | null;
  stripe_payment_method_updated_at: string | null;
}

export interface CustomerPaymentProfile {
  stripeConfigured: boolean;
  hasSavedPaymentMethod: boolean;
  customerId: string | null;
  defaultPaymentMethod: {
    id: string;
    brand: string;
    last4: string;
    updatedAt: string | null;
  } | null;
}

function normaliseReturnPath(value?: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/account?focus=payments";
  }

  return value;
}

async function getCustomerPaymentRowByUserId(userId: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, email, full_name, stripe_customer_id, stripe_default_payment_method_id, stripe_default_payment_method_brand, stripe_default_payment_method_last4, stripe_payment_method_updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500, "customer_payment_lookup_failed");
  }

  return data as (CustomerPaymentRow & { email: string; full_name: string }) | null;
}

function getPaymentMethodSummary(
  customer: CustomerPaymentRow | null,
): CustomerPaymentProfile {
  return {
    stripeConfigured: hasStripeEnv(),
    hasSavedPaymentMethod: Boolean(customer?.stripe_default_payment_method_id),
    customerId: customer?.stripe_customer_id ?? null,
    defaultPaymentMethod: customer?.stripe_default_payment_method_id
      ? {
          id: customer.stripe_default_payment_method_id,
          brand: customer.stripe_default_payment_method_brand ?? "Card",
          last4: customer.stripe_default_payment_method_last4 ?? "0000",
          updatedAt: customer.stripe_payment_method_updated_at ?? null,
        }
      : null,
  };
}

async function persistCustomerPaymentSummary(params: {
  customerId: string;
  stripeCustomerId: string;
  paymentMethod: Stripe.PaymentMethod | null;
}) {
  if (!hasSupabaseAdminEnv()) {
    return;
  }

  const supabase = createAdminClient();
  const card = params.paymentMethod?.card ?? null;

  const { error } = await supabase
    .from("customers")
    .update({
      stripe_customer_id: params.stripeCustomerId,
      stripe_default_payment_method_id: params.paymentMethod?.id ?? null,
      stripe_default_payment_method_brand: card?.brand ?? null,
      stripe_default_payment_method_last4: card?.last4 ?? null,
      stripe_payment_method_updated_at: params.paymentMethod ? new Date().toISOString() : null,
    })
    .eq("id", params.customerId);

  if (error) {
    throw new AppError(error.message, 500, "customer_payment_summary_update_failed");
  }
}

async function resolveCheckoutSessionPaymentMethod(params: {
  stripe: Stripe;
  checkoutSessionId: string;
  stripeCustomerId: string;
}) {
  const session = await params.stripe.checkout.sessions.retrieve(params.checkoutSessionId);

  if (!session.customer || String(session.customer) !== params.stripeCustomerId) {
    throw new AppError("That payment-method session does not belong to this customer.", 403, "payment_method_session_forbidden");
  }

  if (session.mode !== "setup" || !session.setup_intent) {
    return null;
  }

  const setupIntent =
    typeof session.setup_intent === "string"
      ? await params.stripe.setupIntents.retrieve(session.setup_intent)
      : session.setup_intent;

  const paymentMethodId =
    typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id;

  if (!paymentMethodId) {
    return null;
  }

  await params.stripe.customers.update(params.stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  return params.stripe.paymentMethods.retrieve(paymentMethodId);
}

async function resolveDefaultPaymentMethod(params: {
  stripe: Stripe;
  stripeCustomerId: string;
}) {
  const customer = await params.stripe.customers.retrieve(params.stripeCustomerId, {
    expand: ["invoice_settings.default_payment_method"],
  });

  if (customer.deleted) {
    throw new AppError("Stripe customer is no longer available.", 409, "stripe_customer_deleted");
  }

  const expandedPaymentMethod = customer.invoice_settings.default_payment_method;

  if (expandedPaymentMethod && typeof expandedPaymentMethod !== "string") {
    return expandedPaymentMethod;
  }

  const paymentMethods = await params.stripe.paymentMethods.list({
    customer: params.stripeCustomerId,
    type: "card",
    limit: 1,
  });

  const fallbackMethod = paymentMethods.data[0] ?? null;

  if (fallbackMethod) {
    await params.stripe.customers.update(params.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: fallbackMethod.id,
      },
    });
  }

  return fallbackMethod;
}

export async function ensureCustomerStripeIdentity(userId: string) {
  if (!hasStripeEnv()) {
    throw new AppError("Stripe is not configured.", 503, "stripe_unavailable");
  }

  if (!hasSupabaseAdminEnv()) {
    throw new AppError("Supabase admin is not configured.", 503, "supabase_admin_unavailable");
  }

  const customer = await getCustomerPaymentRowByUserId(userId);

  if (!customer) {
    throw new AppError("Customer profile not found.", 404, "customer_not_found");
  }

  if (customer.stripe_customer_id) {
    return {
      customerId: customer.id,
      stripeCustomerId: customer.stripe_customer_id,
    };
  }

  const stripe = getStripeServerClient();
  const stripeCustomer = await stripe.customers.create({
    email: customer.email,
    name: customer.full_name,
    metadata: {
      moverrrCustomerId: customer.id,
      moverrrUserId: userId,
    },
  });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customers")
    .update({
      stripe_customer_id: stripeCustomer.id,
    })
    .eq("id", customer.id);

  if (error) {
    throw new AppError(error.message, 500, "stripe_customer_persist_failed");
  }

  return {
    customerId: customer.id,
    stripeCustomerId: stripeCustomer.id,
  };
}

export async function createCustomerPaymentMethodCheckoutSession(params: {
  userId: string;
  returnTo?: string | null;
}) {
  const identity = await ensureCustomerStripeIdentity(params.userId);
  const stripe = getStripeServerClient();
  const returnPath = normaliseReturnPath(params.returnTo);
  const successUrl = new URL(returnPath, getAppUrl());
  const cancelUrl = new URL(returnPath, getAppUrl());

  successUrl.searchParams.set("focus", "payments");
  successUrl.searchParams.set("paymentSetup", "success");
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

  cancelUrl.searchParams.set("focus", "payments");
  cancelUrl.searchParams.set("paymentSetup", "cancelled");

  const session = await stripe.checkout.sessions.create({
    mode: "setup",
    customer: identity.stripeCustomerId,
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    metadata: {
      moverrrCustomerId: identity.customerId,
      moverrrUserId: params.userId,
      flow: "customer_payment_method_setup",
    },
  });

  if (!session.url) {
    throw new AppError("Stripe did not return a hosted payment-method URL.", 500, "payment_method_session_missing_url");
  }

  return {
    url: session.url,
  };
}

export async function getCustomerPaymentProfileForUser(params: {
  userId: string;
  checkoutSessionId?: string | null;
}) {
  const customer = await getCustomerPaymentRowByUserId(params.userId);

  if (!customer) {
    return {
      stripeConfigured: hasStripeEnv(),
      hasSavedPaymentMethod: false,
      customerId: null,
      defaultPaymentMethod: null,
    } satisfies CustomerPaymentProfile;
  }

  if (!hasStripeEnv() || !customer.stripe_customer_id) {
    return getPaymentMethodSummary(customer);
  }

  const stripe = getStripeServerClient();
  const setupPaymentMethod = params.checkoutSessionId
    ? await resolveCheckoutSessionPaymentMethod({
        stripe,
        checkoutSessionId: params.checkoutSessionId,
        stripeCustomerId: customer.stripe_customer_id,
      })
    : null;
  const defaultPaymentMethod =
    setupPaymentMethod ??
    (await resolveDefaultPaymentMethod({
      stripe,
      stripeCustomerId: customer.stripe_customer_id,
    }));

  await persistCustomerPaymentSummary({
    customerId: customer.id,
    stripeCustomerId: customer.stripe_customer_id,
    paymentMethod: defaultPaymentMethod,
  });

  return getPaymentMethodSummary({
    ...customer,
    stripe_default_payment_method_id: defaultPaymentMethod?.id ?? null,
    stripe_default_payment_method_brand: defaultPaymentMethod?.card?.brand ?? null,
    stripe_default_payment_method_last4: defaultPaymentMethod?.card?.last4 ?? null,
    stripe_payment_method_updated_at: defaultPaymentMethod ? new Date().toISOString() : null,
  });
}
