import type { BreakInRoll, CreationView } from '@/game';

interface BreakInStepProps {
  readonly view: CreationView;
  readonly roll: BreakInRoll | null;
  readonly chosen: string;
  readonly onAttempt: (approachId: string) => void;
}

/** The opening: choose how to get into the Academy. The roll happens once. */
export function BreakInStep({ view, roll, chosen, onAttempt }: BreakInStepProps) {
  return (
    <div className="step">
      <p className="story">{view.intro}</p>
      {roll === null ? (
        <div className="choices-inline">
          {view.approaches.map((a) => (
            <button
              key={a.id}
              type="button"
              className="choice"
              onClick={() => {
                onAttempt(a.id);
              }}
            >
              <b>{a.label}</b>
              <small>
                {a.stat} · {a.chance}%
              </small>
            </button>
          ))}
        </div>
      ) : (
        <>
          <p className="you">{view.approaches.find((a) => a.id === chosen)?.label}</p>
          <p className={`roll ${roll.succeeded ? 'pass' : 'fail'}`}>
            <i aria-hidden="true">{roll.succeeded ? '✓' : '✗'}</i>
            {Math.round(roll.chance * 100)}% · {roll.succeeded ? 'passed' : 'failed'}
          </p>
          <p className="story enter">{roll.text}</p>
          <p className="story enter">{view.records}</p>
        </>
      )}
    </div>
  );
}
