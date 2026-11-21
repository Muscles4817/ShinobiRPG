import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon ninjutsu techniques for the versus fighters who use them, drafted from Narutopedia's facts (rank,
 * art, element, range and users; `prototypes/narutopedia/`). The effects are a first reading
 * of what the wiki says each does, for review; the descriptions are our own words.
 */
export const WIKI_NINJUTSU9: readonly TechniqueDef[] = [
  {
    id: 'smothering-binding',
    name: 'Wood Style: Smothering Binding',
    description: 'Branches race out from an arm and wind round the foe until they cannot move.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    reach: ['close', 'mid'],
    effects: [{ verb: 'pin', power: 16 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'wood-stocks',
    name: 'Wood Style: Stocks',
    description:
      'Wooden stocks snap shut round the foe’s neck and wrists and smother their chakra.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    reach: ['close'],
    effects: [
      { verb: 'pin', power: 14 },
      { verb: 'seal', power: 10 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'top-transformed-buddha',
    name: 'Wood Style: Top Transformed Buddha',
    description:
      'A giant wooden statue unleashes thousands of fists at once, a storm of blows no guard can hold.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    reach: ['close', 'mid'],
    accuracy: 'wild',
    effects: [{ verb: 'area', power: 30, size: 'wide' }],
    chakraCost: 0,
    rank: 'S',
    difficulty: 175,
    oncePerFight: true,
  },
  {
    id: 'wood-spikes-ring',
    name: 'Wood Style: Wood Spikes Ring',
    description:
      'A ring of wood rises round the foe, its spikes pointed in so that any move draws blood.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    reach: ['close'],
    effects: [{ verb: 'pin', power: 14 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'yin-healing-wound-destruction',
    name: 'Yin Healing Wound Destruction',
    description:
      'Reading the blow before it comes, its user starts mending the wound before it is even made.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'heal', power: 22 }],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
];
