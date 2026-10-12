import { look } from '../../look';
import { statLine } from '../../statLine';
import type { PersonDef } from '../../types';

/**
 * The heads of Tōrōgakure's four clans, all jōnin. Each keeps the clan's own techniques and
 * teaches them only to their own; anyone may still train with them.
 */
export const CLAN_HEADS: readonly PersonDef[] = [
  {
    id: 'enji',
    name: 'Enji',
    familyName: 'Hibana',
    role: 'leader',
    title: 'Head of the Hibana',
    rank: 'jonin',
    stats: statLine('C', { ninjutsu: 34, stamina: 'B', reserves: 'A', willpower: 'B' }),
    clanId: 'hibana',
    traitIds: ['proud', 'brash'],
    appearance: look('short', {
      hair: '#b8322c',
      eyes: '#c88a2a',
      skin: '#e2b48c',
      outfit: '#7a3b2a',
    }),
    specialty: 'ninjutsu',
    bio: 'Akari’s uncle, and the only person she still lets correct her. Smells faintly of smoke.',
    schedule: {
      morning: 'training-grounds',
      afternoon: 'mission-hall',
      evening: null,
      night: 'izakaya',
    },
    teacher: {
      quirk: 'harsh',
      steers: { focus: 'specialty', freeAtStage: 3 },
      teaches: ['hibana-spark', 'hibana-wildfire'],
      price: {
        kind: 'all',
        parts: [
          { kind: 'bond', minStage: 2 },
          {
            kind: 'mission',
            missionId: 'storehouse-ghost',
            line: '“Clear the old storehouse first. I don’t teach people who flinch.”',
          },
        ],
      },
    },
  },
  {
    id: 'sayo',
    name: 'Sayo',
    familyName: 'Tōkaku',
    role: 'leader',
    title: 'Head of the Tōkaku',
    rank: 'jonin',
    stats: statLine('C', { genjutsu: 'A', perception: 'A', willpower: 'B', speed: 10 }),
    clanId: 'tokaku',
    traitIds: ['calm', 'curious'],
    appearance: look(
      'buns',
      { hair: '#e8e0d0', eyes: '#8ab4d8', skin: '#f3d2b3', outfit: '#3a3a5e' },
      'neck',
    ),
    specialty: 'genjutsu',
    bio: 'Old enough to have buried most of her friends, and still talks with all of them.',
    schedule: {
      morning: null,
      afternoon: 'training-grounds',
      evening: 'market-street',
      night: null,
    },
    teacher: {
      quirk: 'distracted',
      teaches: ['guiding-light', 'lantern-procession'],
      price: {
        kind: 'favour',
        favourId: 'sayo-offering',
        ask: 'Sayo wants rice left at the shrine for a guest only she can see.',
      },
    },
  },
  {
    id: 'daigo',
    name: 'Daigo',
    familyName: 'Kurogane',
    role: 'leader',
    title: 'Head of the Kurogane',
    rank: 'jonin',
    stats: statLine('C', { kenjutsu: 'A', strength: 'A', stamina: 'B', intellect: 'B' }),
    clanId: 'kurogane',
    traitIds: ['humble', 'diligent'],
    appearance: look(
      'shaved',
      { hair: '#3a3a42', eyes: '#2a1d14', skin: '#a8714c', outfit: '#3e4a52' },
      'arm',
    ),
    specialty: 'kenjutsu',
    bio: 'Master of the clan forge. Tests every blade on his own forearm first, and has the marks.',
    schedule: {
      morning: 'kurogane-forge',
      afternoon: 'kurogane-forge',
      evening: 'training-grounds',
      night: 'izakaya',
    },
    teacher: {
      quirk: 'patient',
      teaches: ['forge-cut', 'tempered-edge'],
      price: {
        kind: 'ryo',
        perSession: 35,
        line: '“Coal, quench oil, a whetstone. You pay for the steel.”',
      },
    },
  },
  {
    id: 'kazane',
    name: 'Kazane',
    familyName: 'Shimenawa',
    role: 'leader',
    title: 'Head of the Shimenawa',
    rank: 'jonin',
    stats: statLine('C', { fuuinjutsu: 'A', chakraControl: 'A', intellect: 'B' }),
    clanId: 'shimenawa',
    traitIds: ['calm', 'cunning'],
    appearance: look('long', {
      hair: '#1b1a22',
      eyes: '#5a7a4a',
      skin: '#f3d2b3',
      outfit: '#e8e0d0',
    }),
    specialty: 'fuuinjutsu',
    bio: 'Keeps the shrine ropes, the clan ledger and a list of every spirit the village owes.',
    schedule: { morning: 'academy', afternoon: null, evening: 'training-grounds', night: null },
    teacher: {
      quirk: 'natural',
      teaches: ['binding-rope', 'sacred-rope-ward'],
      price: {
        kind: 'all',
        parts: [
          { kind: 'bond', minStage: 1 },
          {
            kind: 'mission',
            missionId: 'shrine-weeding',
            line: '“Tend the shrine grounds once. Then you may learn what the ropes are for.”',
          },
        ],
      },
    },
  },
];
