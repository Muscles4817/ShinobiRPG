import type { TechniqueDef } from '@/systems/techniques';

/**
 * More plain sealing craft: a tag that blinds, a volley of tags, barriers drawn in ink, a kunai
 * that bursts, a circle that drinks chakra and a street lined with tags from end to end.
 */
export const FUUINJUTSU_VARIANTS: readonly TechniqueDef[] = [
  {
    id: 'flash-tag',
    name: 'Flash Tag',
    description:
      'A tag inked to burst into white light at arm’s length, which leaves whoever was looking at it blind for a breath.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'daze', power: 7 }],
    chakraCost: 5,
    rank: 'E',
    difficulty: 30,
  },
  {
    id: 'tag-volley',
    name: 'Tag Volley',
    description:
      'Three tags thrown off the fingers one after another, each going off where it lands before the next arrives.',
    discipline: 'fuuinjutsu',
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 13, hits: 3 }],
    chakraCost: 8,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'shoji-barrier',
    name: 'Shoji Barrier',
    description:
      'A screen of sealing script drawn on the air like the paper panes of a sliding door, which takes a blow and tears in your place.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 12 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'blast-kunai',
    name: 'Blast Kunai',
    description:
      'A kunai with a tag wound round the grip, thrown to burst at the chest and throw its target back across the ground.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'damage', power: 16 },
      { verb: 'knock', power: 6, to: 'mid' },
    ],
    chakraCost: 11,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'lamp-oil-circle',
    name: 'Lamp-Oil Circle',
    description:
      'A sealing circle that draws chakra out of whoever stands in it the way a wick draws oil, and feeds it back to you.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'drain', power: 14, absorb: true }],
    chakraCost: 18,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'torii-barrier',
    name: 'Torii Barrier',
    description:
      'A shrine gate of sealing script stands up between you and the attack, and whatever comes through it comes through to nothing.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 15 }],
    chakraCost: 18,
    rank: 'B',
    needs: { control: 'C' },
    difficulty: 110,
  },
  {
    id: 'hundred-tag-street',
    name: 'Hundred-Tag Street',
    description:
      'Every eave and doorpost along the field hung with tags in the night, and all of them set off together at your word.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'afflict', power: 6, harm: 'burn' },
    ],
    chakraCost: 30,
    rank: 'A',
    difficulty: 140,
  },
];
