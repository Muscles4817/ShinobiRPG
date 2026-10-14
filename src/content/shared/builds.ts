import type { BuildDef } from '../upbringing';

/**
 * Frames. Speed is mostly born and strength is bounded by the frame: a slight build can be fast
 * but tops out early in strength, a heavy one the other way round, and carrying more strength
 * than your frame was built for slows you down.
 */

/** About a grade of limit, in stat points. */
const GRADE = 6;
const HALF = 3;

export const BUILDS: readonly BuildDef[] = [
  {
    id: 'slight',
    name: 'Slight',
    description: 'Small and quick. Hard to hit, and hits none too hard.',
    statBonuses: { speed: 1 },
    modifiers: { limitBonus: { speed: GRADE, strength: -GRADE } },
    comfortStrength: 9,
  },
  {
    id: 'wiry',
    name: 'Wiry',
    description: 'Lean and long-winded. Runs all day.',
    statBonuses: { speed: 1, stamina: 1 },
    modifiers: { limitBonus: { speed: HALF, strength: -HALF }, growth: { stamina: 1.15 } },
    comfortStrength: 11,
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Nothing about your frame stands out, which leaves every door open.',
    statBonuses: {},
    modifiers: {},
    comfortStrength: 13,
  },
  {
    id: 'sturdy',
    name: 'Sturdy',
    description: 'Thick through the shoulders. Takes a blow and gives one back.',
    statBonuses: { strength: 1, stamina: 1 },
    modifiers: { limitBonus: { strength: HALF, speed: -HALF } },
    comfortStrength: 16,
  },
  {
    id: 'heavy',
    name: 'Heavy',
    description:
      'Big and strong. Slow to start, slow to tire of hitting, quick to tire of running.',
    statBonuses: { strength: 2 },
    modifiers: {
      limitBonus: { strength: GRADE, speed: -GRADE },
      growth: { stamina: 0.9 },
      hungerRate: 1.15,
    },
    comfortStrength: 20,
  },
];
