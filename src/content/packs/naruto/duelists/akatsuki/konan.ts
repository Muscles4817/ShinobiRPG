import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { akatsukiFighter } from './fighter';

/**
 * Konan, the Angel of the Rain: her body comes apart into paper and folds back together
 * wherever she likes, and the paper cuts, binds and, at the last, goes off by the billion.
 */
export const KONAN_ARTS: readonly TechniqueDef[] = [
  {
    id: 'paper-shuriken',
    name: 'Paper Shuriken',
    description: 'Sheets of paper folded hard as steel, thrown by the handful.',
    discipline: 'ninjutsu',
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 14, hits: 4 }],
    chakraCost: 10,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'dance-of-the-shikigami',
    name: 'Dance of the Shikigami',
    description: 'She comes apart into a storm of paper and settles somewhere else, whole again.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'conceal', power: 16, scaling: { drive: ['ninjutsu'] } },
      { verb: 'move', power: 8 },
    ],
    chakraCost: 14,
    rank: 'A',
    difficulty: 130,
  },
  {
    id: 'paper-binding',
    name: 'Paper Binding',
    description: 'Paper wraps round the target sheet over sheet until they can’t move.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'pin', power: 16 }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'paper-person-of-god',
    name: 'Paper Person of God',
    description:
      'A lake parts and it is paper underneath: six hundred billion explosive tags, going off for ten minutes.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'area', power: 34, size: 'vast' }],
    chakraCost: 40,
    rank: 'S',
    difficulty: 190,
    oncePerFight: true,
    afterCost: { kind: 'exhaustion', days: 3 },
  },
];

export const KONAN: PersonDef = akatsukiFighter({
  id: 'konan',
  name: 'Konan',
  familyName: '',
  pronouns: 'she',
  title: 'Angel of the Rain',
  // Jōnin-grade on her own, though in the Rain they pray to her.
  rank: 'jonin',
  stats: statLine(22, {
    strength: 14,
    speed: 28,
    reserves: 38,
    chakraControl: 40,
    intellect: 36,
    perception: 32,
    willpower: 40,
    taijutsu: 20,
    ninjutsu: 44,
    genjutsu: 16,
    kenjutsu: 10,
    fuuinjutsu: 34,
  }),
  traitIds: ['calm', 'focused'],
  appearance: look(
    'buns',
    { hair: '#5a4a8a', eyes: '#c9a43a', skin: '#f3d2b3', outfit: '#2a2a32' },
    'forehead',
    { shape: 'oval', figure: 'slight', expression: 'calm', age: 'grown' },
  ),
  specialty: 'ninjutsu',
  bio: 'A war orphan of the Rain, taught by Jiraiya with Nagato and Yahiko. She folds a paper flower for her hair and stays at Pain’s side.',
  arsenal: {
    techniqueIds: [
      'paper-shuriken',
      'paper-binding',
      'dance-of-the-shikigami',
      'paper-person-of-god',
    ],
  },
});
