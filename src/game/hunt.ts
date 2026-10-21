import type { HuntDef, HuntStop, LocationDef } from '@/content';
import { hashUnit } from '@/core';
import type {
  DecisionOption,
  JourneyHunt,
  JourneyPlan,
  MissionStage,
  ThreadDef,
} from '@/systems/missions';

import type { GameContext } from './context';
import { greetingsOf } from './greetings';
import { onOrders } from './orders';
import type { GameState } from './state';

/**
 * Being hunted (`TownGreeting.hunt`): a town that holds something against you may send hunters
 * after you on its roads. How close they are is a hidden meter (`GameState.hunt`). Each night in
 * the town brings them closer, each day out of their reach cools the trail, and on a hunted
 * stretch of road you are asked how you travel and how you sleep, each answer bringing them
 * closer or not. Close enough, somewhere past a line drawn fresh for every trip, they find you,
 * and once you have dealt with them the trail starts again near cold. Someone there on their
 * village's orders (a long story's act based in the town) has its protection and isn't hunted.
 */

export const HUNT_THREAD = 'hunt';
/** The meter's top: how close the hunters can come. */
const MOST_HEAT = 10;
/** On any one trip they find you somewhere from here to a little past it. */
const FOUND_FROM = 5;
const FOUND_SPREAD = 3;
/** Each night in a town that hunts you brings them this much closer. */
const NIGHT_HEAT = 1;
/** Each day out of their reach the trail cools this much. */
const COOLING = 1;
/** Once they have found you and you are past them, the trail starts again from here. */
const AFTER_FOUND = 1;

const FOUND = 'hunters-found';

interface Hunting {
  readonly town: LocationDef;
  readonly hunt: HuntDef;
}

/** Every town hunting you now, unless you are there on your village's orders. */
function huntingTowns(state: GameState, ctx: GameContext): Hunting[] {
  return ctx.content.locations.all.flatMap((town) =>
    onOrders(state, ctx, town.id)
      ? []
      : greetingsOf(state, ctx, town.id).flatMap((g) => (g.hunt ? [{ town, hunt: g.hunt }] : [])),
  );
}

/** The hunt a trip runs into, if one of its legs crosses a hunting town's roads. */
export function huntForTrip(
  state: GameState,
  ctx: GameContext,
  legs: JourneyPlan['legs'],
): JourneyHunt | null {
  const found = huntingTowns(state, ctx).find(({ hunt }) =>
    legs.some((leg) => hunt.regions.includes(leg.region)),
  );
  if (!found) return null;
  const roll = hashUnit(state.board.seed, state.time.day, HUNT_THREAD, found.town.id);
  return {
    townId: found.town.id,
    heat: state.hunt.heat,
    foundAt: FOUND_FROM + Math.floor(roll * FOUND_SPREAD),
  };
}

/** The hidden thread a hunted trip keeps, starting where the hunters were when you set out. */
export function huntThread(hunt: JourneyHunt): ThreadDef {
  return {
    id: HUNT_THREAD,
    label: 'The hunters',
    levels: Array.from({ length: MOST_HEAT + 1 }, (_, i) => `${i}`),
    start: Math.min(MOST_HEAT, hunt.heat),
    hidden: true,
  };
}

function stopStage(stop: HuntStop): MissionStage {
  return {
    kind: 'decision',
    text: stop.text,
    options: stop.answers.map((a): DecisionOption => ({
      label: a.label,
      tone: a.tone,
      reply: a.reply,
      effects: [
        { kind: 'thread', thread: HUNT_THREAD, by: a.heat },
        ...(a.energy ? [{ kind: 'energy' as const, by: -a.energy }] : []),
      ],
    })),
  };
}

/**
 * A hunted stretch of road: how you travel it, the stretch, how you sleep on it, and the hunters
 * if they are close enough, after which you are past them and the trail starts again.
 */
export function huntedLeg(
  hunt: JourneyHunt,
  ctx: GameContext,
  walk: MissionStage & { readonly kind: 'leg' },
): MissionStage[] {
  const def = huntDefOf(hunt, ctx);
  if (!def || !walk.region || !def.regions.includes(walk.region)) return [walk];
  const close = { thread: HUNT_THREAD, atLeast: hunt.foundAt };
  return [
    stopStage(def.travel),
    walk,
    stopStage(def.sleep),
    {
      kind: 'encounter',
      when: close,
      text: def.found,
      template: 'lone-rogue',
      job: 'escort',
      enemyIds: def.hunterIds,
      canFlee: true,
      bypassable: true,
      ...(def.ground ? { ground: def.ground } : {}),
    },
    {
      kind: 'decision',
      when: close,
      text: 'The hunters are behind you, for now. They will send others when they hear.',
      options: [
        {
          label: 'Keep moving',
          tone: 'quiet',
          reply: 'You keep moving, and the trail goes cold behind you.',
          effects: [
            { kind: 'thread', thread: HUNT_THREAD, by: AFTER_FOUND - MOST_HEAT },
            { kind: 'mark', mark: FOUND },
          ],
        },
      ],
    },
  ];
}

function huntDefOf(hunt: JourneyHunt, ctx: GameContext): HuntDef | undefined {
  return ctx.content.locations.get(hunt.townId)?.greetings?.find((g) => g.hunt)?.hunt;
}

/** How close the hunters are at the end of a hunted trip, kept for the next. */
export function heatAfterTrip(state: GameState): GameState {
  const heat = state.mission?.threads[HUNT_THREAD];
  return heat === undefined ? state : { ...state, hunt: { heat } };
}

/**
 * A day settled: closer for a night in a town that hunts you, cooler for one out of its reach.
 * Days on the road or on a job are counted by the trip or not at all.
 */
export function settleHunt(state: GameState, ctx: GameContext): GameState {
  if (state.mission) return state;
  const here = huntingTowns(state, ctx).some(({ town }) => town.id === state.locationId);
  const now = state.hunt.heat;
  const heat = here ? Math.min(MOST_HEAT, now + NIGHT_HEAT) : Math.max(0, now - COOLING);
  return heat === now ? state : { ...state, hunt: { heat } };
}
