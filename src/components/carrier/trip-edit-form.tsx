"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Trip } from "@/types/trip";

export function TripEditForm({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripDate: formData.get("tripDate"),
          timeWindow: formData.get("timeWindow"),
          spaceSize: formData.get("spaceSize"),
          availableVolumeM3: Number(formData.get("availableVolumeM3")),
          availableWeightKg: Number(formData.get("availableWeightKg")),
          detourRadiusKm: Number(formData.get("detourRadiusKm")),
          priceCents: Math.round(Number(formData.get("priceDollars")) * 100),
          status: formData.get("status"),
          specialNotes: formData.get("specialNotes"),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update trip.");
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update trip.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input name="tripDate" type="date" defaultValue={trip.tripDate} required />
        <select
          name="timeWindow"
          defaultValue={trip.timeWindow}
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="flexible">Flexible</option>
        </select>
        <select
          name="spaceSize"
          defaultValue={trip.spaceSize}
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
        >
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>
        <select
          name="status"
          defaultValue={trip.status ?? "active"}
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          name="availableVolumeM3"
          type="number"
          step="0.1"
          defaultValue={trip.availableVolumeM3.toString()}
          required
        />
        <Input
          name="availableWeightKg"
          type="number"
          step="1"
          defaultValue={trip.availableWeightKg.toString()}
          required
        />
        <Input
          name="detourRadiusKm"
          type="number"
          step="1"
          defaultValue={trip.detourRadiusKm.toString()}
          required
        />
        <Input
          name="priceDollars"
          type="number"
          step="1"
          defaultValue={(trip.priceCents / 100).toString()}
          required
        />
      </div>

      <Textarea
        name="specialNotes"
        defaultValue={trip.rules.specialNotes ?? ""}
        placeholder="Operational notes for this listing"
      />
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving trip..." : "Save trip changes"}
      </Button>
    </form>
  );
}
