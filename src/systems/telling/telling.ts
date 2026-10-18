/**
 * What the game has said lately, per bank of lines (a sensei's sign-offs, the lines for a nap),
 * so a line picked by hash can pass over the ones the player has just read. Only the last few
 * picks of each bank are kept.
 */

/** Recent picks per bank, newest last, as indices into the bank. */
export type Told = Readonly<Record<string, readonly number[]>>;

export const NOTHING_TOLD: Told = {};

/** How many recent picks a bank remembers: enough to rotate a small bank, never the whole of it. */
export const TOLD_MEMORY = 3;

/** Whether a bank has ever been drawn from: how a "first time" line knows it is the first. */
export function toldBefore(told: Told, bank: string): boolean {
  return told[bank] !== undefined;
}

export function recentlyTold(told: Told, bank: string): readonly number[] {
  return told[bank] ?? [];
}

/**
 * Notes a pick, keeping at most `memory` of the newest (`TOLD_MEMORY` unless the bank asks for
 * more, and never all of a bank of `size`).
 */
export function noteTold(
  told: Told,
  bank: string,
  pick: { index: number; size: number; memory?: number },
): Told {
  const keep = Math.min(pick.memory ?? TOLD_MEMORY, pick.size - 1);
  const recent = [...recentlyTold(told, bank).filter((i) => i !== pick.index), pick.index];
  return { ...told, [bank]: keep > 0 ? recent.slice(-keep) : [] };
}
