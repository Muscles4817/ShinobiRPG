import type { GearDef } from '../../../types';

/** The net-mender's: what a fishing town makes when it makes weapons. */
export const SHIOMACHI_GEAR: readonly GearDef[] = [
  {
    id: 'fishhook-darts',
    name: 'Fishhook Darts',
    description: 'Barbed and weighted. They go in easily and come out badly.',
    kind: 'weapon',
    shape: 'throwing',
    rank: 'D',
    cost: 130,
    icon: 'fish',
  },
  {
    id: 'gutting-needles',
    name: 'Gutting Needles',
    description: 'Long steel needles for cleaning fish, ground finer for cleaning other things.',
    kind: 'weapon',
    shape: 'senbon',
    rank: 'D',
    cost: 110,
    icon: 'fish',
  },
  {
    id: 'oilskin-coat',
    name: 'Oilskin Coat',
    description: 'Waxed canvas over quilting. Turns spray, rain and the odd blade.',
    kind: 'armour',
    level: 'light',
    rank: 'D',
    cost: 150,
    icon: 'vest',
  },
  {
    id: 'cork-float-charm',
    name: 'Cork Float Charm',
    description: 'A net float carved with a binding knot. Whatever you tie, stays tied.',
    kind: 'focus',
    boosts: { verb: 'pin' },
    rank: 'C',
    cost: 260,
    icon: 'charm',
  },
];
