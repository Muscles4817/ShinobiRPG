import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { leafFighter } from './fighter';

/**
 * The generation before Kakashi's, all dead when the story opens: Minato as the Fourth Hokage on
 * the night of the Nine-Tails, Kushina before that night (the Nine-Tails' jinchūriki, whose chains
 * could hold it; the beast itself isn't written here), and Sakumo, the White Fang, at his height
 * in the Third War, before the mission he abandoned to save his comrades.
 */
export const FOURTH_FIGHTERS: readonly PersonDef[] = [
  leafFighter({
    id: 'minato',
    name: 'Minato',
    familyName: 'Namikaze',
    pronouns: 'he',
    title: 'Fourth Hokage',
    rank: 'kage',
    // The Yellow Flash: a sealing genius and the Rasengan's maker. His speed past any body's is
    // the Flying Thunder God in his kit, not his legs.
    stats: statLine(26, {
      ninjutsu: 46,
      fuuinjutsu: 46,
      taijutsu: 32,
      kenjutsu: 30,
      genjutsu: 18,
      chakraControl: 46,
      reserves: 34,
      strength: 18,
      speed: 30,
      stamina: 22,
      intellect: 46,
      perception: 42,
      willpower: 38,
    }),
    traitIds: ['calm', 'kind'],
    appearance: look(
      'spiky',
      { hair: '#e0b64a', eyes: '#3d5fa8', skin: '#f3d2b3', outfit: '#e8e0d0' },
      'forehead',
      { shape: 'oval', expression: 'smile', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'The Leaf’s Yellow Flash, whose marked kunai made whole armies flee on sight. He died sealing the Nine-Tails into his newborn son.',
    arsenal: {
      techniqueIds: [
        'flying-thunder-god',
        'flying-thunder-god-strike',
        'flying-thunder-god-slash',
        'rasengan',
        'contract-seal',
        'reaper-death-seal',
        'substitution-jutsu',
      ],
      gearIds: ['marked-kunai'],
      summons: ['gamabunta'],
      // The Flying Thunder God: a change of distance in an instant (`teleport`).
      perks: ['teleport'],
    },
  }),
  leafFighter({
    id: 'kushina',
    name: 'Kushina',
    familyName: 'Uzumaki',
    pronouns: 'she',
    title: 'Jinchūriki of the Nine-Tails',
    rank: 'jonin',
    // An Uzumaki's life force and special chakra, and a temper to match.
    stats: statLine(18, {
      fuuinjutsu: 40,
      ninjutsu: 28,
      taijutsu: 24,
      kenjutsu: 16,
      genjutsu: 10,
      chakraControl: 30,
      reserves: 52,
      strength: 15,
      speed: 18,
      stamina: 26,
      intellect: 22,
      perception: 26,
      willpower: 40,
    }),
    clanId: 'uzumaki',
    traitIds: ['brash', 'kind'],
    appearance: look(
      'long',
      { hair: '#b8322c', eyes: '#3d5fa8', skin: '#f3d2b3', outfit: '#5a7a4a' },
      'forehead',
      { shape: 'heart', expression: 'grin', age: 'grown' },
    ),
    specialty: 'fuuinjutsu',
    bio: 'The Red-Hot Habanero, brought from the Land of Whirlpools to hold the Nine-Tails. Her chakra chains could bind the beast itself.',
    arsenal: {
      techniqueIds: [
        'adamantine-chain-impalement',
        'adamantine-chains',
        'adamantine-chain-barrier',
        'uzumaki-chains',
        'substitution-jutsu',
      ],
    },
  }),
  leafFighter({
    id: 'sakumo',
    name: 'Sakumo',
    familyName: 'Hatake',
    pronouns: 'he',
    title: 'The White Fang of the Leaf',
    rank: 'jonin',
    // A swordsman whose name, it was said, outshone even the Sannin's.
    stats: statLine(20, {
      kenjutsu: 44,
      taijutsu: 28,
      ninjutsu: 24,
      genjutsu: 12,
      fuuinjutsu: 14,
      chakraControl: 30,
      reserves: 22,
      strength: 18,
      speed: 28,
      stamina: 22,
      intellect: 26,
      perception: 30,
      willpower: 30,
    }),
    traitIds: ['kind', 'calm'],
    appearance: look(
      'long',
      { hair: '#e8e0d0', eyes: '#1b1a22', skin: '#e2b48c', outfit: '#5a7a4a' },
      'forehead',
      { shape: 'long', eyes: 'narrow', expression: 'calm', age: 'grown' },
    ),
    specialty: 'kenjutsu',
    bio: 'Kakashi’s father, the White Fang, whose white chakra sabre the enemy feared above the Sannin. He broke off a mission to save his comrades and was shamed for it.',
    arsenal: {
      techniqueIds: [
        'white-light-cut',
        'chakra-flow',
        'iaido-draw',
        'swallow-return',
        'hilt-and-edge',
        'body-flicker',
        'substitution-jutsu',
      ],
      gearIds: ['white-light-chakra-sabre'],
    },
  }),
];
