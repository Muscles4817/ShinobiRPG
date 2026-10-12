import type { MissionTemplate } from '../../../../missionTemplates';
import { A_RANK_JOBS } from './chuninA';
import { B_RANK_JOBS } from './chunin';
import { C_TEAM_ROAD } from './cTeam';
import { C_TEAM_FIELD } from './cTeamField';
import { D_RANK_CHORES } from './dRankChores';
import { D_RANK_ROAD } from './dRankRoad';
import { D_RANK_TOWN } from './dRankTown';
import { D_RANK_TROUBLE } from './dRankTrouble';

/** Every job template in the pack: shapes of work, filled many times over in `../fills`. */
export const MISSION_TEMPLATES: readonly MissionTemplate[] = [
  ...D_RANK_CHORES,
  ...D_RANK_TOWN,
  ...D_RANK_TROUBLE,
  ...D_RANK_ROAD,
  ...C_TEAM_ROAD,
  ...C_TEAM_FIELD,
  ...B_RANK_JOBS,
  ...A_RANK_JOBS,
];
