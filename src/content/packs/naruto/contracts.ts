import type { MissionDef } from '@/systems/missions';
import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef } from '../../contracts';
import { statLine } from '../../statLine';

/**
 * Summoning contracts in the Hidden Leaf: the toads of Mount Myōboku, signed after a job for a
 * lost toad messenger, and Kakashi's ninken, whose scroll he lets a close friend sign.
 */

export const CONTRACT_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'summoning-gamakichi',
    name: 'Summoning: Gamakichi',
    description: 'A small orange toad in a cloud of smoke, already complaining about snacks.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'gamakichi' }],
    chakraCost: 8,
    rank: 'D',
    difficulty: 40,
  },
  {
    id: 'summoning-gamaken',
    name: 'Summoning: Gamaken',
    description: 'A huge, clumsy toad with a shield and a jitte, called with a smear of blood.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'gamaken' }],
    chakraCost: 18,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'summoning-gamabunta',
    name: 'Summoning: Gamabunta',
    description: 'The Toad Boss, pipe and blade and all. He wants a proper meal for his trouble.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'gamabunta' }],
    chakraCost: 34,
    rank: 'A',
    difficulty: 130,
  },
  {
    id: 'summoning-pakkun',
    name: 'Summoning: Pakkun',
    description: 'A small pug in a blue vest, with the best nose in the pack and an opinion.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'pakkun' }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 35,
  },
  {
    id: 'summoning-bull',
    name: 'Summoning: Bull',
    description: 'The biggest of the ninken, a slab of a dog who says nothing and holds on.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: 'bull' }],
    chakraCost: 14,
    rank: 'C',
    difficulty: 70,
  },
  {
    id: 'gamakichi-oil-bullet',
    name: 'Gamakichi’s Oil Bullet',
    description: 'A fat gob of slick oil spat from across the field.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 9 }],
    chakraCost: 3,
    rank: 'E',
    difficulty: 20,
  },
  {
    id: 'toad-jitte-strike',
    name: 'Toad Jitte Strike',
    description: 'A huge jitte swung behind a huge shield.',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 18 }],
    chakraCost: 4,
    rank: 'C',
    difficulty: 60,
  },
  {
    id: 'toad-water-gun',
    name: 'Toad Water Gun',
    description: 'A torrent of water from the Toad Boss, across everyone in his way.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [{ verb: 'area', power: 22, size: 'wide' }],
    chakraCost: 14,
    rank: 'A',
    difficulty: 120,
  },
  {
    id: 'ninken-hold',
    name: 'Ninken Hold',
    description: 'Jaws clamped on a leg that will not let go.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'pin', power: 8 },
    ],
    chakraCost: 4,
    rank: 'D',
    difficulty: 45,
  },
];

const TOADS: ContractDef = {
  id: 'myoboku-toads',
  name: 'The Toads of Mount Myōboku',
  description:
    'A clan of toads, proud and loud, from a mountain no road reaches. They answer whoever signed their scroll, as far as they respect them.',
  summons: [
    {
      id: 'gamakichi',
      name: 'Gamakichi',
      description: 'Small, cheeky and quick, with an oil bullet and opinions about snacks.',
      techniqueId: 'summoning-gamakichi',
      standing: 0,
      stats: statLine('E', { speed: 'D', ninjutsu: 'D', perception: 'D' }),
      healthScale: 0.5,
      maxChakra: 20,
      traits: ['swift'],
      techniqueIds: ['gamakichi-oil-bullet'],
      upkeep: 3,
    },
    {
      id: 'gamaken',
      name: 'Gamaken',
      description: 'Huge and clumsy, a shield on one arm; he wants blood before he will come.',
      techniqueId: 'summoning-gamaken',
      standing: 2,
      stats: statLine('D', { strength: 'C', stamina: 'B', taijutsu: 'C' }),
      healthScale: 3,
      maxChakra: 30,
      traits: ['armoured'],
      techniqueIds: ['toad-jitte-strike'],
      upkeep: 10,
      price: { blood: 8 },
    },
    {
      id: 'gamabunta',
      name: 'Gamabunta',
      description:
        'The Toad Boss. He comes for a proper meal of game, and leaves if there is none.',
      techniqueId: 'summoning-gamabunta',
      standing: 4,
      stats: statLine('C', { strength: 'A', stamina: 'A', ninjutsu: 'B', kenjutsu: 'B' }),
      healthScale: 5,
      maxChakra: 80,
      traits: ['armoured'],
      techniqueIds: ['toad-water-gun', 'toad-jitte-strike'],
      upkeep: 18,
      price: { offeringId: 'wild-game' },
    },
  ],
};

const NINKEN: ContractDef = {
  id: 'kakashi-ninken',
  name: 'Kakashi’s Ninken',
  description:
    'Eight tracking dogs who answer the ninken scroll. They like a quiet summoner and a good scratch behind the ears.',
  summons: [
    {
      id: 'pakkun',
      name: 'Pakkun',
      description: 'A small pug with the best nose in the pack; he fights only when he must.',
      techniqueId: 'summoning-pakkun',
      standing: 0,
      stats: statLine('E', { speed: 'D', perception: 'C', intellect: 'D' }),
      healthScale: 0.4,
      maxChakra: 15,
      traits: ['swift'],
      techniqueIds: ['fang-rush'],
      upkeep: 2,
    },
    {
      id: 'bull',
      name: 'Bull',
      description: 'The biggest of the pack; he bites, and holds, and waits.',
      techniqueId: 'summoning-bull',
      standing: 2,
      stats: statLine('D', { strength: 'C', stamina: 'C', taijutsu: 'C' }),
      healthScale: 1.6,
      maxChakra: 20,
      traits: ['brawler'],
      techniqueIds: ['ninken-hold', 'fang-rush'],
      upkeep: 6,
    },
  ],
};

export const CONTRACTS: readonly ContractDef[] = [TOADS, NINKEN];

/** A lost toad messenger: see it home safe, and the toads offer you their scroll. */
export const TOAD_MISSION: MissionDef = {
  id: 'toad-on-the-doorstep',
  title: 'A Toad on the Doorstep',
  rank: 'D',
  client: 'A Lost Toad',
  summary: 'A talking toad with a scroll on its back is asking the gate guards for directions.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 70, reputation: 3, contractId: 'myoboku-toads' },
  minMissionsCompleted: 4,
  stages: [
    {
      kind: 'narrative',
      text: '“Name’s Gamatatsu,” says the toad, through a mouthful of sweets. “I’m lost. Big brother’s going to kill me.”',
    },
    {
      kind: 'check',
      text: 'He has to be back at the old shrine in the forest before the moon is up, and he cannot remember the way.',
      approaches: [
        { label: 'Carry him at a run', stat: 'speed', difficulty: 8 },
        { label: 'Read the trail he came by', stat: 'perception', difficulty: 9 },
      ],
      success:
        'You reach the shrine as the moon clears the trees. Gamatatsu bows, and a scroll as long as you are tall unrolls at your feet.',
      failure:
        'You get there late and covered in mud, but you get there. The scroll unrolls at your feet anyway.',
      onFailure: 'penalty',
      failureDamage: 3,
    },
  ],
};
