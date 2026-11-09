import { fightingPower } from '@/systems/stats';

import { alive } from '../../rules/body';
import { bestArt } from '../../rules/damage';
import { hasTrait } from '../../rules/kit';
import { tell } from '../../rules/telling';
import { canReveal, covered, EYE_UPKEEP, isRevealed, uncovered } from '../../rules/veil';
import { climbReasons, type FightSoFar } from './climbing';
import { told, type Bank } from './fresh';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { opponentsOf } from './senses';
import { momentOf } from './voice';

/**
 * A veiled eye in a planned fight (`rules/veil.ts`): uncovering it is a moment's work as a turn
 * begins, no turn spent, and it costs chakra as each exchange ends until its owner can't pay,
 * when it closes again. A fighter keeps it covered against a foe they outclass and uncovers it
 * when the fight turns: a foe who is a match for them, one who fights with illusions, or a fight
 * going against them (`climbing.ts`).
 */

/** A foe this close to the fighter's own fighting power is worth the eye from the start. */
export const MATCH_RATIO = 0.8;

const UNCOVERING: Bank = {
  id: 'reveal',
  lines: [
    '{a} lift{a.s} the cover from {a.their} hidden eye, and it opens.',
    '{a} bare{a.s} the eye {a.they} keep{a.s} covered, and it starts to turn.',
  ],
};

/** The eye uncovered: a moment's work, no turn spent. */
export function reveal(round: Round, actor: PlanFighter): Round {
  const line = told(momentOf(round, actor.id), UNCOVERING, { a: actor });
  return say({ ...round, fighters: patch(round.fighters, actor.id, uncovered(actor)) }, line);
}

/** A foe who fights with illusions first: the eye sees through them. */
function illusionist(f: PlanFighter): boolean {
  return hasTrait(f, 'illusionist') || f.attributes.genjutsu >= bestArt(f);
}

/**
 * Whether uncovering the eye is worth it now: a foe who is a match, an illusionist, or the fight
 * turning.
 */
export function revealWorth(self: PlanFighter, fight: FightSoFar): boolean {
  if (!canReveal(self)) return false;
  const own = Math.max(1, fightingPower(self.attributes));
  const standing = fight.foes.filter(alive);
  const match = standing.some((f) => fightingPower(f.attributes) / own >= MATCH_RATIO);
  const why = climbReasons(self, fight);
  return match || standing.some(illusionist) || why.losing || why.hurt;
}

/** As a fighter's turn begins: their eye uncovered if the fight calls for it, and they act on. */
export function uncoverWhenWorth(round: Round, id: string): Round {
  const f = fighterIn(round, id);
  if (!f || !alive(f)) return round;
  const fight = {
    foes: opponentsOf(round.fighters, f),
    exchange: round.number,
    ...(round.reads ? { reads: round.reads } : {}),
  };
  return revealWorth(f, fight) ? reveal(round, f) : round;
}

/** One fighter's eye as the exchange ends: paid for, or closed when they can't pay. */
function upkeep(round: Round, id: string): Round {
  const f = fighterIn(round, id);
  if (!f || !alive(f) || !isRevealed(f)) return round;
  if (f.chakra < EYE_UPKEEP) {
    const line = tell('{a.poss} chakra runs thin, and the eye closes again.', { a: f });
    return say({ ...round, fighters: patch(round.fighters, id, covered(f)) }, line);
  }
  return { ...round, fighters: patch(round.fighters, id, { chakra: f.chakra - EYE_UPKEEP }) };
}

/** As an exchange ends: every eye uncovered takes its due. */
export function veilsAfter(round: Round): Round {
  return round.fighters.reduce((r, f) => upkeep(r, f.id), round);
}
