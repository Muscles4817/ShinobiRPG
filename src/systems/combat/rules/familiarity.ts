/**
 * Familiarity: a technique used again and again in one fight is read more easily each time. Its
 * foes slip it more often (`familiarScale`, on the read in the avoid roll), and a fighter
 * choosing on instinct reaches less for a card played turns running (`repeatWeight`), so a fight's attacks vary on
 * their own, and a fighter who reads the fight changes up an attack they've leaned on.
 */

/** The first few uses give nothing away: a technique is only read once it is leaned on… */
const FRESH_USES = 2;
/** …then each further use makes it this much easier to read… */
export const FAMILIAR_PER_USE = 0.12;
/** …up to this many times as likely. */
export const FAMILIAR_MAX = 1.4;
/** Instinct reaches for a card this much less for each turn running it has been played… */
const REPEAT_WEIGHT = 0.85;
/** …but never less than this share. */
const REPEAT_FLOOR = 0.4;
/** Uses running after which someone who reads the fight changes up. */
export const CHANGE_UP_AFTER = 2;

/** How much more easily a technique is read after this many earlier uses. */
export function familiarScale(priorUses: number): number {
  return Math.min(FAMILIAR_MAX, 1 + FAMILIAR_PER_USE * Math.max(0, priorUses - FRESH_USES + 1));
}

/** How much instinct still leans on a card played this many turns running. */
export function repeatWeight(uses: number): number {
  return Math.max(REPEAT_FLOOR, REPEAT_WEIGHT ** Math.max(0, uses));
}
