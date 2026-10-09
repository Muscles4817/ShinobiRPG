import type { Rng } from '@/core';

import type { DuelAction } from './actions';
import type { Fighter } from './state';

/**
 * Behaviour for every fighter the player doesn't control, on either side: heal when low,
 * otherwise mix techniques, guards and strikes.
 */
export function chooseAiAction(self: Fighter, rng: Rng): DuelAction {
  const sealed = (self.sealed ?? 0) > 0;
  const affordable = sealed ? [] : self.techniques.filter((t) => t.chakraCost <= self.chakra);
  const heal = affordable.find((t) => t.effect === 'heal');
  if (heal && self.health < self.maxHealth * 0.35) return { kind: 'technique', technique: heal };

  const offensive = affordable.filter((t) => t.effect !== 'heal');
  if (offensive.length > 0 && rng.chance(0.45)) {
    return { kind: 'technique', technique: rng.pick(offensive) };
  }
  return rng.chance(0.15) ? { kind: 'guard' } : { kind: 'strike' };
}
