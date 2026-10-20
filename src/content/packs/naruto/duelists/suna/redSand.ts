import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { sunaFighter } from './fighter';

/**
 * The Red Sand, the puppeteers: Chiyo, the elder who taught half the Sand its poisons, and
 * Sasori, her grandson, whose parents died in Sakumo Hatake's raids and who made himself a
 * family of puppets. He left the Sand, and took a Kazekage with him.
 */
export const RED_SAND_FIGHTERS: readonly PersonDef[] = [
  sunaFighter({
    id: 'chiyo',
    name: 'Chiyo',
    familyName: 'of the Red Sand',
    pronouns: 'she',
    clanId: 'akasuna',
    title: 'Elder of the Sand',
    rank: 'jonin',
    stats: statLine('B', {
      chakraControl: 'S',
      intellect: 'S',
      ninjutsu: 'A',
      willpower: 'A',
      speed: 'D',
      strength: 'E',
      stamina: 'D',
    }),
    traitIds: ['proud', 'cunning'],
    appearance: look(
      'buns',
      { hair: '#9a9a9a', eyes: '#3a3632', skin: '#d8ad85', outfit: '#8a3a2a' },
      'belt',
      { age: 'old', expression: 'smirk', figure: 'slight' },
    ),
    specialty: 'ninjutsu',
    bio: 'She fights with the two puppets her grandson made of his parents. She has never said what it costs her to work their arms.',
    arsenal: {
      techniqueIds: ['chakra-threads', 'mystical-palm'],
      puppets: ['father', 'mother'],
    },
  }),
  sunaFighter({
    id: 'sasori',
    name: 'Sasori',
    familyName: 'of the Red Sand',
    pronouns: 'he',
    clanId: 'akasuna',
    title: 'Rogue Puppet Master',
    rank: 'kage',
    stats: statLine('B', {
      chakraControl: 'S',
      ninjutsu: 'A',
      intellect: 'A',
      kenjutsu: 'A',
      perception: 'A',
      reserves: 'A',
      speed: 'B',
    }),
    traitIds: ['calm', 'focused'],
    appearance: look(
      'shaggy',
      { hair: '#b8322c', eyes: '#7a4a2a', skin: '#f3d2b3', outfit: '#3a3632' },
      'belt',
      { age: 'young', expression: 'calm' },
    ),
    specialty: 'ninjutsu',
    bio: 'Fights from inside Hiruko and doesn’t like to be kept waiting. He thinks art is what lasts, and he has made sure a Kazekage will.',
    arsenal: {
      techniqueIds: ['chakra-threads', 'poison-needle-volley'],
      puppets: ['third-kazekage-puppet', 'hiruko'],
    },
  }),
];
