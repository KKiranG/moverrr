import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/env";

export async function trackAnalyticsEvent(params: {
  eventName: string;
  userId?: string | null;
  sessionId?: string | null;
  pathname?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!hasSupabaseAdminEnv()) {
    return;
  }

  const supabase = createAdminClient();
  await supabase.from("analytics_events").insert({
    event_name: params.eventName,
    user_id: params.userId ?? null,
    session_id: params.sessionId ?? null,
    pathname: params.pathname ?? null,
    metadata: params.metadata ?? {},
  });
}
