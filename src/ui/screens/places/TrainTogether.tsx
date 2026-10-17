import type { GameAction, TrainingView } from '@/game';

import { GradeBadge } from '../../components/Grade';

/** Training together: drill your companion in a stat, you its teacher, your grade over its own. */
export function TrainTogether({
  view,
  perform,
}: {
  readonly view: TrainingView['companion'];
  readonly perform: (action: GameAction) => void;
}) {
  if (!view) return null;
  const why = view.drills.every((d) => d.blocker !== null) ? view.drills[0]?.blocker : null;
  return (
    <section className="people-here" aria-label={`Train with ${view.name}`}>
      <h2 className="label">Train with {view.name}</h2>
      <div className="teach-stats">
        {view.drills.map((d) => (
          <button
            key={d.label}
            type="button"
            className="teach-stat"
            disabled={d.blocker !== null}
            title={d.blocker ?? undefined}
            aria-label={`Drill ${view.name} in ${d.label}`}
            onClick={() => {
              perform(d.action);
            }}
          >
            <span className="teach-label">{d.label}</span>
            <span className="teach-grades" aria-hidden="true">
              <GradeBadge grade={d.yours} />
              <small>over</small>
              <GradeBadge grade={d.theirs} />
            </span>
          </button>
        ))}
      </div>
      {why && <p className="blocker">{why}</p>}
    </section>
  );
}
