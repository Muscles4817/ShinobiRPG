import {
  startRun,
  type JourneyPlan,
  type MissionDef,
  type MissionRun,
  type MissionStage,
} from '@/systems/missions';
import { findJourney, type Journey, type RouteDef } from '@/systems/travel';

import type { GameContext } from './context';
import { chip, log } from './ops';
import { endsOpen, roadOpen } from './routeNeeds';
import { settle } from './story/state';
import { keepsToSafeRoads } from './leave';
import { arriving, leaving, tripCrew } from './trips';
import type { GameState } from './state';
import { placeInText } from './placeName';
import { bearing } from './compass';
import { homeVillageId } from './homeVillage';
import { heatAfterTrip, huntedLeg, huntThread } from './hunt';

/**
 * Trips of your own along the roads. The way is the quickest open journey over the pack's
 * routes; a road is open when neither end is locked (a waypoint still "coming soon" closes the
 * road through it) and you meet what it needs (`routeNeeds.ts`), so a closed shortcut means
 * the long way round. A trip plays as a mission run with no client and no pay, built from the
 * journey's legs, so the road works as it does on a job: days with meals from your pack and
 * nights in camp, road events by region, and a camp between legs unless you hurry.
 */

/** The fire between legs: only time for one thing. */
const CAMP_PICKS = 1;
const CAMP_TEXT = 'You make camp off the road as the light goes.';

/**
 * The quickest open way there, or null if no open road goes there. A genin on a pass keeps to
 * safe roads where a safe way exists, even when a quicker one has bandits on it.
 */
export function journeyTo(state: GameState, ctx: GameContext, locationId: string): Journey | null {
  const routes = ctx.content.routes.all;
  const open = (r: RouteDef) => roadOpen(state, ctx, r);
  const quickest = findJourney(routes, state.locationId, locationId, open);
  if (!quickest || quickest.danger === 'petty' || !keepsToSafeRoads(state, ctx, locationId))
    return quickest;
  const safe = (r: RouteDef) => open(r) && r.danger === 'petty';
  return findJourney(routes, state.locationId, locationId, safe) ?? quickest;
}

/** The way there if you met every road's needs: what a closed shortcut would give you. */
export function shortcutTo(state: GameState, ctx: GameContext, locationId: string): Journey | null {
  return findJourney(ctx.content.routes.all, state.locationId, locationId, (r) => endsOpen(r, ctx));
}

/** The way there once every road is open: what the Travel tab shows for a place still locked. */
export function plannedJourneyTo(
  state: GameState,
  ctx: GameContext,
  locationId: string,
): Journey | null {
  return findJourney(ctx.content.routes.all, state.locationId, locationId);
}

const CAMP: MissionStage = {
  kind: 'camp',
  text: CAMP_TEXT,
  picks: CAMP_PICKS,
  activities: [
    { kind: 'crew', label: 'Sit up talking by the fire', when: { crew: 'team' } },
    { kind: 'drill', label: 'Drill by the fire' },
    { kind: 'rest', label: 'Sleep properly' },
  ],
};

type PlanLeg = JourneyPlan['legs'][number];

/** Where each leg sets out from: the start, then wherever the leg before was heading. */
function startsOf(plan: JourneyPlan): string[] {
  return plan.legs.map((_, i) => (i === 0 ? plan.from : (plan.legs[i - 1]?.toward ?? plan.from)));
}

/**
 * A leg's line, with the way it heads when it sets off for somewhere new: "You set off north
 * for Kiri Ford." on the first stretch, "From Shiomachi the road turns east, for…" after.
 */
function headed(ctx: GameContext, leg: PlanLeg, from: string): string {
  if (!leg.toward || leg.toward === from) return leg.text;
  const start = ctx.content.locations.require(from);
  const end = ctx.content.locations.require(leg.toward);
  const way = bearing(start.map, end.map);
  const toward = placeInText(end.name);
  return `${leg.text} The road runs ${way} from ${placeInText(start.name)}, towards ${toward}.`;
}

function stagesOf(plan: JourneyPlan, ctx: GameContext): MissionStage[] {
  const starts = startsOf(plan);
  return plan.legs.flatMap((leg, i): MissionStage[] => {
    const from = starts[i] ?? plan.from;
    // Only the first day of a stretch says where it heads; the rest are the same road.
    const fresh = i === 0 || plan.legs[i - 1]?.toward !== leg.toward;
    const text = fresh ? headed(ctx, leg, from) : leg.text;
    const walk = { kind: 'leg' as const, text, days: leg.days, region: leg.region };
    const road = plan.hunt ? huntedLeg(plan.hunt, ctx, walk) : [walk];
    return plan.quick || i === plan.legs.length - 1 ? road : [...road, CAMP];
  });
}

/** How many legs are behind you: those passed, and one whose road event waits on your choice. */
export function legsWalked(run: MissionRun, stages: readonly MissionStage[]): number {
  const passed = stages.slice(0, run.stageIndex).filter((s) => s.kind === 'leg').length;
  return run.roadEvent && stages[run.stageIndex]?.kind === 'leg' ? passed + 1 : passed;
}

/** The legs walked so far, walked back the other way: each heads where the one before began. */
export function legsBack(plan: JourneyPlan, walked: number): JourneyPlan['legs'] {
  const starts = startsOf(plan);
  return plan.legs
    .slice(0, walked)
    .map((leg, i) => ({ ...leg, toward: starts[i] ?? plan.from }))
    .reverse();
}

/** The trip as a mission the run can play: no client, no pay, only the road. */
export function journeyMission(plan: JourneyPlan, ctx: GameContext): MissionDef {
  const destination = ctx.content.locations.require(plan.to).name;
  return {
    id: `journey:${plan.from}:${plan.to}`,
    title: `The road to ${destination}`,
    rank: 'D',
    client: '',
    summary: `You set out for ${destination}.`,
    slots: 0,
    energyCost: 0,
    reward: { ryo: 0, reputation: 0 },
    minMissionsCompleted: 0,
    stages: stagesOf(plan, ctx),
    ...(plan.hunt ? { threads: [huntThread(plan.hunt)] } : {}),
  };
}

/** A trip about to start: the way, the passage paid, and a friend asked along. */
export interface Departure {
  readonly plan: JourneyPlan;
  readonly passage: number;
  readonly companionId: string | null;
}

/** Setting out (passage already paid): the trip becomes the run in progress. */
export function setOut(state: GameState, ctx: GameContext, trip: Departure): GameState {
  const { plan, passage } = trip;
  const def = journeyMission(plan, ctx);
  const going = leaving(state, ctx, plan, trip.companionId);
  const crew = tripCrew(going.people.companionId);
  const run = settle(def, { ...startRun(def, crew), journey: plan });
  return log(
    { ...going, mission: run },
    {
      heading: def.title,
      text: def.summary,
      tone: 'info',
      chips: passage > 0 ? [chip(`−${passage} ryo passage`, 'cost')] : [],
    },
  );
}

/** The last leg walked: you are there. */
export function arrive(state: GameState, ctx: GameContext, plan: JourneyPlan): GameState {
  const destination = ctx.content.locations.require(plan.to);
  const days = plan.legs.reduce((sum, leg) => sum + leg.days, 0);
  const home = destination.id === homeVillageId(state, ctx);
  const place = placeInText(destination.name);
  const trailed = heatAfterTrip(state);
  return log(arriving({ ...trailed, mission: null, locationId: destination.id }, ctx, plan), {
    heading: home ? `Home in ${place}` : `Arrived in ${place}`,
    text: home
      ? `You are back in ${place}, with the road still in your legs.`
      : `You walk into ${place}, road-dusty and glad of it.`,
    tone: 'success',
    chips: [chip(days === 1 ? 'A day on the road' : `${days} days on the road`, 'info')],
  });
}
