import { hasSupabaseAdminEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminActorId, recordAdminActionEvent } from "@/lib/data/operator-tasks";
import type { ConciergeOfferRecord } from "@/types/admin";
import type { Database } from "@/types/database";

type ConciergeOfferRow = Database["public"]["Tables"]["concierge_offers"]["Row"];

function toConciergeOffer(row: ConciergeOfferRow): ConciergeOfferRecord {
  return {
    id: row.id,
    unmatchedRequestId: row.unmatched_request_id,
    carrierId: row.carrier_id,
    operatorTaskId: row.operator_task_id,
    status: row.status,
    quotedTotalPriceCents: row.quoted_total_price_cents,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listConciergeOffersForUnmatchedRequest(unmatchedRequestId: string) {
  if (!hasSupabaseAdminEnv()) {
    return [] as ConciergeOfferRecord[];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("concierge_offers")
    .select("*")
    .eq("unmatched_request_id", unmatchedRequestId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500, "concierge_offer_query_failed");
  }

  return (data ?? []).map((row) => toConciergeOffer(row as ConciergeOfferRow));
}

export async function createConciergeOffer(params: {
  adminUserId: string;
  unmatchedRequestId: string;
  carrierId: string;
  quotedTotalPriceCents: number;
  note?: string | null;
  operatorTaskId?: string | null;
}) {
  if (!hasSupabaseAdminEnv()) {
    throw new AppError("Supabase admin is not configured.", 503, "supabase_admin_unavailable");
  }

  const adminActorId = await getAdminActorId(params.adminUserId);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("concierge_offers")
    .insert({
      unmatched_request_id: params.unmatchedRequestId,
      carrier_id: params.carrierId,
      created_by_admin_user_id: adminActorId,
      operator_task_id: params.operatorTaskId ?? null,
      quoted_total_price_cents: params.quotedTotalPriceCents,
      note: params.note?.trim() || null,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 500, "concierge_offer_create_failed");
  }

  await recordAdminActionEvent({
    adminUserId: params.adminUserId,
    entityType: "concierge_offer",
    entityId: data.id,
    actionType: "concierge_offer_created",
    reason: params.note?.trim() || null,
    metadata: {
      unmatchedRequestId: params.unmatchedRequestId,
      carrierId: params.carrierId,
      quotedTotalPriceCents: params.quotedTotalPriceCents,
      operatorTaskId: params.operatorTaskId ?? null,
    },
  });

  return toConciergeOffer(data as ConciergeOfferRow);
}
