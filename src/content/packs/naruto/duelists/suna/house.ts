import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { sunaFighter } from './fighter';

/**
 * The Kazekage's children who are not Gaara: Temari, who learned the fan from her mother's
 * family, and Kankurō, who learned the threads from the Red Sand. Neither art is the house's
 * own, which is how the house likes it: it holds the village together by marrying into it.
 */
export const HOUSE_FIGHTERS: readonly PersonDef[] = [
  sunaFighter({
    id: 'temari',
    name: 'Temari',
    familyName: 'of the Sands',
    pronouns: 'she',
    clanId: 'sabaku',
    role: 'genin',
    title: 'Genin',
    rank: 'genin',
    // As at the Chūnin Exams.
    stats: statLine('D', {
      ninjutsu: 'B',
      intellect: 'B',
      chakraControl: 'C',
    }),
    traitIds: ['proud', 'cunning'],
    appearance: look(
      'buns',
      { hair: '#d9b45a', eyes: '#3e6b5a', skin: '#e8c39e', outfit: '#6b5a8a' },
      'neck',
      { expression: 'smirk' },
    ),
    specialty: 'ninjutsu',
    bio: 'The eldest, with her mother’s fan and her father’s eye for a weak point. She never lets a fight come within reach of the fan’s edge.',
    arsenal: {
      techniqueIds: ['cutting-whirlwind', 'wind-scythe', 'fan-gust', 'fan-wall'],
      gearIds: ['temari-war-fan'],
      weaponMastery: { fan: 1 },
    },
  }),
  sunaFighter({
    id: 'kankuro',
    name: 'Kankurō',
    familyName: 'of the Sands',
    pronouns: 'he',
    clanId: 'sabaku',
    role: 'genin',
    title: 'Genin',
    rank: 'genin',
    // As at the Chūnin Exams: Karasu is his only puppet yet.
    stats: statLine('D', {
      chakraControl: 'B',
      intellect: 'B',
      // Enough for the threads, a B-rank art, and little else.
      ninjutsu: 'B',
      perception: 'C',
      stamina: 'C',
      taijutsu: 'E',
    }),
    traitIds: ['brash', 'cunning'],
    appearance: look(
      'short',
      { hair: '#4a3626', eyes: '#3a3632', skin: '#e2b48c', outfit: '#1b1a22' },
      'forehead',
      { expression: 'grin', mark: 'scar' },
    ),
    specialty: 'ninjutsu',
    bio: 'Wears the puppeteer’s paint and a hood with ears on it. Begged the Red Sand to teach him until the old woman gave in, and never says thank you.',
    arsenal: {
      techniqueIds: ['chakra-threads'],
      puppets: ['karasu'],
    },
  }),
];
