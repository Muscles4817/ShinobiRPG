import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

import { EBISU_ARSENAL, IRUKA_ARSENAL } from './arsenals';

import { IRUKA_TEACHER } from '../teachers';

/** The academy's teachers and the village's elite tutor. */
export const INSTRUCTORS: readonly PersonDef[] = [
  {
    id: 'iruka',
    name: 'Iruka',
    familyName: 'Umino',
    pronouns: 'he',
    role: 'instructor',
    title: 'Academy instructor',
    rank: 'chunin',
    stats: statLine('D', { ninjutsu: 'C', taijutsu: 'C', intellect: 'C' }),
    traitIds: ['kind', 'diligent'],
    favouriteRecipeId: 'miso-soup',
    appearance: look(
      'ponytail',
      {
        hair: '#4a2f1d',
        eyes: '#2a1d14',
        skin: '#c68e63',
        outfit: '#2f4f7a',
      },
      'forehead',
      { mark: 'scar', expression: 'smile', age: 'grown' },
    ),
    bio: 'Taught you everything you know, hands out missions in the afternoons, and pays for ramen far too often.',
    schedule: {
      morning: 'academy',
      afternoon: 'mission-desk',
      evening: 'shopping-district',
      night: 'training-grounds',
    },
    teacher: IRUKA_TEACHER,
    arsenal: IRUKA_ARSENAL,
  },
  {
    id: 'ebisu',
    name: 'Ebisu',
    familyName: '',
    pronouns: 'he',
    role: 'instructor',
    title: 'Special Jōnin, elite tutor',
    rank: 'jonin',
    stats: statLine('C', { ninjutsu: 'B', intellect: 'B', chakraControl: 'B' }),
    traitIds: ['proud', 'diligent'],
    appearance: look('short', {
      hair: '#1b1a22',
      eyes: '#1b1a22',
      skin: '#f3d2b3',
      outfit: '#2f4f7a',
    }),
    specialty: 'ninjutsu',
    bio: 'Tutor to the Hokage’s grandson. Believes in shortcuts strictly applied, and in sunglasses.',
    schedule: {
      morning: 'academy',
      afternoon: 'training-grounds',
      evening: 'shopping-district',
      night: null,
    },
    teacher: {
      quirk: 'harsh',
      steers: { focus: 'weakest', freeAtStage: 3 },
      teaches: ['body-flicker', 'chakra-sensing'],
      price: {
        kind: 'ryo',
        perSession: 50,
        line: '“The elite path is a paid path. My other pupil is the Honourable Grandson.”',
      },
    },
    arsenal: EBISU_ARSENAL,
  },
];
