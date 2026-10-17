import type { DayEndView, GameAction } from '@/game';

import { DaySky } from '../../art/DaySky';
import { DayPlaques } from './DayPlaques';
import { Find, Growth, Hurt, Moment, Person, Purse } from './DayRows';

interface DaySheetProps {
  readonly view: DayEndView;
  readonly perform: (action: GameAction) => void;
}

function Ledger({ view }: { readonly view: DayEndView }) {
  const { hurts, growth, people, finds, purse } = view;
  if (hurts.length + growth.length + people.length + finds.length === 0 && !purse) return null;
  return (
    <div className="day-ledger">
      {hurts.length > 0 && (
        <section aria-label="Hurt">
          <h3>Hurt</h3>
          {hurts.map((h) => (
            <Hurt key={h.title} h={h} />
          ))}
        </section>
      )}
      {growth.length > 0 && (
        <section aria-label="What grew">
          <h3>What grew</h3>
          {growth.map((g) => (
            <Growth key={g.stat} g={g} />
          ))}
        </section>
      )}
      {people.length > 0 && (
        <section aria-label="People">
          <h3>People</h3>
          {people.map((p) => (
            <Person key={p.face.id} p={p} />
          ))}
        </section>
      )}
      {finds.length > 0 && (
        <section aria-label="Found">
          <h3>Found</h3>
          <div className="day-finds">
            {finds.map((f) => (
              <Find key={f.name} f={f} />
            ))}
          </div>
        </section>
      )}
      {purse && (
        <section aria-label="Purse">
          <h3>Purse</h3>
          <Purse lines={purse.lines} left={purse.left} />
        </section>
      )}
    </div>
  );
}

/**
 * The end of a day, over everything: a strip of sky (the moon, or dawn if you never slept), the
 * day's moments, a ledger of only the sections something happened in, and the day ahead.
 */
export function DaySheet({ view, perform }: DaySheetProps) {
  return (
    <div className="day-sheet" role="dialog" aria-modal="true" aria-labelledby="day-title">
      <header className="day-sky">
        <DaySky dawn={!view.slept} />
        <p>{view.when}</p>
        <h2 id="day-title">{view.title}</h2>
      </header>
      <div className="day-body">
        {view.moments.map((m) => (
          <Moment key={m.title} m={m} />
        ))}
        <Ledger view={view} />
        <DayPlaques label={view.aheadLabel} hooks={view.ahead} />
        <button
          type="button"
          className="btn wide day-close"
          onClick={() => {
            perform(view.dismiss);
          }}
        >
          {view.button}
        </button>
      </div>
    </div>
  );
}
