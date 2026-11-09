import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonArsenal, PersonDef } from '../../../types';

/**
 * Jiraiya of the Sannin, the Toad Sage. No prodigy: a loud, stubborn boy who found the toads'
 * scroll and grew strong with it, so he fights by summoning, on reserves deep enough to keep the
 * mountain's toads out all fight (`arsenal.summons`, called from the kit: `plan/calling.ts`).
 * Against anyone worth it he calls the two Great Sage Toads, has a big toad carry him (or hides)
 * while he meditates into Sage Mode (`plan/meditation.ts`), and the elders perch on his
 * shoulders to keep it going (`plan/perching.ts`); then the Sage Arts. A toad hurt badly enough
 * goes home and won't come back that fight, so he sends them home before that and calls another.
 * Versus only for now (`ContentPack.duelists`).
 */

const SAGE_MODE = { ladder: 'sage', step: 1 } as const;
const SAGE_TOADS = ['fukasaku', 'shima'];

export const JIRAIYA_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'jiraiya-sage-mode',
    name: 'Sage Mode',
    description:
      'With the two sage toads beside him he sits perfectly still and draws in the natural energy of the world. Warts and a toad’s nose come with it; he hates that part.',
    discipline: 'ninjutsu',
    needsCalls: SAGE_TOADS,
    effects: [
      {
        verb: 'empower',
        power: 1,
        boosts: ['strength', 'speed', 'stamina', 'perception', 'taijutsu', 'ninjutsu'],
        opens: SAGE_MODE,
        still: true,
      },
    ],
    chakraCost: 20,
    rank: 'S',
    difficulty: 180,
  },
  {
    id: 'swamp-of-the-underworld',
    name: 'Earth Style: Swamp of the Underworld',
    description:
      'The ground under the enemy turns to a bottomless bog that swallows them to the waist.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [
      { verb: 'area', power: 14, size: 'wide' },
      { verb: 'pin', power: 14 },
    ],
    chakraCost: 22,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'toad-mouth-bind',
    name: 'Summoning: Toad Mouth Bind',
    description:
      'Not a toad but the inside of one. The walls of a great toad’s gullet close over the ground, and whoever is caught sinks into the flesh.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'pin', power: 18 },
      { verb: 'afflict', power: 8, harm: 'poison' },
    ],
    chakraCost: 24,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'needle-jizo',
    name: 'Ninja Art: Needle Jizō',
    description: 'His long white hair wraps round him and hardens into a ball of needles.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'substitute', power: 10 }],
    chakraCost: 10,
    rank: 'B',
    difficulty: 95,
  },
  {
    id: 'wild-lions-mane',
    name: 'Ninja Art: Wild Lion’s Mane',
    description: 'His hair lashes out, wraps the foe and squeezes.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'pin', power: 12 },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 100,
  },
  {
    id: 'sage-art-frog-kumite',
    name: 'Sage Art: Frog Kumite',
    description:
      'Natural energy reaches past his fists. Dodge by a hair and the blow lands anyway.',
    discipline: 'taijutsu',
    moulded: true,
    needsOpen: SAGE_MODE,
    reach: ['close', 'mid'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 24 }],
    chakraCost: 12,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'sage-art-hair-needle-senbon',
    name: 'Sage Art: Hair Needle Senbon',
    description: 'A storm of needles fired from hair hardened with natural energy.',
    discipline: 'ninjutsu',
    needsOpen: SAGE_MODE,
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 28, hits: 5 }],
    chakraCost: 16,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'sage-art-big-ball-rasengan',
    name: 'Sage Art: Big Ball Rasengan',
    description: 'A Rasengan swollen with natural energy, as big as he is, driven into the foe.',
    discipline: 'ninjutsu',
    needsOpen: SAGE_MODE,
    reach: ['close'],
    effects: [
      { verb: 'break', power: 36, scaling: { drive: ['ninjutsu', 'chakraControl'] } },
      { verb: 'daze', power: 10 },
    ],
    chakraCost: 26,
    rank: 'S',
    difficulty: 170,
  },
  {
    id: 'sage-art-goemon',
    name: 'Sage Art: Goemon',
    description:
      'Fukasaku’s wind, Shima’s oil and his own fire, thrown together into a river of boiling oil across the field.',
    discipline: 'ninjutsu',
    element: 'fire',
    needsOpen: SAGE_MODE,
    needsCalls: SAGE_TOADS,
    effects: [
      { verb: 'area', power: 30, size: 'wide' },
      { verb: 'afflict', power: 10, harm: 'burn' },
    ],
    chakraCost: 30,
    rank: 'S',
    difficulty: 175,
  },
  {
    id: 'sage-art-gamarinsho',
    name: 'Sage Art: Demonic Illusion: Gamarinshō',
    description:
      'The two sage toads on his shoulders sing their duet. Whoever hears it stands frozen in a cage of toads, their chakra stilled, their mind gone.',
    discipline: 'ninjutsu',
    needsOpen: SAGE_MODE,
    needsCalls: SAGE_TOADS,
    effects: [
      { verb: 'daze', power: 22 },
      { verb: 'seal', power: 14 },
      { verb: 'confuse', power: 12 },
    ],
    chakraCost: 28,
    rank: 'S',
    difficulty: 175,
    oncePerFight: true,
  },
];

const JIRAIYA_ARSENAL: PersonArsenal = {
  techniqueIds: [
    'jiraiya-sage-mode',
    'sage-art-big-ball-rasengan',
    'sage-art-goemon',
    'sage-art-frog-kumite',
    'sage-art-hair-needle-senbon',
    'sage-art-gamarinsho',
    'rasengan',
    'toad-oil-flame-bullet',
    'swamp-of-the-underworld',
    'toad-mouth-bind',
    'food-cart-destroyer',
    'wild-lions-mane',
    'needle-jizo',
    'transparent-escape',
    'shadow-clone',
  ],
  summons: ['gamakichi', 'gamaken', 'gamahiro', 'gamabunta', 'fukasaku', 'shima'],
};

export const JIRAIYA: PersonDef = {
  id: 'jiraiya',
  name: 'Jiraiya',
  familyName: '',
  pronouns: 'he',
  role: 'shinobi',
  title: 'The Toad Sage',
  rank: 'kage',
  // No genius: what he has is reserves, stubbornness, a spymaster's head and the toads.
  stats: statLine(24, {
    ninjutsu: 40,
    fuuinjutsu: 36,
    taijutsu: 28,
    genjutsu: 8,
    kenjutsu: 8,
    chakraControl: 34,
    reserves: 52,
    strength: 22,
    speed: 18,
    stamina: 30,
    intellect: 38,
    perception: 32,
    willpower: 42,
  }),
  traitIds: ['brash', 'kind'],
  appearance: look(
    'long',
    { hair: '#ece6da', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#5a7a4a' },
    'forehead',
    { shape: 'square', figure: 'broad', expression: 'grin', age: 'grown' },
  ),
  specialty: 'ninjutsu',
  bio: 'One of the Leaf’s three Sannin, a spymaster, and the author of some very popular, very bad novels. He was the slowest of his team until the toads took him in.',
  schedule: { morning: null, afternoon: null, evening: null, night: null },
  arsenal: JIRAIYA_ARSENAL,
};
