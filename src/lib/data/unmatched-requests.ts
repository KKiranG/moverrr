import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { toGeographyPoint, toUnmatchedRequest } from "@/lib/data/mappers";
import { unmatchedRequestSchema, type UnmatchedRequestInput } from "@/lib/validation/unmatched-request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import type { UnmatchedRequest } from "@/types/alert";
import type { Database } from "@/types/database";

type UnmatchedRequestRow = Database["public"]["Tables"]["unmatched_requests"]["Row"];

export async function createUnmatchedRequest(params: UnmatchedRequestInput) {
  if (!hasSupabaseEnv()) {
    throw new AppError("Supabase is not configured.", 503, "supabase_unavailable");
  }

  const parsed = unmatchedRequestSchema.safeParse(params);

  if (!parsed.success) {
    throw new AppError("Unmatched request payload is invalid.", 400, "invalid_unmatched_request");
  }

  if (!parsed.data.customerId && !hasSupabaseAdminEnv()) {
    throw new AppError(
      "Guest route requests need Supabase admin access to store unmatched demand.",
      503,
      "supabase_admin_unavailable",
    );
  }

  const supabase =
    parsed.data.customerId || !hasSupabaseAdminEnv()
      ? createServerSupabaseClient()
      : createAdminClient();
  const insertPayload: Database["public"]["Tables"]["unmatched_requests"]["Insert"] = {
    customer_id: parsed.data.customerId ?? null,
    move_request_id: parsed.data.moveRequestId ?? null,
    status: parsed.data.status,
    pickup_suburb: parsed.data.pickupSuburb,
    pickup_postcode: parsed.data.pickupPostcode ?? null,
    pickup_point: toGeographyPoint(parsed.data.pickupLongitude, parsed.data.pickupLatitude),
    dropoff_suburb: parsed.data.dropoffSuburb,
    dropoff_postcode: parsed.data.dropoffPostcode ?? null,
    dropoff_point: toGeographyPoint(parsed.data.dropoffLongitude, parsed.data.dropoffLatitude),
    item_category: parsed.data.itemCategory ?? null,
    item_description: parsed.data.itemDescription,
    preferred_date: parsed.data.preferredDate ?? null,
    notify_email: parsed.data.notifyEmail ?? null,
    expires_at: parsed.data.expiresAt,
  };

  const { data, error } = await supabase
    .from("unmatched_requests")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 500, "unmatched_request_create_failed");
  }

  return toUnmatchedRequest(data as UnmatchedRequestRow);
}

export async function listUnmatchedRequestsForCustomer(customerId: string) {
  if (!hasSupabaseEnv()) {
    return [] as UnmatchedRequest[];
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("unmatched_requests")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500, "unmatched_request_query_failed");
  }

  return (data ?? []).map((row) => toUnmatchedRequest(row as UnmatchedRequestRow));
}
