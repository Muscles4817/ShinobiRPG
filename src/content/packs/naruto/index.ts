import type { ContentPack } from '../../types';
import { BUILDS } from '../../shared/builds';
import { EXERCISES } from '../../shared/exercises';
import { CURRICULUM } from '../../shared/sensei/curriculum';
import { SENSEI_TESTS } from '../../shared/sensei/tests';
import { TALENTS } from '../../shared/talents';
import { TRAITS } from '../../shared/traits';
import { UPBRINGINGS } from '../../shared/upbringings';
import { CLAN_TECHNIQUES } from './clanTechniques';
import { CLANS } from './clans';
import { COMBO_TECHNIQUES } from './comboTechniques';
import { ELITE_MISSIONS } from './eliteMissions';
import { ENEMIES } from './enemies';
import { FOODS } from './food';
import { SEASONAL_FOODS } from './seasonalFood';
import { MISSIONS } from './missions';
import { TEAM_MISSIONS } from './teamMissions';
import { GENERIC_CONVERSATIONS } from '../../shared/conversations';
import { SHARED_TOPICS, TEMPLATE_CONVERSATIONS } from '../../shared/talk';
import { COOKBOOKS, INGREDIENTS } from '../../shared/kitchen';
import { RECIPES } from '../../shared/recipes';
import { CAMP_FINDS, WILD_INGREDIENTS } from '../../shared/wilds';
import { GEAR } from './gear';
import { INJURIES } from '../../shared/injuries';
import { TOOLS } from '../../shared/tools';
import { ENCOUNTERS } from '../../shared/encounters';
import { ROAD_EVENTS } from '../../shared/road/events';
import { VOICES } from '../../shared/talk/voices';
import { EXAM_ENCOUNTERS } from '../../shared/examEncounters';
import { CHUNIN_ENEMIES, CHUNIN_MISSIONS } from './chuninMissions';
import { EXAM_ENEMIES, EXAM_MISSIONS, EXAMS } from './exam';
import { NARUTO_CONVERSATIONS } from './conversations';
import {
  CANON_GENIN,
  INSTRUCTORS,
  LEADERS,
  SENIOR_GENIN,
  SENSEIS,
  VILLAGE_CHUNIN,
  VILLAGE_JONIN,
  VILLAGERS,
} from './people';
import { ROSTER_CONVERSATIONS } from './rosterConversations';
import { ROSTER_TECHNIQUES } from './rosterTechniques';
import { ACADEMY_TECHNIQUES, BREAK_IN, DISCIPLINE_STARTERS, NAMES, NINDOS, TEAM } from './profile';
import { SENSEI_TECHNIQUES } from './senseiTechniques';
import { RENAMED_TECHNIQUES } from './techniques/renamed';
import { TECHNIQUES } from './techniques';
import { CANON_TECHNIQUES } from './techniques/canon';
import { TRAINING } from './training';
import { VILLAGE } from './village';
import { NARUTO_LOCATIONS, NARUTO_TEXT } from './world';
import { NARUTO_ROUTES } from './routes';

/**
 * Fan setting using Naruto names, for personal play only. Never ship it in a public
 * release: build with VITE_EXCLUDE_FAN_PACKS=true to drop it from the bundle.
 *
 * Built inside a pure-annotated function: top-level array spreads count as side effects to
 * the bundler, which would otherwise keep this pack's data in a release build.
 */
export const NARUTO_PACK: ContentPack = /*#__PURE__*/ (() => ({
  id: 'naruto',
  name: 'Hidden Leaf (Naruto)',
  description: 'Konohagakure in the Land of Fire, with names from Naruto. Fan pack.',
  startLocationId: 'konohagakure',
  startingRyo: 300,
  text: NARUTO_TEXT,
  locations: NARUTO_LOCATIONS,
  routes: NARUTO_ROUTES,
  exercises: EXERCISES,
  senseiTests: SENSEI_TESTS,
  curriculum: CURRICULUM,
  techniques: [
    ...TECHNIQUES,
    ...CLAN_TECHNIQUES,
    ...SENSEI_TECHNIQUES,
    ...ROSTER_TECHNIQUES,
    ...COMBO_TECHNIQUES,
    ...CANON_TECHNIQUES,
  ],
  missions: [
    ...MISSIONS,
    ...TEAM_MISSIONS,
    ...ELITE_MISSIONS,
    ...CHUNIN_MISSIONS,
    ...EXAM_MISSIONS,
  ],
  exams: EXAMS,
  encounters: [...ENCOUNTERS, ...EXAM_ENCOUNTERS],
  roadEvents: ROAD_EVENTS,
  arcs: [],
  voices: VOICES,
  enemies: [...ENEMIES, ...CHUNIN_ENEMIES, ...EXAM_ENEMIES],
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
  ingredients: [...INGREDIENTS, ...WILD_INGREDIENTS],
  recipes: RECIPES,
  cookbooks: COOKBOOKS,
  campFinds: CAMP_FINDS,
  people: [
    ...SENSEIS,
    ...INSTRUCTORS,
    ...LEADERS,
    ...VILLAGE_JONIN,
    ...VILLAGE_CHUNIN,
    ...CANON_GENIN,
    ...SENIOR_GENIN,
    ...VILLAGERS,
  ],
  conversations: [
    ...GENERIC_CONVERSATIONS,
    ...TEMPLATE_CONVERSATIONS,
    ...NARUTO_CONVERSATIONS,
    ...ROSTER_CONVERSATIONS,
  ],
  conversationTopics: SHARED_TOPICS,
  names: NAMES,
  team: TEAM,
  village: VILLAGE,
  academyTechniques: ACADEMY_TECHNIQUES,
  disciplineStarters: DISCIPLINE_STARTERS,
  renamedTechniques: RENAMED_TECHNIQUES,
}))();
