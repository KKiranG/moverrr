"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoogleAutocompleteInput } from "@/components/shared/google-autocomplete-input";
import type { Trip } from "@/types/trip";

interface ResolvedAddress {
  label: string;
  suburb: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

interface BookingFormProps {
  trip: Trip;
  isAuthenticated: boolean;
}

export function BookingForm({ trip, isAuthenticated }: BookingFormProps) {
  const router = useRouter();
  const [pickup, setPickup] = useState<ResolvedAddress | null>(null);
  const [dropoff, setDropoff] = useState<ResolvedAddress | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPickup = useMemo(
    () => `${trip.route.originSuburb} NSW ${trip.route.originPostcode ?? ""}`.trim(),
    [trip.route.originPostcode, trip.route.originSuburb],
  );
  const defaultDropoff = useMemo(
    () =>
      `${trip.route.destinationSuburb} NSW ${trip.route.destinationPostcode ?? ""}`.trim(),
    [trip.route.destinationPostcode, trip.route.destinationSuburb],
  );

  async function uploadPhotoIfNeeded() {
    if (!photoFile) {
      return [] as string[];
    }

    const formData = new FormData();
    formData.append("file", photoFile);
    formData.append("bucket", "item-photos");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to upload item photo.");
    }

    return [payload.path as string];
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      router.push(`/login?next=/trip/${trip.id}`);
      return;
    }

    if (!pickup || !dropoff) {
      setError("Choose both pickup and dropoff addresses from the address suggestions.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const itemPhotoUrls = await uploadPhotoIfNeeded();
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: trip.id,
          carrierId: trip.carrier.id,
          itemDescription: formData.get("itemDescription"),
          itemCategory: formData.get("itemCategory"),
          itemDimensions: formData.get("itemDimensions"),
          itemWeightKg: Number(formData.get("itemWeightKg") || 0) || undefined,
          itemPhotoUrls,
          needsStairs: formData.get("needsStairs") === "yes",
          needsHelper: formData.get("needsHelper") === "yes",
          specialInstructions: formData.get("specialInstructions"),
          pickupAddress: pickup.label,
          pickupSuburb: pickup.suburb,
          pickupPostcode: pickup.postcode,
          pickupLatitude: pickup.latitude,
          pickupLongitude: pickup.longitude,
          pickupAccessNotes: formData.get("pickupAccessNotes"),
          pickupContactName: formData.get("pickupContactName"),
          pickupContactPhone: formData.get("pickupContactPhone"),
          dropoffAddress: dropoff.label,
          dropoffSuburb: dropoff.suburb,
          dropoffPostcode: dropoff.postcode,
          dropoffLatitude: dropoff.latitude,
          dropoffLongitude: dropoff.longitude,
          dropoffAccessNotes: formData.get("dropoffAccessNotes"),
          dropoffContactName: formData.get("dropoffContactName"),
          dropoffContactPhone: formData.get("dropoffContactPhone"),
        }),
      });
      const bookingPayload = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingPayload.error ?? "Failed to create booking.");
      }

      try {
        await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: bookingPayload.booking.id }),
        });
      } catch {
        // Keep the booking even if Stripe is not configured yet.
      }

      router.push(`/bookings/${bookingPayload.booking.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">What are you moving?</span>
        <Input name="itemDescription" defaultValue="Three-seat sofa" required />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Category</span>
          <select
            name="itemCategory"
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
            defaultValue="furniture"
          >
            <option value="furniture">Furniture</option>
            <option value="boxes">Boxes</option>
            <option value="appliance">Appliance</option>
            <option value="fragile">Fragile</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Dimensions</span>
          <Input name="itemDimensions" placeholder="200cm x 90cm x 85cm" />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Item photo</span>
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Pickup address</span>
        <GoogleAutocompleteInput
          name="pickupAddressInput"
          defaultValue={defaultPickup}
          placeholder="Pickup address"
          onResolved={setPickup}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Pickup access notes</span>
        <Textarea name="pickupAccessNotes" placeholder="Stairs, loading dock, gate code" />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Dropoff address</span>
        <GoogleAutocompleteInput
          name="dropoffAddressInput"
          defaultValue={defaultDropoff}
          placeholder="Dropoff address"
          onResolved={setDropoff}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Dropoff access notes</span>
        <Textarea name="dropoffAccessNotes" placeholder="Apartment access or delivery notes" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Stairs?</span>
          <select
            name="needsStairs"
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
            defaultValue="no"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Need a helper?</span>
          <select
            name="needsHelper"
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
            defaultValue="no"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="pickupContactName" placeholder="Pickup contact name" />
        <Input name="pickupContactPhone" placeholder="Pickup contact phone" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="dropoffContactName" placeholder="Dropoff contact name" />
        <Input name="dropoffContactPhone" placeholder="Dropoff contact phone" />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Anything the carrier should know?</span>
        <Textarea
          name="specialInstructions"
          placeholder="Fragile edges, preferred loading side, timing constraints"
        />
      </label>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating booking..." : "Continue to payment"}
      </Button>
    </form>
  );
}
