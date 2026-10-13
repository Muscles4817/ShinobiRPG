import { hashUnit } from '@/core';
import type { RoadEventDef } from '@/systems/missions';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * What comes up on a stretch of road with a `region`: most days something does, drawn from the
 * pack's road events for that region by a hash of the seed, the day, the job and the stage, so
 * the same road on the same day always brings the same thing and never draws on the dice.
 */

/** The chance a stretch of road brings something worth a choice. */
export const ROAD_EVENT_CHANCE = 0.75;

export function roadEventOn(
  state: GameState,
  ctx: GameContext,
  region: string,
): RoadEventDef | null {
  const run = state.mission;
  if (!run) return null;
  const key = [state.board.seed, state.time.day, run.missionId, run.stageIndex] as const;
  if (hashUnit(...key, 'happens') >= ROAD_EVENT_CHANCE) return null;
  const events = ctx.content.roadEvents.all.filter((e) => e.regions.includes(region));
  return events[Math.floor(hashUnit(...key, 'which') * events.length)] ?? null;
}
