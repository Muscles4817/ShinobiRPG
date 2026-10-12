import type { MissionFill } from '../../../../missionTemplates';
import { EXEMPLARS_CHUNIN } from './exemplarsChunin';
import { EXEMPLARS_TEAM } from './exemplarsTeam';
import { EXEMPLARS_TOWN } from './exemplarsTown';
import { EXEMPLARS_TROUBLE } from './exemplarsTrouble';

/** One finished job per template, written first to show what a good fill of it reads like. */
export const EXEMPLAR_FILLS: readonly MissionFill[] = [
  ...EXEMPLARS_TOWN,
  ...EXEMPLARS_TROUBLE,
  ...EXEMPLARS_TEAM,
  ...EXEMPLARS_CHUNIN,
];
