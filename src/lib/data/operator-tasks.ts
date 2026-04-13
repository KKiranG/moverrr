import { hasSupabaseAdminEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminActionEvent,
  OperatorTask,
  OperatorTaskPriority,
  OperatorTaskStatus,
  OperatorTaskType,
} from "@/types/admin";
import type { Database } from "@/types/database";

type OperatorTaskRow = Database["public"]["Tables"]["operator_tasks"]["Row"];
type AdminActionEventRow = Database["public"]["Tables"]["admin_action_events"]["Row"];

function toRecord(metadata: unknown) {
  return metadata && typeof metadata === "object"
    ? (metadata as Record<string, unknown>)
    : {};
}

function toOperatorTask(row: OperatorTaskRow): OperatorTask {
  return {
    id: row.id,
    taskType: row.task_type,
    status: row.status,
    priority: row.priority,
    unmatchedRequestId: row.unmatched_request_id,
    listingId: row.listing_id,
    bookingId: row.booking_id,
    disputeId: row.dispute_id,
    carrierId: row.carrier_id,
    corridorKey: row.corridor_key,
    title: row.title,
    blocker: row.blocker,
    nextAction: row.next_action,
    dueAt: row.due_at,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: toRecord(row.metadata),
  };
}

function toAdminActionEvent(row: AdminActionEventRow): AdminActionEvent {
  return {
    id: row.id,
    adminUserId: row.admin_user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actionType: row.action_type,
    reason: row.reason,
    metadata: toRecord(row.metadata),
    createdAt: row.created_at,
  };
}

export async function getAdminActorId(userId: string) {
  if (!hasSupabaseAdminEnv()) {
    throw new AppError("Supabase admin is not configured.", 503, "supabase_admin_unavailable");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500, "admin_actor_lookup_failed");
  }

  if (!data) {
    throw new AppError("Admin access required.", 403, "forbidden");
  }

  return data.id;
}

export async function recordAdminActionEvent(params: {
  adminUserId: string;
  entityType: AdminActionEvent["entityType"];
  entityId: string;
  actionType: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const adminUserId = await getAdminActorId(params.adminUserId);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_action_events")
    .insert({
      admin_user_id: adminUserId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      action_type: params.actionType,
      reason: params.reason ?? null,
      metadata: params.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 500, "admin_action_event_create_failed");
  }

  return toAdminActionEvent(data as AdminActionEventRow);
}

export async function ensureOperatorTask(params: {
  taskType: OperatorTaskType;
  title: string;
  blocker?: string | null;
  nextAction?: string | null;
  priority?: OperatorTaskPriority;
  unmatchedRequestId?: string | null;
  listingId?: string | null;
  bookingId?: string | null;
  disputeId?: string | null;
  carrierId?: string | null;
  corridorKey?: string | null;
  dueAt?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const supabase = createAdminClient();
  let lookup = supabase
    .from("operator_tasks")
    .select("*")
    .eq("task_type", params.taskType)
    .in("status", ["open", "in_progress"])
    .limit(1);

  if (params.unmatchedRequestId) {
    lookup = lookup.eq("unmatched_request_id", params.unmatchedRequestId);
  }

  if (params.listingId) {
    lookup = lookup.eq("listing_id", params.listingId);
  }

  if (params.bookingId) {
    lookup = lookup.eq("booking_id", params.bookingId);
  }

  if (params.disputeId) {
    lookup = lookup.eq("dispute_id", params.disputeId);
  }

  const { data: existing, error: existingError } = await lookup.maybeSingle();

  if (existingError) {
    throw new AppError(existingError.message, 500, "operator_task_lookup_failed");
  }

  if (existing) {
    return toOperatorTask(existing as OperatorTaskRow);
  }

  const { data, error } = await supabase
    .from("operator_tasks")
    .insert({
      task_type: params.taskType,
      title: params.title,
      blocker: params.blocker ?? null,
      next_action: params.nextAction ?? null,
      priority: params.priority ?? "normal",
      unmatched_request_id: params.unmatchedRequestId ?? null,
      listing_id: params.listingId ?? null,
      booking_id: params.bookingId ?? null,
      dispute_id: params.disputeId ?? null,
      carrier_id: params.carrierId ?? null,
      corridor_key: params.corridorKey ?? null,
      due_at: params.dueAt ?? null,
      metadata: params.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 500, "operator_task_create_failed");
  }

  return toOperatorTask(data as OperatorTaskRow);
}

export async function listOperatorTasks(params?: {
  status?: OperatorTaskStatus;
  taskType?: OperatorTaskType;
  limit?: number;
}) {
  if (!hasSupabaseAdminEnv()) {
    return [] as OperatorTask[];
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("operator_tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(params?.limit ?? 50);

  if (params?.status) {
    query = query.eq("status", params.status);
  }

  if (params?.taskType) {
    query = query.eq("task_type", params.taskType);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(error.message, 500, "operator_task_query_failed");
  }

  return (data ?? []).map((row) => toOperatorTask(row as OperatorTaskRow));
}

export async function updateOperatorTask(params: {
  taskId: string;
  status: OperatorTaskStatus;
  blocker?: string | null;
  nextAction?: string | null;
  assignedAdminUserId?: string | null;
}) {
  if (!hasSupabaseAdminEnv()) {
    throw new AppError("Supabase admin is not configured.", 503, "supabase_admin_unavailable");
  }

  const patch: Database["public"]["Tables"]["operator_tasks"]["Update"] = {
    status: params.status,
    blocker: params.blocker ?? null,
    next_action: params.nextAction ?? null,
    assigned_admin_user_id: params.assignedAdminUserId ?? null,
    resolved_at: params.status === "resolved" ? new Date().toISOString() : null,
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("operator_tasks")
    .update(patch)
    .eq("id", params.taskId)
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 500, "operator_task_update_failed");
  }

  return toOperatorTask(data as OperatorTaskRow);
}
