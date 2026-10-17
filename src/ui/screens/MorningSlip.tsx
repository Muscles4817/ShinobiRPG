import type { DayEndView, GameAction } from '@/game';

interface MorningSlipProps {
  readonly view: DayEndView;
  readonly perform: (action: GameAction) => void;
}

/**
 * The brief end of a day: nothing at night, and next morning a slip above the village with a
 * few lines about the day before and the day ahead's first plaque.
 */
export function MorningSlip({ view, perform }: MorningSlipProps) {
  const first = view.ahead[0];
  return (
    <section className="morning-slip" aria-label="Yesterday">
      <button
        type="button"
        className="morning-slip-dismiss"
        onClick={() => {
          perform(view.dismiss);
        }}
      >
        Dismiss
      </button>
      <h3>{view.title}</h3>
      {view.summary.length > 0 && (
        <ul>
          {view.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {first && (
        <p className="morning-slip-ahead">
          <span aria-hidden="true">{first.glyph}</span>
          <span>
            <b>Today:</b> {first.text}
          </span>
        </p>
      )}
    </section>
  );
}
