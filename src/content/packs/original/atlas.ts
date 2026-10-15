import type { AtlasDef } from '../../atlas';

/**
 * The Land of Embers: the lantern village in its hills, the coast and Salt Bay to the south,
 * the river down to Kiri Ford, the Reikon Mountains to the north and the dunes past the
 * eastern border.
 */
export const ORIGINAL_ATLAS: AtlasDef = {
  lands: [
    [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 52 },
      { x: 92, y: 56 },
      { x: 84, y: 54 },
      { x: 76, y: 52 },
      { x: 70, y: 47 },
      { x: 68, y: 42 },
      { x: 64, y: 40.5 },
      { x: 58, y: 42 },
      { x: 52, y: 45 },
      { x: 44, y: 46 },
      { x: 36, y: 48 },
      { x: 30, y: 51 },
      { x: 24, y: 54.5 },
      { x: 16, y: 56 },
      { x: 8, y: 58 },
      { x: 0, y: 58 },
    ],
    [
      { x: 46, y: 58 },
      { x: 49, y: 57 },
      { x: 50.5, y: 60 },
      { x: 47, y: 61.5 },
    ],
    [
      { x: 70, y: 62 },
      { x: 74, y: 61 },
      { x: 75, y: 64 },
      { x: 71, y: 65 },
    ],
    [
      { x: 12, y: 63 },
      { x: 15, y: 62.5 },
      { x: 15.5, y: 65 },
      { x: 12.5, y: 65.5 },
    ],
  ],
  home: [
    { x: 0, y: 0 },
    { x: 72, y: 0 },
    { x: 70, y: 14 },
    { x: 74, y: 28 },
    { x: 78, y: 46 },
    { x: 80, y: 70 },
    { x: 0, y: 70 },
  ],
  borders: [
    [
      { x: 72, y: 0 },
      { x: 70, y: 14 },
      { x: 74, y: 28 },
      { x: 78, y: 46 },
      { x: 78, y: 53 },
    ],
  ],
  rivers: [
    [
      { x: 44, y: 3 },
      { x: 50, y: 14 },
      { x: 58, y: 22 },
      { x: 63, y: 30 },
      { x: 66, y: 37 },
      { x: 66, y: 41 },
    ],
  ],
  labels: [
    { text: 'Land of Embers', at: { x: 22, y: 36 }, kind: 'land', large: true },
    { text: 'Land of Dunes', at: { x: 88, y: 44 }, kind: 'land', large: true },
    { text: 'Reikon Mountains', at: { x: 58, y: 8 }, kind: 'feature' },
    { text: 'Ash Wood', at: { x: 26, y: 22 }, kind: 'feature' },
    { text: 'Salt Bay', at: { x: 54, y: 51 }, kind: 'sea' },
    { text: 'The Southern Sea', at: { x: 28, y: 66 }, kind: 'sea' },
  ],
};
