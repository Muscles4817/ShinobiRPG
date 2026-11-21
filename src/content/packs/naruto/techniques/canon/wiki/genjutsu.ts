import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon genjutsu techniques for the versus fighters who use them, drafted from Narutopedia's facts (rank,
 * art, element, range and users; `prototypes/narutopedia/`). The effects are a first reading
 * of what the wiki says each does, for review; the descriptions are our own words.
 */
export const WIKI_GENJUTSU: readonly TechniqueDef[] = [
  {
    id: 'ephemeral',
    name: 'Genjutsu: Ephemeral',
    description:
      'A raised finger, and crows burst from the caster and turn to a storm of shuriken that is not really there.',
    discipline: 'genjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'confuse', power: 14 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
];
