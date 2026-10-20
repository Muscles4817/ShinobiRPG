import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { sunaFighter } from './fighter';

/**
 * The Dunes, the sand priests: the Monarch's warriors once, Shukaku's worshippers still, kept
 * apart under the truce and needed for the barges. Isago, the high priestess; Nagi, who
 * pilots a barge; Bunpuku, who holds their god asleep inside him. Each commands the clan's
 * sand (`ClanDef.dust`).
 */
export const DUNE_FIGHTERS: readonly PersonDef[] = [
  sunaFighter({
    id: 'sakyu-isago',
    name: 'Isago',
    familyName: 'of the Dunes',
    pronouns: 'she',
    clanId: 'sakyu',
    title: 'High Priestess of the Dunes',
    rank: 'jonin',
    stats: statLine('B', {
      ninjutsu: 'A',
      chakraControl: 'A',
      perception: 'A',
      reserves: 'A',
      speed: 'C',
    }),
    traitIds: ['proud', 'focused'],
    appearance: look(
      'long',
      { hair: '#1b1a22', eyes: '#c9a46a', skin: '#b98a5e', outfit: '#8a5a3a' },
      'neck',
      { expression: 'stern', age: 'old', mark: 'earrings' },
    ),
    specialty: 'ninjutsu',
    bio: 'Dark rings round her eyes, like every priest who has eaten the deep sand. She keeps the truce with the Kazekage and has never once pretended to like it.',
    arsenal: {
      techniqueIds: ['dune-wave', 'sand-coffin', 'quicksand-sink', 'sandstorm-veil', 'sand-wall'],
    },
  }),
  sunaFighter({
    id: 'sakyu-nagi',
    name: 'Nagi',
    familyName: 'of the Dunes',
    pronouns: 'he',
    clanId: 'sakyu',
    title: 'Barge Pilot',
    rank: 'chunin',
    stats: statLine('D', {
      ninjutsu: 'C',
      chakraControl: 'C',
      perception: 'B',
      stamina: 'C',
    }),
    traitIds: ['humble', 'tireless'],
    appearance: look(
      'shaved',
      { hair: '#2a1d14', eyes: '#c9a46a', skin: '#a5774f', outfit: '#c9a46a' },
      'arm',
      { expression: 'calm', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'Has brought a barge across the tainted belt eleven times and knows every dune by the sound it makes. Nobody at either end will sit at his table.',
    arsenal: {
      techniqueIds: ['sand-skiff', 'sand-bullet', 'sandstorm-veil'],
    },
  }),
  sunaFighter({
    id: 'bunpuku',
    name: 'Bunpuku',
    familyName: 'of the Dunes',
    pronouns: 'he',
    clanId: 'sakyu',
    title: 'Host of Shukaku',
    rank: 'jonin',
    stats: statLine('C', {
      fuuinjutsu: 'A',
      willpower: 'S',
      reserves: 'A',
      ninjutsu: 'A',
      stamina: 'B',
      chakraControl: 'B',
      speed: 'D',
    }),
    traitIds: ['calm', 'humble'],
    appearance: look(
      'shaved',
      { hair: '#3a3632', eyes: '#c9a46a', skin: '#c99a6e', outfit: '#8a3a2a' },
      'belt',
      { expression: 'calm', age: 'old', figure: 'broad' },
    ),
    specialty: 'fuuinjutsu',
    bio: 'A monk with a tea kettle on his back and a god in his belly. He chants all day to keep it asleep, and the village thanks him by keeping its distance.',
    arsenal: {
      techniqueIds: [
        'shukaku-sutra',
        'quicksand-sink',
        'sand-coffin',
        'sand-shuriken',
        'sand-wall',
      ],
    },
  }),
];
