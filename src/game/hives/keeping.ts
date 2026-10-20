import type { CombatOutcome } from '@/systems/combat';
import { afterFight, bredFor } from '@/systems/hives';
import { isHungry } from '@/systems/vitals';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { broodHatched } from './hatching';
import { bornHive, DEFAULT_SHARE, qualitiesInBody, yourHive } from './hive';

/**
 * Keeping the hive between fights: what came home from a fight is what the hive holds, and
 * each day the insects breed back towards what the body can keep (quickly in your home
 * village, slowly away, slower when you go hungry). A child of a hive clan whose save is from
 * before hives is given theirs, full, the first time a day passes.
 */

/** The hive after a fight, with the insects that came home. */
export function afterHiveFight(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
): GameState {
  const yours = yourHive(state, ctx);
  if (!yours || outcome.swarm === undefined) return state;
  return { ...state, hive: afterFight(yours.hive, outcome.swarm, yours.cap) };
}

function givenOldSave(state: GameState, ctx: GameContext): GameState {
  if (state.hive) return state;
  const clan = ctx.content.clans.get(state.character.clanId);
  const hive = bornHive(clan, DEFAULT_SHARE, state.character.stats, ctx);
  return hive ? { ...state, hive } : state;
}

/** A day passing for the hive: the insects breed back. */
export function hiveDayPassed(state: GameState, ctx: GameContext): GameState {
  const given = broodHatched(givenOldSave(state, ctx), ctx);
  const yours = yourHive(given, ctx);
  if (!yours) return given;
  const atHome = given.locationId === ctx.content.startLocationId && given.mission === null;
  const hive = bredFor(yours.hive, yours.cap, {
    atHome,
    hungry: isHungry(given.character.vitals),
    brood: qualitiesInBody(yours.strain).brood,
  });
  return hive === yours.hive ? given : { ...given, hive };
}
