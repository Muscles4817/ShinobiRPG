import type { TechniqueDef } from '@/systems/techniques';

/** Canon weapon-scroll arts, Tenten's in the anime, on the village's shelves. */
export const CANON_TOOL_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'exploding-dragon-strike',
    name: 'Exploding Dragon Strike',
    description: 'A flaming dragon let out of a scroll, which explodes when it reaches them.',
    discipline: 'fuuinjutsu',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'area', power: 18 },
      { verb: 'afflict', power: 6, harm: 'burn' },
    ],
    chakraCost: 16,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'heavenly-chain-disaster',
    name: 'Manipulated Tools: Heavenly Chain Disaster',
    description: 'Twin Rising Dragons made greater: chains of blades pour down from the scrolls.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [{ verb: 'damage', power: 22, hits: 4 }],
    chakraCost: 15,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'segmented-iron-dome',
    name: 'Unsealing Technique: Segmented Iron Dome',
    description: 'An iron dome unsealed from a scroll, closing over you before the blow lands.',
    discipline: 'fuuinjutsu',
    effects: [{ verb: 'substitute', power: 12 }],
    chakraCost: 10,
    rank: 'C',
    difficulty: 75,
  },
];
