import type { CombatantView, CombatView, RangeBand } from '@/systems/combat';

/**
 * A fight that has just ended, kept until you have watched it end. The engine's own state is
 * gone once the result is settled, so this keeps what the watch screen needs to stage the last
 * exchange: the story, who stood where with how much health, and the distance. Like a report
 * card, it never blocks play; it only decides what the screen shows until you move on.
 */
export interface CombatFinale {
  readonly round: number;
  readonly range: RangeBand | null;
  readonly log: readonly string[];
  /** Lines the engine had let go before `log` (see `CombatView.logOffset`). */
  readonly logOffset: number;
  readonly combatants: readonly CombatantView[];
}

export function finaleOf(view: CombatView): CombatFinale {
  return {
    round: view.round,
    range: view.range ?? null,
    log: view.log,
    logOffset: view.logOffset ?? 0,
    combatants: view.combatants,
  };
}

/** The finished fight as a view with nothing left to choose, for the watch screen. */
export function combatFinaleView(finale: CombatFinale): CombatView {
  return {
    round: finale.round,
    log: finale.log,
    logOffset: finale.logOffset,
    combatants: finale.combatants,
    options: [],
    ...(finale.range ? { range: finale.range } : {}),
  };
}
