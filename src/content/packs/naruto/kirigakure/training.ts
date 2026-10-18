import type { TrainingDef } from '../../../types';

/** Drills on the sea cliffs, in the fog the village is named for. */
export const KIRI_TRAINING: readonly TrainingDef[] = [
  {
    id: 'blind-mist-drill',
    icon: 'eye',
    name: 'Blind in the Mist',
    spot: 'The ledge above the fog bank',
    description: 'Fight with your eyes shut in the fog, and strike at a footstep before it lands.',
    slots: 1,
    energyCost: 20,
    gains: { perception: 1.2, kenjutsu: 0.5 },
  },
  {
    id: 'cliff-surf-run',
    icon: 'wave',
    name: 'Cliff Surf Runs',
    spot: 'The rocks at the foot of the cliffs',
    description: 'Run the rocks between waves, and climb back up when a wave wins.',
    slots: 1,
    energyCost: 25,
    gains: { speed: 1, stamina: 0.8 },
  },
];
