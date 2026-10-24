import type { JourneyPlan, MissionDef, MissionStage, RoadStage, WayLeg } from '@/systems/missions';
import { findJourney, type RouteDef } from '@/systems/travel';

import type { GameContext } from './context';
import { homeVillageId } from './homeVillage';
import { CAMP } from './journeys';
import { stopAt } from './journeyStops';
import { roadOpen } from './routeNeeds';
import type { GameState } from './state';

/**
 * Jobs on the map (`docs/design/journeys-plan.md` 3.7). A job's `road` stage is the quickest open
 * way out to where it `goesTo`, or home to your village from where the road before left you. The
 * ways are worked out when the job is taken and kept on the run (`MissionRun.ways`), so a road
 * that opens or closes while you are out doesn't move you; then each road is walked as its legs,
 * a camp between stretches, with the map's road events on them as on a trip. The job's own beats
 * that follow a road with an `at` happen partway along it, and a town's inn or a landmark on the
 * way is a stop, as on a trip (a crew won't wait a day while you wander wild country).
 */

function isRoad(stage: MissionStage): stage is RoadStage & MissionStage {
  return stage.kind === 'road';
}

/** Whether a job walks the map's road rather than legs of its own. */
export function walksTheMap(def: Pick<MissionDef, 'stages'>): boolean {
  return def.stages.some(isRoad);
}

/** Where a road of the job heads: out to where the job goes, or home. */
function headingFor(state: GameState, ctx: GameContext, def: MissionDef, road: RoadStage): string {
  return road.to === 'home' ? homeVillageId(state, ctx) : (def.goesTo ?? state.locationId);
}

/**
 * The legs of every road the job walks, from where you stand, in order; null when some road has
 * no open way (a road closed to you, or nowhere to go).
 */
export function jobWays(
  state: GameState,
  ctx: GameContext,
  def: MissionDef,
): (readonly WayLeg[])[] | null {
  const open = (r: RouteDef) => roadOpen(state, ctx, r);
  const ways: (readonly WayLeg[])[] = [];
  let from = state.locationId;
  for (const road of def.stages.filter(isRoad)) {
    const to = headingFor(state, ctx, def, road);
    const journey = from === to ? null : findJourney(ctx.content.routes.all, from, to, open);
    if (!journey) return null;
    ways.push(journey.legs);
    from = to;
  }
  return ways;
}

/** Where a road is laid out: the content, and your own village (no stop is made there). */
interface Country {
  readonly ctx: GameContext;
  readonly home: string;
}

/** A stretch ended at a town with an inn or a landmark with a sight: worth a stop. */
function stopOn(legs: readonly WayLeg[], i: number, { ctx, home }: Country): MissionStage[] {
  const here = legs[i]?.toward;
  if (!here || here === home || i === legs.length - 1 || legs[i + 1]?.toward === here) return [];
  const offer = stopAt(ctx, here);
  return offer && offer.kind !== 'wild' ? [{ kind: 'stop', locationId: here }] : [];
}

/** The beats that fall after stretch `n` (counting from one); the last takes any beyond it. */
function beatsAfter(beats: readonly MissionStage[], n: number, last: boolean): MissionStage[] {
  return beats.filter((b) => (b.at ?? 0) === n || (last && (b.at ?? 0) > n));
}

/** A road as the stages it is walked as: each leg, the beats after it, a stop, then the camp. */
function walked(
  road: RoadStage & MissionStage,
  legs: readonly WayLeg[],
  beats: readonly MissionStage[],
  country: Country,
): MissionStage[] {
  const gated = (stage: MissionStage): MissionStage =>
    road.when ? { ...stage, when: road.when } : stage;
  return legs.flatMap((leg, i): MissionStage[] => {
    const own = i === 0 && road.text;
    const walk: MissionStage = {
      kind: 'leg',
      text: own ? road.text : leg.text,
      ...(own && road.variants ? { variants: road.variants } : {}),
      days: leg.days,
      region: leg.region,
      danger: leg.danger,
    };
    const last = i === legs.length - 1;
    const after = beatsAfter(beats, i + 1, last);
    if (last) return [gated(walk), ...after];
    return [gated(walk), ...after, ...stopOn(legs, i, country).map(gated), gated(CAMP)];
  });
}

/** Where a road's stretches lie among the job's stages as walked: its first stage to its last leg. */
export interface RoadSpan {
  readonly from: number;
  readonly to: number;
}

interface Layout {
  readonly stages: readonly MissionStage[];
  readonly spans: readonly RoadSpan[];
}

/** The beats straight after a road that are placed along it. */
function beatsFrom(stages: readonly MissionStage[], start: number): MissionStage[] {
  const end = stages.findIndex((s, i) => i >= start && (s.at === undefined || isRoad(s)));
  return stages.slice(start, end === -1 ? stages.length : end);
}

function layOut(def: MissionDef, ways: readonly (readonly WayLeg[])[], country: Country): Layout {
  const stages: MissionStage[] = [];
  const spans: RoadSpan[] = [];
  let road = 0;
  for (let i = 0; i < def.stages.length; i++) {
    const stage = def.stages[i];
    if (!stage) break;
    if (!isRoad(stage)) {
      stages.push(stage);
      continue;
    }
    const beats = beatsFrom(def.stages, i + 1);
    const way = walked(stage, ways[road++] ?? [], beats, country);
    const lastLeg = way.findLastIndex((s) => s.kind === 'leg');
    spans.push({ from: stages.length, to: stages.length + Math.max(lastLeg, 0) });
    stages.push(...way);
    i += beats.length;
  }
  return { stages, spans };
}

/** The job with its roads laid out as legs; a job with no roads of its own is as written. */
export function withRoads(
  def: MissionDef,
  ways: readonly (readonly WayLeg[])[],
  country: Country,
): MissionDef {
  return walksTheMap(def) ? { ...def, stages: layOut(def, ways, country).stages } : def;
}

const countryOf = (state: GameState, ctx: GameContext): Country => ({
  ctx,
  home: homeVillageId(state, ctx),
});

/** The ways the job walks: on its run, those kept when it was taken; on the board, today's. */
function waysOf(state: GameState, ctx: GameContext, def: MissionDef) {
  const run = state.mission?.missionId === def.id ? state.mission : null;
  return run?.ways ?? jobWays(state, ctx, def) ?? [];
}

/**
 * The job as it is walked: on its run, the ways kept when it was taken (or, for a run taken before
 * they were kept, today's); on the board, the ways it would take from where you stand.
 */
export function jobAsWalked(state: GameState, ctx: GameContext, def: MissionDef): MissionDef {
  return walksTheMap(def) ? withRoads(def, waysOf(state, ctx, def), countryOf(state, ctx)) : def;
}

/** A job's road being walked: the road as a trip's plan, and the legs walked before it. */
export interface JobRoad {
  readonly plan: JourneyPlan;
  readonly legsBefore: number;
}

/**
 * The road a job is walking now, for the map (`views/journeyView.ts`): null off the road (before
 * it, at the job's business when it arrives) and on trips of your own, which have a plan already.
 */
export function jobRoadNow(state: GameState, ctx: GameContext): JobRoad | null {
  const run = state.mission;
  const def = run && !run.journey ? ctx.content.missions.get(run.missionId) : undefined;
  if (!run || !def || !walksTheMap(def)) return null;
  const ways = waysOf(state, ctx, def);
  const { stages, spans } = layOut(def, ways, countryOf(state, ctx));
  const k = spans.findIndex((s) => run.stageIndex >= s.from && run.stageIndex <= s.to);
  const legs = ways[k];
  const span = spans[k];
  if (!legs?.length || !span) return null;
  const from = ways[k - 1]?.at(-1)?.toward ?? state.locationId;
  const to = legs.at(-1)?.toward ?? from;
  const legsBefore = stages.slice(0, span.from).filter((s) => s.kind === 'leg').length;
  return { plan: { from, to, legs, quick: false }, legsBefore };
}
