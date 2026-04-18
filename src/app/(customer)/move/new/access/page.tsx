import { StickyCta, WizardHeader } from "@/components/spec/wizard";

const stairsOptions = ["None", "1-2 flights", "3 or more flights"];

export default function MoveAccessPage() {
  return (
    <main className="pb-28">
      <WizardHeader step={4} backHref="/move/new/timing" />
      <section className="screen screen-wide space-y-4">
        <h1 className="heading">A few things about the move</h1>

        <div className="surface-1">
          <p className="title">Stairs at pickup</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {stairsOptions.map((option, index) => (
              <button
                key={`pickup-${option}`}
                type="button"
                className={`min-h-[44px] min-w-[44px] rounded-[var(--radius-sm)] px-2 text-[13px] hover:bg-[var(--bg-elevated-3)] active:bg-[var(--bg-elevated-3)] ${
                  index === 0
                    ? "bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-1">
          <p className="title">Stairs at drop-off</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {stairsOptions.map((option, index) => (
              <button
                key={`dropoff-${option}`}
                type="button"
                className={`min-h-[44px] min-w-[44px] rounded-[var(--radius-sm)] px-2 text-[13px] hover:bg-[var(--bg-elevated-3)] active:bg-[var(--bg-elevated-3)] ${
                  index === 0
                    ? "bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-1">
          <p className="title">Is there a lift available?</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: "Yes", selected: false },
              { label: "No", selected: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                className={`min-h-[44px] min-w-[44px] rounded-[var(--radius-sm)] px-2 text-[13px] hover:bg-[var(--bg-elevated-3)] active:bg-[var(--bg-elevated-3)] ${
                  option.selected
                    ? "bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-1">
          <p className="title">Will someone help at pickup / drop-off?</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: "Yes", selected: false },
              { label: "No", selected: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                className={`min-h-[44px] min-w-[44px] rounded-[var(--radius-sm)] px-2 text-[13px] hover:bg-[var(--bg-elevated-3)] active:bg-[var(--bg-elevated-3)] ${
                  option.selected
                    ? "bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-1">
          <p className="title">Parking</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Easy", selected: true },
              { label: "Unsure", selected: false },
              { label: "Difficult", selected: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                className={`min-h-[44px] min-w-[44px] rounded-[var(--radius-sm)] px-2 text-[13px] hover:bg-[var(--bg-elevated-3)] active:bg-[var(--bg-elevated-3)] ${
                  option.selected
                    ? "bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <StickyCta href="/move/new/results" label="Find drivers" />
    </main>
  );
}
