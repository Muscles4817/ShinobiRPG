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
import { ORIGINAL_CONVERSATIONS } from './conversations';
import { GENIN } from './genin';
import { SENSEIS_AND_ELDERS } from './people';
import { ACADEMY_TECHNIQUES, BREAK_IN, DISCIPLINE_STARTERS, NAMES, NINDOS, TEAM } from './profile';
import { SENSEI_TECHNIQUES } from './senseiTechniques';
import { TECHNIQUES } from './techniques';
import { TRAINING } from './training';
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
  people: [...SENSEIS_AND_ELDERS, ...GENIN],
  conversations: [...GENERIC_CONVERSATIONS, ...ORIGINAL_CONVERSATIONS],
  names: NAMES,
  team: TEAM,
  academyTechniques: ACADEMY_TECHNIQUES,
  disciplineStarters: DISCIPLINE_STARTERS,
};
