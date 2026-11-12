import { chakraTaken } from './effort';
import { lastDitch } from '../../rules/trumps';
import { isWounding, techniquePower } from '../../rules/verbs';
import { playable, slotted, type Card } from './cards';
import { RANGE_BANDS } from '../../rules/range';
import { readsInTheMoment } from './judgement';
import type { PlanFighter } from './state';

/**
 * Chakra pacing: a fighter with judgement keeps enough chakra for their finisher (their
 * strongest wounding technique the plan can play) and won't spend below it on anything else, unless they are in
 * their last ditch. The player paces by their own plan; a dull mind spends as it pleases.
 */

/**
 * A fighter's finisher: their strongest wounding technique their plan could play, at some
 * distance and with a full tank. Chakra kept for one that is never slotted, or waits on a step
 * not open or a partner not there, is chakra wasted.
 */
function finisherOf(self: PlanFighter) {
  const full = { ...self, chakra: self.maxChakra };
  return RANGE_BANDS.flatMap((band) => slotted(self, band))
    .flatMap((c) => (c.kind === 'jutsu' && playable(full, c) ? [c.technique] : []))
    .filter(isWounding)
    .sort((a, b) => techniquePower(b) - techniquePower(a))[0];
}

/** Whether playing this card would spend the chakra a paced fighter keeps for their finisher. */
export function spendsReserve(self: PlanFighter, card: Card): boolean {
  if (self.isPlayer || card.kind !== 'jutsu' || !readsInTheMoment(self) || lastDitch(self)) {
    return false;
  }
  const finisher = finisherOf(self);
  if (!finisher || finisher.id === card.technique.id) return false;
  // Breath and chakra are kept apart: a body move never eats into the finisher's chakra.
  const spends = chakraTaken(self, card.technique);
  const keeps = chakraTaken(self, finisher);
  return spends > 0 && keeps > 0 && self.chakra - spends < keeps;
}
