import type { CombatantView, CombatEvent, CombatView, RangeBand } from '@/systems/combat';

/**
 * A fight that has just ended, kept until you have watched it end. The engine's own state is
 * gone once the result is settled, so this keeps what the watch screen needs to stage the last
 * exchange: the story, who stood where with how much health, and the distance. Like a report
 * card, it never blocks play; it only decides what the screen shows until you move on.
 */
export interface CombatFinale {
  readonly round: number;
  readonly range: RangeBand | null;
  /** The story as events (`CombatView.story`). */
  readonly story: readonly CombatEvent[];
  /** Events the engine had let go before `story` (see `CombatView.storyOffset`). */
  readonly storyOffset: number;
  readonly combatants: readonly CombatantView[];
  /** A fight only watched (versus, an exam's finals): nobody on the stage is you. */
  readonly watched?: true;
}

export function finaleOf(view: CombatView): CombatFinale {
  return {
    round: view.round,
    range: view.range ?? null,
    story: view.story,
    storyOffset: view.storyOffset ?? 0,
    combatants: view.combatants,
    ...(view.watched ? { watched: true as const } : {}),
  };
}

/** The finished fight as a view with nothing left to choose, for the watch screen. */
export function combatFinaleView(finale: CombatFinale): CombatView {
  return {
    round: finale.round,
    story: finale.story,
    storyOffset: finale.storyOffset,
    combatants: finale.combatants,
    options: [],
    ...(finale.range ? { range: finale.range } : {}),
    ...(finale.watched ? { watched: true as const } : {}),
  };
}
