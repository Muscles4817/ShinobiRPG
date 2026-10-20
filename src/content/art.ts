/** Ids of the drawings content can ask for; the UI's `art/` has one drawing per id. */

/** Drawn scenery the UI knows how to paint. Adding one = add it here and in ui/art. */
export type BackdropId =
  | 'leaf-village'
  | 'lantern-rooftops'
  | 'dunes'
  | 'coast'
  | 'mist'
  | 'mist-village'
  | 'mountain'
  | 'sand-village'
  | 'barge-landing';

/** Small line drawings for places, items and drills. */
export type IconId =
  | 'post'
  | 'bowl'
  | 'board'
  | 'scroll'
  | 'stacks'
  | 'house'
  | 'heal'
  | 'torii'
  | 'lantern'
  | 'fish'
  | 'rice'
  | 'pill'
  | 'tea'
  | 'wind'
  | 'cart'
  | 'fist'
  | 'wave'
  | 'eye'
  | 'leaf'
  | 'tree'
  | 'dango'
  | 'grill'
  | 'sword'
  | 'seal'
  | 'anvil'
  | 'vest'
  | 'charm'
  | 'pot'
  | 'veg'
  | 'sake'
  | 'spring';

/** Every pack's map is this many units across and down; locations sit at points inside it. */
export const MAP_SIZE = { width: 100, height: 70 } as const;
