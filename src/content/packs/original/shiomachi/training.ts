import type { TrainingDef } from '../../../types';

/** Drills on the breakwater, against the sea. */
export const SHIOMACHI_TRAINING: readonly TrainingDef[] = [
  {
    id: 'tide-runs',
    icon: 'wave',
    name: 'Tide Runs',
    spot: 'The breakwater at low tide',
    description: 'Sprint the length of the wall and back before the waves close it off.',
    slots: 1,
    energyCost: 25,
    gains: { speed: 1, stamina: 1 },
  },
  {
    id: 'net-hauling',
    icon: 'fish',
    name: 'Net Hauling',
    spot: 'The boats coming in',
    description: 'Help the crews drag the nets ashore. They pay in fish and insults.',
    slots: 1,
    energyCost: 25,
    gains: { strength: 1.3, taijutsu: 0.5 },
  },
  {
    id: 'spray-stance',
    icon: 'leaf',
    name: 'Spray Stance',
    spot: 'The end of the breakwater',
    description: 'Hold a stance on wet stone while the spray comes over, feet stuck with chakra.',
    slots: 1,
    energyCost: 15,
    gains: { chakraControl: 1.2, willpower: 0.5 },
  },
];
