import type { TrainingDef } from '../../../types';

/** The monks' drills in the temple courtyard. */
export const FIRE_TEMPLE_TRAINING: readonly TrainingDef[] = [
  {
    id: 'staff-forms',
    icon: 'fist',
    name: 'Staff Forms',
    spot: 'The temple courtyard',
    description: 'A hundred forms with a monk’s staff, then a hundred more. Nobody counts aloud.',
    slots: 1,
    energyCost: 25,
    gains: { taijutsu: 1.2, strength: 0.6 },
  },
  {
    id: 'thousand-steps',
    icon: 'torii',
    name: 'The Thousand Steps',
    spot: 'The stair up to the bell tower',
    description: 'Up the stone stair and down again, before the bell rings the hour.',
    slots: 1,
    energyCost: 25,
    gains: { stamina: 1.3, willpower: 0.5 },
  },
  {
    id: 'dawn-zazen',
    icon: 'leaf',
    name: 'Dawn Zazen',
    spot: 'The meditation hall',
    description: 'Sit still while the monk with the stick walks behind you. Move, and you’ll know.',
    slots: 1,
    energyCost: 10,
    gains: { willpower: 1.2, chakraControl: 0.6 },
  },
];
