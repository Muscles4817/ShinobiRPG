import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { akatsukiFighter } from './fighter';

/**
 * Itachi Uchiha as the Akatsuki knew him: the Mangekyō's three arts (Tsukuyomi, Amaterasu,
 * Susanoo with the Totsuka Blade and the Yata Mirror), the clan's fire and his crows, in a body
 * the illness was already taking. Susanoo is read as cast chakra armour, and the Totsuka Blade
 * as a sealing blow; neither needs the other to be out, which the engine has no way to ask.
 */
export const ITACHI_ARTS: readonly TechniqueDef[] = [
  {
    id: 'tsukuyomi',
    name: 'Tsukuyomi',
    description:
      'One look into the Mangekyō and the victim spends three days on a cross in a red world. Outside, a moment passes.',
    discipline: 'genjutsu',
    clan: 'uchiha',
    reach: ['close'],
    effects: [
      { verb: 'daze', power: 22 },
      { verb: 'drain', power: 40, will: true },
    ],
    chakraCost: 26,
    rank: 'S',
    difficulty: 180,
    tags: {
      delivery: ['eye-contact'],
      needs: ['mind', 'meets-eyes'],
      lands: ['dreaming'],
      catches: 'none',
      execution: { channelled: true },
    },
    oncePerFight: true,
    afterCost: { kind: 'injury', stat: 'perception', amount: 3, days: 7 },
  },
  {
    id: 'susanoo',
    name: 'Susanoo',
    description:
      'A ribcage, then a warrior of chakra rises round its user, the Yata Mirror on one arm. Every moment of it costs the body.',
    discipline: 'ninjutsu',
    clan: 'uchiha',
    effects: [{ verb: 'shroud', power: 20, kind: 'chakra' }],
    chakraCost: 30,
    rank: 'S',
    difficulty: 185,
    oncePerFight: true,
    afterCost: { kind: 'exhaustion', days: 3 },
  },
  {
    id: 'totsuka-blade',
    name: 'Totsuka Blade',
    description:
      'The sword of sake in Susanoo’s hand. Whatever it pierces is drawn into the gourd and sealed in a dream without end.',
    discipline: 'ninjutsu',
    clan: 'uchiha',
    reach: ['close', 'mid'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 18 },
      { verb: 'seal', power: 24 },
    ],
    chakraCost: 24,
    rank: 'S',
    difficulty: 185,
    oncePerFight: true,
  },
];

export const ITACHI: PersonDef = akatsukiFighter({
  id: 'itachi',
  name: 'Itachi',
  familyName: 'Uchiha',
  pronouns: 'he',
  clanId: 'uchiha',
  title: 'Rogue of the Leaf',
  // Kage-level: an ANBU captain at thirteen, and the Mangekyō beyond that.
  rank: 'kage',
  // Illusion past anyone's, eyes and wits to match; the illness has taken his stamina.
  stats: statLine(26, {
    strength: 18,
    speed: 38,
    stamina: 20,
    reserves: 34,
    chakraControl: 44,
    intellect: 48,
    perception: 46,
    willpower: 46,
    taijutsu: 34,
    ninjutsu: 44,
    genjutsu: 54,
    kenjutsu: 30,
  }),
  traitIds: ['calm', 'focused'],
  appearance: look(
    'ponytail',
    { hair: '#1b1a22', eyes: '#b8322c', skin: '#f3d2b3', outfit: '#2a2a32' },
    'forehead',
    { shape: 'long', figure: 'slight', expression: 'calm', age: 'young' },
  ),
  specialty: 'genjutsu',
  bio: 'Killed his whole clan in one night and spared only his little brother. He wears the Leaf’s headband scored through and says nothing about why.',
  arsenal: {
    techniqueIds: [
      'tsukuyomi',
      'amaterasu',
      'susanoo',
      'totsuka-blade',
      'coercion-sharingan',
      'great-fireball',
      'phoenix-flower',
      'crow-scatter',
      'shadow-clone',
      'body-flicker',
      'shuriken-jutsu',
    ],
    // The Sharingan reads every foe and sees each move coming.
    perks: ['insight', 'foresight'],
  },
});
