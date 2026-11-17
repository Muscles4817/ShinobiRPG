import type { TechniqueDef } from '@/systems/techniques';

import type { GearDef } from '../../../../types';

/**
 * Arts of the Fourth Hokage's generation beyond the pack's: Minato's Contract Seal, Kushina's
 * chains driven through a body or raised as a barrier, and the White Fang's chakra sabre. Sakumo's cut has no name of its
 * own in canon; it is his sabre's white trail, written as a chakra-flow strike.
 */
export const FOURTH_ARTS: readonly TechniqueDef[] = [
  {
    id: 'contract-seal',
    name: 'Contract Seal',
    description:
      'A palm slammed on the body with the formula already burning in it, and whatever contract held them is cut away.',
    discipline: 'fuuinjutsu',
    reach: ['close'],
    accuracy: 'sure',
    effects: [
      { verb: 'seal', power: 24 },
      { verb: 'damage', power: 10 },
    ],
    chakraCost: 22,
    rank: 'S',
    difficulty: 175,
  },
  {
    id: 'adamantine-chain-barrier',
    name: 'Adamantine Sealing Chains: Barrier',
    description:
      'The chains drive into the ground round her and lock into a wall that held the Nine-Tails.',
    discipline: 'fuuinjutsu',
    clan: 'uzumaki',
    effects: [{ verb: 'substitute', power: 18 }],
    chakraCost: 18,
    rank: 'S',
    difficulty: 170,
  },
  {
    id: 'adamantine-chain-impalement',
    name: 'Adamantine Sealing Chains: Impalement',
    description:
      'The chains come out of her back like spears and go through, and what they go through can’t move its chakra.',
    discipline: 'fuuinjutsu',
    clan: 'uzumaki',
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'damage', power: 22 },
      { verb: 'seal', power: 12 },
    ],
    chakraCost: 20,
    rank: 'S',
    difficulty: 170,
  },
  {
    id: 'white-light-cut',
    name: 'White Light Cut',
    description:
      'Chakra run through the White Light Chakra Sabre leaves a white trail in the air, and the cut is through before it fades.',
    discipline: 'kenjutsu',
    moulded: true,
    accuracy: 'sure',
    needs: { weapon: 'blade', control: 'B' },
    effects: [
      { verb: 'break', power: 26, scaling: { drive: ['kenjutsu', 'chakraControl'] } },
      { verb: 'afflict', power: 7, harm: 'bleed' },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 140,
  },
];

export const FOURTH_GEAR: readonly GearDef[] = [
  {
    id: 'white-light-chakra-sabre',
    name: 'White Light Chakra Sabre',
    description:
      'Sakumo Hatake’s short sword, which glows white with the chakra run through it. His son carried it after him.',
    kind: 'weapon',
    weaponClass: 'light-blade',
    rank: 'A',
    unique: true,
    effects: ['sunder'],
    cost: 0,
    icon: 'sword',
  },
];
