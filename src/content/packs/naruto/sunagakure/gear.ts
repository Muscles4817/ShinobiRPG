import type { GearDef } from '../../../types';

/** What the Windbreak Workshop sells a foreigner: a war fan and a veil against the sand. */
export const SUNA_GEAR: readonly GearDef[] = [
  {
    id: 'war-fan',
    name: 'Iron-Ribbed War Fan',
    description:
      'A fan of oiled canvas on iron ribs, as long as your arm. Closed it is a club; open, it moves the wind.',
    kind: 'weapon',
    weaponClass: 'fan',
    boosts: { verb: 'area' },
    rank: 'C',
    cost: 420,
    icon: 'wind',
  },
  {
    id: 'sand-veil',
    name: 'Sand Veil',
    description:
      'A hooded travelling robe sewn over mesh, with a veil for the face. Keeps off the sun and the sand, and a careless blade with them.',
    kind: 'armour',
    level: 'light',
    rank: 'C',
    cost: 220,
    icon: 'vest',
  },
];
