import { deepRegion, type DeepWildsDef } from '@/content';
import {
  depthsOut,
  depthsTo,
  startRun,
  type Danger,
  type MissionDef,
  type MissionStage,
  type VenturePlan,
  type WildDepth,
} from '@/systems/missions';

import type { GameContext } from './context';
import { CAMP, legsWalked } from './journeys';
import { chip, log } from './ops';
import type { GameState } from './state';
import { settle } from './story/state';
import { tripCrew } from './trips';

/**
 * Going off the paths into wild country (`docs/design/chakra-beasts-plan.md`). A venture is a
 * run of your own, like a trip: a day a depth, finding the way before each one past the edge,
 * a camp each night where you may turn back, and the walk back out through the depths you came
 * by. What a day brings is its depth's road events (`deepRegion`), drawn as a road's are, and
 * the deeper you go the worse they may be.
 */

/** The worst a day at each depth may bring. */
const DEPTH_DANGER: Readonly<Record<WildDepth, Danger>> = {
  edge: 'armed',
  deep: 'deadly',
  heart: 'elite',
};
/** How hard it is to find the way on to the deep and to the heart. */
const WAY_DIFFICULTY: Readonly<Record<Exclude<WildDepth, 'edge'>, number>> = { deep: 9, heart: 12 };
/** What losing the way costs the body. */
const LOST_HURT = 8;

/** The wild country of a kind you can go into, if there is a way in. */
export function deepWildsOf(ctx: GameContext, biome: string): DeepWildsDef | null {
  return ctx.content.deepWilds.find((d) => d.biome === biome) ?? null;
}

function countryOf(ctx: GameContext, plan: VenturePlan): DeepWildsDef {
  const country = deepWildsOf(ctx, plan.country);
  if (!country) throw new Error(`No way into wild country "${plan.country}"`);
  return country;
}

function wayOn(country: DeepWildsDef, depth: Exclude<WildDepth, 'edge'>): MissionStage {
  const way = country.wayTo[depth];
  const difficulty = WAY_DIFFICULTY[depth];
  return {
    kind: 'check',
    text: way.text,
    approaches: [
      { label: 'Read the country', stat: 'perception', difficulty, role: 'tracker' },
      { label: 'Keep count of your bearings', stat: 'intellect', difficulty },
    ],
    success: way.success,
    failure: way.failure,
    onFailure: 'forward',
    failureDamage: LOST_HURT,
  };
}

function day(country: DeepWildsDef, depth: WildDepth, way: 'going' | 'back'): MissionStage {
  return {
    kind: 'leg',
    text: country.depths[depth][way],
    days: 1,
    region: deepRegion(country.biome, depth),
    danger: DEPTH_DANGER[depth],
  };
}

function goingIn(country: DeepWildsDef, depth: WildDepth): MissionStage[] {
  return depthsTo(depth).flatMap((d) => [
    ...(d === 'edge' ? [] : [wayOn(country, d)]),
    day(country, d, 'going'),
    CAMP,
  ]);
}

function comingOut(country: DeepWildsDef, from: WildDepth): MissionStage[] {
  return [
    ...depthsOut(from).map((d) => day(country, d, 'back')),
    { kind: 'narrative', text: country.out },
  ];
}

/** "Into the deep woods". */
export function ventureTitle(country: DeepWildsDef): string {
  return `Into ${country.name}`;
}

/** The venture as a run can play it: no client and no pay, only the country. */
export function ventureMission(plan: VenturePlan, ctx: GameContext): MissionDef {
  const country = countryOf(ctx, plan);
  const stages = plan.out
    ? comingOut(country, plan.out)
    : [...goingIn(country, plan.depth), ...comingOut(country, plan.depth)];
  return {
    id: `venture:${plan.placeId}:${plan.out ?? plan.depth}`,
    title: ventureTitle(country),
    rank: 'D',
    client: '',
    summary: `You leave the path and go into ${country.name}.`,
    slots: 0,
    energyCost: 0,
    reward: { ryo: 0, reputation: 0 },
    minMissionsCompleted: 0,
    stages,
  };
}

/** Setting off the paths: the venture becomes the run in progress. */
export function goInto(state: GameState, ctx: GameContext, plan: VenturePlan): GameState {
  const def = ventureMission(plan, ctx);
  const run = settle(def, { ...startRun(def, tripCrew(null)), venture: plan });
  return log({ ...state, mission: run }, { heading: def.title, text: def.summary, tone: 'info' });
}

/**
 * On a venture still going in: the depth reached so far, while there is further to go (at the
 * deepest camp the way on is the way out, so there is nothing to turn back from). Null otherwise.
 */
export function ventureAhead(state: GameState, ctx: GameContext): WildDepth | null {
  const run = state.mission;
  const plan = run?.venture;
  if (!run || !plan || plan.out) return null;
  const depths = depthsTo(plan.depth);
  const walked = legsWalked(run, ventureMission(plan, ctx).stages);
  return walked < depths.length ? (depths[walked - 1] ?? null) : null;
}

/** Turning back at a camp: walk out from the depth you reached. */
export function turnOut(state: GameState, ctx: GameContext, reached: WildDepth): GameState {
  const run = state.mission;
  const plan = run?.venture;
  if (!run || !plan) return state;
  const back = { ...plan, out: reached };
  const def = ventureMission(back, ctx);
  const returning = settle(def, { ...startRun(def, run.crew), venture: back });
  return log(
    { ...state, mission: returning },
    {
      heading: 'Turning back',
      text: 'You break camp and start back the way you came.',
      tone: 'warning',
    },
  );
}

/** Out of the wild, where you went in. */
export function comeOut(state: GameState, ctx: GameContext, plan: VenturePlan): GameState {
  const deepest = plan.out ?? plan.depth;
  const days = depthsTo(deepest).length + depthsOut(deepest).length;
  const country = countryOf(ctx, plan);
  return log(
    { ...state, mission: null },
    {
      heading: `Out of ${country.name}`,
      text: 'You are back where you left the path.',
      tone: 'success',
      chips: [chip(days === 1 ? 'A day in the wild' : `${days} days in the wild`, 'info')],
    },
  );
}
