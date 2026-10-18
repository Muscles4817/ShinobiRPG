import type { CombatGround, RangeBand } from '../../contract';
import type { Rng } from '@/core';

import { groundMiss, groundRule, withinGround } from '../../rules/ground';
import { concealmentOf } from '../../rules/verbs';
import { RANGE_LABEL } from '../../rules/range';
import { say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * The ground in a planned fight (`rules/ground.ts`): the opening line that names it, and the
 * distances it has room for, and the cover it gives anyone hiding. A fight that would be thrown or step past what the ground allows
 * (far range, in a room) stops at the walls.
 */

/** A hider as a seeker finds them on this ground: harder among trees or corners. */
export function inCover(ground: CombatGround | undefined, hider: PlanFighter): PlanFighter {
  const cover = groundRule(ground).cover;
  return cover === 0 ? hider : { ...hider, concealment: concealmentOf(hider) + cover };
}

/** An attack from far off lost among the trees or walls, for anyone not sure-footed there. */
export function lostToGround(round: Round, actor: PlanFighter, rng: Rng): string | null {
  const miss = groundMiss(round.ground, actor, round.range);
  if (miss <= 0 || !rng.chance(miss)) return null;
  return tell('{a.poss} attack is lost among the cover.', { a: actor });
}

/**
 * What the plan screen says of the ground, beside the prompt: its rules are for planning,
 * not the story. Nothing for an open arena.
 */
export function groundNote(ground: CombatGround | undefined): string | null {
  return ground === undefined || ground === 'arena' ? null : groundRule(ground).line;
}

/** The fight moved to `to`, as far as the ground lets it. */
export function movedTo(round: Round, to: RangeBand, line: string): Round {
  const at = withinGround(round.ground, to);
  if (at === to) return { ...say(round, line), range: to };
  const walls = `The walls stop it short of ${RANGE_LABEL[to].toLowerCase()} range.`;
  return at === round.range ? say(round, walls) : { ...say(round, walls), range: at };
}
