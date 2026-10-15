/**
 * Places people go to unwind: the bar (an izakaya, a teahouse, a gambling house's front room)
 * and hot water (a natural spring or a town bathhouse). Both are where bonds are made off duty.
 */

/**
 * Something played at a bar's tables: dice, a board game, arm-wrestling. For now it is what
 * the room looks like; a mini-game will hang on its id.
 */
export interface Pastime {
  readonly id: string;
  readonly name: string;
  /** What it looks like from the counter. No numbers. */
  readonly scene: string;
}

export interface TavernFields {
  /** A bar: open evenings and nights, with a menu and whoever drops in. */
  readonly kind: 'tavern';
  readonly keeper: string;
  readonly foodIds: readonly string[];
  /** What buying everyone inside a round costs. */
  readonly roundCost: number;
  /** What a drink costs when you sit down with one person. */
  readonly cupCost: number;
  /** What is played at the back tables. */
  readonly pastimes?: readonly Pastime[];
}

/** Hot water from the ground, or a town's heated tubs. */
export type Waters = 'spring' | 'bathhouse';

export interface OnsenFields {
  /** A hot spring or bathhouse: a soak for ryo, never open at night (validated). */
  readonly kind: 'onsen';
  readonly keeper: string;
  readonly waters: Waters;
  readonly soakCost: number;
}
