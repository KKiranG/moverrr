import { Card } from "@/components/ui/card";

const items = [
  "Post route, date, space, and price in under 60 seconds.",
  "Keep detour tolerance honest so matches stay trustworthy.",
  "Upload licence and insurance once for manual verification.",
  "Use pickup and delivery photos as proof before payout release.",
];

export function TripChecklist() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <p className="section-label">Carrier principles</p>
        <h2 className="text-lg text-text">What the MVP needs from supply</h2>
        <ul className="space-y-2 text-sm leading-6 text-text-secondary">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
