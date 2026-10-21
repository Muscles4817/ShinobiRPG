import type { TrainingDef } from '../../../types';

/** Drills on the Wind Gallery's ledge and in the puppeteers' Thread Yard. */
export const SUNA_TRAINING: readonly TrainingDef[] = [
  {
    id: 'gale-stance',
    icon: 'wind',
    name: 'Gale Stance',
    spot: 'The lip of the Wind Gallery',
    description:
      'Hold a stance at the edge of the cliff while the desert wind tries to take you off it.',
    slots: 1,
    energyCost: 25,
    gains: { strength: 0.8, willpower: 0.8, stamina: 0.5 },
  },
  {
    id: 'cliff-wind-cutting',
    icon: 'wind',
    name: 'Cutting the Wind',
    spot: 'The far end of the gallery',
    description:
      'Mould your chakra into the gusts as the fan clan’s children do, until they cut where you send them.',
    slots: 1,
    energyCost: 20,
    gains: { ninjutsu: 1, chakraControl: 0.7 },
  },
  {
    id: 'thread-weaving',
    icon: 'seal',
    name: 'Thread Weaving',
    spot: 'A bench under the hanging dummies',
    description:
      'Run chakra threads to a dummy’s ten fingers and make it pick up a cup without spilling it.',
    slots: 1,
    energyCost: 15,
    gains: { chakraControl: 1.2, intellect: 0.6 },
  },
  {
    id: 'dummy-dodging',
    icon: 'eye',
    name: 'Dodging the Dummies',
    spot: 'The middle of the Thread Yard',
    description: 'Stand among swinging dummies with blunted blades and come out without a bruise.',
    slots: 1,
    energyCost: 25,
    gains: { speed: 0.9, perception: 0.8 },
  },
];
