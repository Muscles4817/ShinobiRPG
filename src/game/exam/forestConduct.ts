import type { ApproachId } from '@/systems/missions';
import { fightingPower } from '@/systems/stats';

import { enemyStatLine } from '../combatants';
import type { GameContext } from '../context';
import { encounterHere } from '../encounter/current';
import { combatStats } from '../gear';
import { scout } from '../scouting';
import type { GameState } from '../state';
import { forestLost, markConduct } from './forest';

/**
 * How the examiners judge your choices at the forest's encounters: pulling your team out of a
 * fight it would lose is sensible (out of one it could win, giving up), and getting past rivals
 * without a fight is noted in your favour.
 */

/** Ways past that don't come to blows, when they work. */
const PEACEFUL: readonly ApproachId[] = ['sneak', 'talk', 'bribe', 'intimidate'];

/** Whether the strongest rival here reads as stronger than you. */
function outmatched(state: GameState, ctx: GameContext): boolean {
  const here = encounterHere(state, ctx);
  if (!here) return false;
  const toughest = here.foes
    .map(enemyStatLine)
    .sort((a, b) => fightingPower(b) - fightingPower(a))[0];
  if (!toughest) return false;
  const { threat } = scout(toughest, combatStats(state, ctx), false);
  return threat === 'stronger' || threat === 'much-stronger';
}

/** You pull your team out of the forest: the exam is over, and how wise it was is noted. */
export function withdrawFromForest(state: GameState, ctx: GameContext): GameState {
  const signal = outmatched(state, ctx) ? 'sensible-withdrawal' : 'gave-up';
  return forestLost(markConduct(state, signal), ctx, 'withdrew');
}

/** After an approach in the forest: a way past that worked without a fight is noted. */
export function noteWayPast(before: GameState, after: GameState, approach: ApproachId): GameState {
  if (!PEACEFUL.includes(approach) || after.combat) return after;
  const stillThere =
    after.mission?.encounter !== undefined &&
    after.mission.stageIndex === before.mission?.stageIndex;
  return stillThere ? after : markConduct(after, 'avoided-fight');
}
