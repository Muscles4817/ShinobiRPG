/**
 * Leave from the village for trips of your own (jobs need none: their road is orders). A genin
 * goes only on a pass their sensei signs, good for some days; a chūnin has days of leave each
 * season, spent by the day on the road; a jōnin comes and goes. Which rank gets which rule is
 * the game's to say; here are the pass and the allowance.
 */

export interface Leave {
  /** The last day the sensei's pass is good for, or null with none signed. */
  readonly passUntil: number | null;
  /** The season the leave taken was counted in (`seasonIndex`). */
  readonly season: number;
  /** Days of leave taken that season. */
  readonly daysTaken: number;
  /** The day you last left home on a trip of your own, or null while you are home. */
  readonly awaySince: number | null;
}

export const NO_LEAVE: Leave = { passUntil: null, season: 0, daysTaken: 0, awaySince: null };

export function passValid(leave: Leave, day: number): boolean {
  return leave.passUntil !== null && day <= leave.passUntil;
}

/** A pass signed today, good for `days` days. */
export function signPass(leave: Leave, day: number, days: number): Leave {
  return { ...leave, passUntil: day + days - 1 };
}

/** Days of leave left this season, from an allowance of `allowance`. */
export function leaveLeft(leave: Leave, season: number, allowance: number): number {
  return leave.season === season ? Math.max(0, allowance - leave.daysTaken) : allowance;
}

/** Leave spent: `days` more counted this season (a new season starts the count again). */
export function takeLeave(leave: Leave, season: number, days: number): Leave {
  const taken = leave.season === season ? leave.daysTaken : 0;
  return { ...leave, season, daysTaken: taken + days };
}
