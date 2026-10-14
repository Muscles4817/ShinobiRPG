import { startRun, type JourneyPlan, type MissionDef, type MissionStage } from '@/systems/missions';
import { findJourney, type Journey, type RouteDef } from '@/systems/travel';

import type { GameContext } from './context';
import { chip, log } from './ops';
import { endsOpen, roadOpen } from './routeNeeds';
import { settle } from './story/state';
import { keepsToSafeRoads } from './leave';
import { arriving, leaving, tripCrew } from './trips';
import type { GameState } from './state';

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

function stagesOf(plan: JourneyPlan): MissionStage[] {
  return plan.legs.flatMap((leg, i): MissionStage[] => {
    const walk: MissionStage = { kind: 'leg', text: leg.text, days: leg.days, region: leg.region };
    return plan.quick || i === plan.legs.length - 1 ? [walk] : [walk, CAMP];
  });
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
    stages: stagesOf(plan),
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
  return log(arriving({ ...state, mission: null, locationId: destination.id }, ctx, plan), {
    heading: `Arrived in ${destination.name}`,
    text: `You walk into ${destination.name}, road-dusty and glad of it.`,
    tone: 'success',
    chips: [chip(days === 1 ? 'A day on the road' : `${days} days on the road`, 'info')],
  });
}
