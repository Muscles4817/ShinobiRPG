import { allDay, look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/**
 * The Landing's people, met only there: a sand priest who pilots the barges and eats alone, the
 * caravanserai's keeper, and the caravan master who sells everything a crossing needs.
 */
const LANDING = 'kagero-landing';

export const LANDING_PEOPLE: readonly PersonDef[] = [
  {
    id: 'sakyu-sunao',
    name: 'Sunao',
    familyName: 'of the Dunes',
    pronouns: 'she',
    homeLocationId: LANDING,
    clanId: 'sakyu',
    role: 'shinobi',
    title: 'Barge pilot of the Landing',
    rank: 'chunin',
    stats: statLine('D', {
      ninjutsu: 'C',
      perception: 'B',
      chakraControl: 'C',
      stamina: 'C',
      willpower: 'C',
    }),
    traitIds: ['calm', 'tireless'],
    appearance: look(
      'long',
      { hair: '#1b1a22', eyes: '#c9a46a', skin: '#a5774f', outfit: '#8a5a3a' },
      'neck',
      { expression: 'calm', age: 'young', mark: 'earrings' },
    ),
    specialty: 'ninjutsu',
    bio: 'Dark rings round her eyes from the deep sand, like every priest. She brings a barge in twice a week, writes your name down or doesn’t, and eats her supper alone on the deck.',
    schedule: {
      morning: 'barge-yards',
      afternoon: 'barge-office',
      evening: 'barge-yards',
      night: null,
    },
    arsenal: { techniqueIds: ['sand-skiff', 'sand-bullet', 'sandstorm-veil'] },
  },
  {
    id: 'hamada',
    name: 'Hamada',
    familyName: '',
    pronouns: 'he',
    homeLocationId: LANDING,
    role: 'villager',
    title: 'Keeper of the Caravanserai',
    rank: 'civilian',
    stats: statLine(3, {
      perception: 9,
      intellect: 9,
      taijutsu: 0,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['cunning', 'kind'],
    appearance: look(
      'shaved',
      { hair: '#9a9a9a', eyes: '#3a3632', skin: '#b98a5e', outfit: '#c9a46a' },
      'belt',
      { age: 'old', expression: 'smile', facialHair: 'beard' },
    ),
    bio: 'Has kept the well for forty years and knows the price of everything in the Landing, water most of all. Says a priest saved his life once, and won’t say more in company.',
    schedule: allDay('kagero-caravanserai'),
  },
  {
    id: 'rokusuke',
    name: 'Rokusuke',
    familyName: '',
    pronouns: 'he',
    homeLocationId: LANDING,
    role: 'villager',
    title: 'Caravan master',
    rank: 'civilian',
    stats: statLine(4, {
      strength: 9,
      stamina: 10,
      perception: 8,
      taijutsu: 0,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['brash', 'proud'],
    appearance: look(
      'topknot',
      { hair: '#2a1d14', eyes: '#2a1d14', skin: '#c68e63', outfit: '#7a4a2a' },
      'arm',
      { age: 'grown', expression: 'grin', mark: 'scar' },
    ),
    bio: 'Has walked the outer sands with camels more times than he can count and the tainted belt twice, which he counts very carefully. Spits when a priest walks by, and books his goods on their barges all the same.',
    schedule: {
      morning: 'kagero-water-market',
      afternoon: 'kagero-water-market',
      evening: 'kagero-caravanserai',
      night: 'kagero-caravanserai',
    },
  },
];
