import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { sunaFighter } from './fighter';

/**
 * The Cutting Wind, the fan clan, who fill the barges' sails: Oroshi, the sail-master who heads
 * them, and Yashamaru, the Kazekage's brother-in-law and a medic, who was told to kill his
 * sister's son. And Baki, who isn't of the clan and needs no fan for his wind.
 */
export const WIND_FIGHTERS: readonly PersonDef[] = [
  sunaFighter({
    id: 'kamaitachi-oroshi',
    name: 'Oroshi',
    familyName: 'of the Cutting Wind',
    pronouns: 'she',
    clanId: 'kamaitachi',
    title: 'Sail-Master of the Barges',
    rank: 'jonin',
    stats: statLine('C', { ninjutsu: 'A', strength: 'A', stamina: 'B', willpower: 'B' }),
    traitIds: ['brash', 'tireless'],
    appearance: look(
      'topknot',
      { hair: '#2a1d14', eyes: '#5f4a3a', skin: '#b98a5e', outfit: '#c9a46a' },
      'arm',
      { expression: 'grin', figure: 'broad', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'Has filled a barge’s sail from the Sand to the border and back without resting. She stands on deck beside the priests and has never once spoken to one.',
    arsenal: {
      techniqueIds: ['desert-gale', 'cutting-whirlwind', 'fan-gust', 'fan-wall'],
      gearIds: ['sail-fan'],
      weaponMastery: { fan: 1 },
    },
  }),
  sunaFighter({
    id: 'yashamaru',
    name: 'Yashamaru',
    familyName: 'of the Cutting Wind',
    pronouns: 'he',
    clanId: 'kamaitachi',
    title: 'Medic of the Sand',
    rank: 'jonin',
    stats: statLine('C', {
      chakraControl: 'A',
      ninjutsu: 'B',
      speed: 'B',
      intellect: 'B',
      perception: 'B',
    }),
    traitIds: ['kind', 'calm'],
    appearance: look(
      'long',
      { hair: '#c9a46a', eyes: '#5f9b8a', skin: '#f3d2b3', outfit: '#e8e0d0' },
      'forehead',
      { expression: 'smile', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'Raised his dead sister’s youngest when nobody else would touch him. He was also told to kill him, and he is a man who does what he is told.',
    arsenal: {
      techniqueIds: ['mystical-palm', 'wind-scythe', 'fan-gust'],
      tools: { 'explosive-tag': 4, 'smoke-bomb': 1 },
    },
  }),
  sunaFighter({
    id: 'baki',
    name: 'Baki',
    familyName: '',
    pronouns: 'he',
    title: 'Jōnin Commander',
    rank: 'jonin',
    stats: statLine('B', {
      ninjutsu: 'A',
      speed: 'B',
      taijutsu: 'B',
      willpower: 'B',
      intellect: 'B',
    }),
    traitIds: ['calm', 'diligent'],
    appearance: look(
      'short',
      { hair: '#2a1d14', eyes: '#3a3632', skin: '#c99a6e', outfit: '#8a7a5a' },
      'forehead',
      { expression: 'stern', mark: 'scar', facialHair: 'beard', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'Wears half his face under a veil and keeps the Kazekage’s children in line. Fought the Leaf’s outpost for a year and still won’t say the name Hatake.',
    arsenal: {
      techniqueIds: ['blade-of-wind', 'vacuum-bullet', 'air-bullet'],
    },
  }),
];
