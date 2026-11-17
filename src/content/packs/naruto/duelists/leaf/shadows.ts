import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { leafFighter } from './fighter';

/**
 * The Leaf in Part II, out of the world's reach for now: Danzō as he went to the Five Kage
 * Summit, his stolen Sharingan still under the bandages; Sai, his Root agent placed on Team
 * Kakashi; and Konohamaru as a genin who has learned the Rasengan from Naruto (written at the
 * grade that technique asks, his body and the rest a good genin's).
 */
export const SHADOW_FIGHTERS: readonly PersonDef[] = [
  leafFighter({
    id: 'danzo',
    name: 'Danzō',
    familyName: 'Shimura',
    pronouns: 'he',
    title: 'Leader of Root',
    rank: 'kage',
    stats: statLine(20, {
      ninjutsu: 40,
      fuuinjutsu: 32,
      genjutsu: 22,
      taijutsu: 22,
      kenjutsu: 20,
      chakraControl: 34,
      reserves: 34,
      strength: 12,
      speed: 16,
      stamina: 16,
      intellect: 40,
      perception: 30,
      willpower: 38,
    }),
    traitIds: ['cunning', 'proud'],
    appearance: look(
      'short',
      { hair: '#1b1a22', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#1b1a22' },
      'forehead',
      { shape: 'angular', expression: 'stern', mark: 'scar', age: 'old' },
    ),
    seal: '団',
    specialty: 'ninjutsu',
    bio: 'The Third Hokage’s old rival, who ran Root from the dark as the village’s hidden root. His bandaged arm and eye hide Sharingan he had no right to.',
    arsenal: {
      techniqueIds: [
        'vacuum-great-sphere',
        'pressure-damage',
        'vacuum-sphere',
        'vacuum-bullet',
        'izanagi',
        'body-flicker',
        'substitution-jutsu',
      ],
      // The eyes stay bandaged until the fight calls for them.
      veiled: ['insight', 'foresight'],
    },
  }),
  leafFighter({
    id: 'sai',
    name: 'Sai',
    familyName: '',
    pronouns: 'he',
    title: 'Root agent',
    // Root keeps no ranks of its own; written as a chūnin of the village.
    rank: 'chunin',
    stats: statLine(12, {
      ninjutsu: 26,
      kenjutsu: 20,
      taijutsu: 18,
      fuuinjutsu: 16,
      genjutsu: 8,
      chakraControl: 22,
      reserves: 16,
      strength: 12,
      speed: 18,
      stamina: 14,
      intellect: 20,
      perception: 20,
      willpower: 16,
    }),
    traitIds: ['calm', 'curious'],
    appearance: look(
      'short',
      { hair: '#1b1a22', eyes: '#1b1a22', skin: '#f3d2b3', outfit: '#1b1a22' },
      'forehead',
      { shape: 'oval', eyes: 'narrow', expression: 'smile', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'A Root agent raised without feelings, sent to Team Kakashi as Sasuke’s replacement. His brush paints beasts that fight, and his smile is learned from books.',
    arsenal: {
      techniqueIds: [
        'super-beast-lions',
        'super-beast-snakes',
        'super-beast-bird',
        'substitution-jutsu',
      ],
      gearIds: ['tanto'],
    },
  }),
  leafFighter({
    id: 'konohamaru',
    name: 'Konohamaru',
    familyName: 'Sarutobi',
    pronouns: 'he',
    role: 'genin',
    title: 'Genin',
    rank: 'genin',
    stats: statLine(7, {
      ninjutsu: 28,
      chakraControl: 20,
      taijutsu: 10,
      genjutsu: 4,
      kenjutsu: 5,
      fuuinjutsu: 4,
      reserves: 14,
      strength: 9,
      speed: 11,
      stamina: 11,
      intellect: 8,
      perception: 9,
      willpower: 16,
    }),
    traitIds: ['brash', 'diligent'],
    appearance: look(
      'spiky',
      { hair: '#4a2f1d', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#d8b04a' },
      'forehead',
      { shape: 'round', expression: 'grin', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'The Third Hokage’s grandson, who calls Naruto his rival and boss. He beat one of Pain’s bodies with the Rasengan while the village fell round him.',
    arsenal: {
      techniqueIds: ['rasengan', 'shadow-clone', 'substitution-jutsu'],
    },
  }),
];
