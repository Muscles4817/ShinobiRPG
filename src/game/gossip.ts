import type { RumourDef } from '@/content';
import { hashUnit } from '@/core';

import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * How the village's talk turns over (`village.ts`): never about a job you have already done
 * or that can no longer be posted, and never the same line two days running. The talk is a
 * ring in an order drawn from the seed; each day takes the next stretch of it, no longer than
 * half the ring, so a day's lines are never the day before's. Like the board, it is a hash,
 * never the dice, and keeps nothing in the save.
 */

/** A job rumour still worth telling: the job isn't done, and nothing has closed it. */
export function stillOpen(rumour: RumourDef, state: GameState, ctx: GameContext): boolean {
  const { missionId } = rumour;
  if (missionId === undefined) return true;
  const job = ctx.content.missions.get(missionId);
  const closed = job?.closedBy !== undefined && state.village.marks.includes(job.closedBy);
  return !state.board.completed.includes(missionId) && !closed;
}

/** The talk in its ring order for this save: the same every day, so the days take turns. */
export function ringOrder(rumours: readonly RumourDef[], seed: number): RumourDef[] {
  return rumours
    .map((r) => ({ r, key: hashUnit(seed, r.id, 'ring') }))
    .sort((a, b) => a.key - b.key)
    .map(({ r }) => r);
}

/**
 * Today's stretch of a ring: at most `perDay` lines and never more than half of it, so no line
 * is told two days running; a ring of one is told every other day.
 */
export function stretchOf<T>(ring: readonly T[], day: number, perDay: number): T[] {
  if (ring.length === 0 || perDay <= 0) return [];
  if (ring.length === 1) return day % 2 === 0 ? [...ring] : [];
  const size = Math.min(perDay, Math.floor(ring.length / 2));
  const start = (day * size) % ring.length;
  return Array.from({ length: size }, (_, i) => ring[(start + i) % ring.length]).filter(
    (r): r is T => r !== undefined,
  );
}
