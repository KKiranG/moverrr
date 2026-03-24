"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? null);
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Auth unavailable.");
      setEmail(null);
    }
  }, []);

  return { email, isAuthenticated: Boolean(email), error };
}
