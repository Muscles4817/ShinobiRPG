import type { CombatGround, RangeBand } from '../../contract';
import type { Rng } from '@/core';

import { groundMiss, groundRule, withinGround } from '../../rules/ground';
import { concealmentOf } from '../../rules/verbs';
import { RANGE_LABEL } from '../../rules/range';
import { say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';
import { bandOf, distanceBetween, withMoves, type PairMove } from './distance';

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
  const miss = groundMiss(round.ground, actor, bandOf(round, actor));
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

function walls(to: RangeBand): string {
  return `The walls stop it short of ${RANGE_LABEL[to].toLowerCase()} range.`;
}

/**
 * Everyone moved to `to`, as far as the ground lets them (a vast blast): the fight's distance
 * and every pair's.
 */
export function movedTo(round: Round, to: RangeBand, line: string): Round {
  const at = withinGround(round.ground, to);
  const { distances: _pairs, ...everyone } = round;
  return { ...say(everyone, at === to ? line : walls(to)), range: at };
}

/** Some pairs moved, each as far as the ground lets it; every other pair keeps its distance. */
export function pairsMoved(round: Round, moves: readonly PairMove[], line: string): Round {
  const held = moves.map((move) => ({ ...move, to: withinGround(round.ground, move.to) }));
  const short = moves.find((move, i) => held[i]?.to !== move.to);
  const changed = held.filter((move) => distanceBetween(round, move.a, move.b) !== move.to);
  const told = say(round, short ? walls(short.to) : line);
  return changed.length === 0 ? told : { ...told, distances: withMoves(round, changed) };
}
