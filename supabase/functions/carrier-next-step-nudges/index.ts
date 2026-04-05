import { createClient } from "npm:@supabase/supabase-js@2";

import {
  buildCarrierNudgeAuditEvent,
  getCarrierNudgeEmailConfig,
  selectCarrierNextStepNudges,
  type CarrierNextStepBookingRow,
  type CarrierNextStepNudge,
} from "./shared.ts";

function getEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getSupabaseUrl() {
  return Deno.env.get("SUPABASE_URL") ?? getEnv("NEXT_PUBLIC_SUPABASE_URL");
}

function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

function buildDedupeKey(nudge: CarrierNextStepNudge, recipientEmail: string) {
  return [
    nudge.bookingId,
    nudge.type,
    nudge.bookingStatus,
    recipientEmail.toLowerCase(),
    nudge.dedupeWindowKey,
  ].join(":");
}

async function reserveDeliveryAttempt(params: {
  supabase: ReturnType<typeof createClient>;
  nudge: CarrierNextStepNudge;
  recipientEmail: string;
  dedupeKey: string;
}) {
  const { error } = await params.supabase.from("booking_email_deliveries").insert({
    booking_id: params.nudge.bookingId,
    recipient_email: params.recipientEmail.toLowerCase(),
    email_type: `carrier_next_step_${params.nudge.type}`,
    booking_status: params.nudge.bookingStatus,
    dedupe_key: params.dedupeKey,
    provider: "pending",
  });

  if (!error) {
    return { reserved: true as const };
  }

  if (error.code === "23505") {
    return { reserved: false as const, deduped: true as const };
  }

  throw error;
}

async function releaseDeliveryAttempt(
  supabase: ReturnType<typeof createClient>,
  dedupeKey: string,
) {
  await supabase.from("booking_email_deliveries").delete().eq("dedupe_key", dedupeKey);
}

async function markDeliverySent(params: {
  supabase: ReturnType<typeof createClient>;
  dedupeKey: string;
  providerMessageId?: string | null;
}) {
  await params.supabase
    .from("booking_email_deliveries")
    .update({
      provider: "resend",
      provider_message_id: params.providerMessageId ?? null,
    })
    .eq("dedupe_key", params.dedupeKey);
}

async function recordAuditEvent(
  supabase: ReturnType<typeof createClient>,
  params: Parameters<typeof buildCarrierNudgeAuditEvent>[0],
) {
  await supabase.from("booking_events").insert(buildCarrierNudgeAuditEvent(params));
}

async function sendNudgeEmail(params: {
  emailConfig: ReturnType<typeof getCarrierNudgeEmailConfig> extends { skipped: false; config: infer T }
    ? T
    : never;
  nudge: CarrierNextStepNudge;
  recipientEmail: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.emailConfig.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.emailConfig.resendFromEmail,
      to: [params.recipientEmail],
      subject: params.nudge.subject,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;line-height:1.5">
          <h1 style="font-size:20px;margin-bottom:16px">${params.nudge.headline}</h1>
          <div style="border:1px solid #e5e5e5;border-radius:12px;padding:16px;margin:16px 0">
            <p style="margin:0 0 8px"><strong>Booking:</strong> ${params.nudge.bookingReference}</p>
            <p style="margin:0 0 8px"><strong>Route:</strong> ${params.nudge.routeLabel}</p>
            <p style="margin:0 0 8px"><strong>Missing step:</strong> ${params.nudge.missingStep}</p>
            <p style="margin:0"><strong>Status:</strong> ${params.nudge.bookingStatus.replaceAll("_", " ")}</p>
          </div>
          <p>${params.nudge.summary}</p>
          <p>${params.nudge.whatHappensNext}</p>
          <p style="margin-top:20px">
            <a
              href="${params.emailConfig.siteUrl}${params.nudge.actionHref}"
              style="display:inline-block;background:#0066ff;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:600"
            >
              ${params.nudge.actionLabel}
            </a>
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with ${response.status}`);
  }

  return (await response.json().catch(() => null)) as { id?: string } | null;
}

Deno.serve(async () => {
  try {
    const supabase = createSupabaseAdminClient();
    const emailConfig = getCarrierNudgeEmailConfig({
      resendApiKey: Deno.env.get("RESEND_API_KEY"),
      resendFromEmail: Deno.env.get("RESEND_FROM_EMAIL"),
      siteUrl: Deno.env.get("NEXT_PUBLIC_SITE_URL"),
    });

    const now = new Date();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, booking_reference, status, payment_status, pending_expires_at, pickup_proof_photo_url, delivery_proof_photo_url, delivered_at, updated_at, listing_id, carrier:carriers(email, stripe_onboarding_complete, business_name), listing:capacity_listings(trip_date, origin_suburb, destination_suburb)",
      )
      .in("status", [
        "pending",
        "confirmed",
        "picked_up",
        "in_transit",
        "delivered",
        "completed",
      ])
      .limit(200);

    if (error) {
      throw error;
    }

    const nudges = selectCarrierNextStepNudges(
      (data ?? []) as unknown as CarrierNextStepBookingRow[],
      now,
    );

    let selected = 0;
    let emailed = 0;
    let skipped = 0;
    let deduped = 0;
    let failed = 0;

    for (const nudge of nudges) {
      selected += 1;

      if (!nudge.carrierEmail) {
        await recordAuditEvent(supabase, {
          nudge,
          outcome: "skipped",
          reason: "missing_carrier_email",
        });
        skipped += 1;
        continue;
      }

      if (emailConfig.skipped) {
        await recordAuditEvent(supabase, {
          nudge,
          outcome: "skipped",
          reason: emailConfig.reason,
          recipientEmail: nudge.carrierEmail,
        });
        skipped += 1;
        continue;
      }

      const dedupeKey = buildDedupeKey(nudge, nudge.carrierEmail);
      const deliveryAttempt = await reserveDeliveryAttempt({
        supabase,
        nudge,
        recipientEmail: nudge.carrierEmail,
        dedupeKey,
      });

      if (!deliveryAttempt.reserved) {
        await recordAuditEvent(supabase, {
          nudge,
          outcome: "deduped",
          reason: "duplicate_window",
          recipientEmail: nudge.carrierEmail,
          dedupeKey,
        });
        deduped += 1;
        continue;
      }

      try {
        const payload = await sendNudgeEmail({
          emailConfig: emailConfig.config,
          nudge,
          recipientEmail: nudge.carrierEmail,
        });

        await markDeliverySent({
          supabase,
          dedupeKey,
          providerMessageId: payload?.id ?? null,
        });
        await recordAuditEvent(supabase, {
          nudge,
          outcome: "sent",
          recipientEmail: nudge.carrierEmail,
          dedupeKey,
          providerMessageId: payload?.id ?? null,
        });
        emailed += 1;
      } catch (sendError) {
        await releaseDeliveryAttempt(supabase, dedupeKey);
        await recordAuditEvent(supabase, {
          nudge,
          outcome: "failed",
          reason: sendError instanceof Error ? sendError.message : "email_send_failed",
          recipientEmail: nudge.carrierEmail,
          dedupeKey,
        });
        failed += 1;
      }
    }

    return Response.json({
      selected,
      emailed,
      skipped,
      deduped,
      failed,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown carrier nudge runner error.",
      },
      { status: 500 },
    );
  }
});
