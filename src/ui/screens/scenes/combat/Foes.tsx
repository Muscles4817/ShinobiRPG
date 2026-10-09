import type { CombatantView } from '@/game';

interface FoesProps {
  readonly foes: readonly CombatantView[];
  readonly round: number;
  readonly targetId: string | null;
  /** Null when there is nothing to choose between. */
  readonly onTarget: ((id: string) => void) | null;
}

/** Enemies across the top: health, conditions, what they seem about to do. Tap to target. */
export function Foes({ foes, round, targetId, onTarget }: FoesProps) {
  return (
    <header className={foes.length > 1 ? 'foes many' : 'foes'}>
      {foes.map((e) => {
        const down = e.health <= 0;
        const targeted = !down && e.id === targetId && onTarget !== null;
        const body = (
          <>
            <div className="foe-name">
              {e.tag && <span className="badge d-spirit">{e.tag}</span>}
              <b>{e.name}</b>
              {targeted && <span className="target-mark">Target</span>}
              {e.statuses.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
            <span className="hp">
              <i style={{ width: `${(e.health / e.maxHealth) * 100}%` }} />
            </span>
            {e.intent && !down && <span className="intent">{e.intent}</span>}
            <span className="foe-foot num">
              <span>
                {e.health} / {e.maxHealth}
              </span>
              <span>Round {round}</span>
            </span>
          </>
        );
        const className = `foe${down ? ' down' : ''}${targeted ? ' targeted' : ''}`;
        return onTarget && !down ? (
          <button
            key={e.id}
            type="button"
            className={className}
            aria-pressed={targeted}
            onClick={() => {
              onTarget(e.id);
            }}
          >
            {body}
          </button>
        ) : (
          <div key={e.id} className={className}>
            {body}
          </div>
        );
      })}
    </header>
  );
}
