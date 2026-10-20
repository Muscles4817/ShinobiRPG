import type { PlaceDef } from '../../../types';

/**
 * The loyal houses' compounds, along the inner canals behind the harbour ward. The bloodline
 * clans' compounds are empty under the purge, so a foreigner never finds them on the quarter.
 */
export const KIRI_COMPOUNDS: readonly PlaceDef[] = [
  {
    id: 'houses-quarter',
    kind: 'quarter',
    name: 'The Houses’ Quarter',
    icon: 'torii',
    blurb: 'The loyal houses, along the inner canals',
    compoundIds: [
      'kasumi-compound',
      'amibari-compound',
      'kurage-compound',
      'isana-compound',
      'shiogama-compound',
    ],
  },
  {
    id: 'kasumi-compound',
    kind: 'compound',
    name: 'The Kasumi Lamp-House',
    icon: 'lantern',
    blurb: 'Braziers smoking on every balcony, feeding the fog',
    clanId: 'kasumi',
  },
  {
    id: 'amibari-compound',
    kind: 'compound',
    name: 'The Register House',
    icon: 'stacks',
    blurb: 'Nets drying in the yard, and a room full of ledgers nobody may read',
    clanId: 'amibari',
  },
  {
    id: 'kurage-compound',
    kind: 'compound',
    name: 'The Kurage Hall',
    icon: 'house',
    blurb: 'White masks on hooks inside the door, and no windows to the street',
    clanId: 'kurage',
  },
  {
    id: 'isana-compound',
    kind: 'compound',
    name: 'The Isana Boatsheds',
    icon: 'wave',
    blurb: 'Whale boats on the slips, and a whale’s jawbone over the gate',
    clanId: 'isana',
  },
  {
    id: 'shiogama-compound',
    kind: 'compound',
    name: 'The Forge-House',
    icon: 'anvil',
    blurb: 'Salt pans in the yard and the smell of brine on hot steel',
    clanId: 'shiogama',
  },
];
