import { StickyCta, WizardHeader } from "@/components/spec/wizard";

export default function MoveRoutePage() {
  return (
    <main className="pb-28">
      <WizardHeader step={1} backHref="/" />
      <section className="screen screen-wide space-y-5">
        <h1 className="heading">Where are we picking up?</h1>
        <input className="ios-input" placeholder="Pickup address" aria-label="Pickup address" />

        <h2 className="heading">Where is it going?</h2>
        <input className="ios-input" placeholder="Drop-off address" aria-label="Drop-off address" />

        <p className="caption">Couldn&apos;t find an address? Try the suburb name instead.</p>
      </section>
      <StickyCta href="/move/new/item" label="Continue" />
    </main>
  );
}
