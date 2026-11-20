import type { RangeBand } from '../../contract';
import { RANGE_BANDS } from '../../rules/range';
import { attacksFrom, bestAttack } from './stepping';
import { findCard, isOffence } from './cards';
import { isOpen } from './finishers';
import type { KeepTrying } from './keepTryingShape';
import type { PlanFighter } from './state';

/**
 * How hard a fighter keeps trying to get where they fight (`keepAt`): while the step there is at
 * least an even chance (the suggestion), every exchange, or only when the way is clear (every
 * foe facing them dazed or held). The bench (`keepTryingBench.test.ts`) keeps each the best in
 * some matchup: a brawler with nothing else to do keeps trying, a caster a fast blade punishes
 * for stepping does better standing, an illusionist who dazes first goes when the way is clear.
 */

type Planned = PlanFighter;

/** A fallback is worth fighting from when its best attack is at least this share of home's. */
const FALLBACK_SHARE = 0.6;

/** A distance other than where they fight from which some slot of theirs attacks nearly as well. */
function fallbackBand(fighter: Planned): RangeBand | null {
  const home = fighter.keepAt;
  if (home === undefined) return null;
  const others = RANGE_BANDS.filter((b) => b !== home);
  const worth = bestAttack(fighter, home) * FALLBACK_SHARE;
  return (
    others.find(
      (band) =>
        bestAttack(fighter, band) >= worth &&
        fighter.loadout[band].some((slot) => {
          const card = findCard(fighter, slot.card);
          return card !== null && isOffence(card) && attacksFrom(fighter, card, band);
        }),
    ) ?? null
  );
}

/** The suggested way to keep trying, and why. */
export function suggestedKeepTrying(fighter: Planned): {
  readonly way: KeepTrying;
  readonly why: string;
} {
  // Bodies called to fight (summons, puppets) fight best with their caller further back.
  if ((fighter.calls?.length ?? 0) > 0) {
    return { way: 'always', why: 'What you call fights best with you further back' };
  }
  if (fallbackBand(fighter)) {
    return { way: 'odds', why: 'Your plan attacks nearly as well from where you are' };
  }
  return { way: 'always', why: 'Nothing in your plan attacks as well from anywhere else' };
}

/** The way this fighter keeps trying: their own choice, else the suggestion. */
export function keepTryingOf(fighter: Planned & Pick<PlanFighter, 'keepTrying'>): KeepTrying {
  return fighter.keepTrying ?? suggestedKeepTrying(fighter).way;
}

/** Where the attempt stands: the exchange now, and the foes facing them. */
export interface Attempt {
  readonly exchange: number;
  readonly foes: readonly PlanFighter[];
  /** The chance the step towards where they fight would be made now, when known. */
  readonly odds?: number;
}

/** A step at least this likely is worth taking. */
const FAIR_ODDS = 0.5;

/** Whether to try for where they fight this exchange, by how hard they keep trying. */
export function triesNow(fighter: PlanFighter, at: Attempt | undefined): boolean {
  if (!at) return true;
  switch (keepTryingOf(fighter)) {
    case 'always':
      return true;
    case 'clear':
      return at.foes.length > 0 && at.foes.every(isOpen);
    case 'odds':
      return at.odds === undefined || at.odds >= FAIR_ODDS;
  }
}
