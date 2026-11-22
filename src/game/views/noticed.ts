import { toldIn, type CombatEvent, type CombatView, type ToldEvent } from '@/systems/combat';

import { lastRound } from './roundEvents';

/**
 * What your fighter noticed, for the plan screen: the reads the engine made in their name (told
 * lines marked `read`): of the foes as the fight opens, then of the round just played. Said as
 * surely as their eyes allow, never with a number.
 */
export function noticed(view: Pick<CombatView, 'story'>): string[] {
  const round = lastRound(view.story);
  const told = round && round.told.length > 0 ? round.told : toldIn(view.story);
  return told.filter((t) => t.read === true).map((t) => t.text);
}

/** The story's lines without the reads, which the plan screen shows on their own. */
export function withoutReads(story: readonly CombatEvent[]): ToldEvent[] {
  return toldIn(story).filter((t) => t.read !== true);
}
