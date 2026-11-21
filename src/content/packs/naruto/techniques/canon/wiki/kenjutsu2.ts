import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon kenjutsu techniques for the versus fighters who use them, drafted from Narutopedia's facts (rank,
 * art, element, range and users; `prototypes/narutopedia/`). The effects are a first reading
 * of what the wiki says each does, for review; the descriptions are our own words.
 */
export const WIKI_KENJUTSU2: readonly TechniqueDef[] = [
  {
    id: 'wind-vacuum-blade',
    name: 'Wind Style: Vacuum Blade',
    description:
      'Breath blown along a kunai wraps it in a pale green edge that cuts far past the steel.',
    discipline: 'kenjutsu',
    element: 'wind',
    needs: { weapon: 'blade' },
    reach: ['close', 'mid'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 14 }],
    chakraCost: 0,
    rank: 'C',
    difficulty: 80,
    moulded: true,
  },
];
