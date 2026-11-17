/**
 * Rules on trial a fighter carries into a fight that turns them on (`CombatExperiments`), as a
 * shape only so the fight state can hold it: each flag is set at the fight's start and read once
 * where its rule lives.
 */
export interface OnTrial {
  /** A ready Dodge that slips an attack up close leaps clear to mid (`leap.ts`). */
  readonly leapsClear?: true;
  /** A step in that reaches close carries a blow (`closeQuarters.ts`). */
  readonly rushes?: true;
  /** Hand signs can be broken up close (`closeQuarters.ts`). */
  readonly crowdable?: true;
  /** May keep their feet when a wide blast catches them (`standing.ts`). */
  readonly standsFirm?: true;
}
