/**
 * Retinues: a fighter and the bodies that belong to them (`CombatantSetup.master`), such as a
 * hound at its handler's heel (`docs/design/retinue-plan.md`). A companion fights on its own
 * judgement and fights on if its master falls. While master and companion both stand free of
 * dazes and holds they fight as one and hit harder (`TANDEM_BONUS`), so the answer to a pair is
 * to break them up: daze or pin one, or fell one first.
 */

/** Extra damage while a fighter's partner stands beside them, free to act. */
export const TANDEM_BONUS = 0.15;

interface Linked {
  readonly id: string;
  readonly master?: string;
  readonly health: number;
}

/** Whether two fighters belong together: one is the other's master. */
export function partnered(a: Linked, b: Linked): boolean {
  return a.id !== b.id && (a.master === b.id || b.master === a.id);
}

/**
 * Damage scale for a fighter striking beside their partner: the tandem holds while both stand
 * and are `free` (the engine says what binds a fighter: a daze, a hold).
 */
export function tandemScale<F extends Linked>(
  f: F,
  fighters: readonly F[],
  free: (fighter: F) => boolean,
): number {
  if (f.health <= 0 || !free(f)) return 1;
  const beside = fighters.some((o) => partnered(f, o) && o.health > 0 && free(o));
  return beside ? 1 + TANDEM_BONUS : 1;
}
