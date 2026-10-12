import { look } from '../../look';
import { statLine } from '../../statLine';
import type { PersonDef } from '../../types';

/** The village's chūnin (besides Iruka, who teaches at the academy): desk, gate and clinic. */
export const VILLAGE_CHUNIN: readonly PersonDef[] = [
  {
    id: 'izumo',
    name: 'Izumo',
    familyName: 'Kamizuki',
    role: 'shinobi',
    title: 'Chūnin',
    rank: 'chunin',
    stats: statLine('D', { ninjutsu: 'C', chakraControl: 'C', perception: 15 }),
    traitIds: ['kind', 'lazy'],
    appearance: look('long', {
      hair: '#4a2f1d',
      eyes: '#2a1d14',
      skin: '#f3d2b3',
      outfit: '#2f4f7a',
    }),
    specialty: 'ninjutsu',
    bio: 'Keeps the gate and the mission desk with Kotetsu. Hides one eye behind his hair, and a sticky trick up his sleeve.',
    schedule: {
      morning: 'mission-desk',
      afternoon: 'mission-desk',
      evening: 'training-grounds',
      night: null,
    },
    teacher: {
      quirk: 'patient',
      teaches: ['syrup-capture-field', 'hidden-mist'],
      price: {
        kind: 'ryo',
        perSession: 10,
        line: '“Cover my desk shift’s tea money and it’s a deal.”',
      },
    },
  },
  {
    id: 'kotetsu',
    name: 'Kotetsu',
    familyName: 'Hagane',
    role: 'shinobi',
    title: 'Chūnin',
    rank: 'chunin',
    stats: statLine('D', { taijutsu: 'C', strength: 'C', stamina: 15 }),
    traitIds: ['brash', 'lazy'],
    appearance: look('spiky', {
      hair: '#1b1a22',
      eyes: '#2a1d14',
      skin: '#e2b48c',
      outfit: '#2f4f7a',
    }),
    specialty: 'taijutsu',
    bio: 'Izumo’s partner at the gate, with a bandage across his nose and a mace he swears is a sword.',
    schedule: {
      morning: 'mission-desk',
      afternoon: 'mission-desk',
      evening: 'training-grounds',
      night: 'izakaya',
    },
    teacher: {
      quirk: 'distracted',
      teaches: ['dynamic-entry'],
      price: { kind: 'ryo', perSession: 10, line: '“You buy lunch. Big lunch.”' },
    },
  },
  {
    id: 'hana',
    name: 'Hana',
    familyName: 'Inuzuka',
    role: 'shinobi',
    title: 'Chūnin, animal medic',
    rank: 'chunin',
    stats: statLine('D', { taijutsu: 'C', speed: 'C', perception: 'C', chakraControl: 15 }),
    clanId: 'inuzuka',
    traitIds: ['kind', 'focused'],
    appearance: look('long', {
      hair: '#4a2f1d',
      eyes: '#8a5a2b',
      skin: '#e2b48c',
      outfit: '#e8e0d0',
    }),
    specialty: 'taijutsu',
    bio: 'Kiba’s older sister and the clan’s vet. Patches up dogs and genin with the same brisk hands.',
    schedule: { morning: 'hospital', afternoon: 'training-grounds', evening: null, night: null },
    teacher: {
      quirk: 'patient',
      teaches: ['mystical-palm', 'passing-fang', 'cherry-blossom-impact'],
      price: { kind: 'bond', minStage: 1 },
    },
  },
];
