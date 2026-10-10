import type { Rng } from '@/core';

import type { RangeBand } from '../../contract';
import { alive, targetable } from '../../rules/body';
import { canAttackFrom, homeBand } from '../../rules/kit';
import { footworkTowards } from './ai';
import { moveBlocker } from './moves';
import type { MindFighter, Move } from './state';

/**
 * Teammates commit to a move with everyone else. They attack from where their kit lets them
 * (an archer ally backs off from close quarters, a brawler ally closes in) and only at foes
 * they can see.
 */

const ALLY_JUTSU_CHANCE = 0.4;

export function fightingAllies(fighters: readonly MindFighter[]): MindFighter[] {
  return fighters.filter((f) => f.side === 'player' && !f.isPlayer && alive(f) && f.stunned === 0);
}

/** The first foe an ally can see, if any. */
export function allyTarget(fighters: readonly MindFighter[]): MindFighter | undefined {
  return fighters.find((f) => f.side === 'enemy' && targetable(f));
}

function allyMove(ally: MindFighter, range: RangeBand, rng: Rng): Move {
  if (!canAttackFrom(ally, range)) return footworkTowards(range, homeBand(ally));
  const usable = ally.techniques.filter(
    (t) =>
      t.effect !== 'heal' && moveBlocker(ally, { kind: 'jutsu', technique: t }, range) === null,
  );
  if (usable.length > 0 && rng.chance(ALLY_JUTSU_CHANCE)) {
    return { kind: 'jutsu', technique: rng.pick(usable) };
  }
  return { kind: range === 'close' ? 'strike' : 'throw' };
}

/** What each ally commits to this round, from the range at its start. */
export function allyMoves(
  fighters: readonly MindFighter[],
  range: RangeBand,
  rng: Rng,
): Record<string, Move> {
  return Object.fromEntries(fightingAllies(fighters).map((a) => [a.id, allyMove(a, range, rng)]));
}
