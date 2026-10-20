import { bestiary } from '../../shared/bestiary';
import { NARUTO_FOE_KIT } from './bestiaryKit';
import { BEAST_TECHNIQUES, COMPANION_LORE } from '../../shared/beastTechniques';
import { STRAINS } from './strains';
import { WILD_STRAINS } from '../../shared/wildStrains';
import { DUSTS } from '../../shared/dusts';
import { DUST_TECHNIQUES } from '../../shared/dustTechniques';
import { CONTRACTS, TOAD_MISSION } from './contracts';
import { CONTRACT_TECHNIQUES } from './contractTechniques';
import type { ContentPack } from '../../types';
import { BUILDS } from '../../shared/builds';
import { EXERCISES } from '../../shared/exercises';
import { CURRICULUM } from '../../shared/sensei/curriculum';
import { SENSEI_SPEECH } from '../../shared/sensei/speech';
import { senseiParts } from '../../shared/sensei/parts';
import { SENSEI_TESTS } from '../../shared/sensei/tests';
import { FIELD_BOOK_REWARDS } from '../../shared/fieldBook';
import { FURNISHINGS } from '../../shared/furnishings';
import { GARDEN_CROPS } from '../../shared/garden';
import { QUIRKS } from '../../shared/quirks';
import { NARUTO_HOMES } from './homes';
import { TALENTS } from '../../shared/talents';
import { TRAITS } from '../../shared/traits';
import { UPBRINGINGS } from '../../shared/upbringings';
import { CLAN_TECHNIQUES } from './clanTechniques';
import { CLANS } from './clans';
import { COMBO_TECHNIQUES } from './comboTechniques';
import { ELITE_MISSIONS } from './eliteMissions';
import { COMPANION_KINDS } from './companions';
import { CANON_FOES } from './canonFoes';
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
import { DUELIST_GEAR, DUELIST_PUPPETS, DUELIST_TECHNIQUES, DUELISTS } from './duelists';
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
import { TEMPLE_BELL_ARC, TEMPLE_BELL_FOE, TEMPLE_BELL_JOBS } from './arcs/templeBell';
import { DROWNED_SHORE_ARC, DROWNED_SHORE_FOE, DROWNED_SHORE_JOBS } from './arcs/drownedShore';
import { LOADED_DICE_ARC, LOADED_DICE_FOE, LOADED_DICE_JOBS } from './arcs/loadedDice';
import { SWORD_SCHOOL_ARC, SWORD_SCHOOL_FOE, SWORD_SCHOOL_JOBS } from './arcs/swordSchool';
import { SNAKE_DEN_ARC, SNAKE_DEN_FOE, SNAKE_DEN_JOBS } from './arcs/snakeDen';
import { TWO_SIDES_ARC, TWO_SIDES_JOBS } from './arcs/twoSides';
import { SILK_DAUGHTER_ARC, SILK_DAUGHTER_JOBS } from './arcs/silkDaughter';
import { UNWRITTEN_RULE_ARC, UNWRITTEN_RULE_JOBS } from './arcs/unwrittenRule';
import { KANAME_STORY } from './people/stories/kaname';
import { HOTARU_STORY } from './people/stories/hotaru';
import { SHION_STORY } from './people/stories/shion';
import { MASARU_STORY } from './people/stories/masaru';
import { ANKO_STORY } from './people/stories/anko';
import { ASUMA_STORY } from './people/stories/asuma';
import { GUY_STORY } from './people/stories/guy';
import { KAKASHI_STORY } from './people/stories/kakashi';
import { KURENAI_STORY } from './people/stories/kurenai';
import {
  CANON_GENIN,
  INSTRUCTORS,
  LEADERS,
  SENIOR_GENIN,
  NEW_SENSEIS,
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
import { SUNA_CLANS } from './sunagakure';
import { NARUTO_ATLAS } from './atlas';
import { WAVES_FOODS, WAVES_JOBS, WAVES_PEOPLE, WAVES_TRAINING } from './landOfWaves';
import { TANZAKU_FOODS, TANZAKU_JOBS, TANZAKU_PEOPLE } from './tanzaku';
import {
  KIRI_CLANS,
  KIRI_FOES,
  KIRI_FOODS,
  KIRI_GEAR,
  KIRI_JOBS,
  KIRI_HOUSE_FOLK,
  KIRI_PEOPLE,
  KIRI_TRAINING,
} from './kirigakure';
import { SHUKUBA_FOODS, SHUKUBA_JOBS, SHUKUBA_PEOPLE } from './shukuba';
import { OTAFUKU_FOODS, OTAFUKU_JOBS, OTAFUKU_PEOPLE } from './otafuku';
import { SENSEI_GROUNDS, SENSEI_NAMES } from './senseiGrounds';
import {
  FIRE_TEMPLE_FOODS,
  FIRE_TEMPLE_JOBS,
  FIRE_TEMPLE_PEOPLE,
  FIRE_TEMPLE_TRAINING,
} from './fireTemple';

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
  atlas: NARUTO_ATLAS,
  exercises: EXERCISES,
  senseiTests: SENSEI_TESTS,
  curriculum: CURRICULUM,
  senseiSpeech: SENSEI_SPEECH,
  senseiParts: senseiParts(SENSEI_GROUNDS, SENSEI_NAMES),
  techniques: [
    ...TECHNIQUES,
    ...CLAN_TECHNIQUES,
    ...DUST_TECHNIQUES,
    ...SENSEI_TECHNIQUES,
    ...ROSTER_TECHNIQUES,
    ...COMBO_TECHNIQUES,
    ...BEAST_TECHNIQUES,
    ...CONTRACT_TECHNIQUES,
    ...CANON_TECHNIQUES,
    ...DUELIST_TECHNIQUES,
  ],
  missions: [
    ...MISSIONS,
    TOAD_MISSION,
    ...TEAM_MISSIONS,
    ...ELITE_MISSIONS,
    ...CHUNIN_MISSIONS,
    ...EXAM_MISSIONS,
    ...WAVES_JOBS,
    ...TANZAKU_JOBS,
    ...KIRI_JOBS,
    ...SHUKUBA_JOBS,
    ...OTAFUKU_JOBS,
    ...FIRE_TEMPLE_JOBS,
    ...TEMPLE_BELL_JOBS,
    ...DROWNED_SHORE_JOBS,
    ...LOADED_DICE_JOBS,
    ...SWORD_SCHOOL_JOBS,
    ...SNAKE_DEN_JOBS,
    ...TWO_SIDES_JOBS,
    ...SILK_DAUGHTER_JOBS,
    ...UNWRITTEN_RULE_JOBS,
  ],
  exams: EXAMS,
  encounters: [...ENCOUNTERS, ...EXAM_ENCOUNTERS],
  roadEvents: ROAD_EVENTS,
  arcs: [
    TEMPLE_BELL_ARC,
    DROWNED_SHORE_ARC,
    LOADED_DICE_ARC,
    SWORD_SCHOOL_ARC,
    SNAKE_DEN_ARC,
    TWO_SIDES_ARC,
    SILK_DAUGHTER_ARC,
    UNWRITTEN_RULE_ARC,
  ],
  voices: VOICES,
  companionKinds: COMPANION_KINDS,
  companionLore: COMPANION_LORE,
  contracts: CONTRACTS,
  strains: [...STRAINS, ...WILD_STRAINS],
  dusts: DUSTS,
  enemies: [
    ...ENEMIES,
    ...CANON_FOES,
    ...bestiary(NARUTO_FOE_KIT),
    ...CHUNIN_ENEMIES,
    ...EXAM_ENEMIES,
    TEMPLE_BELL_FOE,
    DROWNED_SHORE_FOE,
    ...KIRI_FOES,
    LOADED_DICE_FOE,
    SWORD_SCHOOL_FOE,
    SNAKE_DEN_FOE,
  ],
  training: [...TRAINING, ...WAVES_TRAINING, ...FIRE_TEMPLE_TRAINING, ...KIRI_TRAINING],
  foods: [
    ...FOODS,
    ...SEASONAL_FOODS,
    ...WAVES_FOODS,
    ...TANZAKU_FOODS,
    ...KIRI_FOODS,
    ...SHUKUBA_FOODS,
    ...OTAFUKU_FOODS,
    ...FIRE_TEMPLE_FOODS,
  ],
  clans: [...CLANS, ...KIRI_CLANS, ...SUNA_CLANS],
  builds: BUILDS,
  upbringings: UPBRINGINGS,
  talents: TALENTS,
  quirks: QUIRKS,
  homes: NARUTO_HOMES,
  furnishings: FURNISHINGS,
  gardenCrops: GARDEN_CROPS,
  fieldBook: FIELD_BOOK_REWARDS,
  traits: TRAITS,
  nindos: NINDOS,
  breakIn: BREAK_IN,
  gear: [...GEAR, ...DUELIST_GEAR, ...KIRI_GEAR],
  tools: TOOLS,
  injuries: INJURIES,
  ingredients: [...INGREDIENTS, ...WILD_INGREDIENTS],
  recipes: RECIPES,
  cookbooks: COOKBOOKS,
  campFinds: CAMP_FINDS,
  people: [
    ...SENSEIS,
    ...NEW_SENSEIS,
    ...INSTRUCTORS,
    ...LEADERS,
    ...VILLAGE_JONIN,
    ...VILLAGE_CHUNIN,
    ...CANON_GENIN,
    ...SENIOR_GENIN,
    ...VILLAGERS,
    ...WAVES_PEOPLE,
    ...TANZAKU_PEOPLE,
    ...KIRI_PEOPLE,
    ...KIRI_HOUSE_FOLK,
    ...OTAFUKU_PEOPLE,
    ...SHUKUBA_PEOPLE,
    ...FIRE_TEMPLE_PEOPLE,
  ],
  duelists: DUELISTS,
  puppets: DUELIST_PUPPETS,
  conversations: [
    ...GENERIC_CONVERSATIONS,
    ...TEMPLATE_CONVERSATIONS,
    ...NARUTO_CONVERSATIONS,
    ...ROSTER_CONVERSATIONS,
    ...KAKASHI_STORY,
    ...GUY_STORY,
    ...KURENAI_STORY,
    ...ASUMA_STORY,
    ...ANKO_STORY,
    ...KANAME_STORY,
    ...HOTARU_STORY,
    ...SHION_STORY,
    ...MASARU_STORY,
  ],
  conversationTopics: SHARED_TOPICS,
  names: NAMES,
  team: TEAM,
  village: VILLAGE,
  academyTechniques: ACADEMY_TECHNIQUES,
  disciplineStarters: DISCIPLINE_STARTERS,
  renamedTechniques: RENAMED_TECHNIQUES,
}))();
