import type { RangeBand } from '../../contract';
import { RANGE_BANDS } from '../../rules/range';
import { cardId, findCard, fitsBand, isReaction, reactionsFor, type Card } from './cards';
import type { CardId, PlanFighter, Reactions } from './state';

export type { Reactions } from './state';

/**
 * What a fighter keeps ready besides their action slots: one defence per distance (Guard,
 * Dodge, Counter or a substitution they know) that reacts on its own when they're hit there,
 * and the distance they fight at, which they step towards on their own (`priority.ts`). Neither
 * takes a slot. Fights saved before these existed kept their defences in the slots, so a
 * fighter without readiness reads their first slotted defence instead.
 */

export const NO_REACTIONS: Reactions = { close: null, mid: null, far: null };

/** Where a fighter fights: a distance to make for, or null to fight wherever they stand. */
export type KeepAt = RangeBand | null;

type Ready = Pick<PlanFighter, 'loadout' | 'techniques' | 'items' | 'reactions'>;

function fitting(fighter: Ready, id: CardId | null, band: RangeBand): Card | null {
  if (id === null) return null;
  const card = findCard(fighter, id);
  return card && isReaction(card) && fitsBand(card, band) ? card : null;
}

/** The defence this fighter has ready at this distance, if any. */
export function reactionAt(fighter: Ready, band: RangeBand): Card | null {
  if (fighter.reactions) return fitting(fighter, fighter.reactions[band] ?? null, band);
  const legacy = fighter.loadout[band].find((s) => fitting(fighter, s.card, band) !== null);
  return legacy ? fitting(fighter, legacy.card, band) : null;
}

/** The defences a fighter could keep ready at each distance, best first as the plan prefers. */
export function reactionChoices(fighter: Ready, band: RangeBand): Card[] {
  return reactionsFor(fighter, band);
}

/**
 * The defence a plan keeps ready by default: a substitution when the kit has one, then a
 * Guard, then a Dodge. A plan with a defence beats one without far more often than any extra
 * attack makes up for (the content bench measures it), so every distance keeps one.
 */
export function defaultReactions(fighter: Ready): Reactions {
  const pick = (band: RangeBand): CardId | null => {
    const choices = reactionChoices(fighter, band);
    const swap = choices.find((c) => c.kind === 'jutsu');
    const best = swap ?? choices.find((c) => c.kind === 'guard') ?? choices[0];
    return best ? cardId(best) : null;
  };
  const [close = null, mid = null, far = null] = RANGE_BANDS.map(pick);
  return { close, mid, far };
}

/**
 * A remembered set of reactions, kept where it still fits the fighter; anywhere it doesn't
 * (a technique since forgotten, a Counter remembered for range), the default takes its place.
 */
export function cleanReactions(fighter: Ready, reactions: Reactions): Reactions {
  const fallback = defaultReactions(fighter);
  const keep = (band: RangeBand) =>
    fitting(fighter, reactions[band], band) ? reactions[band] : fallback[band];
  return { close: keep('close'), mid: keep('mid'), far: keep('far') };
}
