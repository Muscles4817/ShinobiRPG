import type { TechniqueDef } from '@/systems/techniques';

import type { GearDef } from '../../../../types';

/**
 * The Flying Thunder God, the Second Hokage's space-time formula that the Fourth made his own:
 * a step to wherever a marked kunai lies. As an escape it is a swap that leaves nothing behind;
 * as an attack it is the pack's Flying Thunder God Slash, made with the marked kunai in hand.
 */
export const THUNDER_GOD_ARTS: readonly TechniqueDef[] = [
  {
    id: 'flying-thunder-god',
    name: 'Flying Thunder God Technique',
    description:
      'The blow lands where they stood an instant before. They are already beside the marked kunai across the field.',
    discipline: 'ninjutsu',
    needs: { control: 'A' },
    effects: [{ verb: 'substitute', power: 20 }],
    chakraCost: 12,
    rank: 'S',
    difficulty: 190,
  },
];

export const THUNDER_GOD_GEAR: readonly GearDef[] = [
  {
    id: 'marked-kunai',
    name: 'Marked Kunai',
    description:
      'A kunai with the Flying Thunder God formula written on its grip. The Fourth’s had three prongs, and the enemy learned to fear the sight of one.',
    kind: 'weapon',
    weaponClass: 'light-blade',
    rank: 'A',
    unique: true,
    cost: 0,
    icon: 'sword',
  },
];
