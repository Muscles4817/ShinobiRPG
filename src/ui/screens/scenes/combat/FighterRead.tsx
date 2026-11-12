import type { CombatantView, ScoutingRead } from '@/game';

import { Read } from './Foes';
import { shortName } from './shortNames';

const DISTANCE_LINE = {
  close: 'Close to you.',
  mid: 'At mid range from you.',
  far: 'Far off from you.',
} as const;

/** What a fighter still standing is doing: how far off, what next, what you know, what it knows. */
function StandingNotes({ fighter: f }: { readonly fighter: CombatantView }) {
  return (
    <>
      {f.side === 'enemy' && f.distance && (
        <p className="muted small fighter-distance">{DISTANCE_LINE[f.distance]}</p>
      )}
      {f.intent && <p className="intent">{f.intent}</p>}
      {f.known && <p className="muted small known-cards">{f.known}</p>}
      {f.learned && <p className="muted small learned">{f.learned}</p>}
    </>
  );
}

/**
 * What you know of the fighter you tapped in the formation: for a foe, what they are about to
 * do, how far off they stand, the cards you know they hold, what they have learned of you and
 * your read on them; for one of yours, how they stand.
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
      {f.health > 0 && <StandingNotes fighter={f} />}
      {conditions && <p className="muted small">{conditions}</p>}
      {read && f.health > 0 && <Read read={read} />}
    </section>
  );
}

/** Every foe's telegraphed move at a glance, decided again after each exchange. */
export function FoeMoves({
  foes,
  field = foes,
}: {
  readonly foes: readonly CombatantView[];
  /** Everyone in the fight, so the seals match the formation's. */
  readonly field?: readonly CombatantView[];
}) {
  const moving = foes.filter((f) => f.health > 0 && f.intent);
  if (moving.length === 0) return null;
  return (
    <section className="foe-moves" aria-label="Their next moves">
      <h3 className="plan-heading">Their next moves</h3>
      <ul>
        {moving.map((f) => (
          <li key={f.id}>
            <span className="token-seal small enemy" aria-hidden="true">
              {shortName(f.name, field, f.id).mark}
            </span>
            <b>{f.name}</b> <span>{f.intent}</span>
          </li>
        ))}
      </ul>
      <p className="muted small">They decide again after every exchange.</p>
    </section>
  );
}
