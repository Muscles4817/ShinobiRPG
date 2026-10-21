import { COMMIT_BREATH, type Commitment } from '../../rules/commitment';
import { breathOf } from './effort';
import { told, type Bank } from './fresh';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { momentOf } from './voice';
import type { Turn } from './senses';

/**
 * Committed defence in a planned fight (`rules/commitment.ts`): playing Evade or Brace spends the
 * fighter's turn and breath, and holds until their next turn begins. While it holds, the avoid
 * roll (`avoid.ts`) and the hit (`react.ts`) read it; a daze still leaves them open to everything.
 */

const COMMITTING: Readonly<Record<Commitment, Bank>> = {
  evade: {
    id: 'evade',
    lines: [
      '{a} give{a.s} everything to staying out of reach.',
      '{a} keep{a.s} moving, light on {a.their} feet, never where a blow could find {a.them}.',
      '{a} drop{a.s} back into constant motion, watching for what comes.',
    ],
  },
  brace: {
    id: 'brace',
    lines: [
      '{a} plant{a.s} {a.their} feet and set{a.s} {a.themself} to take it.',
      '{a} tuck{a.s} in behind {a.their} guard and dig{a.s} in.',
      '{a} brace{a.s} for whatever comes.',
    ],
  },
};

/** Whether the fighter has the breath for a commitment. */
export function canCommit(
  f: Pick<PlanFighter, 'attributes' | 'breath'>,
  kind: Commitment,
): boolean {
  return breathOf(f) >= COMMIT_BREATH[kind];
}

/** Whether a fighter is committed to this defence now. */
export function committedTo(f: Pick<PlanFighter, 'committed'>, kind: Commitment): boolean {
  return f.committed === kind;
}

/** Plays a commitment: the breath is spent, and it holds until the fighter's next turn. */
export function commit(round: Round, { actor }: Turn, kind: Commitment): Round {
  const breath = Math.max(0, breathOf(actor) - COMMIT_BREATH[kind]);
  const line = told(momentOf(round, actor.id), COMMITTING[kind], { a: actor });
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { committed: kind, breath }) },
    line,
  );
}

/** A fighter's turn begins: whatever they committed to last turn is over. */
export function released(round: Round, id: string): Round {
  const f = fighterIn(round, id);
  if (!f?.committed) return round;
  return { ...round, fighters: patch(round.fighters, id, { committed: null }) };
}
