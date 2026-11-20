import type { RangeBand } from '../../contract';
import { RANGE_BANDS, RANGE_LABEL } from '../../rules/range';
import { attacksFrom } from './stepping';
import { findCard, isOffence } from './cards';
import { isOpen } from './finishers';
import { roundOfExchange, type KeepTrying } from './keepTryingShape';
import type { PlanFighter } from './state';

/**
 * How hard a fighter keeps trying to get where they fight (`keepAt`): every exchange, once a
 * round and then fighting where they stand, or only when the way is clear (every foe facing
 * them dazed or held). Unset, the plan suggests one by what its slots do where it isn't going: a
 * plan with attacks that work from elsewhere tries once; one with nothing there keeps trying.
 */

type Planned = PlanFighter;

/** A distance other than where they fight from which some slot of theirs attacks. */
function fallbackBand(fighter: Planned): RangeBand | null {
  const others = RANGE_BANDS.filter((b) => b !== fighter.keepAt);
  return (
    others.find((band) =>
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
  const fallback = fallbackBand(fighter);
  if (fallback) {
    return {
      way: 'once',
      why: `Your plan still attacks from ${RANGE_LABEL[fallback].toLowerCase()} range`,
    };
  }
  return { way: 'always', why: 'Nothing in your plan attacks from anywhere else' };
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
    case 'once':
      return fighter.triedFor !== roundOfExchange(at.exchange);
    case 'clear':
      return at.foes.length > 0 && at.foes.every(isOpen);
    case 'odds':
      return at.odds === undefined || at.odds >= FAIR_ODDS;
  }
}
