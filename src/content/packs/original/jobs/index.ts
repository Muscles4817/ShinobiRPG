import { missionsFromTemplates } from '../../../missionTemplates';
import { MISSION_FILLS } from './fills';
import { MISSION_TEMPLATES } from './templates';

export { ELITE_ENEMIES } from './eliteEnemies';
export { JOB_ENEMIES } from './enemies';
export { MISSION_FILLS } from './fills';
export { MISSION_TEMPLATES } from './templates';

/**
 * The jobs made from templates. They join the hand-written missions on the Mission Hall's
 * board and are posted the same way, by rank and record.
 */
export const TEMPLATE_MISSIONS = missionsFromTemplates(MISSION_TEMPLATES, MISSION_FILLS);
