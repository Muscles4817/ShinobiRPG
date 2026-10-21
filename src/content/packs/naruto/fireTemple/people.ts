import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/** The Fire Temple's people: they live at the temple and are met only there. */
export const FIRE_TEMPLE_PEOPLE: readonly PersonDef[] = [
  {
    id: 'chiriku',
    name: 'Chiriku',
    familyName: '',
    pronouns: 'he',
    homeLocationId: 'fire-temple',
    role: 'shinobi',
    title: 'Head monk of the Fire Temple',
    rank: 'jonin',
    stats: statLine(14, {
      stamina: 18,
      reserves: 22,
      chakraControl: 24,
      intellect: 15,
      perception: 18,
      willpower: 30,
      taijutsu: 28,
      ninjutsu: 18,
      genjutsu: 10,
      kenjutsu: 8,
    }),
    traitIds: ['calm', 'humble'],
    appearance: look(
      'shaved',
      { hair: '#1a1a1a', eyes: '#2a1d14', skin: '#c68e63', outfit: '#d87a2a' },
      'belt',
    ),
    specialty: 'taijutsu',
    bio: 'One of the Twelve Guardian Ninja, long ago. Now he leads the monks at prayer and in the courtyard, and asks visitors to do the same.',
    schedule: {
      morning: 'temple-courtyard',
      afternoon: 'temple-courtyard',
      evening: 'temple-kitchen',
      night: null,
    },
  },
  {
    id: 'novice-kei',
    name: 'Kei',
    familyName: '',
    pronouns: 'they',
    homeLocationId: 'fire-temple',
    role: 'villager',
    title: 'Temple novice',
    rank: 'civilian',
    stats: statLine(6, {
      strength: 5,
      stamina: 7,
      reserves: 5,
      chakraControl: 3,
      willpower: 9,
      taijutsu: 3,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['diligent', 'curious'],
    appearance: look(
      'shaved',
      { hair: '#2a1d14', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#d87a2a' },
      'belt',
    ),
    bio: 'Sent to the temple at eight. Sweeps the stair every morning and asks every shinobi what the outside is like.',
    schedule: {
      morning: 'temple-courtyard',
      afternoon: 'temple-kitchen',
      evening: 'pilgrims-hall',
      night: null,
    },
  },
];
