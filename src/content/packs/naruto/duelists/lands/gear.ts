import type { GearDef } from '../../../../types';

/** Weapons only the far villages' fighters carry: none of them is sold anywhere. */
export const FAR_GEAR: readonly GearDef[] = [
  {
    id: 'seven-swords',
    name: 'Seven Swords',
    description:
      'Seven plain swords, carried on the back and drawn into the crooks of the arms and legs, with one held in the teeth.',
    kind: 'weapon',
    weaponClass: 'sword',
    rank: 'A',
    unique: true,
    blades: 7,
    cost: 0,
    icon: 'sword',
  },
  {
    id: 'cleaver-blade',
    name: 'Cleaver Blade',
    description: 'A broad, square-ended blade, heavy as a butcher’s and swung as lazily.',
    kind: 'weapon',
    weaponClass: 'greatsword',
    rank: 'B',
    unique: true,
    cost: 0,
    icon: 'sword',
  },
  {
    id: 'kusarigama',
    name: 'Kusarigama',
    description: 'A sickle on a long chain, swung wide; it is drawn back before anyone can close.',
    kind: 'weapon',
    weaponClass: 'chain',
    rank: 'A',
    unique: true,
    cost: 0,
    icon: 'sword',
  },
];
