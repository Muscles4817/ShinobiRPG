/**
 * Gathering (`docs/design/defence-plan.md`, slice 5): a fighter may give their turn to drawing
 * chakra and breath back, much more than an exchange's own trickle (`chakra.ts`, `breath.ts`).
 * It leaves them open until their next turn: no Evade or Brace, only a Guard of the ready
 * defences, and they slip far less (`GATHER_OPEN`). A fighter who wants their finisher again
 * spends a turn getting it back, and a sharp foe punishes the turn.
 */

/** Share of their whole chakra a fighter draws back by gathering… */
export const GATHER_CHAKRA_SHARE = 0.2;
/** …and at least this much. */
export const GATHER_CHAKRA_MIN = 10;
/** Share of their whole breath they get back. */
export const GATHER_BREATH_SHARE = 0.3;
/** What a gatherer's slip is multiplied by while they gather. */
export const GATHER_OPEN = 0.4;

/** Chakra gathered on a turn, from the fighter's whole. */
export function chakraGathered(maxChakra: number): number {
  return Math.max(GATHER_CHAKRA_MIN, Math.round(maxChakra * GATHER_CHAKRA_SHARE));
}

/** Breath gathered on a turn, from the fighter's whole. */
export function breathGathered(maxBreath: number): number {
  return Math.round(maxBreath * GATHER_BREATH_SHARE);
}
