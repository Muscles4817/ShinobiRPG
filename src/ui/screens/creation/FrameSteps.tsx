import { OptionCard } from './OptionCard';
import type { StepProps } from './types';

/** How you were raised: offered by whether you were born into a clan. */
export function UpbringingStep({ view, draft, update }: StepProps) {
  const family = draft.clanId === 'none' ? 'clanless' : 'clan';
  const offered = view.upbringings.filter((u) => u.family === family);
  return (
    <div className="step opt-list">
      {offered.map((u) => (
        <OptionCard
          key={u.id}
          name={u.name}
          description={u.description}
          effects={u.effects}
          selected={draft.upbringingId === u.id}
          onSelect={() => {
            update({ upbringingId: u.id });
          }}
        />
      ))}
      <p className="muted small">
        Early training is spent on the next pages, with what your standing gives.
      </p>
    </div>
  );
}

/** Your frame: what strength and speed can become, and what carrying more costs. */
export function BuildStep({ view, draft, update }: StepProps) {
  return (
    <div className="step opt-list">
      {view.builds.map((b) => (
        <OptionCard
          key={b.id}
          name={b.name}
          description={b.description}
          effects={b.effects}
          selected={draft.buildId === b.id}
          onSelect={() => {
            update({ buildId: b.id });
          }}
        />
      ))}
      <p className="muted small">
        Speed is mostly born and strength is bounded by your frame. Grow stronger than your frame
        was built for and you will slow down.
      </p>
    </div>
  );
}
