import type { CombatantView, ScoutingRead } from '@/game';

import { Read } from './Foes';
import { shortName } from './Formation';

/**
 * What you know of the fighter you tapped in the formation: for a foe, what they are about to
 * do and your read on them; for one of yours, how they stand.
 */
export function FighterRead({
  fighter: f,
  read,
}: {
  readonly fighter: CombatantView | undefined;
  readonly read: ScoutingRead | undefined;
}) {
  if (!f) return null;
  const conditions = f.statuses.length > 0 ? f.statuses.join(', ') : null;
  return (
    <section className={`fighter-read ${f.side}`} aria-label={`About ${f.name}`}>
      <p className="fighter-read-name">
        <b>{f.name}</b> {f.tag && <span className="badge">{f.tag}</span>}
        <span className="num">
          {f.health} / {f.maxHealth}
        </span>
      </p>
      {f.intent && f.health > 0 && <p className="intent">{f.intent}</p>}
      {conditions && <p className="muted small">{conditions}</p>}
      {read && f.health > 0 && <Read read={read} />}
    </section>
  );
}

/** Every foe's telegraphed move at a glance, decided again after each exchange. */
export function FoeMoves({ foes }: { readonly foes: readonly CombatantView[] }) {
  const moving = foes.filter((f) => f.health > 0 && f.intent);
  if (moving.length === 0) return null;
  return (
    <section className="foe-moves" aria-label="Their next moves">
      <h3 className="plan-heading">Their next moves</h3>
      <ul>
        {moving.map((f) => (
          <li key={f.id}>
            <span className="token-seal small enemy" aria-hidden="true">
              {shortName(f.name).mark}
            </span>
            <b>{f.name}</b> <span>{f.intent}</span>
          </li>
        ))}
      </ul>
      <p className="muted small">They decide again after every exchange.</p>
    </section>
  );
}
