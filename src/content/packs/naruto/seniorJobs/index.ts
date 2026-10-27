import type { MissionDef } from '@/systems/missions';

import { HYUGA_TAKEN, MIST_DEFECTOR, SAND_WATCHERS } from './aRankBorders';
import { ENVOY_NIGHT, OTAFUKU_TRAITOR, STONE_CACHE } from './aRankTowns';
import { CLOUD_DELEGATION, STONE_SURVEYORS } from './borderShinobi';
import { BOUNTY_STATION, OTAFUKU_PAWN, TAX_SILVER } from './borderTowns';
import { RIVERS_ORPHANS, SPICE_RUNNERS } from './sandAndRivers';
import { CLOUD_PAIR, MIST_SWORD_FOR_HIRE, SWORD_SAINT } from './sRank';
import { STEPS_TOLL, TEMPLE_SUTRA } from './templeAndSteps';
import { FOREST_POACHERS, PIRATES_AT_THE_BRIDGE, REFUGEES_AT_THE_WAVES } from './waterAndWild';

/**
 * The Leaf's senior work: B-rank jobs for chūnin, A-rank for jōnin (or chūnin under one) and
 * S-rank for jōnin with a squad, out along the map's roads to the towns, borders and wild
 * country around the Fire Country. All of them are posted at the mission desk.
 */
export const SENIOR_MISSIONS: readonly MissionDef[] = [
  PIRATES_AT_THE_BRIDGE,
  FOREST_POACHERS,
  STEPS_TOLL,
  STONE_SURVEYORS,
  OTAFUKU_PAWN,
  REFUGEES_AT_THE_WAVES,
  TAX_SILVER,
  TEMPLE_SUTRA,
  BOUNTY_STATION,
  SPICE_RUNNERS,
  CLOUD_DELEGATION,
  RIVERS_ORPHANS,
  ENVOY_NIGHT,
  HYUGA_TAKEN,
  OTAFUKU_TRAITOR,
  SAND_WATCHERS,
  STONE_CACHE,
  MIST_DEFECTOR,
  MIST_SWORD_FOR_HIRE,
  CLOUD_PAIR,
  SWORD_SAINT,
];
