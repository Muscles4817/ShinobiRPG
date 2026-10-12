import type { ScalingStat, TechniqueEffect, Verb } from '@/systems/techniques';

/**
 * Each verb's scaling profile, defined once. A technique's effect is driven by its user's
 * stats and resisted by its target's, so the same technique differs in two people's hands.
 * `drive` is the user's side (how strongly it lands: a technique's skill against the target's
 * resistance, and its potency); `resist` is what lets the target see it coming. Toughness
 * against a hit that lands is the body's, not the verb's (`rules/body.ts`). An effect may
 * override either list (`TechniqueEffect.scaling`).
 */

/** Who an effect lands on: a foe it is aimed at, or the user themselves. */
export type VerbAim = 'foe' | 'self';

export interface VerbProfile {
  readonly aim: VerbAim;
  readonly drive: readonly ScalingStat[];
  readonly resist: readonly ScalingStat[];
}

export const VERB_PROFILES: Readonly<Record<Verb, VerbProfile>> = {
  damage: { aim: 'foe', drive: ['art'], resist: ['guard'] },
  daze: { aim: 'foe', drive: ['art'], resist: ['guard'] },
  seal: { aim: 'foe', drive: ['art'], resist: ['guard'] },
  heal: { aim: 'self', drive: ['ninjutsu'], resist: [] },
};

/** The profile an effect scales by: its verb's, with the effect's own overrides on top. */
export function profileOf(effect: TechniqueEffect): VerbProfile {
  const base = VERB_PROFILES[effect.verb];
  return {
    aim: base.aim,
    drive: effect.scaling?.drive ?? base.drive,
    resist: effect.scaling?.resist ?? base.resist,
  };
}
