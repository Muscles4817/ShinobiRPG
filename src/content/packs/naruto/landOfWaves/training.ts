import type { TrainingDef } from '../../../types';

/** Drills at the bridge and in the forest behind Tazuna’s house. */
export const WAVES_TRAINING: readonly TrainingDef[] = [
  {
    id: 'scaffold-hauling',
    icon: 'post',
    name: 'Scaffold Hauling',
    spot: 'The bridge site',
    description: 'Carry stone and timber out along the scaffolds for the builders who stayed.',
    slots: 1,
    energyCost: 25,
    gains: { strength: 1.3, stamina: 0.7 },
  },
  {
    id: 'tide-pylon-stance',
    icon: 'wave',
    name: 'Pylon Stance',
    spot: 'The pylons at the end of the bridge',
    description: 'Hold a stance on a wet pylon as the swell rises round your ankles.',
    slots: 1,
    energyCost: 15,
    gains: { chakraControl: 1, willpower: 0.7 },
  },
  {
    id: 'kunai-mark-climbs',
    icon: 'tree',
    name: 'Kunai-Mark Climbs',
    spot: 'The tall trees behind the house',
    description: 'Run up the trunk, cut a mark where you slip, and try to beat it next time.',
    slots: 1,
    energyCost: 20,
    gains: { chakraControl: 1.3, speed: 0.4 },
  },
];
