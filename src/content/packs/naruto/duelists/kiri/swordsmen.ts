import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { kiriFighter } from './fighter';

/**
 * The Seven Ninja Swordsmen as Yagura's war finds them: three still serve the tower with their
 * blades, and one, Kisame, has already cut his way out of the village and wears another cloak.
 */
export const SWORDSMEN_FIGHTERS: readonly PersonDef[] = [
  kiriFighter({
    id: 'kushimaru',
    name: 'Kushimaru',
    familyName: 'Kuriarare',
    pronouns: 'he',
    title: 'Swordsman of the Mist',
    rank: 'jonin',
    stats: statLine('C', { kenjutsu: 'A', speed: 'A', perception: 'B', genjutsu: 'B' }),
    traitIds: ['calm', 'cunning'],
    appearance: look(
      'shaved',
      { hair: '#1b1a22', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#2a2a32' },
      'forehead',
      { shape: 'long', figure: 'slight', expression: 'calm', age: 'grown' },
    ),
    specialty: 'kenjutsu',
    bio: 'Masked, long-limbed and silent. Nuibari sews his enemies together, and he leaves them hung where the patrols will see.',
    arsenal: {
      techniqueIds: ['nuibari-stitch', 'silent-killing', 'hidden-mist', 'swallow-return'],
      gearIds: ['nuibari'],
    },
  }),
  kiriFighter({
    id: 'jinpachi',
    name: 'Jinpachi',
    familyName: 'Munashi',
    pronouns: 'he',
    title: 'Swordsman of the Mist',
    rank: 'jonin',
    stats: statLine('C', { kenjutsu: 'A', fuuinjutsu: 'B', strength: 'B', stamina: 'B' }),
    traitIds: ['brash', 'proud'],
    appearance: look(
      'shaggy',
      { hair: '#4a2f1d', eyes: '#2a1d14', skin: '#c68e63', outfit: '#9a2f2a' },
      'forehead',
      { shape: 'square', expression: 'grin', mark: 'scar', age: 'grown' },
    ),
    specialty: 'kenjutsu',
    bio: 'Carries Shibuki and enough explosive tags to level a street, and has. Fights loud because he enjoys it.',
    arsenal: {
      techniqueIds: ['shibuki-blast', 'explosive-tag', 'chain-detonation', 'swallow-return'],
      gearIds: ['shibuki'],
      tools: { 'explosive-tag': 3 },
    },
  }),
  kiriFighter({
    id: 'jinin',
    name: 'Jinin',
    familyName: 'Akebino',
    pronouns: 'he',
    title: 'Swordsman of the Mist',
    rank: 'jonin',
    stats: statLine('C', { kenjutsu: 'A', strength: 'A', stamina: 'B', taijutsu: 'B' }),
    traitIds: ['proud', 'tireless'],
    appearance: look(
      'short',
      { hair: '#e0b64a', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#2f4f7a' },
      'forehead',
      { figure: 'broad', expression: 'smirk', age: 'grown' },
    ),
    specialty: 'kenjutsu',
    bio: 'Wields Kabutowari with the axe in one hand, the hammer in the other and the chain between. Has split more helmets than he can count, and counts them anyway.',
    arsenal: {
      techniqueIds: ['kabutowari-split', 'breaker-fist', 'swallow-return'],
      gearIds: ['kabutowari'],
    },
  }),
  kiriFighter({
    id: 'kisame',
    name: 'Kisame',
    familyName: 'Hoshigaki',
    pronouns: 'he',
    title: 'Rogue Swordsman of the Mist',
    rank: 'kage',
    stats: statLine('B', {
      reserves: 46,
      kenjutsu: 38,
      ninjutsu: 36,
      strength: 40,
      stamina: 42,
      taijutsu: 'A',
      speed: 'A',
    }),
    traitIds: ['brash', 'cunning'],
    appearance: look(
      'spiky',
      { hair: '#3d5fa8', eyes: '#e8e0d0', skin: '#7a9ab0', outfit: '#2a2a32' },
      'forehead',
      { shape: 'angular', figure: 'broad', expression: 'grin', age: 'grown' },
    ),
    specialty: 'kenjutsu',
    bio: 'The Tailless Tailed Beast. Killed officials of his own village and walked out carrying Samehada. The Hoshigaki name is spat in the Mist because of him.',
    arsenal: {
      techniqueIds: [
        'samehada-shave',
        'five-feeding-sharks',
        'shark-water-prison',
        'water-shark-bullet',
        'water-wall',
      ],
      gearIds: ['samehada'],
    },
  }),
];
