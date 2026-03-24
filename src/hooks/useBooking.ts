"use client";

import { useState } from "react";

export function useBooking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBooking(payload: Record<string, unknown>) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create booking.");
      }

      return data;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create booking.");
      throw caught;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { createBooking, isSubmitting, error };
}
