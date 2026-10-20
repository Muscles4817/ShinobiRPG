import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/** Kiri Ford's people: they live by the river and are met only there. */
export const KIRI_FORD_PEOPLE: readonly PersonDef[] = [
  {
    id: 'tobei',
    name: 'Tobei',
    familyName: 'Sawa',
    pronouns: 'he',
    homeLocationId: 'kiri-ford',
    role: 'villager',
    title: 'Ferry pilot',
    rank: 'civilian',
    stats: statLine(0, {
      strength: 11,
      speed: 6,
      stamina: 11,
      reserves: 3,
      chakraControl: 1,
      intellect: 6,
      perception: 10,
      willpower: 7,
      taijutsu: 2,
    }),
    traitIds: ['brash', 'kind'],
    appearance: look(
      'ponytail',
      { hair: '#4a3a2a', eyes: '#2a1d14', skin: '#9a6440', outfit: '#3a4a3a' },
      'arm',
    ),
    bio: 'Has rowed the ford since he was nine and knows every sandbar by the way the water wrinkles over it. Tells it louder after dark.',
    schedule: {
      morning: 'ferry-office',
      afternoon: 'ford-market',
      evening: 'low-water',
      night: 'low-water',
    },
  },
];
