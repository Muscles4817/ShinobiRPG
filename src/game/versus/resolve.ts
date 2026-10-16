import type { CombatOutcome } from '@/systems/combat';

import { addReport } from '../reports';
import type { GameState } from '../state';

/**
 * How a versus bout ends: a result card and nothing else. No one is hurt for real, no one
 * grows, and the sandbox is thrown away once you leave. A watched bout's card names who won.
 */
export function resolveVersus(state: GameState, outcome: CombatOutcome): GameState {
  const match = state.versus;
  if (!match) return state;
  const watched = match.watched;
  const won = outcome.result === 'victory';
  const winners = won ? watched?.sideName : match.foeName;
  const several = (won ? match.side : match.foes).length > 1;
  return addReport(
    { ...state, combat: null },
    {
      kind: 'fight',
      result: outcome.result,
      enemies: match.foeName,
      rounds: outcome.rounds,
      damageTaken: Math.max(0, match.startHealth - outcome.player.health),
      chakraSpent: Math.max(0, match.startChakra - outcome.player.chakra),
      health: outcome.player.health,
      maxHealth: match.maxHealth,
      ...(watched && winners ? { verdict: `${winners} ${several ? 'win' : 'wins'}` } : {}),
    },
  );
}
