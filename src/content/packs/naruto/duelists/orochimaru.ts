import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef } from '../../../contracts';
import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonArsenal, PersonDef } from '../../../types';

/**
 * Orochimaru of the Sannin as he stood on the roof at the invasion (Part 1): snakes from the
 * sleeves, a body he sheds like a skin, and the Impure World Reanimation, which calls the First
 * and Second Hokage back as bodies of his mind (`docs/design/retinue-plan.md` step 6). The
 * Reanimation is a contract no one signs, kept by him alone (`validateContracts.ts`): its two
 * bodies answer as `shared`, think with his wits and go for his mark, and he raises one that
 * falls (`raises`), so the answer is a seal laid on them as they fall, or Orochimaru himself.
 * Versus only for now (`ContentPack.duelists`).
 */

const FIRST = 'reanimated-first';
const SECOND = 'reanimated-second';

export const OROCHIMARU_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'impure-world-reanimation',
    name: 'Summoning: Impure World Reanimation',
    description:
      'Two coffins rise out of the roof. Their lids fall, and the First and Second Hokage step out with dead eyes and his tags in their skulls.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'summon', power: 1, call: FIRST },
      { verb: 'summon', power: 1, call: SECOND },
    ],
    chakraCost: 40,
    rank: 'S',
    difficulty: 190,
    oncePerFight: true,
  },
  {
    id: 'striking-shadow-snakes',
    name: 'Striking Shadow Snakes',
    description:
      'A fistful of snakes lunges from his sleeve and bites from further off than it looks.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 16, hits: 3 }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'five-pronged-seal',
    name: 'Five Pronged Seal',
    description:
      'Five fingertips burning with chakra driven into the belly, and the chakra in there twists shut.',
    discipline: 'fuuinjutsu',
    reach: ['close'],
    effects: [
      { verb: 'seal', power: 18 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'wood-release-deep-forest',
    name: 'Wood Release: Birth of Dense Woodland',
    description: 'Trees burst up through the roof tiles and wind round everything in reach.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'area', power: 22, size: 'wide' },
      { verb: 'pin', power: 16 },
    ],
    chakraCost: 30,
    rank: 'S',
    difficulty: 180,
  },
  {
    id: 'water-formation-wall',
    name: 'Water Release: Water Formation Wall',
    description: 'A wall of water rises from nowhere, on a roof with no water on it.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [{ verb: 'substitute', power: 14 }],
    chakraCost: 16,
    rank: 'A',
    difficulty: 130,
  },
];

const HOKAGE_UPKEEP = 6;

/** Part 1's Reanimation: the bodies held back by his restraint, short of what they were alive. */
export const REANIMATION: ContractDef = {
  id: 'impure-world',
  name: 'The Impure World Reanimation',
  description:
    'Not a clan but a forbidden seal: the dead called back into bodies of dust and paper, with no will but the caster’s.',
  summons: [
    {
      id: FIRST,
      name: 'Reanimated First Hokage',
      description: 'Hashirama Senju, dead eyes and cracked skin, held to his summoner’s will.',
      techniqueId: 'impure-world-reanimation',
      standing: 0,
      stats: statLine(26, {
        ninjutsu: 36,
        taijutsu: 30,
        chakraControl: 32,
        strength: 24,
        speed: 22,
        stamina: 32,
        perception: 30,
        willpower: 20,
        genjutsu: 12,
        kenjutsu: 12,
        fuuinjutsu: 20,
        reserves: 40,
      }),
      healthScale: 1,
      maxChakra: 400,
      techniqueIds: ['wood-release-deep-forest'],
      upkeep: HOKAGE_UPKEEP,
      shared: true,
    },
    {
      id: SECOND,
      name: 'Reanimated Second Hokage',
      description: 'Tobirama Senju, fast and cold even dead, a water wall where there is no water.',
      techniqueId: 'impure-world-reanimation',
      standing: 0,
      stats: statLine(26, {
        ninjutsu: 34,
        taijutsu: 30,
        chakraControl: 32,
        strength: 20,
        speed: 28,
        stamina: 28,
        perception: 32,
        willpower: 20,
        genjutsu: 14,
        kenjutsu: 18,
        fuuinjutsu: 24,
        reserves: 38,
      }),
      healthScale: 1,
      maxChakra: 360,
      techniqueIds: ['water-dragon-bullet', 'water-formation-wall'],
      upkeep: HOKAGE_UPKEEP,
      shared: true,
    },
  ],
};

const OROCHIMARU_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'striking-shadow-snakes',
    'hidden-shadow-snake-hands',
    'binding-snake-glare',
    'five-pronged-seal',
    'orochimaru-body-replacement',
  ],
  // The Reanimation's bodies are of his mind; he raises one that falls, unless it is sealed.
  perks: ['raises'],
  summons: [FIRST, SECOND],
};

export const OROCHIMARU: PersonDef = {
  id: 'orochimaru',
  name: 'Orochimaru',
  familyName: '',
  pronouns: 'he',
  role: 'shinobi',
  title: 'The Snake Sannin',
  rank: 'kage',
  // A genius by any measure, and sure of it; his arms already weakening from the seal to come.
  stats: statLine(26, {
    ninjutsu: 44,
    fuuinjutsu: 38,
    genjutsu: 30,
    taijutsu: 30,
    kenjutsu: 32,
    chakraControl: 40,
    reserves: 46,
    strength: 18,
    speed: 26,
    stamina: 28,
    intellect: 46,
    perception: 36,
    willpower: 40,
  }),
  traitIds: ['proud', 'cunning'],
  appearance: look(
    'long',
    { hair: '#14161a', eyes: '#c9a43a', skin: '#e9e2d6', outfit: '#6a5a7a' },
    'forehead',
    { shape: 'long', figure: 'slight', expression: 'smirk', age: 'grown' },
  ),
  specialty: 'ninjutsu',
  bio: 'One of the Leaf’s three Sannin, who left it to chase every technique there is. He came back for the chūnin exams wearing a Sound jōnin’s face.',
  schedule: { morning: null, afternoon: null, evening: null, night: null },
  arsenal: OROCHIMARU_ARSENAL,
};
