import { alive } from '../../rules/body';
import { fighterIn, say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Channelled holds in a planned fight: a pin its caster must keep holding (a hand in the water
 * prison). While they hold it, their turn goes on holding (the target stays pinned), they have
 * no hands for a defence (`readiness.ts`), and the moment they are hurt or dazed the hold breaks
 * and the target is free, of it and of any seal it kept on them. A hold whose target has fallen, or slipped free, simply lets go.
 */

/** The exchanges a held target stays pinned for, topped up each turn the hold is kept. */
const HELD_PIN = 2;

function letGo(f: PlanFighter): PlanFighter {
  const { holding: _held, ...rest } = f;
  return rest;
}

/** Out of the hold, and out of whatever else it kept on them (the seal of a water prison). */
function freed(f: PlanFighter): PlanFighter {
  const { pinned: _pin, grip: _grip, ...rest } = f;
  return { ...rest, sealed: 0 };
}

/** Starts holding `targetId`: the caster's hands are now on the hold. */
export function startHolding(round: Round, casterId: string, targetId: string): Round {
  const fighters = round.fighters.map((f) => (f.id === casterId ? { ...f, holding: targetId } : f));
  return { ...round, fighters };
}

/**
 * A holder's turn: kept on the hold while the target is still caught (`spent`), or, if the hold
 * has nothing left to hold, let go (the turn is theirs to play).
 */
export function keepHolding(round: Round, holder: PlanFighter): { round: Round; spent: boolean } {
  if (!holder.holding) return { round, spent: false };
  // Dazed, they lose their grip.
  if (holder.stunned > 0) return { round: breakHold(round, holder.id), spent: false };
  const held = fighterIn(round, holder.holding);
  if (!held || !alive(held) || (held.pinned ?? 0) <= 0) {
    const fighters = round.fighters.map((f) => (f.id === holder.id ? letGo(f) : f));
    return { round: { ...round, fighters }, spent: false };
  }
  const fighters = round.fighters.map((f) =>
    f.id === held.id ? { ...f, pinned: Math.max(f.pinned ?? 0, HELD_PIN) } : f,
  );
  return {
    round: say({ ...round, fighters }, tell('{a} hold{a.s} {t} fast.', { a: holder, t: held })),
    spent: true,
  };
}

/** A holder hurt: the hold breaks and its target is free. */
export function breakHold(round: Round, holderId: string): Round {
  const holder = fighterIn(round, holderId);
  const heldId = holder?.holding;
  if (!holder || !heldId) return round;
  const fighters = round.fighters.map((f) =>
    f.id === holderId ? letGo(f) : f.id === heldId ? freed(f) : f,
  );
  const held = fighterIn(round, heldId);
  return say(
    { ...round, fighters },
    held
      ? tell('{a.poss} hold breaks, and {t} {t.is} free.', { a: holder, t: held })
      : tell('{a.poss} hold breaks.', { a: holder }),
  );
}
