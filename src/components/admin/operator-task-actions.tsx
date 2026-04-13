"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OperatorTaskActions({
  taskId,
  initialStatus,
}: {
  taskId: string;
  initialStatus: "open" | "in_progress" | "resolved" | "cancelled";
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);

    try {
      const response = await fetch(`/api/admin/operator-tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          blocker: status === "resolved" ? note || "Resolved in admin queue." : note || undefined,
          nextAction: status === "resolved" ? "Closed." : note || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update the operator task.");
      }

      setNote("");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to update the operator task.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <select
        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text"
        value={status}
        onChange={(event) =>
          setStatus(event.target.value as "open" | "in_progress" | "resolved" | "cancelled")
        }
      >
        <option value="open">Open</option>
        <option value="in_progress">In progress</option>
        <option value="resolved">Resolved</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <Input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Short ops note or next step"
        maxLength={280}
      />
      <Button type="button" variant="secondary" disabled={busy} onClick={() => void submit()}>
        {busy ? "Saving..." : "Update task"}
      </Button>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
