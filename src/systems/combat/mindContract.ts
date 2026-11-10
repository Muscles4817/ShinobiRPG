/**
 * The shared-mind part of the combat contract (`docs/design/retinue-plan.md`, step 6): several
 * bodies of one mind on one side. They think with the sharpest of them, aim as one and watch
 * each other's backs, so nothing slips up on one unseen while another stands
 * (`engines/plan/sharedMind.ts`). A mind may have a **source**: the one driving the bodies,
 * hidden off the field until a Search, a sense or sharp eyes find it. It takes no turns of its
 * own, and the side is beaten when it falls or when every body it drives has. A fighter with the
 * `raises` perk brings a fallen body of its mind back up, for chakra, unless it fell under a seal
 * (`rules/minds.ts`).
 */
export interface CombatMind {
  /** Which mind: fighters of one side with the same id share it. */
  readonly id: string;
  /** The mind's source, hidden off the field. */
  readonly source?: true;
}
