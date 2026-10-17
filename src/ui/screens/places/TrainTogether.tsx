import type { GameAction, TrainingView } from '@/game';

import { GradeBadge } from '../../components/Grade';

/**
 * Training together: drill your companion in one of its skills, you its handler. Its body
 * (strength, speed, stamina) comes with time, so only skills are drilled here.
 */
export function TrainTogether({
  view,
  perform,
}: {
  readonly view: TrainingView['companion'];
  readonly perform: (action: GameAction) => void;
}) {
  if (!view) return null;
  const why = view.drills.find((d) => d.blocker !== null)?.blocker ?? null;
  return (
    <section className="people-here" aria-label={`Train with ${view.name}`}>
      <h2 className="label">Train with {view.name}</h2>
      <p className="muted small">
        You handle, it learns: its skills grow with drills, its body with time.{' '}
        <span className="chip cost num">−{view.energy} energy</span>
      </p>
      <div className="teach-stats">
        {view.drills.map((d) => (
          <button
            key={d.label}
            type="button"
            className="teach-stat"
            disabled={d.blocker !== null}
            aria-label={`Drill ${view.name} in ${d.label}`}
            onClick={() => {
              perform(d.action);
            }}
          >
            <span className="teach-label">{d.label}</span>
            <span className="teach-grades" aria-hidden="true">
              <GradeBadge grade={d.theirs} />
            </span>
          </button>
        ))}
      </div>
      {why && <p className="blocker">{why}</p>}
    </section>
  );
}
