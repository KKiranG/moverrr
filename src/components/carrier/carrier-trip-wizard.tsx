"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { GoogleAutocompleteInput } from "@/components/shared/google-autocomplete-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { suggestPrice } from "@/lib/pricing/suggest";

interface AddressValue {
  label: string;
  suburb: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

const steps = ["Route", "When & space", "Price & rules"] as const;

export function CarrierTripWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [origin, setOrigin] = useState<AddressValue | null>(null);
  const [destination, setDestination] = useState<AddressValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spaceSize, setSpaceSize] = useState<"S" | "M" | "L" | "XL">("M");

  const pricingSuggestion = useMemo(
    () =>
      suggestPrice({
        distanceKm: 35,
        spaceSize,
        needsStairs: false,
        needsHelper: false,
        isReturn: true,
      }),
    [spaceSize],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!origin || !destination) {
      setError("Choose origin and destination from the address suggestions.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originSuburb: origin.suburb,
          originPostcode: origin.postcode,
          originLatitude: origin.latitude,
          originLongitude: origin.longitude,
          destinationSuburb: destination.suburb,
          destinationPostcode: destination.postcode,
          destinationLatitude: destination.latitude,
          destinationLongitude: destination.longitude,
          detourRadiusKm: Number(formData.get("detourRadiusKm")),
          tripDate: formData.get("tripDate"),
          timeWindow: formData.get("timeWindow"),
          spaceSize,
          availableVolumeM3: Number(formData.get("availableVolumeM3")),
          availableWeightKg: Number(formData.get("availableWeightKg")),
          priceCents: Math.round(Number(formData.get("priceDollars")) * 100),
          suggestedPriceCents: pricingSuggestion.midCents,
          accepts: formData.getAll("accepts"),
          stairsOk: formData.get("stairsOk") === "yes",
          stairsExtraCents:
            Math.round(Number(formData.get("stairsExtraDollars") || 0) * 100),
          helperAvailable: formData.get("helperAvailable") === "yes",
          helperExtraCents:
            Math.round(Number(formData.get("helperExtraDollars") || 0) * 100),
          status: formData.get("status"),
          specialNotes: formData.get("specialNotes"),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create trip.");
      }

      router.push("/carrier/trips");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create trip.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="flex gap-2 overflow-x-auto">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStepIndex(index)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              index === stepIndex
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-text-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {stepIndex === 0 ? (
        <div className="grid gap-4">
          <GoogleAutocompleteInput
            name="originAddress"
            placeholder="Origin suburb or address"
            onResolved={setOrigin}
          />
          <GoogleAutocompleteInput
            name="destinationAddress"
            placeholder="Destination suburb or address"
            onResolved={setDestination}
          />
          <Input
            name="detourRadiusKm"
            type="number"
            step="1"
            defaultValue="10"
            placeholder="Detour radius km"
            required
          />
        </div>
      ) : null}

      {stepIndex === 1 ? (
        <div className="grid gap-4">
          <Input name="tripDate" type="date" required />
          <select
            name="timeWindow"
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
            defaultValue="flexible"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="flexible">Flexible</option>
          </select>
          <select
            name="spaceSize"
            value={spaceSize}
            onChange={(event) => setSpaceSize(event.target.value as "S" | "M" | "L" | "XL")}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
          >
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
          <Input
            name="availableVolumeM3"
            type="number"
            step="0.1"
            defaultValue="1"
            placeholder="Available volume m3"
            required
          />
          <Input
            name="availableWeightKg"
            type="number"
            step="1"
            defaultValue="100"
            placeholder="Available weight kg"
            required
          />
        </div>
      ) : null}

      {stepIndex === 2 ? (
        <div className="grid gap-4">
          <p className="text-sm text-text-secondary">
            Suggested range ${pricingSuggestion.lowCents / 100} to $
            {pricingSuggestion.highCents / 100}
          </p>
          <Input
            name="priceDollars"
            type="number"
            step="1"
            defaultValue={Math.round(pricingSuggestion.midCents / 100).toString()}
            placeholder="Price in dollars"
            required
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" name="accepts" value="furniture" defaultChecked />
              Furniture
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" name="accepts" value="boxes" defaultChecked />
              Boxes
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" name="accepts" value="appliance" defaultChecked />
              Appliance
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" name="accepts" value="fragile" />
              Fragile
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="stairsOk"
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
              defaultValue="no"
            >
              <option value="no">No stairs support</option>
              <option value="yes">Stairs OK</option>
            </select>
            <Input name="stairsExtraDollars" type="number" step="1" defaultValue="0" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="helperAvailable"
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
              defaultValue="no"
            >
              <option value="no">No helper</option>
              <option value="yes">Helper available</option>
            </select>
            <Input name="helperExtraDollars" type="number" step="1" defaultValue="0" />
          </div>
          <select
            name="status"
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
            defaultValue="active"
          >
            <option value="active">Publish now</option>
            <option value="draft">Save as draft</option>
          </select>
          <Textarea name="specialNotes" placeholder="Special handling notes" />
        </div>
      ) : null}

      {error ? <p className="text-sm text-error">{error}</p> : null}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
        >
          Back
        </Button>
        {stepIndex < steps.length - 1 ? (
          <Button
            type="button"
            onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))}
          >
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save trip"}
          </Button>
        )}
      </div>
    </form>
  );
}
