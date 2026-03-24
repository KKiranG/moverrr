"use client";

import { useEffect, useState } from "react";

import type { Trip } from "@/types/trip";

export function useTrip(id: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function run() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/trips/${id}`, {
          signal: abortController.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load trip.");
        }

        if (isMounted) {
          setTrip(payload.trip ?? null);
        }
      } catch (caught) {
        if (abortController.signal.aborted) {
          return;
        }

        if (isMounted) {
          setError(caught instanceof Error ? caught.message : "Unable to load trip.");
          setTrip(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [id]);

  return { trip, isLoading, error };
}
