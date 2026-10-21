import { allDay, look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/** Villagers every genin knows: the ramen stand. */
export const VILLAGERS: readonly PersonDef[] = [
  {
    id: 'teuchi',
    name: 'Teuchi',
    familyName: '',
    pronouns: 'he',
    role: 'villager',
    title: 'Ramen chef',
    rank: 'civilian',
    stats: statLine(4, {
      taijutsu: 1,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 2,
      fuuinjutsu: 0,
      chakraControl: 2,
      strength: 7,
      stamina: 7,
      intellect: 7,
      perception: 7,
      willpower: 8,
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
      { eyes: 'hooded', expression: 'smile', age: 'old' },
    ),
    bio: 'Owner of Ichiraku Ramen. Has fed every hungry genin in the village at least once.',
    schedule: allDay('shopping-district'),
  },
  {
    id: 'ayame',
    name: 'Ayame',
    familyName: '',
    pronouns: 'she',
    role: 'villager',
    title: 'Ichiraku Ramen',
    rank: 'civilian',
    stats: statLine(4, {
      taijutsu: 1,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 1,
      fuuinjutsu: 0,
      chakraControl: 2,
      strength: 3,
      speed: 6,
      stamina: 5,
      intellect: 8,
      perception: 9,
      willpower: 6,
    }),
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
