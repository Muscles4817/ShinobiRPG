import type { TrainingDef } from '../../../types';

/** Drills in the wild country: under the cedars, and among the rows of blades. */
export const WILD_FOLK_TRAINING: readonly TrainingDef[] = [
  {
    id: 'root-running',
    icon: 'tree',
    name: 'Root Running',
    spot: 'The hermit’s paths',
    description: 'Run the old paths between the cedars without stepping on a single root.',
    slots: 1,
    energyCost: 25,
    gains: { speed: 1, perception: 0.6 },
  },
  {
    id: 'still-listening',
    icon: 'eye',
    name: 'Still Listening',
    spot: 'The hermit’s clearing',
    description: 'Sit by the hut until you can name every bird you hear, and where it is.',
    slots: 1,
    energyCost: 10,
    gains: { perception: 1, willpower: 0.5 },
  },
  {
    id: 'row-walking',
    icon: 'sword',
    name: 'Walking the Rows',
    spot: 'Between the blades',
    description:
      'Walk the rows with a wooden sword and cut at each marker as you pass, never touching it.',
    slots: 1,
    energyCost: 25,
    gains: { kenjutsu: 1, stamina: 0.5 },
  },
  {
    id: 'clearing-sand',
    icon: 'leaf',
    name: 'Clearing the Sand',
    spot: 'The keeper’s rounds',
    description: 'Dig out the blades the wind has buried overnight and set them straight again.',
    slots: 1,
    energyCost: 25,
    gains: { strength: 1, stamina: 0.6 },
  },
];
