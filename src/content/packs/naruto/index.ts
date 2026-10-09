import type { ContentPack } from '../../types';
import { TALENTS } from '../../shared/talents';
import { TRAITS } from '../../shared/traits';
import { CLAN_TECHNIQUES } from './clanTechniques';
import { CLANS } from './clans';
import { ENEMIES } from './enemies';
import { FOODS } from './food';
import { MISSIONS } from './missions';
import { ACADEMY_TECHNIQUES, BREAK_IN, DISCIPLINE_STARTERS, NINDOS } from './profile';
import { TECHNIQUES } from './techniques';
import { TRAINING } from './training';
import { NARUTO_LOCATIONS, NARUTO_TEXT } from './world';

/**
 * Fan setting using Naruto names, for personal play only. Never ship it in a public
 * release: build with VITE_EXCLUDE_FAN_PACKS=true to drop it from the bundle.
 */
export const NARUTO_PACK: ContentPack = {
  id: 'naruto',
  name: 'Hidden Leaf (Naruto)',
  description: 'Konohagakure in the Land of Fire, with names from Naruto. Fan pack.',
  startLocationId: 'konohagakure',
  startingRyo: 300,
  text: NARUTO_TEXT,
  locations: NARUTO_LOCATIONS,
  techniques: [...TECHNIQUES, ...CLAN_TECHNIQUES],
  missions: MISSIONS,
  enemies: ENEMIES,
  training: TRAINING,
  foods: FOODS,
  clans: CLANS,
  talents: TALENTS,
  traits: TRAITS,
  nindos: NINDOS,
  breakIn: BREAK_IN,
  academyTechniques: ACADEMY_TECHNIQUES,
  disciplineStarters: DISCIPLINE_STARTERS,
};
