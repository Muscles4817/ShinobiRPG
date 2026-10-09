import type { ContentPack } from '../../types';
import { ACADEMY_TECHNIQUES, APTITUDES } from './aptitudes';
import { ENEMIES } from './enemies';
import { FOODS } from './food';
import { MISSIONS } from './missions';
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
  techniques: TECHNIQUES,
  missions: MISSIONS,
  enemies: ENEMIES,
  training: TRAINING,
  foods: FOODS,
  aptitudes: APTITUDES,
  academyTechniques: ACADEMY_TECHNIQUES,
};
