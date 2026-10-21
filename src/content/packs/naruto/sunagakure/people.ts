import { allDay, look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/**
 * The Outer Ring's people, met only in the Sand: the Envoy's clerk who hands foreigners their
 * work and has not forgiven the Leaf, the Cistern House's keeper, a widow of Sakumo Hatake's
 * raids, and the breaker who runs the Breaking Pens.
 */
const SUNA = 'sunagakure';

export const SUNA_PEOPLE: readonly PersonDef[] = [
  {
    id: 'suna-kiyose',
    name: 'Kiyose',
    familyName: '',
    pronouns: 'he',
    homeLocationId: SUNA,
    role: 'shinobi',
    title: 'Clerk of the Envoy’s Office',
    rank: 'chunin',
    stats: statLine('D', {
      intellect: 'B',
      ninjutsu: 'C',
      perception: 'C',
      chakraControl: 'C',
      willpower: 'C',
    }),
    traitIds: ['proud', 'diligent'],
    appearance: look(
      'short',
      { hair: '#2a1d14', eyes: '#3a3632', skin: '#c99a6e', outfit: '#c9a46a' },
      'forehead',
      { expression: 'stern', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'His father went out with the patrol that met Sakumo Hatake’s men and came back in a sack. He gives Leaf shinobi their work politely, and always the worst of it.',
    schedule: {
      morning: 'envoys-office',
      afternoon: 'envoys-office',
      evening: 'last-well',
      night: null,
    },
  },
  {
    id: 'madam-ruri',
    name: 'Ruri',
    familyName: '',
    pronouns: 'she',
    homeLocationId: SUNA,
    role: 'villager',
    title: 'Keeper of the Cistern House',
    rank: 'civilian',
    stats: statLine(3, {
      intellect: 10,
      perception: 9,
      taijutsu: 0,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['cunning', 'calm'],
    appearance: look(
      'buns',
      { hair: '#3a3632', eyes: '#5f4a3a', skin: '#b98a5e', outfit: '#3e6b5a' },
      'belt',
      { expression: 'smirk', age: 'grown', mark: 'earrings' },
    ),
    bio: 'Owns the water under the Outer Ring and knows it. She charges the Leaf double, and tells them so, and they pay.',
    schedule: allDay('cistern-house'),
  },
  {
    id: 'suna-oyone',
    name: 'Oyone',
    familyName: '',
    pronouns: 'she',
    homeLocationId: SUNA,
    role: 'villager',
    title: 'Spice seller of the bazaar',
    rank: 'civilian',
    stats: statLine(3, {
      willpower: 10,
      perception: 8,
      taijutsu: 0,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['proud', 'tireless'],
    appearance: look(
      'long',
      { hair: '#9a9a9a', eyes: '#2a1d14', skin: '#a5774f', outfit: '#1b1a22' },
      'belt',
      { expression: 'stern', age: 'old' },
    ),
    bio: 'Has worn black since the war. Her husband and both sons died the same winter, in the same stretch of desert, to the same white-haired man from the Leaf.',
    schedule: {
      morning: 'covered-bazaar',
      afternoon: 'covered-bazaar',
      evening: 'covered-bazaar',
      night: null,
    },
  },
  {
    id: 'suna-gozan',
    name: 'Gōzan',
    familyName: '',
    pronouns: 'he',
    homeLocationId: SUNA,
    role: 'shinobi',
    title: 'Master of the Breaking Pens',
    rank: 'chunin',
    stats: statLine('D', {
      strength: 'B',
      willpower: 'B',
      taijutsu: 'C',
      perception: 'C',
      stamina: 'C',
    }),
    traitIds: ['brash', 'diligent'],
    appearance: look(
      'shaved',
      { hair: '#2a1d14', eyes: '#2a1d14', skin: '#c68e63', outfit: '#7a4a2a' },
      'arm',
      { expression: 'stern', age: 'grown', figure: 'broad', mark: 'scar' },
    ),
    specialty: 'taijutsu',
    bio: 'Breaks hounds and camels to the collar and has the bite marks to show for it. He says a beast that thinks is a beast that waits, and he doesn’t keep the ones that wait.',
    schedule: allDay('breaking-pens'),
  },
];
