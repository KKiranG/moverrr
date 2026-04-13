"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const CLARIFICATION_REASONS = [
  { value: "item_details", label: "Item details" },
  { value: "access_details", label: "Access details" },
  { value: "timing", label: "Timing" },
  { value: "photos", label: "Photos" },
  { value: "other", label: "Other" },
] as const;

type ClarificationReason = (typeof CLARIFICATION_REASONS)[number]["value"];

export function RequestClarificationSheet({
  isOpen,
  onClose,
  onSubmit,
  busy,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { clarificationReason: ClarificationReason; clarificationMessage: string }) => Promise<void>;
  busy: boolean;
}) {
  const [clarificationReason, setClarificationReason] =
    useState<ClarificationReason>("item_details");
  const [clarificationMessage, setClarificationMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <Card className="border-accent/20 bg-accent/5 p-4">
      <div className="space-y-4">
        <div>
          <p className="section-label">Request clarification</p>
          <h3 className="mt-1 text-base text-text">Ask one factual follow-up before you accept or decline</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Keep this to missing facts only. This path is not for bargaining or back-and-forth negotiation.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-text">Reason</span>
          <select
            value={clarificationReason}
            onChange={(event) => setClarificationReason(event.target.value as ClarificationReason)}
            className="min-h-[44px] rounded-xl border border-border bg-background px-3 text-sm text-text"
          >
            {CLARIFICATION_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-text">Message</span>
          <Textarea
            value={clarificationMessage}
            onChange={(event) => setClarificationMessage(event.target.value)}
            placeholder="Example: Please confirm whether there are stairs at pickup and whether the item can be stood upright."
            rows={4}
          />
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={async () => {
              setError(null);

              try {
                await onSubmit({
                  clarificationReason,
                  clarificationMessage,
                });
                setClarificationMessage("");
                onClose();
              } catch (caught) {
                setError(
                  caught instanceof Error
                    ? caught.message
                    : "Unable to request clarification right now.",
                );
              }
            }}
          >
            {busy ? "Sending..." : "Send clarification"}
          </Button>
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
