import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

import {
  HOTARU_ARSENAL,
  KANAME_ARSENAL,
  MASARU_ARSENAL,
  SHION_ARSENAL,
} from './arsenals/newSenseis';
import { HOTARU_WAYS, KANAME_WAYS, MASARU_WAYS, SHION_WAYS } from './newSenseiWays';

/**
 * The jōnin who take new teams this year, now that the village's famous senseis have theirs.
 * Each comes from somewhere the Leaf's roads reach (the Fire Temple, the Land of Waves, Tanzaku
 * Town, the post road), and each has a story that leads back there.
 */
export const NEW_SENSEIS: readonly PersonDef[] = [
  {
    id: 'kaname',
    name: 'Kaname',
    familyName: 'Ōtori',
    role: 'sensei',
    title: 'Jōnin',
    rank: 'jonin',
    stats: statLine('C', { taijutsu: 'A', willpower: 'B', stamina: 'B', perception: 'B' }),
    traitIds: ['calm', 'humble'],
    favouriteRecipeId: 'tofu-congee',
    appearance: look(
      'shaved',
      { hair: '#1b1a22', eyes: '#3a2a1a', skin: '#c68e63', outfit: '#b8722c' },
      'neck',
    ),
    specialty: 'taijutsu',
    bio: 'Raised by the monks of the Fire Temple after the last war. Fights like water poured over stone.',
    schedule: {
      morning: 'training-grounds',
      afternoon: 'academy',
      evening: 'naka-river',
      night: null,
    },
    sensei: {
      specialty: 'taijutsu',
      favouredTraits: ['calm', 'humble', 'diligent'],
      nature: 'earth',
      style: 'Quiet, patient and impossible to knock over. Asks more questions than he answers.',
      toleratesReplacement: true,
      lesson:
        'Kaname has you hold a stance until your legs shake, then shows you how to stop them shaking.',
      ways: KANAME_WAYS,
    },
    teacher: {
      quirk: 'patient',
      steers: { focus: 'weakest', freeAtStage: 2 },
      teaches: [
        'shadow-dancing-leaf',
        'moonlight-kick',
        'drunken-fist',
        'arm-bar',
        'lion-combo',
        'heel-drop',
      ],
      price: { kind: 'bond', minStage: 1, line: '“Sit with me a while first. Then we will see.”' },
    },
    arsenal: KANAME_ARSENAL,
  },
  {
    id: 'hotaru',
    name: 'Hotaru',
    familyName: 'Shiranami',
    role: 'sensei',
    title: 'Jōnin',
    rank: 'jonin',
    stats: statLine('C', { ninjutsu: 'A', chakraControl: 'B', reserves: 'B', stamina: 'B' }),
    traitIds: ['kind', 'diligent'],
    favouriteRecipeId: 'fish-bone-broth',
    appearance: look('long', {
      hair: '#2f4f6a',
      eyes: '#2a6a7a',
      skin: '#e2b48c',
      outfit: '#3a5a7a',
    }),
    specialty: 'ninjutsu',
    bio: 'Came to the Leaf as a girl, hidden in the hold of a fishing boat out of the Land of Waves, and never went back.',
    schedule: {
      morning: 'naka-river',
      afternoon: 'training-grounds',
      evening: 'shopping-district',
      night: 'izakaya',
    },
    sensei: {
      specialty: 'ninjutsu',
      favouredTraits: ['kind', 'diligent', 'curious'],
      nature: 'water',
      style: 'Warm, organised and fierce about her team. Nobody gets left on the shore.',
      lesson: 'Hotaru has the three of you pass a ball of water between you until nobody drops it.',
      ways: HOTARU_WAYS,
    },
    teacher: {
      quirk: 'natural',
      steers: { focus: 'specialty', freeAtStage: 3 },
      teaches: [
        'water-bullet',
        'water-clone',
        'hiding-in-water',
        'water-shark-bullet',
        'water-dragon-bullet',
        'water-wall',
        'thousand-water-needles',
      ],
      price: {
        kind: 'mission',
        missionId: 'bridge-builder',
        line: '“Help the people of the Waves first. Then come back to me.”',
      },
    },
    arsenal: HOTARU_ARSENAL,
  },
  {
    id: 'shion',
    name: 'Shion',
    familyName: 'Ukiha',
    role: 'sensei',
    title: 'Jōnin',
    rank: 'jonin',
    stats: statLine('C', { genjutsu: 'A', perception: 'B', intellect: 'B', speed: 'B' }),
    traitIds: ['cunning', 'curious'],
    favouriteRecipeId: 'grilled-eel',
    appearance: look('ponytail', {
      hair: '#7a2a4a',
      eyes: '#4a3a6a',
      skin: '#f3d2b3',
      outfit: '#2a2a32',
    }),
    specialty: 'genjutsu',
    bio: 'Ran the Leaf’s informants in Tanzaku Town for years before anyone at home learned her face. Some still haven’t.',
    schedule: { morning: null, afternoon: 'archives', evening: 'izakaya', night: 'izakaya' },
    sensei: {
      specialty: 'genjutsu',
      favouredTraits: ['cunning', 'curious', 'calm'],
      nature: 'fire',
      style: 'Wry and watchful. Sees through people and tells them so.',
      toleratesReplacement: true,
      lesson:
        'Shion deals you cards from a deck that keeps changing in your hands, until you see the trick.',
      ways: SHION_WAYS,
    },
    teacher: {
      quirk: 'natural',
      steers: { focus: 'specialty', freeAtStage: 2 },
      teaches: [
        'sapping-illusion',
        'sly-mind-affect',
        'bell-sound-clone',
        'tree-binding',
        'illusory-body',
        'phantom-sound-chains',
        'temple-of-nirvana',
      ],
      price: {
        kind: 'ryo',
        perSession: 40,
        line: '“Nothing in Tanzaku is free. I learned that young.”',
      },
    },
    arsenal: SHION_ARSENAL,
  },
  {
    id: 'masaru',
    name: 'Masaru',
    familyName: 'Hagane',
    role: 'sensei',
    title: 'Jōnin',
    rank: 'jonin',
    stats: statLine('C', { kenjutsu: 'A', strength: 'B', speed: 'B', stamina: 'B' }),
    traitIds: ['proud', 'tireless'],
    favouriteRecipeId: 'hunters-skewers',
    appearance: look(
      'ponytail',
      { hair: '#1b1a22', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#4a4a52' },
      'belt',
    ),
    specialty: 'kenjutsu',
    bio: 'A samurai’s son who chose the forehead protector over the sword school. His father has not written since.',
    schedule: {
      morning: 'training-grounds',
      afternoon: 'weapon-shop',
      evening: 'training-grounds',
      night: null,
    },
    sensei: {
      specialty: 'kenjutsu',
      favouredTraits: ['proud', 'tireless', 'brash'],
      style: 'Loud, exacting and competitive. Every drill is a duel, and he keeps score.',
      lesson: 'Masaru has you draw and cut a thousand times, and counts every one out loud.',
      ways: MASARU_WAYS,
    },
    teacher: {
      quirk: 'harsh',
      steers: { focus: 'specialty', freeAtStage: 3 },
      teaches: [
        'swallow-return',
        'samurai-sabre',
        'hilt-and-edge',
        'afterglow',
        'decapitating-sweep',
        'flying-revolving-sword',
        'heavenly-chain-disaster',
      ],
      price: {
        kind: 'all',
        parts: [
          { kind: 'bond', minStage: 1, line: '“Show me you can lose properly first.”' },
          { kind: 'ryo', perSession: 30, line: 'He nods at the whetstones. They aren’t free.' },
        ],
      },
    },
    arsenal: MASARU_ARSENAL,
  },
];
