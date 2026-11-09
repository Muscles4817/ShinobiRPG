import type { TechniqueDef } from '@/systems/techniques';

import { WATER_ARTS } from './beastArtsWater';

/**
 * What chakra beasts do in a fight, by the country they live in: techniques no person learns
 * (`validateChakraBeasts.ts`). A bite or a charge is a body move; one wreathed in an element is
 * moulded and costs chakra. The river, marsh and shore
 * beasts' are in `beastArtsWater.ts`.
 */
const WOODS_AND_MOUNTAIN_ARTS: readonly TechniqueDef[] = [
  {
    id: 'fox-haze',
    name: 'Fox Haze',
    description: 'The fox fades into the shadow between two trunks.',
    discipline: 'genjutsu',
    effects: [{ verb: 'conceal', power: 10 }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 45,
  },
  {
    id: 'fox-fire-lure',
    name: 'Fox-Fire Lure',
    description: 'Pale lights bob off through the trees. When you look back, the path has gone.',
    discipline: 'genjutsu',
    effects: [{ verb: 'confuse', power: 8 }],
    chakraCost: 7,
    rank: 'D',
    difficulty: 50,
  },
  {
    id: 'shrike-cry',
    name: 'Shrike Cry',
    description: 'A shriek pitched to go through your head. For a moment you can’t think.',
    discipline: 'genjutsu',
    effects: [{ verb: 'daze', power: 8 }],
    chakraCost: 3,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'burning-charge',
    name: 'Burning Charge',
    description:
      'It charges with its head down and its tusks smoking. The grass burns where it ran.',
    discipline: 'taijutsu',
    element: 'fire',
    moulded: true,
    effects: [
      { verb: 'damage', power: 16 },
      { verb: 'afflict', power: 5, harm: 'burn' },
    ],
    chakraCost: 10,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'mountains-weight',
    name: 'Mountain’s Weight',
    description: 'It rears up and drops its whole weight on you. The ground cracks under the blow.',
    discipline: 'taijutsu',
    element: 'earth',
    moulded: true,
    accuracy: 'wild',
    effects: [
      { verb: 'damage', power: 30 },
      { verb: 'knock', power: 10, to: 'mid' },
    ],
    chakraCost: 22,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'root-bind',
    name: 'Root Bind',
    description: 'Roots break the soil round your ankles and pull you down.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [
      { verb: 'damage', power: 6 },
      { verb: 'pin', power: 14 },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 100,
  },
  {
    id: 'moss-mend',
    name: 'Moss Mend',
    description: 'Moss creeps over the wound and closes it, green where the blood was.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'heal', power: 18 }],
    chakraCost: 16,
    rank: 'B',
    difficulty: 100,
  },
  {
    id: 'thunder-dive',
    name: 'Thunder Dive',
    description: 'Folds its wings and falls out of the cloud with the lightning.',
    discipline: 'taijutsu',
    element: 'lightning',
    moulded: true,
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 16 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'stone-horn',
    name: 'Stone Horn',
    description: 'Its horns go grey as granite just before they hit.',
    discipline: 'taijutsu',
    element: 'earth',
    moulded: true,
    effects: [
      { verb: 'damage', power: 14 },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 9,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'owl-stare',
    name: 'Owl’s Stare',
    description: 'It stares, and its eyes hold yours. You can’t look away.',
    discipline: 'genjutsu',
    effects: [{ verb: 'daze', power: 14 }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 100,
  },
  {
    id: 'hollow-hoot',
    name: 'Hollow Hoot',
    description: 'One low note from every side of the pass at once.',
    discipline: 'genjutsu',
    effects: [{ verb: 'confuse', power: 14 }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 100,
  },
  {
    id: 'silent-wing',
    name: 'Silent Wing',
    description: 'A shadow goes over without any sound of wings.',
    discipline: 'genjutsu',
    effects: [{ verb: 'conceal', power: 14 }],
    chakraCost: 12,
    rank: 'B',
    difficulty: 90,
  },
];

/** Chakra beasts' techniques of the desert. */
const DESERT_ARTS: readonly TechniqueDef[] = [
  {
    id: 'glass-sting',
    name: 'Glass Sting',
    description: 'It strikes with a tail like blown glass, the venom showing through it.',
    discipline: 'taijutsu',
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'afflict', power: 8, harm: 'poison' },
    ],
    chakraCost: 4,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'sand-dive',
    name: 'Sand Dive',
    description: 'It dives head first into the dune and the sand closes over it.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [{ verb: 'conceal', power: 10 }],
    chakraCost: 8,
    rank: 'C',
    difficulty: 60,
  },
  {
    id: 'burrow-strike',
    name: 'Burrow Strike',
    description: 'It comes up through the sand under your feet, jaws first.',
    discipline: 'taijutsu',
    element: 'earth',
    moulded: true,
    effects: [{ verb: 'damage', power: 16 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'shell-slam',
    name: 'Shell Slam',
    description: 'A shell the size of a house, swung like a door.',
    discipline: 'taijutsu',
    accuracy: 'wild',
    effects: [{ verb: 'damage', power: 24 }],
    chakraCost: 6,
    rank: 'B',
    difficulty: 90,
  },
  {
    id: 'sand-breath',
    name: 'Sand Breath',
    description:
      'It opens its beak and the desert pours out, hot enough to scour paint off a cart.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [{ verb: 'area', power: 22, size: 'wide' }],
    chakraCost: 24,
    rank: 'A',
    difficulty: 130,
  },
];

/** Chakra beasts' techniques of anywhere chakra pools: the swarms. */
const SWARM_ARTS: readonly TechniqueDef[] = [
  {
    id: 'hornet-cloud',
    name: 'Hornet Cloud',
    description: 'The nest empties at you. Each sting draws out a little chakra.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'damage', power: 7 },
      { verb: 'drain', power: 6, absorb: true },
    ],
    chakraCost: 3,
    swarmCost: 12,
    rank: 'D',
    difficulty: 45,
  },
  {
    id: 'moth-glow',
    name: 'Moth Glow',
    description: 'The moths light up all together, and the glare makes you giddy.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'confuse', power: 8 },
      { verb: 'drain', power: 5, absorb: true },
    ],
    chakraCost: 5,
    rank: 'D',
    difficulty: 45,
  },
];

/** Every chakra beast's techniques, for each pack's list. */
export const CHAKRA_BEAST_ARTS: readonly TechniqueDef[] = [
  ...WOODS_AND_MOUNTAIN_ARTS,
  ...WATER_ARTS,
  ...DESERT_ARTS,
  ...SWARM_ARTS,
];
