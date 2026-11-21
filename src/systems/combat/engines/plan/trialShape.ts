/**
 * Flags a fighter carries into a fight for its close-quarters rules and the teleport, as a shape
 * only so the fight state can hold it: each flag is set at the
 * fight's start and read once where its rule lives.
 */
export interface OnTrial {
  /** A taijutsu fighter: a step in that reaches close carries a blow (`closeQuarters.ts`). */
  readonly rushes?: true;
  /** Hand signs can be broken up close (`closeQuarters.ts`). */
  readonly crowdable?: true;
  /** Changes distance without spending the turn, once a round (`blink.ts`). */
  readonly teleports?: true;
  /** Has blinked this round (`blink.ts`). */
  readonly blinked?: true;
}
