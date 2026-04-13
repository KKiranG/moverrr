"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function CancelBookingRequestButton({
  bookingRequestId,
}: {
  bookingRequestId: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/booking-requests/${bookingRequestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel" }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to cancel this request right now.");
      }

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to cancel this request right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        className="min-h-[44px]"
        disabled={isSubmitting}
        onClick={() => void handleCancel()}
      >
        {isSubmitting ? "Cancelling request..." : "Cancel request"}
      </Button>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
