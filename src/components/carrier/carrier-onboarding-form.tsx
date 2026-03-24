"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CarrierOnboardingForm({
  action,
  defaultEmail,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultEmail: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadDocument(file: File | null) {
    if (!file) {
      return "";
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "carrier-documents");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to upload document.");
    }

    return payload.path as string;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const currentTarget = event.currentTarget;
    const formData = new FormData(currentTarget);

    try {
      const licence = currentTarget.licence.files?.[0] ?? null;
      const insurance = currentTarget.insurance.files?.[0] ?? null;
      const [licencePhotoUrl, insurancePhotoUrl] = await Promise.all([
        uploadDocument(licence),
        uploadDocument(insurance),
      ]);
      formData.set("licencePhotoUrl", licencePhotoUrl);
      formData.set("insurancePhotoUrl", insurancePhotoUrl);

      startTransition(async () => {
        try {
          await action(formData);
          setMessage("Carrier onboarding saved. Your verification is ready for admin review.");
        } catch (caught) {
          setError(
            caught instanceof Error ? caught.message : "Unable to save onboarding.",
          );
        }
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload documents.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="businessName" placeholder="Business name" required />
        <Input name="contactName" placeholder="Contact name" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="phone" placeholder="+61 400 000 000" required />
        <Input name="email" defaultValue={defaultEmail} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="abn" placeholder="ABN (optional)" />
        <Input name="serviceSuburbs" placeholder="Penrith, Parramatta, Bondi" />
      </div>
      <Textarea name="bio" placeholder="What kind of jobs do you usually take?" />

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          name="vehicleType"
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
          defaultValue="van"
        >
          <option value="van">Van</option>
          <option value="ute">Ute</option>
          <option value="small_truck">Small truck</option>
          <option value="large_truck">Large truck</option>
          <option value="trailer">Trailer</option>
        </select>
        <Input name="regoPlate" placeholder="Rego plate" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="vehicleMake" placeholder="Make" />
        <Input name="vehicleModel" placeholder="Model" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="vehicleVolumeM3" type="number" step="0.1" placeholder="Volume m3" required />
        <Input name="vehicleWeightKg" type="number" step="1" placeholder="Weight kg" required />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Licence photo</span>
        <Input name="licence" type="file" accept="image/*,application/pdf" required />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Insurance document</span>
        <Input name="insurance" type="file" accept="image/*,application/pdf" required />
      </label>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save carrier onboarding"}
      </Button>
    </form>
  );
}
