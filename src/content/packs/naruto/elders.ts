import { allDay, look } from '../../look';
import { statLine } from '../../statLine';
import type { PersonDef } from '../../types';

import { IRUKA_TEACHER } from './teachers';

/** The village figures every genin knows: their academy teacher, the Hokage, the ramen stand. */
export const VILLAGE_ELDERS: readonly PersonDef[] = [
  {
    id: 'iruka',
    name: 'Iruka',
    familyName: 'Umino',
    role: 'instructor',
    title: 'Academy instructor',
    rank: 'chunin',
    stats: statLine('D', { ninjutsu: 'C', taijutsu: 'C', intellect: 'C' }),
    traitIds: ['kind', 'diligent'],
    favouriteRecipeId: 'miso-soup',
    appearance: look('ponytail', {
      hair: '#4a2f1d',
      eyes: '#2a1d14',
      skin: '#c68e63',
      outfit: '#2f4f7a',
    }),
    bio: 'Taught you everything you know. Hands out missions in the afternoons. Pays for ramen too often.',
    schedule: {
      morning: 'academy',
      afternoon: 'mission-desk',
      evening: 'shopping-district',
      night: 'training-grounds',
    },
    teacher: IRUKA_TEACHER,
  },
  {
    id: 'hiruzen',
    name: 'Hiruzen',
    familyName: 'Sarutobi',
    role: 'leader',
    title: 'Third Hokage',
    rank: 'kage',
    stats: statLine('A', {
      ninjutsu: 'S',
      intellect: 'S',
      chakraControl: 'S',
      stamina: 'C',
      speed: 'B',
    }),
    traitIds: ['kind', 'calm'],
    appearance: look(
      'shaved',
      { hair: '#e8e0d0', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#e8e0d0' },
      'arm',
    ),
    bio: 'The Professor. Leads the village from behind a pipe and a mountain of paperwork.',
    schedule: { morning: 'mission-desk', afternoon: null, evening: null, night: null },
  },
  {
    id: 'teuchi',
    name: 'Teuchi',
    familyName: '',
    role: 'villager',
    title: 'Ramen chef',
    rank: 'civilian',
    stats: statLine(4, {
      stamina: 7,
      taijutsu: 1,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 2,
      fuuinjutsu: 0,
    }),
    traitIds: ['kind', 'focused'],
    recipes: [
      { recipeId: 'rolled-omelette', minStage: 1 },
      { recipeId: 'spicy-hot-pot', minStage: 2 },
      { recipeId: 'pepper-rice', minStage: 3 },
    ],
    appearance: look(
      'shaved',
      { hair: '#8a5a2b', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#e8e0d0' },
      'arm',
    ),
    bio: 'Owner of Ichiraku Ramen. Has fed every hungry genin in the village at least once.',
    schedule: allDay('shopping-district'),
  },
  {
    id: 'ayame',
    name: 'Ayame',
    familyName: '',
    role: 'villager',
    title: 'Ichiraku Ramen',
    rank: 'civilian',
    stats: statLine(4, { taijutsu: 1, ninjutsu: 0, genjutsu: 0, kenjutsu: 1, fuuinjutsu: 0 }),
    traitIds: ['kind', 'curious'],
    appearance: look(
      'long',
      { hair: '#4a2f1d', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#e8e0d0' },
      'arm',
    ),
    bio: 'Teuchi’s daughter. Knows every regular’s order and most of their secrets.',
    schedule: {
      morning: null,
      afternoon: 'shopping-district',
      evening: 'shopping-district',
      night: null,
    },
  },
];
