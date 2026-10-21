import type { Rng } from '@/core';

import type { RangeBand } from '../../contract';
import { effortOf } from '../../rules/breath';
import { isHarmful } from '../../rules/verbs';
import type { Card } from './cards';
import { affords } from './effort';
import { canGather } from './gather';
import { readsInTheMoment } from './judgement';
import type { PlanFighter } from './state';

/**
 * When a fighter gathers on instinct (`gather.ts`): the turn a foe gives up to get its chakra
 * back once its attacks are out of reach of what it has left.
 */

/** How often a fighter run dry of chakra gathers rather than fighting on with what is left. */
const GATHER_CHANCE = 0.5;

/**
 * Gathering on instinct: a fighter with attacks paid in chakra who can no longer pay for any
 * attack at all (a body move paid in breath still counts) sometimes gives a turn to drawing it
 * back; up close against someone who can punish it, only a mind that doesn't read the fight
 * risks it.
 */
export function gatherInstinct(
  self: PlanFighter,
  moment: { readonly band: RangeBand; readonly foe: PlanFighter | undefined },
  rng: Rng,
): Card | undefined {
  const attacks = self.techniques.filter(isHarmful);
  const moulded = attacks.some((t) => effortOf(self, t).pool === 'chakra');
  if (!moulded || !canGather(self) || attacks.some((t) => affords(self, t))) return undefined;
  const punished = moment.band === 'close' && moment.foe !== undefined && readsInTheMoment(self);
  return !punished && rng.chance(GATHER_CHANCE) ? { kind: 'gather' } : undefined;
}
