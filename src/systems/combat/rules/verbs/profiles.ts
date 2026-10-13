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
  heal: { aim: 'self', drive: ['ninjutsu', 'chakraControl'], resist: [] },
  // Hits every foe; each may see it coming, dodge or guard on their own.
  area: { aim: 'foe', drive: ['art'], resist: ['guard'] },
  // Takes hold by genjutsu against willpower; chakra control shortens it (`confusionTurns`).
  confuse: { aim: 'foe', drive: ['genjutsu'], resist: ['willpower'] },
  // Hides the user; foes look for them with perception (`searchChance`). Smoke-style
  // techniques override the drive with ninjutsu.
  conceal: { aim: 'self', drive: ['genjutsu'], resist: ['perception'] },
  // Reaches out for hidden foes; their concealment is what it has to overcome.
  sense: { aim: 'self', drive: ['perception', 'ninjutsu'], resist: [] },
  // Raw force through a guard and armour; seen coming like any blow.
  break: { aim: 'foe', drive: ['strength'], resist: ['guard'] },
  // Raises a fight-wide condition (`field.ts`) as dense as the user's art makes it; whoever's
  // perception rises above that density sees through it.
  field: { aim: 'self', drive: ['art'], resist: ['perception'] },
  // Footwork too fast to contest: the user is simply there. Nothing drives or resists it.
  move: { aim: 'self', drive: [], resist: [] },
  // A defence that reacts on its own: the first hit that would land each round strikes a
  // decoy instead. Certain, but paid in chakra each time; genjutsu isn't fooled by it.
  substitute: { aim: 'self', drive: [], resist: [] },
  // Raises the user's own stats; skill in the art decides by how much (`rules/verbs/empower.ts`).
  empower: { aim: 'self', drive: ['art'], resist: [] },
  // Decoys made with the art; sharp eyes pick the real one out (`rules/verbs/clones.ts`).
  clone: { aim: 'self', drive: ['art'], resist: ['perception'] },
  // Set by sealing craft and cunning; a foe who notices it steps around (`rules/verbs/trap.ts`).
  trap: { aim: 'self', drive: ['fuuinjutsu', 'intellect'], resist: ['perception'] },
  // A throw or a pull: art and strength against the target's footing (`rules/verbs/hold.ts`).
  knock: { aim: 'foe', drive: ['art', 'strength'], resist: ['strength', 'speed'] },
  // A hold: art against strength (an illusory one overrides the resist with willpower).
  pin: { aim: 'foe', drive: ['art'], resist: ['strength'] },
  // Chakra drawn out: art against chakra control (`rules/verbs/drain.ts`).
  drain: { aim: 'foe', drive: ['art'], resist: ['chakraControl'] },
  // Lingering harm: art against stamina (`rules/verbs/afflict.ts`).
  afflict: { aim: 'foe', drive: ['art'], resist: ['stamina'] },
  // A readied riposte, struck with the art when the next blow comes (`rules/verbs/riposte.ts`).
  counter: { aim: 'self', drive: ['art'], resist: [] },
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
