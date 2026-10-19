import type { TechniqueDef } from '@/systems/techniques';

/**
 * The Tōga's moth techniques, taught only to the clan. Each spends moths from the hive in the
 * body (`swarmCost`) beside a little chakra; moth dust that lands keeps a foe glowing and found.
 */
export const TOGA_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'toga-moth-dust',
    name: 'Moth Dust',
    description: 'A pale cloud from your sleeves that settles on a foe and glows.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'damage', power: 7 }],
    chakraCost: 3,
    swarmCost: 12,
    rank: 'E',
    difficulty: 30,
    clan: 'toga',
  },
  {
    id: 'toga-scale-blind',
    name: 'Scale Blind',
    description: 'The moths beat their wings in a foe’s face until the scales leave them reeling.',
    discipline: 'genjutsu',
    effects: [{ verb: 'daze', power: 10 }],
    chakraCost: 5,
    swarmCost: 18,
    rank: 'D',
    difficulty: 45,
    clan: 'toga',
  },
  {
    id: 'toga-moth-veil',
    name: 'Moth Veil',
    description: 'A curtain of wings, and you are somewhere else behind it.',
    discipline: 'genjutsu',
    effects: [{ verb: 'conceal', power: 10 }],
    chakraCost: 4,
    swarmCost: 15,
    rank: 'D',
    difficulty: 45,
    clan: 'toga',
  },
  {
    id: 'toga-lantern-swarm',
    name: 'Lantern Swarm',
    description: 'Every moth you keep, at once, over everyone in front of you, drinking.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'area', power: 10, size: 'small' },
      { verb: 'drain', power: 8, absorb: true },
    ],
    chakraCost: 8,
    swarmCost: 35,
    rank: 'C',
    difficulty: 70,
    clan: 'toga',
  },
];
