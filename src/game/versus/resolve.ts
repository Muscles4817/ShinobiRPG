import type { CombatOutcome } from '@/systems/combat';

import { addReport } from '../reports';
import type { GameState } from '../state';

/**
 * How a versus bout ends: a result card and nothing else. No one is hurt for real, no one
 * grows, and the sandbox is thrown away once you leave.
 */
export function resolveVersus(state: GameState, outcome: CombatOutcome): GameState {
  const match = state.versus;
  if (!match) return state;
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
    },
  );
}
