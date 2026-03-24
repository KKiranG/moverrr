"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { CarrierProfile } from "@/types/carrier";

export function VerifyCarrierActions({ carrier }: { carrier: CarrierProfile }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(isApproved: boolean) {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/carriers/${carrier.id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update carrier verification.");
      }

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update carrier verification.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={isSubmitting} onClick={() => submit(true)}>
          Approve
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => submit(false)}
        >
          Reject
        </Button>
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
