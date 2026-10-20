import type { TrainingDef } from '../../../types';

/** Drills on the sea cliffs and at the Kasumi's fog shrine, in the fog the village is named for. */
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
  {
    id: 'fog-breath-drill',
    icon: 'wind',
    name: 'Fog Breathing',
    spot: 'Beside the Kasumi braziers',
    description:
      'Breathe the shrine’s fog in time with the keepers until your chakra moves the way the mist does.',
    slots: 1,
    energyCost: 15,
    gains: { chakraControl: 1.1, genjutsu: 0.6 },
  },
  {
    id: 'brazier-watch',
    icon: 'lantern',
    name: 'Brazier Watch',
    spot: 'The shrine steps at night',
    description:
      'Keep a brazier fed through the watch, and name every footstep that passes in the fog.',
    slots: 1,
    energyCost: 15,
    gains: { perception: 1, willpower: 0.7 },
  },
];
