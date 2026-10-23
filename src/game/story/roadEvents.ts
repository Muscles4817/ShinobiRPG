import { hashUnit } from '@/core';
import { jobProfile } from '@/content';
import { dangerAtLeast, type Danger, type RoadEventDef, type RoadRarity } from '@/systems/missions';
import { seasonOf } from '@/systems/time';
import { meetOnRoad } from '@/systems/travel';

import type { GameContext } from '../context';
import { activeMission } from '../missionFlow';
import type { GameState } from '../state';

/**
 * What comes up on a stretch of road with a `region` (`docs/design/journeys-plan.md` 3.5). Some
 * days nothing does: the rougher the road, the likelier something is. What may come is the
 * region's events that the road's danger and the season allow, less the ones met lately or met
 * once for good; a rare one is drawn far less often than a common one. All of it is a hash of
 * the seed, the day, the job and the stage, so the same road on the same day always brings the
 * same thing and never draws on the dice.
 */

/** The chance a stretch of road brings something worth a choice, by the worst it may hold. */
export const ROAD_EVENT_CHANCE: Readonly<Record<Danger, number>> = {
  petty: 0.55,
  armed: 0.7,
  deadly: 0.8,
  elite: 0.85,
};

/** How much likelier a common event is to come up than an uncommon or a rare one. */
const RARITY_WEIGHT: Readonly<Record<RoadRarity, number>> = { common: 6, uncommon: 3, rare: 1 };

/** A stretch of road: the kind of road it is, and the worst it may hold when it says. */
interface Stretch {
  readonly region?: string;
  readonly danger?: Danger;
}

/** The worst a stretch may bring: its own road's, else the job's worst foe, else nothing much. */
function dangerOf(state: GameState, ctx: GameContext, stretch: Stretch): Danger {
  if (stretch.danger) return stretch.danger;
  const def = activeMission(state, ctx);
  return (def && jobProfile(def, (id) => ctx.content.enemies.get(id)).danger) ?? 'petty';
}

/** The region's events this road and season allow, not met for good. */
function eventsFor(state: GameState, ctx: GameContext, region: string, danger: Danger) {
  const season = seasonOf(state.time.day);
  return ctx.content.roadEvents.all.filter(
    (e) =>
      e.regions.includes(region) &&
      dangerAtLeast(danger, e.danger ?? 'petty') &&
      (e.seasons?.includes(season) ?? true) &&
      !state.atlas.roadSeen.includes(e.id),
  );
}

/** One of them, weighted by rarity, from a roll in [0, 1). */
function weighted(events: readonly RoadEventDef[], roll: number): RoadEventDef | null {
  const weight = (e: RoadEventDef) => RARITY_WEIGHT[e.rarity ?? 'common'];
  let left = roll * events.reduce((sum, e) => sum + weight(e), 0);
  for (const e of events) {
    left -= weight(e);
    if (left < 0) return e;
  }
  return events.at(-1) ?? null;
}

export function roadEventOn(
  state: GameState,
  ctx: GameContext,
  stretch: Stretch,
): RoadEventDef | null {
  const run = state.mission;
  if (!run || !stretch.region) return null;
  const key = [state.board.seed, state.time.day, run.missionId, run.stageIndex] as const;
  const danger = dangerOf(state, ctx, stretch);
  if (hashUnit(...key, 'happens') >= ROAD_EVENT_CHANCE[danger]) return null;
  const fits = eventsFor(state, ctx, stretch.region, danger);
  // Only when every event the road could bring was met lately does one come round again.
  const fresh = fits.filter((e) => !state.atlas.recentRoad.includes(e.id));
  return weighted(fresh.length > 0 ? fresh : fits, hashUnit(...key, 'which'));
}

/** A road event met: the road won't bring it again soon, nor ever if it comes once. */
export function metOnRoad(state: GameState, event: RoadEventDef): GameState {
  return { ...state, atlas: meetOnRoad(state.atlas, event.id, event.once === true) };
}
