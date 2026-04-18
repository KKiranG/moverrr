import { Timeline } from "@/components/spec/cards";
import { TopAppBar } from "@/components/spec/chrome";
import { bookingTimeline } from "@/lib/spec-mocks";
import { Button } from "@/components/ui/button";

export default function BookingLiveViewPage() {
  return (
    <main className="pb-8">
      <TopAppBar title="Your move" backHref="/activity" rightHref="/inbox/booking-demo-booking" rightLabel="⋯" />
      <section className="screen space-y-4">
        <div className="surface-1">
          <p className="title">Carrier confirmed</p>
          <p className="caption mt-1">James will pick up on Fri between 9am-1pm</p>
        </div>

        <Timeline steps={bookingTimeline} />

        <div className="surface-1">
          <p className="caption">Total paid on delivery: <span className="tabular">$101.20</span></p>
        </div>

        <Button variant="secondary" className="w-full">Message driver</Button>
        <Button variant="ghost" className="w-full text-[var(--danger)]">Cancel booking</Button>
      </section>
    </main>
  );
}
