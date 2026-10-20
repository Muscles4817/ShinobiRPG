import type { TechniqueDef } from '@/systems/techniques';

import type { GearDef } from '../../../../types';

/**
 * The Cutting Wind: the fan clan's art, which fills the barges' sails and empties battlefields.
 * A school, not a bloodline, so the Kazekage's daughter learned it from her mother's family.
 * And Baki's Blade of Wind, which needs no fan at all.
 */
const SCHOOL = 'Cutting Wind';

export const WIND_ARTS: readonly TechniqueDef[] = [
  {
    id: 'fan-gust',
    name: 'Fan Gust',
    description: 'One sweep of the open fan, and the air itself shoves them back.',
    discipline: 'ninjutsu',
    element: 'wind',
    school: SCHOOL,
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 12 },
      { verb: 'knock', power: 8, to: 'far' },
    ],
    chakraCost: 8,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'fan-wall',
    name: 'Wall of Wind',
    description: 'The fan snaps open between them and the blow, and the blow goes wide.',
    discipline: 'ninjutsu',
    element: 'wind',
    school: SCHOOL,
    effects: [{ verb: 'substitute', power: 12 }],
    chakraCost: 10,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'wind-scythe',
    name: 'Wind Scythe',
    description: 'The fan’s edge throws crescents of air that cut wherever they cross.',
    discipline: 'ninjutsu',
    element: 'wind',
    school: SCHOOL,
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 18, hits: 3 }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'cutting-whirlwind',
    name: 'Cutting Whirlwind',
    description:
      'The full fan, swung with the whole body. A whirlwind of blades goes over the field, and nothing in it stands.',
    discipline: 'ninjutsu',
    element: 'wind',
    school: SCHOOL,
    effects: [{ verb: 'area', power: 18, size: 'wide' }],
    chakraCost: 26,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'desert-gale',
    name: 'Desert Gale',
    description:
      'A wind to fill a barge’s sails, turned on the field. It lifts the sand with it and blinds everyone it passes.',
    discipline: 'ninjutsu',
    element: 'wind',
    school: SCHOOL,
    effects: [
      { verb: 'area', power: 16, size: 'wide' },
      { verb: 'field', power: 12, field: 'dust' },
    ],
    chakraCost: 28,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'blade-of-wind',
    name: 'Blade of Wind',
    description: 'A blade of air from the bare hand, quick as a thought and quite invisible.',
    discipline: 'ninjutsu',
    element: 'wind',
    reach: ['close', 'mid'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 24 }],
    chakraCost: 16,
    rank: 'A',
    difficulty: 140,
  },
];

export const SUNA_FANS: readonly GearDef[] = [
  {
    id: 'temari-war-fan',
    name: 'The Iron War Fan',
    description:
      'A fan as tall as its bearer, with three moons painted on it. Each one open is a stronger wind.',
    kind: 'weapon',
    weaponClass: 'fan',
    boosts: { verb: 'area' },
    rank: 'A',
    unique: true,
    cost: 0,
    icon: 'sword',
  },
  {
    id: 'sail-fan',
    name: 'The Sail-Master’s Fan',
    description:
      'Bamboo and barge-canvas, made to fill a sail across half the desert. It drives a storm just as well.',
    kind: 'weapon',
    weaponClass: 'fan',
    boosts: { discipline: 'ninjutsu' },
    rank: 'A',
    unique: true,
    cost: 0,
    icon: 'sword',
  },
];
