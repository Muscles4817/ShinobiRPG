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
          {read.details.map((d) => `${d.label} ${d.theirs} (you ${d.yours})`).join(', ')}
        </small>
      )}
    </span>
  );
}

function foeClass(flags: { down: boolean; hidden: boolean; targeted: boolean }): string {
  return ['foe', ...Object.entries(flags).flatMap(([name, on]) => (on ? [name] : []))].join(' ');
}

interface FoeCardProps extends Omit<FoesProps, 'foes'> {
  readonly foe: CombatantView;
}

/** One enemy: health, conditions, what they seem about to do. Tap to target. */
function FoeCard({ foe: e, round, targetId, onTarget, reads }: FoeCardProps) {
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
    <div className={className}>{body}</div>
  );
}

/**
 * Enemies across the top. When some stand in a back row, the rows are shown apart: the back
 * row furthest from you, the front row nearest the fight.
 */
export function Foes(props: FoesProps) {
  const { foes } = props;
  const className = foes.length > 1 ? 'foes many' : 'foes';
  const card = (e: CombatantView) => <FoeCard key={e.id} {...props} foe={e} />;
  if (!foes.some((e) => e.row === 'back'))
    return <header className={className}>{foes.map(card)}</header>;
  const rows = [
    { name: 'Back row', foes: foes.filter((e) => e.row === 'back') },
    { name: 'Front row', foes: foes.filter((e) => e.row !== 'back') },
  ];
  return (
    <header className={`${className} in-rows`}>
      {rows.map((row) => (
        <section key={row.name} className="foe-row" aria-label={`Their ${row.name.toLowerCase()}`}>
          <h3 className="row-label">{row.name}</h3>
          {row.foes.map(card)}
        </section>
      ))}
    </header>
  );
}
