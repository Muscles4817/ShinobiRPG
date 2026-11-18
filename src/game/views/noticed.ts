import { splitNarration, type CombatView } from '@/systems/combat';

import { lastRound } from './roundWhy';

/**
 * What your fighter noticed, for the plan screen: the reads the engine made in their name
 * (`readLine`): of the foes as the fight opens, then of the round just played. Said as surely as
 * their eyes allow, never with a number.
 */
export function noticed(view: Pick<CombatView, 'log'>): string[] {
  const round = lastRound(view.log);
  const said = round.length > 0 ? round : view.log.map(splitNarration);
  return said.filter((s) => s.read === true).map((s) => s.text);
}

/** The story without the reads, which the plan screen shows on their own. */
export function withoutReads(log: readonly string[]): string[] {
  return log.filter((line) => splitNarration(line).read !== true);
}
