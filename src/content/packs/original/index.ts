import type { ContentPack } from '../../types';
import { BUILDS } from '../../shared/builds';
import { TALENTS } from '../../shared/talents';
import { TRAITS } from '../../shared/traits';
import { UPBRINGINGS } from '../../shared/upbringings';
import { CLAN_TECHNIQUES } from './clanTechniques';
import { CLANS } from './clans';
import { COMBO_TECHNIQUES } from './comboTechniques';
import { ENEMIES } from './enemies';
import { FOODS } from './food';
import { SEASONAL_FOODS } from './seasonalFood';
import { JOB_ENEMIES, TEMPLATE_MISSIONS } from './jobs';
import { MISSIONS } from './missions';
import { TEAM_MISSIONS } from './teamMissions';
import { GENERIC_CONVERSATIONS } from '../../shared/conversations';
import { SHARED_TOPICS, TEMPLATE_CONVERSATIONS } from '../../shared/talk';
import { COOKBOOKS, INGREDIENTS } from '../../shared/kitchen';
import { RECIPES } from '../../shared/recipes';
import { CAMP_FINDS, WILD_INGREDIENTS } from '../../shared/wilds';
import { TOROGAKURE_COOKBOOKS, TOROGAKURE_INGREDIENTS } from './kitchen';
import { TOROGAKURE_RECIPES } from './recipes';
import { VILLAGE_COOKS } from './villagers';
import { GEAR } from './gear';
import { INJURIES } from '../../shared/injuries';
import { TOOLS } from '../../shared/tools';
import { ENCOUNTERS } from '../../shared/encounters';
import { ROAD_EVENTS } from '../../shared/road/events';
import { VOICES } from '../../shared/talk/voices';
import { EXAM_ENCOUNTERS } from '../../shared/examEncounters';
import { CHUNIN_ENEMIES, CHUNIN_MISSIONS } from './chuninMissions';
import { EXAM_ENEMIES, EXAM_MISSIONS, EXAMS } from './exam';
import { ORIGINAL_CONVERSATIONS } from './conversations';
import { CLAN_TOPICS } from './talk';
import { CLAN_HEADS } from './clanHeads';
import { VILLAGE_CHUNIN } from './chunin';
import { GENIN } from './genin';
import { VILLAGE_JONIN } from './jonin';
import { ROSTER_CONVERSATIONS } from './rosterConversations';
import { ROSTER_TECHNIQUES } from './rosterTechniques';
import { SENSEIS_AND_ELDERS } from './people';
import { ACADEMY_TECHNIQUES, BREAK_IN, DISCIPLINE_STARTERS, NAMES, NINDOS, TEAM } from './profile';
import { SENSEI_TECHNIQUES } from './senseiTechniques';
import { TECHNIQUES } from './techniques';
import { TRAINING } from './training';
import { VILLAGE } from './village';
import { LANTERN_THIEF, LANTERN_THIEF_JOBS } from './arcs/lanternThief';
import { ORIGINAL_LOCATIONS, ORIGINAL_TEXT } from './world';

/** The game's own setting: Tōrōgakure in the Land of Embers. Safe to ship publicly. */
export const ORIGINAL_PACK: ContentPack = {
  id: 'original',
  name: 'Land of Embers',
  description: 'Tōrōgakure, the Village Hidden Among Lanterns. The game’s own world.',
  startLocationId: 'torogakure',
  startingRyo: 300,
  text: ORIGINAL_TEXT,
  locations: ORIGINAL_LOCATIONS,
  techniques: [
    ...TECHNIQUES,
    ...CLAN_TECHNIQUES,
    ...SENSEI_TECHNIQUES,
    ...ROSTER_TECHNIQUES,
    ...COMBO_TECHNIQUES,
  ],
  missions: [
    ...MISSIONS,
    ...LANTERN_THIEF_JOBS,
    ...TEAM_MISSIONS,
    ...CHUNIN_MISSIONS,
    ...TEMPLATE_MISSIONS,
    ...EXAM_MISSIONS,
  ],
  exams: EXAMS,
  encounters: [...ENCOUNTERS, ...EXAM_ENCOUNTERS],
  roadEvents: ROAD_EVENTS,
  arcs: [LANTERN_THIEF],
  voices: VOICES,
  enemies: [...ENEMIES, ...CHUNIN_ENEMIES, ...JOB_ENEMIES, ...EXAM_ENEMIES],
  training: TRAINING,
  foods: [...FOODS, ...SEASONAL_FOODS],
  clans: CLANS,
  builds: BUILDS,
  upbringings: UPBRINGINGS,
  talents: TALENTS,
  traits: TRAITS,
  nindos: NINDOS,
  breakIn: BREAK_IN,
  gear: GEAR,
  tools: TOOLS,
  injuries: INJURIES,
  ingredients: [...INGREDIENTS, ...WILD_INGREDIENTS, ...TOROGAKURE_INGREDIENTS],
  recipes: [...RECIPES, ...TOROGAKURE_RECIPES],
  cookbooks: [...COOKBOOKS, ...TOROGAKURE_COOKBOOKS],
  campFinds: CAMP_FINDS,
  people: [
    ...VILLAGE_COOKS,
    ...SENSEIS_AND_ELDERS,
    ...GENIN,
    ...VILLAGE_JONIN,
    ...CLAN_HEADS,
    ...VILLAGE_CHUNIN,
  ],
  conversations: [
    ...GENERIC_CONVERSATIONS,
    ...TEMPLATE_CONVERSATIONS,
    ...ORIGINAL_CONVERSATIONS,
    ...ROSTER_CONVERSATIONS,
  ],
  conversationTopics: [...SHARED_TOPICS, ...CLAN_TOPICS],
  names: NAMES,
  team: TEAM,
  village: VILLAGE,
  academyTechniques: ACADEMY_TECHNIQUES,
  disciplineStarters: DISCIPLINE_STARTERS,
};
