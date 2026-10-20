import { look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';

/** Tanzaku Town’s people: they live in the castle town and are met only there. */
export const TANZAKU_PEOPLE: readonly PersonDef[] = [
  {
    id: 'okichi',
    name: 'Okichi',
    familyName: '',
    pronouns: 'she',
    homeLocationId: 'tanzaku-town',
    role: 'villager',
    title: 'Dice dealer at the Short Odds',
    rank: 'civilian',
    stats: statLine(4, {
      perception: 10,
      intellect: 9,
      speed: 8,
      taijutsu: 1,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['cunning', 'calm'],
    appearance: look(
      'buns',
      { hair: '#2a1d14', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#7a2a3a' },
      'arm',
    ),
    bio: 'Can tell a loaded die by the sound it makes in the cup. Remembers every face that ever won big, and every one that ran.',
    schedule: {
      morning: null,
      afternoon: 'festival-street',
      evening: 'short-odds',
      night: 'short-odds',
    },
  },
  {
    id: 'sosuke',
    name: 'Sōsuke',
    familyName: 'Aburame',
    pronouns: 'he',
    homeLocationId: 'tanzaku-town',
    role: 'shinobi',
    title: 'Aburame who walked out',
    rank: 'chunin',
    stats: statLine('D', { ninjutsu: 'C', chakraControl: 'C', perception: 'C' }),
    clanId: 'aburame',
    traitIds: ['cunning', 'calm'],
    appearance: look(
      'shaggy',
      { hair: '#2a1d14', eyes: '#1b1a22', skin: '#e2b48c', outfit: '#4a4a3a' },
      'neck',
    ),
    specialty: 'ninjutsu',
    bio: 'Left the clan over a quarrel he says was about insects and wasn’t. Lives off the dice tables and keeps his hive fed on the castle town’s moths.',
    schedule: {
      morning: 'lucky-cat-inn',
      afternoon: 'festival-street',
      evening: 'short-odds',
      night: 'short-odds',
    },
    hiveRite: { clanId: 'aburame', minStage: 3 },
  },
];
