/**
 * Flags a fighter carries into a fight for its close-quarters rules and the rules on trial
 * (`CombatExperiments`), as a shape only so the fight state can hold it: each flag is set at the
 * fight's start and read once where its rule lives.
 */
export interface OnTrial {
  /** A ready Dodge that slips an attack up close leaps clear to mid (`leap.ts`). */
  readonly leapsClear?: true;
  /** A taijutsu fighter: a step in that reaches close carries a blow (`closeQuarters.ts`). */
  readonly rushes?: true;
  /** Hand signs can be broken up close (`closeQuarters.ts`). */
  readonly crowdable?: true;
  /** Changes distance without spending the turn, once a round (`blink.ts`). */
  readonly teleports?: true;
  /** Has blinked this round (`blink.ts`). */
  readonly blinked?: true;
  /** Fights under the far gap: crossing between mid and far is harder (`farGap.ts`). */
  readonly longGap?: true;
}
