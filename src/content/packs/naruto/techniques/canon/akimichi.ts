import type { TechniqueDef } from '@/systems/techniques';

/** The Akimichi's size-changing arts, hiden taught by Chōza. Each burns the body to fuel it. */
export const CANON_AKIMICHI: readonly TechniqueDef[] = [
  {
    id: 'multi-size',
    name: 'Multi-Size Technique',
    description: 'You swell to a giant’s size, with the weight and strength to go with it.',
    discipline: 'ninjutsu',
    clan: 'akimichi',
    effects: [
      {
        verb: 'empower',
        power: 10,
        boosts: ['strength', 'stamina'],
        healthPerExchange: 1,
      },
    ],
    chakraCost: 10,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'spiked-human-bullet-tank',
    name: 'Spiked Human Bullet Tank',
    description: 'The Human Bullet Tank again, wrapped in ropes studded with kunai.',
    discipline: 'taijutsu',
    clan: 'akimichi',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'break', power: 18 },
      { verb: 'afflict', power: 6, harm: 'bleed' },
      { verb: 'knock', power: 8, to: 'far' },
    ],
    chakraCost: 12,
    rank: 'C',
    difficulty: 85,
  },
  {
    id: 'super-multi-size',
    name: 'Super Multi-Size Technique',
    description: 'Multi-Size until you stand as tall as the hills.',
    discipline: 'ninjutsu',
    clan: 'akimichi',
    effects: [
      {
        verb: 'empower',
        power: 16,
        boosts: ['strength', 'stamina'],
        healthPerExchange: 2,
        afterCost: { kind: 'exhaustion', days: 1 },
      },
    ],
    chakraCost: 18,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'butterfly-mode',
    name: 'Butterfly Mode',
    description:
      'The last pill: the body’s fat burns into chakra that flares from the back as wings.',
    discipline: 'ninjutsu',
    clan: 'akimichi',
    effects: [
      {
        verb: 'empower',
        power: 22,
        boosts: ['strength', 'speed', 'taijutsu'],
        healthPerExchange: 3,
      },
    ],
    chakraCost: 20,
    rank: 'A',
    difficulty: 140,
    oncePerFight: true,
    afterCost: { kind: 'hospital', days: 4 },
  },
  {
    id: 'butterfly-bullet-bombing',
    name: 'Butterfly Bullet Bombing',
    description: 'All of Butterfly Mode’s chakra packed into one punch.',
    discipline: 'taijutsu',
    clan: 'akimichi',
    reach: ['close'],
    effects: [
      { verb: 'break', power: 28 },
      { verb: 'daze', power: 10 },
    ],
    chakraCost: 18,
    rank: 'B',
    difficulty: 115,
    oncePerFight: true,
    afterCost: { kind: 'hospital', days: 2 },
  },
];
