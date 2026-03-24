import { redirect } from "next/navigation";

import { getAdminEmails, hasSupabaseEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export async function getOptionalSessionUser() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

export async function requireSessionUser() {
  const user = await getOptionalSessionUser();

  if (!user) {
    throw new AppError("You need to log in first.", 401, "unauthorized");
  }

  return user;
}

export async function requirePageSessionUser() {
  const user = await getOptionalSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function isAdminUser(userId: string, email?: string | null) {
  if (!hasSupabaseEnv()) {
    return false;
  }

  if (email && getAdminEmails().includes(email.toLowerCase())) {
    return true;
  }

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}

export async function requireAdminUser() {
  const user = await requireSessionUser();
  const admin = await isAdminUser(user.id, user.email);

  if (!admin) {
    throw new AppError("Admin access required.", 403, "forbidden");
  }

  return user;
}

export async function requirePageAdminUser() {
  const user = await requirePageSessionUser();
  const admin = await isAdminUser(user.id, user.email);

  if (!admin) {
    redirect("/");
  }

  return user;
}
