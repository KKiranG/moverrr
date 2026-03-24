"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BookingStatus } from "@/types/booking";

const transitions: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "delivered"],
  in_transit: ["delivered"],
  delivered: [],
  completed: [],
  cancelled: [],
  disputed: [],
};

export function StatusUpdateActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const router = useRouter();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function uploadProofIfNeeded() {
    if (!proofFile) {
      return null;
    }

    const formData = new FormData();
    formData.append("file", proofFile);
    formData.append("bucket", "proof-photos");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to upload proof photo.");
    }

    return payload.path as string;
  }

  async function update(nextStatus: BookingStatus) {
    setError(null);
    setIsSubmitting(true);

    try {
      let pickupProofPhotoUrl: string | undefined;
      let deliveryProofPhotoUrl: string | undefined;

      if ((nextStatus === "picked_up" || nextStatus === "delivered") && !proofFile) {
        throw new Error("Upload a proof photo before changing that booking status.");
      }

      if (nextStatus === "cancelled" && !cancellationReason.trim()) {
        throw new Error("Add a short cancellation reason for audit history.");
      }

      if (nextStatus === "picked_up") {
        pickupProofPhotoUrl = (await uploadProofIfNeeded()) ?? undefined;
      }

      if (nextStatus === "delivered") {
        deliveryProofPhotoUrl = (await uploadProofIfNeeded()) ?? undefined;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus,
          pickupProofPhotoUrl,
          deliveryProofPhotoUrl,
          cancellationReason: cancellationReason.trim() || undefined,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update booking status.");
      }

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to update booking status.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (transitions[currentStatus].length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {transitions[currentStatus].some((status) => status === "picked_up" || status === "delivered") ? (
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
        />
      ) : null}
      {transitions[currentStatus].includes("cancelled") ? (
        <Textarea
          value={cancellationReason}
          onChange={(event) => setCancellationReason(event.target.value)}
          placeholder="Why was this booking cancelled?"
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        {transitions[currentStatus].map((status) => (
          <Button
            key={status}
            type="button"
            variant={status === "cancelled" ? "secondary" : "primary"}
            disabled={isSubmitting}
            onClick={() => update(status)}
          >
            {status.replace("_", " ")}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
