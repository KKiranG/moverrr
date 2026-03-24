"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const categories = [
  { value: "damage", label: "Damage" },
  { value: "no_show", label: "No show" },
  { value: "late", label: "Late" },
  { value: "wrong_item", label: "Wrong item" },
  { value: "overcharge", label: "Overcharge" },
  { value: "other", label: "Other" },
] as const;

export function DisputeForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [category, setCategory] = useState<(typeof categories)[number]["value"]>("damage");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function uploadProofIfNeeded() {
    if (!photoFile) {
      return [] as string[];
    }

    const formData = new FormData();
    formData.append("file", photoFile);
    formData.append("bucket", "proof-photos");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to upload dispute proof.");
    }

    return [payload.path as string];
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const photoUrls = await uploadProofIfNeeded();
      const response = await fetch(`/api/bookings/${bookingId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          photoUrls,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to raise dispute.");
      }

      setDescription("");
      setPhotoFile(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to raise dispute.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value as (typeof categories)[number]["value"])}
        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
      >
        {categories.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Describe what happened, when it happened, and what outcome you need."
      />
      <Input type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)} />
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting dispute..." : "Raise dispute"}
      </Button>
    </form>
  );
}
