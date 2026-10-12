import type { CombatOutcome } from '@/systems/combat';
import { diffStats, reservesFromChakraSpent } from '@/systems/stats';

import type { GameContext } from './context';
import { log, statChips } from './ops';
import { growCharacter, logDiscoveries } from './growth';
import type { GameState } from './state';

/**
 * What a finished fight grows in you. For now that is chakra reserves: the chakra you paid out
 * (`CombatOutcome.chakraSpent`) deepens the well, with the usual diminishing returns, whether
 * you won or lost.
 */
export function growFromFight(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
): GameState {
  const gains = reservesFromChakraSpent(outcome.chakraSpent ?? 0);
  if (Object.keys(gains).length === 0) return state;
  const before = state.character.stats;
  const growth = growCharacter(state.character, gains, ctx);
  const grown = diffStats(before, growth.character.stats);
  const next = { ...state, character: growth.character };
  // Too little to show is still kept: it adds up over many fights.
  if (Object.keys(grown).length === 0) return logDiscoveries(next, growth.discovered, ctx);
  const logged = log(next, {
    heading: 'Deeper reserves',
    text: 'Drawing on your chakra that hard has left the well a little deeper.',
    tone: 'info',
    chips: statChips(grown),
  });
  return logDiscoveries(logged, growth.discovered, ctx);
}
