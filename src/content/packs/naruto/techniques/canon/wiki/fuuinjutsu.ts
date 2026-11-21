import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon fuuinjutsu techniques for the versus fighters who use them, drafted from Narutopedia's facts (rank,
 * art, element, range and users; `prototypes/narutopedia/`). The effects are a first reading
 * of what the wiki says each does, for review; the descriptions are our own words.
 */
export const WIKI_FUUINJUTSU: readonly TechniqueDef[] = [
  {
    id: 'armoured-eye',
    name: 'Barrier Talisman: Armoured Eye',
    description:
      'Talismans worn as earrings fly to cover the eye a blow is aimed at and harden into a barrier.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 12 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'chakra-control-bind',
    name: 'Chakra Control: Bind',
    description:
      'A petal-shaped seal laid on the foe waits until they near a tag, then red threads lash them still.',
    discipline: 'fuuinjutsu',
    reach: ['close'],
    effects: [{ verb: 'trap', power: 12 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'chakra-draining-seal',
    name: 'Chakra Draining Seal',
    description: 'A seal pressed to the foe pulls their chakra out and pours it into the user.',
    discipline: 'fuuinjutsu',
    reach: ['close'],
    effects: [{ verb: 'drain', power: 10, absorb: true }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'fire-sealing-method',
    name: 'Fire Sealing Method',
    description:
      'An open scroll drinks in the flames coming at the user and locks them under a seal.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 14 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'guiding-thunder',
    name: 'Flying Thunder God: Guiding Thunder',
    description:
      'A barrier of formula flares up, and whatever strikes it vanishes, sent somewhere far away.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 18 }],
    chakraCost: 0,
    rank: 'S',
    difficulty: 175,
  },
  {
    id: 'lion-closing-roar',
    name: 'Sealing Technique: Lion Closing Roar',
    description:
      'A formula drawn on the ground flares shut around the foe standing in it, slamming every chakra point closed at once.',
    discipline: 'fuuinjutsu',
    reach: ['close'],
    effects: [{ verb: 'seal', power: 13 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'tiger-vision-bullet',
    name: 'Sealing Technique: Tiger Vision Staring Bullet',
    description:
      'A great inked tiger leaps from the scroll, seizes the foe in its jaws and drags them down flat into the drawing.',
    discipline: 'fuuinjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'pin', power: 12 },
    ],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'self-cursing-seal',
    name: 'Self-Cursing Seal',
    description:
      'A curse mark slipped onto the foe spreads black across their skin at a word, locking their body rigid.',
    discipline: 'fuuinjutsu',
    reach: ['close'],
    effects: [{ verb: 'pin', power: 14 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'hobi',
    name: 'Wood Style: Hōbi Technique',
    description:
      'A wooden dragon’s head snaps shut round its user, and the blast dies against its sealing jaws.',
    discipline: 'fuuinjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    effects: [{ verb: 'substitute', power: 16 }],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
];
