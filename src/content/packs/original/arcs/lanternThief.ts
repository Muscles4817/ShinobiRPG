import type { ArcDef, MissionDef } from '@/systems/missions';

import { REED_KILN, RELIT } from './lanternThiefEnd';
import { DARK_WALL, NIGHT_MARKET, RIVER_VILLAGES } from './lanternThiefStart';

/**
 * The Lantern Thief: the first long story. Lanterns vanish from the old wall; the trail runs
 * to the river villages and the night market; at a kiln hidden in the reeds smugglers melt the
 * glass down, and the boy feeding their furnace is Tobi, the lamplighter's son; and when the
 * wall is lit again, what happens to him is yours to say. Told over weeks, between everything
 * else, in acts that follow the story circle.
 */

export const LANTERN_THIEF_JOBS: readonly MissionDef[] = [
  DARK_WALL,
  RIVER_VILLAGES,
  NIGHT_MARKET,
  REED_KILN,
  RELIT,
];

export const LANTERN_THIEF: ArcDef = {
  id: 'the-lantern-thief',
  title: 'The Lantern Thief',
  summary: 'Lanterns are vanishing from the old wall, and nobody knows where they go.',
  acts: [
    {
      beats: ['you', 'need'],
      title: 'The dark stretch',
      text: 'Forty lanterns gone from the old wall in a month. The Watch wants to know where.',
      jobs: [DARK_WALL.id],
    },
    {
      beats: ['go', 'search'],
      title: 'Following the glass',
      text: 'Somebody upriver is buying the village’s light. Ask along the river, and look for the glass at the night market.',
      jobs: [RIVER_VILLAGES.id, NIGHT_MARKET.id],
    },
    {
      beats: ['find', 'take'],
      title: 'The kiln in the reeds',
      text: 'The smugglers melt the glass at a kiln out in the reeds, and a boy feeds their fire.',
      jobs: [REED_KILN.id],
    },
    {
      beats: ['return', 'change'],
      title: 'The wall relit',
      text: 'The wall needs its lanterns back, and the lamplighter needs to know what becomes of her son.',
      jobs: [RELIT.id],
    },
  ],
  recommends: {
    personId: 'suzu',
    words:
      'Suzu of the Night Watch stands at the {leader}’s shoulder, the Watch’s report on the old wall in her hand. “{you} followed the glass upriver, walked into the kiln, and brought the light home. The Watch asks for this one.” The {leader} nods. “Kneel, and stand up a chūnin.”',
  },
};
