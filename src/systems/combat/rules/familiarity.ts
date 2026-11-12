/**
 * Familiarity: a technique thrown turns running is read more easily each time. Its foes slip it
 * more often (`familiarScale`, on the read in the avoid roll), and a fighter choosing on
 * instinct reaches less for a card played turns running (`repeatWeight`). The read comes from
 * the run, not the whole fight: a change of move resets it, so mixing attacks pays, and three of
 * one in a row costs more than the next-best move would. A mind that reads the fight picks it up
 * at the full rate; anyone else notices too, at half.
 */

/** The first uses running give nothing away: a technique is only read once it is leaned on… */
export const FRESH_RUN = 2;
/** …then each further use running makes it this much easier to read… */
export const FAMILIAR_PER_USE = 0.3;
/** …up to this many times as likely. */
export const FAMILIAR_MAX = 2;
/** A mind that doesn't read the fight picks up on a move leaned on at this share of the rate. */
export const DULL_READ_SHARE = 0.5;
/** Instinct reaches for a card this much less for each turn running it has been played… */
const REPEAT_WEIGHT = 0.85;
/** …but never less than this share. */
const REPEAT_FLOOR = 0.4;
/** Uses running after which someone who reads the fight changes up. */
export const CHANGE_UP_AFTER = 2;

/**
 * How much more easily a technique is read after this many uses of it running, by a foe who
 * reads the fight (`reader`) or anyone else.
 */
export function familiarScale(priorRun: number, reader = true): number {
  const rate = FAMILIAR_PER_USE * (reader ? 1 : DULL_READ_SHARE);
  return Math.min(FAMILIAR_MAX, 1 + rate * Math.max(0, priorRun - FRESH_RUN + 1));
}

/** How many turns running a fighter has thrown this card before now. */
export function runOf(
  fighter: { readonly streak?: { readonly card: string; readonly turns: number } },
  cardId: string,
): number {
  return fighter.streak?.card === cardId ? fighter.streak.turns : 0;
}

/** How much instinct still leans on a card played this many turns running. */
export function repeatWeight(uses: number): number {
  return Math.max(REPEAT_FLOOR, REPEAT_WEIGHT ** Math.max(0, uses));
}
