import type { CombatOutcome } from '@/systems/combat';
import { gathered, storeAfterFight } from '@/systems/dusts';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { bornDust, drawable, yourDust } from './dust';

/**
 * Keeping your dust between fights: what came back from a fight is what the store holds, and
 * each day dust the ground gives (sand, ash) gathers itself back, quickly at home. Dust no
 * ground gives never comes back on its own. A child of a dust clan whose save is from before
 * dust is given a full store the first time a day passes.
 */

/** The store after a fight, with the dust that came back. */
export function afterDustFight(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
): GameState {
  const yours = yourDust(state, ctx);
  if (!yours || outcome.dust === undefined) return state;
  return { ...state, dust: storeAfterFight(yours.store, outcome.dust, yours.cap) };
}

function givenOldSave(state: GameState, ctx: GameContext): GameState {
  if (state.dust) return state;
  const clan = ctx.content.clans.get(state.character.clanId);
  const dust = bornDust(clan, state.character.stats, ctx);
  return dust ? { ...state, dust } : state;
}

/** A day passing for your dust: what the ground gives gathers back. */
export function dustDayPassed(state: GameState, ctx: GameContext): GameState {
  const given = givenOldSave(state, ctx);
  const yours = yourDust(given, ctx);
  if (!yours) return given;
  const atHome = given.locationId === ctx.content.startLocationId && given.mission === null;
  const dust = gathered(yours.store, yours.cap, { atHome, drawable: drawable(yours.def) });
  return dust === yours.store ? given : { ...given, dust };
}
