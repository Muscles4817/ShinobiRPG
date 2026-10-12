import type { MissionFill } from '../../../../missionTemplates';
import { EXEMPLAR_FILLS } from './exemplars';

/** Every filled job: a client, a place and foes poured into one of the templates. */
export const MISSION_FILLS: readonly MissionFill[] = [...EXEMPLAR_FILLS];
