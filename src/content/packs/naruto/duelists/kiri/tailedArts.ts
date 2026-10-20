import type { TechniqueDef } from '@/systems/techniques';

/**
 * Bloodlines that turned up in nobody's family: Mei's lava and boiling mist, which the Leaf
 * raised and planted, and the Six-Tails' bubbles in Utakata, who walked away from all of it.
 */
export const TAILED_ARTS: readonly TechniqueDef[] = [
  {
    id: 'lava-monster',
    name: 'Lava Style: Lava Monster',
    description: 'Molten rock pours from the mouth in a wave and sets wherever it lands.',
    discipline: 'ninjutsu',
    element: 'fire',
    effects: [
      { verb: 'area', power: 24, size: 'wide' },
      { verb: 'afflict', power: 10, harm: 'burn' },
    ],
    chakraCost: 24,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'lava-globs',
    name: 'Lava Style: Melting Globs',
    description: 'Gobbets of lava spat one after another. They stick, and they keep burning.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 18 },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 15,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'boil-skilled-mist',
    name: 'Boil Style: Skilled Mist',
    description:
      'A warm mist that smells faintly sweet. By the time anyone notices, it is eating their skin.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [
      { verb: 'field', field: 'mist', power: 12 },
      { verb: 'afflict', power: 10, harm: 'poison' },
    ],
    chakraCost: 20,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'exploding-bubbles',
    name: 'Soap Bubble: Exploding Bubbles',
    description: 'A drift of bubbles from a pipe, too pretty to dodge, each one a small blast.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [{ verb: 'damage', power: 16, hits: 3 }],
    chakraCost: 13,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'bubble-cage',
    name: 'Soap Bubble: Bubble Cage',
    description: 'One great bubble swallows the foe and floats them off the ground, kicking.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [{ verb: 'pin', power: 16 }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'six-tails-acid-bubbles',
    name: 'Six-Tails: Acid Bubbles',
    description:
      'The beast’s bubbles, slick and corrosive. Where they burst, skin and steel blister.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [
      { verb: 'damage', power: 18, hits: 2 },
      { verb: 'afflict', power: 8, harm: 'poison' },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 135,
  },
];
