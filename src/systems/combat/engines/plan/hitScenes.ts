import type { CombatForm } from '../../contract';
import type { SceneLines } from './fresh';

/**
 * Hits told where they land and by what: a heavy blow in a room meets a wall, in a forest a
 * trunk, on a lake the water; a spar's crushing blow is more than anyone meant; a fighter near
 * the end puts everything into one. And the verbs for what beasts, swarms and spirits hit with,
 * since a wolf's bite doesn't "hammer" and a ghost doesn't punch. Words only, never rules.
 */

/** How heavy a hit reads (`hitVoice.ts` weighs it). */
type HitWeight = 'graze' | 'solid' | 'heavy' | 'crushing';
type Verbs = Readonly<Record<HitWeight, readonly string[]>>;

/** Plain strikes by what the attacker is (a person's are `hitVoice.ts`'s blows). */
export const FORM_VERBS: Readonly<Record<Exclude<CombatForm, 'person'>, Verbs>> = {
  beast: {
    graze: ['nips', 'grazes', 'snaps at'],
    solid: ['catches', 'sinks into', 'tears at'],
    heavy: ['tears into', 'rips into', 'savages'],
    crushing: ['mauls', 'tears through', 'savages'],
  },
  swarm: {
    graze: ['pricks', 'nips', 'finds'],
    solid: ['stings', 'burns', 'finds'],
    heavy: ['burns into', 'sinks into', 'covers'],
    crushing: ['smothers', 'engulfs', 'floods'],
  },
  spirit: {
    graze: ['brushes', 'grazes', 'chills'],
    solid: ['chills', 'grips', 'numbs'],
    heavy: ['sinks into', 'freezes', 'closes on'],
    crushing: ['drains', 'empties', 'sinks right through'],
  },
};

/** Where a heavy hit throws its target, by the ground. */
const HEAVY_GROUND: SceneLines = {
  room: [
    "{a.poss} {what} {verb} {t}{again}{guard}, and {t.they}{t.'s} driven back into the wall.",
    '{a.poss} {what} {verb} {t}{again}{guard}, and the floorboards crack under {t.them}.',
  ],
  forest: [
    "{a.poss} {what} {verb} {t}{again}{guard}, and {t.they}{t.'s} thrown back against a trunk.",
    '{a.poss} {what} {verb} {t}{again}{guard}, and {t.they} fall{t.ps} back through the undergrowth.',
  ],
  town: [
    "{a.poss} {what} {verb} {t}{again}{guard}, and {t.they}{t.'s} knocked into a shuttered stall.",
    '{a.poss} {what} {verb} {t}{again}{guard}, and tiles slide off the roof under {t.them}.',
  ],
  lake: [
    '{a.poss} {what} {verb} {t}{again}{guard}, and {t.they} skid{t.ps} back across the water.',
    '{a.poss} {what} {verb} {t}{again}{guard}, and spray goes up behind {t.them}.',
  ],
};

/** Sentences around the verb, by weight, for moments that change how any hit reads. */
const HIT_MOMENTS: Readonly<Record<HitWeight, SceneLines>> = {
  graze: {
    desperate: [
      '{a} lash{a.es} out with the last of {a.their} strength, and the {what} only {verb} {t}{again}{guard}.',
    ],
    spar: ['{a.poss} {what} {verb} {t}{again}{guard}, close enough to count.'],
    late: [
      '{a.poss} {what} comes slower than it did at the start and only {verb} {t}{again}{guard}.',
    ],
  },
  solid: {
    desperate: [
      '{a} find{a.s} the strength from somewhere, and {a.poss} {what} {verb} {t}{again}{guard}.',
    ],
    teammate: [
      '{a.poss} {what} {verb} {t}{again}{guard}, through an opening {a.they} learned on the training ground with {t.them}.',
    ],
    rival: ['{a.poss} {what} {verb} {t}{again}{guard}, and {a.they} let{a.ps} {t.them} know it.'],
    opening: ['{a.poss} {what} {verb} {t}{again}{guard} before {t} {t.is} properly set.'],
  },
  heavy: {
    desperate: [
      '{a} put{a.s} the last of {a.their} strength into {a.their} {what}, and it {verb} {t}{again}{guard}.',
    ],
    spar: ['{a.poss} {what} {verb} {t}{again}{guard}, harder than a spar calls for.'],
  },
  crushing: {
    spar: [
      '{a.poss} {what} {verb} {t}{again}{guard}, far harder than anyone means to hit in a spar.',
    ],
    late: [
      '{a.poss} {what} {verb} {t}{again}{guard}, and this late in the fight {t} {t.has} nothing left to take it with.',
    ],
  },
};

/** The same, with heavy hits thrown about by the ground. */
const BODY_HITS: Readonly<Record<HitWeight, SceneLines>> = {
  ...HIT_MOMENTS,
  heavy: { ...HEAVY_GROUND, ...HIT_MOMENTS.heavy },
  crushing: { ...HEAVY_GROUND, ...HIT_MOMENTS.crushing },
};

/**
 * The scene sentences for a hit of this weight. An illusion lands in the mind, so it throws no
 * one into a wall.
 */
export function hitScenes(weight: HitWeight, illusion: boolean): SceneLines {
  return (illusion ? HIT_MOMENTS : BODY_HITS)[weight];
}
