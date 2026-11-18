/**
 * How the fight stood as the round began, kept so the round's end can tell what it did: to each
 * fighter (`roundReads.ts`) and to everyone together (`tiring.ts`).
 */

export interface Quiet {
  /** Rounds in a row that ended with no one much worse off. */
  readonly quietRounds?: number;
  /** Everyone's health together as the round began, to tell how much the round hurt. */
  readonly roundHealth?: number;
  /** Both sides have tired: nothing comes back between exchanges any more. */
  readonly tired?: true;
}

export interface RoundOpened extends Quiet {
  /** Each fighter's health as the round began, by id; unknown when absent. */
  readonly healthAtRound?: Readonly<Record<string, number>>;
}

/** Each fighter's health as it stands, for the next round's reads. */
export function healthNow(
  fighters: readonly { readonly id: string; readonly health: number }[],
): Record<string, number> {
  return Object.fromEntries(fighters.map((f) => [f.id, f.health]));
}
