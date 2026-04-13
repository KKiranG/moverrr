import { formatDateTime } from "@/lib/utils";

export function BookingRequestTimeline({
  entries,
}: {
  entries: Array<{
    key: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-secondary">No request timeline events recorded yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {entries.map((entry) => (
        <div key={entry.key} className="rounded-xl border border-border px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-text">{entry.title}</p>
            <p className="text-xs text-text-secondary">{formatDateTime(entry.createdAt)}</p>
          </div>
          <p className="mt-2 text-sm text-text-secondary">{entry.description}</p>
        </div>
      ))}
    </div>
  );
}
