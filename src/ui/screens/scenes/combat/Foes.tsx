import type { CombatantView, ScoutingRead } from '@/game';

import { ThreatChip } from '../../../components/ThreatChip';

interface FoesProps {
  readonly foes: readonly CombatantView[];
  readonly round: number;
  readonly targetId: string | null;
  /** Null when there is nothing to choose between. */
  readonly onTarget: ((id: string) => void) | null;
  /** How each foe sizes up against you, by combatant id. */
  readonly reads: Readonly<Record<string, ScoutingRead>>;
}

/** The threat, how they fight and, for sharp eyes, where they outclass you. */
function Read({ read }: { readonly read: ScoutingRead }) {
  return (
    <span className="foe-read">
      <ThreatChip threat={read.threat} label={read.threatLabel} />
      <small>{read.style}</small>
      {read.traits.map((t) => (
        <span key={t.trait} className="trait-note">
          <b>{t.label}</b> {t.counter}
        </span>
      ))}
      {read.details.length > 0 && (
        <small className="num">
          {read.details.map((d) => `${d.label} ${d.theirs} (you ${d.yours})`).join(' · ')}
        </small>
      )}
    </span>
  );
}

function foeClass(flags: { down: boolean; hidden: boolean; targeted: boolean }): string {
  return ['foe', ...Object.entries(flags).flatMap(([name, on]) => (on ? [name] : []))].join(' ');
}

/** Enemies across the top: health, conditions, what they seem about to do. Tap to target. */
export function Foes({ foes, round, targetId, onTarget, reads }: FoesProps) {
  return (
    <header className={foes.length > 1 ? 'foes many' : 'foes'}>
      {foes.map((e) => {
        const down = e.health <= 0;
        const hidden = e.targetable === false;
        const read = reads[e.id];
        const targeted = !down && !hidden && e.id === targetId && onTarget !== null;
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
            {!down && read && <Read read={read} />}
            <span className="foe-foot num">
              <span>
                {e.health} / {e.maxHealth}
              </span>
              <span>Round {round}</span>
            </span>
          </>
        );
        const className = foeClass({ down, hidden, targeted });
        return onTarget && !down && !hidden ? (
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
