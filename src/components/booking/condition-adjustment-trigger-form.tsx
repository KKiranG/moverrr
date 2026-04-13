"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CONDITION_ADJUSTMENT_AMOUNTS,
  CONDITION_ADJUSTMENT_REASONS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function ConditionAdjustmentTriggerForm({
  bookingId,
}: {
  bookingId: string;
}) {
  const router = useRouter();
  const [reasonCode, setReasonCode] = useState<string>(
    CONDITION_ADJUSTMENT_REASONS[0]?.value ?? "stairs_mismatch",
  );
  const [amountCents, setAmountCents] = useState<number>(
    CONDITION_ADJUSTMENT_AMOUNTS[0] ?? 1500,
  );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/condition-adjustment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCode,
          amountCents,
          note: note.trim() || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to open the condition adjustment.");
      }

      setNote("");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to open the condition adjustment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-xl border border-warning/20 bg-warning/10 p-3">
      <div>
        <p className="text-sm font-medium text-text">Condition adjustment</p>
        <p className="mt-1 text-sm text-text-secondary">
          Use this once only when the real stairs, helper, item, or parking conditions materially
          differ from what the customer declared.
        </p>
      </div>

      <label className="grid gap-2 text-sm text-text-secondary">
        <span className="text-text">Reason</span>
        <select
          className="min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-text"
          value={reasonCode}
          onChange={(event) => setReasonCode(event.target.value)}
        >
          {CONDITION_ADJUSTMENT_REASONS.map((reason) => (
            <option key={reason.value} value={reason.value}>
              {reason.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm text-text-secondary">
        <span className="text-text">Amount</span>
        <select
          className="min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-text"
          value={String(amountCents)}
          onChange={(event) => setAmountCents(Number(event.target.value))}
        >
          {CONDITION_ADJUSTMENT_AMOUNTS.map((amount) => (
            <option key={amount} value={String(amount)}>
              {formatCurrency(amount)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm text-text-secondary">
        <span className="text-text">Carrier note</span>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Keep this factual. Explain what materially differs on site."
          maxLength={280}
        />
      </label>

      <Button
        type="button"
        variant="secondary"
        className="min-h-[44px]"
        disabled={busy}
        onClick={() => void handleSubmit()}
      >
        {busy ? "Opening adjustment..." : "Open structured adjustment"}
      </Button>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
