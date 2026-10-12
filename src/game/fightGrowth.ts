import type { CombatOutcome } from '@/systems/combat';
import { applyTraining, diffStats, reservesFromChakraSpent } from '@/systems/stats';

import type { GameContext } from './context';
import { log, statChips } from './ops';
import { trainingScale } from './profile';
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
  const before = state.character.stats;
  const stats = applyTraining(before, gains, trainingScale(state.character, ctx));
  const grown = diffStats(before, stats);
  if (Object.keys(grown).length === 0) return state;
  return log(
    { ...state, character: { ...state.character, stats } },
    {
      heading: 'Deeper reserves',
      text: 'Drawing on your chakra that hard has left the well a little deeper.',
      tone: 'info',
      chips: statChips(grown),
    },
  );
}
