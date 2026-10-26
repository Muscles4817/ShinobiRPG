import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';
import { GRAVEFIELD, MOSS_STEP } from './techniques';

/**
 * The two people who live out in the wild country and teach there: the hermit of the Cedar Deep,
 * a tracker who walked away from the village, and the keeper of the Old Battlefield, a swordsman
 * who stayed with the dead. Each is met only where they live, and teaches on their own ground.
 */
export const WILD_FOLK: readonly PersonDef[] = [
  {
    id: 'oboro',
    name: 'Oboro',
    familyName: 'Sakane',
    pronouns: 'she',
    homeLocationId: 'cedar-deep',
    role: 'shinobi',
    title: 'The hermit of the Cedar Deep',
    rank: 'jonin',
    stats: statLine(14, {
      speed: 15,
      stamina: 12,
      chakraControl: 17,
      intellect: 14,
      perception: 22,
      willpower: 16,
      taijutsu: 12,
      ninjutsu: 19,
      genjutsu: 11,
      kenjutsu: 8,
      fuuinjutsu: 7,
    }),
    traitIds: ['calm', 'focused'],
    appearance: look(
      'long',
      { hair: '#b8b2a8', eyes: '#3a4a2a', skin: '#c99a6e', outfit: '#3f4a32' },
      'arm',
    ),
    specialty: 'ninjutsu',
    bio: 'Tracked for the village for thirty years, then one autumn went into the cedars after a deer and did not come back out. She sends no word home and does not want any.',
    schedule: {
      morning: 'cedar-deep-paths',
      afternoon: 'cedar-deep-woods',
      evening: 'cedar-deep-camp',
      night: 'cedar-deep-camp',
    },
    teacher: {
      quirk: 'patient',
      teaches: [...MOSS_STEP],
      price: {
        kind: 'bond',
        minStage: 1,
        line: '“Sit down. Be quiet. Come back tomorrow and do it again.”',
      },
    },
  },
  {
    id: 'gonzo',
    name: 'Gonzō',
    familyName: 'Hidaka',
    pronouns: 'he',
    homeLocationId: 'old-battlefield',
    role: 'shinobi',
    title: 'Keeper of the Old Battlefield',
    rank: 'jonin',
    stats: statLine(14, {
      strength: 17,
      speed: 13,
      stamina: 18,
      chakraControl: 12,
      intellect: 13,
      perception: 15,
      willpower: 20,
      taijutsu: 14,
      ninjutsu: 7,
      genjutsu: 5,
      kenjutsu: 22,
      fuuinjutsu: 6,
    }),
    traitIds: ['humble', 'tireless'],
    appearance: look(
      'shaved',
      { hair: '#6a6258', eyes: '#2a1d14', skin: '#b07a52', outfit: '#4a3a2e' },
      'neck',
    ),
    specialty: 'kenjutsu',
    bio: 'The only one of his company to walk off the field, and the only one who went back. He keeps the blades upright and the names legible, and teaches the old drill to anyone who will help him do it.',
    schedule: {
      morning: 'old-battlefield-rows',
      afternoon: 'old-battlefield-rows',
      evening: 'old-battlefield-camp',
      night: 'old-battlefield-camp',
    },
    teacher: {
      quirk: 'harsh',
      teaches: [...GRAVEFIELD],
      price: {
        kind: 'all',
        parts: [
          { kind: 'bond', minStage: 1, line: '“Walk the rows with me first. Then we’ll talk.”' },
          {
            kind: 'ryo',
            perSession: 20,
            line: 'He holds out a hand for incense money, for the field.',
          },
        ],
      },
    },
  },
];
