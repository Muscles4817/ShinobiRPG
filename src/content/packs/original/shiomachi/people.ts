import { allDay, look } from '../../../look';
import { statLine } from '../../../statLine';
import type { PersonDef } from '../../../types';
import { TIDEWIRE } from './techniques';

/** Port Shiomachi's people: they live on the coast and are met only there. */
export const SHIOMACHI_PEOPLE: readonly PersonDef[] = [
  {
    id: 'nagi',
    name: 'Nagi',
    familyName: 'Amikawa',
    homeLocationId: 'port-shiomachi',
    role: 'shinobi',
    title: 'Retired chūnin, net-mender’s son',
    rank: 'chunin',
    stats: statLine('D', { taijutsu: 'C', speed: 'C', chakraControl: 'C', strength: 13 }),
    traitIds: ['calm', 'humble'],
    appearance: look(
      'shaved',
      { hair: '#3a3a3a', eyes: '#2a1d14', skin: '#b97a50', outfit: '#2f4f5a' },
      'neck',
    ),
    specialty: 'taijutsu',
    bio: 'Left the village after a war he will not talk about. Mends nets now, and teaches wire to anyone who asks twice.',
    schedule: {
      morning: 'breakwater',
      afternoon: 'net-menders',
      evening: 'breakwater',
      night: 'salt-lantern',
    },
    teacher: {
      quirk: 'patient',
      teaches: [...TIDEWIRE],
      price: {
        kind: 'all',
        parts: [
          { kind: 'bond', minStage: 1, line: '“I don’t teach strangers. Sit with me first.”' },
          {
            kind: 'mission',
            missionId: 'harbour-drowned-nets',
            line: '“Bring up the nets off the old wreck. Then you’ll know what wire is for.”',
          },
        ],
      },
    },
  },
  {
    id: 'harbourmaster-kai',
    name: 'Kai',
    familyName: 'Ushio',
    homeLocationId: 'port-shiomachi',
    role: 'villager',
    title: 'Harbourmaster',
    rank: 'civilian',
    stats: statLine(4, {
      intellect: 10,
      perception: 10,
      willpower: 9,
      taijutsu: 1,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 1,
      fuuinjutsu: 0,
    }),
    traitIds: ['proud', 'diligent'],
    appearance: look(
      'short',
      { hair: '#8a7a6a', eyes: '#2a1d14', skin: '#c68e63', outfit: '#1f3a5a' },
      'arm',
    ),
    bio: 'Knows every boat in the harbour by the sound of its oars, and which ones lie about their cargo.',
    schedule: allDay('harbour-office'),
  },
  {
    id: 'umi',
    name: 'Umi',
    familyName: 'Isogai',
    homeLocationId: 'port-shiomachi',
    role: 'villager',
    title: 'Fisher’s daughter',
    rank: 'civilian',
    stats: statLine(3, {
      intellect: 6,
      perception: 8,
      willpower: 9,
      taijutsu: 2,
      ninjutsu: 0,
      genjutsu: 0,
      kenjutsu: 0,
      fuuinjutsu: 0,
    }),
    traitIds: ['brash', 'curious'],
    favouriteRecipeId: 'kelp-fish-broth',
    recipes: [
      { recipeId: 'urchin-rice', minStage: 2 },
      { recipeId: 'puffer-hot-pot', minStage: 3 },
      { recipeId: 'turtle-soup', minStage: 4 },
    ],
    appearance: look(
      'ponytail',
      { hair: '#2a1d14', eyes: '#3a5a7a', skin: '#d9a070', outfit: '#b8322c' },
      'arm',
    ),
    bio: 'Throws knives at driftwood all day. Wants to be a shinobi more than she wants to be a fisher, and says so.',
    schedule: {
      morning: 'fish-market',
      afternoon: 'breakwater',
      evening: 'fish-market',
      night: null,
    },
  },
];
