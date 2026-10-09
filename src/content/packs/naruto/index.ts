import type { ContentPack } from '../../types';
import { TALENTS } from '../../shared/talents';
import { TRAITS } from '../../shared/traits';
import { CLAN_TECHNIQUES } from './clanTechniques';
import { CLANS } from './clans';
import { ENEMIES } from './enemies';
import { FOODS } from './food';
import { MISSIONS } from './missions';
import { TEAM_MISSIONS } from './teamMissions';
import { GENERIC_CONVERSATIONS } from '../../shared/conversations';
import { INGREDIENTS, RECIPES } from '../../shared/kitchen';
import { GEAR } from './gear';
import { NARUTO_CONVERSATIONS } from './conversations';
import { CANON_GENIN } from './genin';
import { ACADEMY_TECHNIQUES, BREAK_IN, DISCIPLINE_STARTERS, NAMES, NINDOS, TEAM } from './profile';
import { SENSEIS_AND_ELDERS } from './senseis';
import { SENSEI_TECHNIQUES } from './senseiTechniques';
import { TECHNIQUES } from './techniques';
import { TRAINING } from './training';
import { VILLAGE } from './village';
import { NARUTO_LOCATIONS, NARUTO_TEXT } from './world';

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
  techniques: [...TECHNIQUES, ...CLAN_TECHNIQUES, ...SENSEI_TECHNIQUES],
  missions: [...MISSIONS, ...TEAM_MISSIONS],
  enemies: ENEMIES,
  training: TRAINING,
  foods: FOODS,
  clans: CLANS,
  talents: TALENTS,
  traits: TRAITS,
  nindos: NINDOS,
  breakIn: BREAK_IN,
  gear: GEAR,
  ingredients: INGREDIENTS,
  recipes: RECIPES,
  people: [...SENSEIS_AND_ELDERS, ...CANON_GENIN],
  conversations: [...GENERIC_CONVERSATIONS, ...NARUTO_CONVERSATIONS],
  names: NAMES,
  team: TEAM,
  village: VILLAGE,
  academyTechniques: ACADEMY_TECHNIQUES,
  disciplineStarters: DISCIPLINE_STARTERS,
}))();
