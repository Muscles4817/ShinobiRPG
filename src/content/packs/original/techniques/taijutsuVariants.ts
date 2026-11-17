import type { TechniqueDef } from '@/systems/techniques';

/**
 * More plain taijutsu, so a striker's repertoire and chains have real choices at every grade:
 * a quick flurry and a jab to open with, knees that daze, catches that turn a blow back, throws
 * that send a foe far or reel them in, and at the top a drum-roll finisher and a river throw.
 * All of them are body moves, paid in breath.
 */
export const TAIJUTSU_VARIANTS: readonly TechniqueDef[] = [
  {
    id: 'twin-knuckle',
    name: 'Twin Knuckle',
    description:
      'Two short punches thrown on one breath, the second already on its way before the first lands.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 11, hits: 2 }],
    chakraCost: 3,
    rank: 'E',
    difficulty: 25,
  },
  {
    id: 'doorstep-jab',
    name: 'Doorstep Jab',
    description:
      'A straight jab from a standing start, the kind a doorman throws before the drunk has finished talking.',
    discipline: 'taijutsu',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 9 }],
    chakraCost: 2,
    rank: 'E',
    difficulty: 25,
  },
  {
    id: 'bridge-knee',
    name: 'Bridge Knee',
    description:
      'Pull their head down by the collar and bring a knee up to meet it, as the canal boys settle things under the bridges.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 12 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 6,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'catch-and-turn',
    name: 'Catch and Turn',
    description:
      'Wait with open hands for their blow, catch the wrist as it comes and turn its weight back into them.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [{ verb: 'counter', power: 12 }],
    chakraCost: 5,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'roof-runner-flurry',
    name: 'Roof-Runner Flurry',
    description:
      'Three quick blows thrown while moving, the way the night runners fight on a ridge where nobody can stand still.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 14, hits: 3 }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'millstone-throw',
    name: 'Millstone Throw',
    description:
      'Turn them over your hip like a sack off the miller’s cart and let go at the top, so they land well out of reach.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 14 },
      { verb: 'knock', power: 8, to: 'far' },
    ],
    chakraCost: 8,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'gatepost-guard',
    name: 'Gatepost Guard',
    description:
      'Stand planted like the gatepost at the lantern bridge and answer the next blow with a harder one of your own.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [{ verb: 'counter', power: 16 }],
    chakraCost: 8,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'reeling-hook',
    name: 'Reeling Hook',
    description:
      'Hook a hand behind their neck from half a stride off and haul them in onto a short punch, the way a boatman lands a heavy catch.',
    discipline: 'taijutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'knock', power: 8, to: 'close' },
      { verb: 'damage', power: 12 },
    ],
    chakraCost: 7,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'nerve-point-tap',
    name: 'Nerve-Point Tap',
    description:
      'Two fingers driven into the soft places a physician learns first, which leave an arm hanging or a knee folding.',
    discipline: 'taijutsu',
    accuracy: 'sure',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'daze', power: 14 },
    ],
    chakraCost: 10,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'waterwheel-kick',
    name: 'Waterwheel Kick',
    description:
      'A turning kick that comes round twice like the mill wheel at the river gate and sends them back a few strides.',
    discipline: 'taijutsu',
    accuracy: 'wild',
    effects: [
      { verb: 'damage', power: 22, hits: 2 },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'festival-drum',
    name: 'Festival Drum',
    description:
      'Fists on a reeling foe like sticks on the great drum of the lantern festival, faster and faster until the beat stops.',
    discipline: 'taijutsu',
    // A drum-roll of blows nobody standing ready would take: it waits for an opening.
    needsTarget: 'open',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 30, hits: 5 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'river-turning-throw',
    name: 'River-Turning Throw',
    description:
      'Take their charge as the bend takes the river, turn it all the way round, and throw them clear across the field.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 22 },
      { verb: 'knock', power: 10, to: 'far' },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
];
