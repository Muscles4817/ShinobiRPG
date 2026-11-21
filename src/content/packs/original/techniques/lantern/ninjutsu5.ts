import type { TechniqueDef } from '@/systems/techniques';

/**
 * Ninjutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_NINJUTSU5: readonly TechniqueDef[] = [
  {
    id: 'kite-day',
    name: 'Kite Day',
    description: 'A sky full of wind kites on chakra lines, and every one of them dives at once.',
    discipline: 'ninjutsu',
    element: 'wind',
    needs: { nature: 'wind' },
    effects: [
      { verb: 'clone', power: 14, kind: 'wind', strikes: true },
      { verb: 'damage', power: 14, hits: 3 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'lamp-oil-river',
    name: 'Lamp-Oil River',
    description:
      'Spill burning oil from your palms like a broken lamp, and it runs across the ground towards everyone in front of you.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    reach: ['close', 'mid'],
    accuracy: 'wild',
    effects: [
      { verb: 'area', power: 18, size: 'wide' },
      { verb: 'afflict', power: 7, harm: 'burn' },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'toga-moth-eclipse',
    name: 'Moth Eclipse',
    description:
      'The whole hive rises at once and the moon goes out, and in the dark every foe feels them drinking.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'area', power: 18, size: 'wide' },
      { verb: 'drain', power: 14, absorb: true },
    ],
    chakraCost: 0,
    swarmCost: 45,
    rank: 'A',
    difficulty: 140,
    clan: 'toga',
    oncePerFight: true,
  },
  {
    id: 'shrine-guardians',
    name: 'Shrine Guardians',
    description:
      'The two stone guardians from the shrine steps stand up out of the ground either side of you and strike whoever comes near.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    effects: [
      { verb: 'clone', power: 12, kind: 'earth', strikes: true },
      { verb: 'counter', power: 14 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'hibana-short-fuse',
    name: 'Short Fuse',
    description:
      'Let the temper the clan is known for catch, and burn hot and fast until there is nothing left to burn.',
    discipline: 'ninjutsu',
    element: 'fire',
    needs: { nature: 'fire' },
    effects: [
      {
        verb: 'empower',
        power: 26,
        boosts: ['ninjutsu', 'speed', 'willpower'],
        healthPerExchange: 6,
      },
    ],
    chakraCost: 0,
    rank: 'S',
    difficulty: 175,
    clan: 'hibana',
    oncePerFight: true,
    afterCost: { kind: 'exhaustion', days: 3 },
  },
];
