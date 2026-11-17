import type { TechniqueDef } from '@/systems/techniques';

/**
 * The Stone's arts: Ōnoki's dust, which takes things apart, and his way with weight; his
 * granddaughter's quicklime and Akatsuchi's golem; and the lava and steam of the Four- and
 * Five-Tails' hosts. Dust Release joins three natures and stands outside the elemental cycle,
 * so it carries no element here.
 */
export const STONE_ARTS: readonly TechniqueDef[] = [
  {
    id: 'dust-detachment',
    name: 'Dust Release: Detachment of the Primitive World',
    description:
      'A small white shape between the hands grows into a beam, and whatever it closes on comes apart to the last speck.',
    discipline: 'ninjutsu',
    reach: ['mid', 'far'],
    needs: { minReserves: 30, control: 'S' },
    effects: [{ verb: 'break', power: 38 }],
    chakraCost: 45,
    rank: 'S',
    difficulty: 190,
  },
  {
    id: 'lightened-boulder',
    name: 'Earth Release: Lightened Boulder',
    description:
      'He makes himself weightless and takes to the air. It is lifting things afterwards that ruins his back.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [
      {
        verb: 'empower',
        power: 10,
        boosts: ['speed'],
        afterCost: { kind: 'injury', stat: 'stamina', amount: 2, days: 3 },
      },
      { verb: 'move', power: 8, to: 'far' },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'weighted-boulder',
    name: 'Earth Release: Weighted Boulder',
    description: 'A touch, and they weigh as much as a boulder. They go down and stay there.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'pin', power: 22 },
      { verb: 'damage', power: 10 },
    ],
    chakraCost: 20,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'quicklime-congealing',
    name: 'Lava Release: Quicklime Congealing',
    description: 'Quicklime spat from the mouth sets hard as cement around whatever it lands on.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'pin', power: 20 },
      { verb: 'damage', power: 8 },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'earth-golem',
    name: 'Earth Release: Golem',
    description:
      'A golem of rock heaves itself out of the ground and swings at whatever is nearest.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [{ verb: 'clone', power: 12, strikes: true, kind: 'earth' }],
    chakraCost: 16,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'four-tails-lava-cloak',
    name: 'Lava Release Chakra Mode',
    description:
      'The Four-Tails’ chakra comes up as a skin of lava. Whoever hits it burns, and whoever it hits burns more.',
    discipline: 'ninjutsu',
    element: 'fire',
    oncePerFight: true,
    effects: [
      {
        verb: 'empower',
        power: 12,
        boosts: ['strength', 'stamina', 'taijutsu'],
        healthPerExchange: 3,
      },
      { verb: 'counter', power: 12 },
    ],
    chakraCost: 24,
    rank: 'A',
    difficulty: 140,
    afterCost: { kind: 'exhaustion', days: 2 },
  },
  {
    id: 'lava-fist',
    name: 'Lava Release: Lava Fist',
    description: 'A fist run with molten rock. It breaks, and then it burns.',
    discipline: 'taijutsu',
    element: 'fire',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 22 },
      { verb: 'afflict', power: 10, harm: 'burn' },
    ],
    chakraCost: 14,
    rank: 'A',
    difficulty: 130,
  },
  {
    id: 'scorching-stream-rock',
    name: 'Lava Release: Scorching Stream Rock',
    description: 'Gobbets of molten rock spat in a stream, each one hot enough to burn through.',
    discipline: 'ninjutsu',
    element: 'fire',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'damage', power: 22, hits: 3 },
      { verb: 'afflict', power: 8, harm: 'burn' },
    ],
    chakraCost: 20,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'steam-armour',
    name: 'Boil Release: Steam Armour',
    description:
      'The Five-Tails’ steam fills his armour and vents from it, driving every blow like a piston.',
    discipline: 'ninjutsu',
    element: 'water',
    oncePerFight: true,
    effects: [
      {
        verb: 'empower',
        power: 12,
        boosts: ['strength', 'speed', 'taijutsu'],
        healthPerExchange: 3,
      },
    ],
    chakraCost: 22,
    rank: 'A',
    difficulty: 135,
    afterCost: { kind: 'exhaustion', days: 2 },
  },
  {
    id: 'unrivalled-strength',
    name: 'Boil Release: Unrivalled Strength',
    description: 'A kick driven by a jet of scalding steam. It throws them across the field.',
    discipline: 'taijutsu',
    element: 'water',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 26 },
      { verb: 'knock', power: 10, to: 'far' },
      { verb: 'afflict', power: 6, harm: 'burn' },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
];
