"use client";

import { useEffect, useState } from "react";

import type { TripSearchResult } from "@/types/trip";

export function useSearch(queryString: string) {
  const [results, setResults] = useState<TripSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function run() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?${queryString}`, {
          signal: abortController.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load search results.");
        }

        if (isMounted) {
          setResults(payload.results ?? []);
        }
      } catch (caught) {
        if (abortController.signal.aborted) {
          return;
        }

        if (isMounted) {
          setError(caught instanceof Error ? caught.message : "Unable to load search results.");
          setResults([]);
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
  }, [queryString]);

  return { results, isLoading, error };
}
