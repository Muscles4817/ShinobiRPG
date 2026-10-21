import type { Rng } from '@/core';

import { outmatched } from '../../rules/trumps';
import { physicalDefence } from '../../rules/damage';
import { avoidRating } from '../../rules/avoidance';
import { playable, type Card } from './cards';
import { readsInTheMoment } from './judgement';
import type { PlanFighter } from './state';

/**
 * Taking cover on instinct (`docs/design/defence-plan.md`): a fighter who reads the fight and
 * faces someone far stronger gives some turns to not being hit, Evade or Brace as their body
 * suits (the quick keep clear, the sturdy stand firm), while the breath lasts. A dull fighter
 * keeps trading blows. This is the first of the survival judgement the plan describes; the
 * read of what is coming, and the threat of a killing blow, come later.
 */

/** How often an outmatched mind that reads the fight takes cover rather than attacking. */
const SHELTER_CHANCE = 0.35;

/** Which commitment suits this fighter against this foe: keeping clear, or standing firm. */
export function shelterFor(self: PlanFighter, foe: PlanFighter): Card {
  const clear = avoidRating(self) / Math.max(1, foe.attributes.speed);
  const firm =
    physicalDefence(self) / Math.max(1, (foe.attributes.strength + foe.attributes.taijutsu) / 2);
  return clear >= firm ? { kind: 'evade' } : { kind: 'brace' };
}

/** A commitment to play this turn instead of attacking, or undefined to fight on. */
export function shelterInstinct(
  self: PlanFighter,
  foe: PlanFighter | undefined,
  rng: Rng,
): Card | undefined {
  if (!foe || !readsInTheMoment(self) || !outmatched(self, [foe])) return undefined;
  const card = shelterFor(self, foe);
  return playable(self, card) && rng.chance(SHELTER_CHANCE) ? card : undefined;
}
