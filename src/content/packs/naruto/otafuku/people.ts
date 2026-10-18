import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/** Otafuku Town's people: they live in the quarter and are met only there. */
export const OTAFUKU_PEOPLE: readonly PersonDef[] = [
  {
    id: 'kotone',
    name: 'Kotone',
    familyName: '',
    pronouns: 'she',
    homeLocationId: 'otafuku-town',
    role: 'villager',
    title: 'Shamisen player at the Willow',
    rank: 'civilian',
    stats: statLine(4, {
      perception: 9,
      willpower: 8,
      intellect: 8,
      taijutsu: 0,
      ninjutsu: 0,
      genjutsu: 1,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['calm', 'curious'],
    appearance: look(
      'buns',
      { hair: '#1a1a2a', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#5a2a4a' },
      'arm',
    ),
    bio: 'Plays for travellers every night and hears what they say when they think the music covers it.',
    schedule: {
      morning: null,
      afternoon: 'lantern-row',
      evening: 'willow-teahouse',
      night: 'willow-teahouse',
    },
  },
];
