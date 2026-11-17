import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { farFighter } from './fighter';

/**
 * Fighters of the small lands: Fū of the Waterfall, the Seven-Tails' host, when Akatsuki came for
 * her (her rank is never said; chūnin is the fair reading); Mifune, the samurai general, at the
 * Fourth War; and Hanzō of the Salamander in his prime, when he named the Sannin.
 */
export const SMALL_LAND_FIGHTERS: readonly PersonDef[] = [
  farFighter('takigakure', {
    id: 'fu',
    name: 'Fū',
    familyName: '',
    pronouns: 'she',
    title: 'Jinchūriki of the Seven-Tails',
    rank: 'chunin',
    stats: statLine(13, {
      strength: 12,
      speed: 22,
      stamina: 20,
      reserves: 38,
      chakraControl: 20,
      intellect: 12,
      perception: 20,
      willpower: 20,
      taijutsu: 18,
      ninjutsu: 24,
      genjutsu: 8,
      kenjutsu: 6,
      fuuinjutsu: 6,
    }),
    traitIds: ['brash', 'kind'],
    appearance: look(
      'bob',
      { hair: '#3e6b5a', eyes: '#e0c46a', skin: '#c68e63', outfit: '#e8e0d0' },
      'arm',
      { expression: 'grin', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'A cheerful jinchūriki of the Waterfall who has no friends and wants a hundred. The Seven-Tails gives her wings.',
    arsenal: {
      techniqueIds: ['seven-tails-cloak', 'scale-powder', 'body-flicker'],
    },
  }),
  farFighter('land-of-iron', {
    id: 'mifune',
    name: 'Mifune',
    familyName: '',
    pronouns: 'he',
    title: 'General of the Samurai',
    rank: 'kage',
    stats: statLine(22, {
      strength: 20,
      speed: 34,
      stamina: 22,
      reserves: 20,
      chakraControl: 30,
      intellect: 34,
      perception: 36,
      willpower: 40,
      taijutsu: 22,
      ninjutsu: 6,
      genjutsu: 6,
      kenjutsu: 48,
      fuuinjutsu: 6,
    }),
    traitIds: ['calm', 'humble'],
    appearance: look(
      'long',
      { hair: '#e8e0d0', eyes: '#3a3632', skin: '#e2b48c', outfit: '#6a7a8a' },
      'belt',
      { shape: 'long', expression: 'calm', age: 'old', facialHair: 'goatee' },
    ),
    specialty: 'kenjutsu',
    bio: 'Leader of the Land of Iron’s samurai, who keeps them out of the shinobi’s wars. Hanzō spared him once, and he has not forgotten.',
    arsenal: {
      techniqueIds: ['mifune-iai', 'samurai-sabre', 'chakra-flow', 'deflecting-guard'],
      gearIds: ['katana'],
      weaponMastery: { sword: 1 },
    },
  }),
  farFighter('amegakure', {
    id: 'hanzo',
    name: 'Hanzō',
    familyName: '',
    pronouns: 'he',
    title: 'Hanzō of the Salamander',
    rank: 'kage',
    stats: statLine(24, {
      strength: 22,
      speed: 30,
      stamina: 30,
      reserves: 40,
      chakraControl: 32,
      intellect: 32,
      perception: 32,
      willpower: 36,
      taijutsu: 30,
      ninjutsu: 42,
      genjutsu: 16,
      kenjutsu: 34,
      fuuinjutsu: 16,
    }),
    traitIds: ['proud', 'cunning'],
    appearance: look(
      'spiky',
      { hair: '#1b1a22', eyes: '#3a3632', skin: '#f3d2b3', outfit: '#3a3632' },
      'forehead',
      { shape: 'angular', expression: 'stern', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'The Rain’s leader, who fought Jiraiya and his two teammates at once, let them live and named them the Sannin. A sac of salamander venom sits in his chest, and he never takes off the mask.',
    arsenal: {
      techniqueIds: ['salamander-venom', 'kusarigama-sweep', 'explosive-tag', 'body-flicker'],
      gearIds: ['kusarigama'],
      weaponMastery: { chain: 1 },
    },
  }),
];
