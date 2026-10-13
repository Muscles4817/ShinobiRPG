import type { MissionFill } from '../../../../missionTemplates';
import { C_TEAM_FIELD_FILLS } from './cTeamField';
import { C_TEAM_ROAD_FILLS } from './cTeamRoad';
import { CHUNIN_A_FILLS } from './chuninA';
import { CHUNIN_B_FILLS } from './chuninB';
import { D_CHORES } from './dChores';
import { D_ERRANDS } from './dErrands';
import { D_ESCORT } from './dEscort';
import { D_ROAD } from './dRoad';
import { D_TOWN } from './dTown';
import { D_TROUBLE } from './dTrouble';
import { EXEMPLAR_FILLS } from './exemplars';

/** Every filled job: a client, a place and foes poured into one of the templates. */
export const MISSION_FILLS: readonly MissionFill[] = [
  ...EXEMPLAR_FILLS,
  ...D_CHORES,
  ...D_ERRANDS,
  ...D_TOWN,
  ...D_TROUBLE,
  ...D_ROAD,
  ...D_ESCORT,
  ...C_TEAM_ROAD_FILLS,
  ...C_TEAM_FIELD_FILLS,
  ...CHUNIN_B_FILLS,
  ...CHUNIN_A_FILLS,
];
