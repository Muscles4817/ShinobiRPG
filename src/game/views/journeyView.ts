import { clamp, counted, numberWord } from '@/core';
import { MAP_SIZE, type BackdropId, type MapPoint } from '@/content';
import type { JourneyPlan, MissionStage } from '@/systems/missions';
import { TIME_SLOTS, type TimeSlot } from '@/systems/time';

import type { GameContext } from '../context';
import { journeyTitle, legsWalked } from '../journeys';
import { activeMission, activeStage } from '../missionFlow';
import { placeInText } from '../placeName';
import type { GameState } from '../state';
import { journeyPath, type LegSpan } from './journeyPath';
import { travelMap, type TravelMap } from './travelMap';

/**
 * A trip as the map shows it (`docs/design/journeys-plan.md` 3.1): the road as one line in
 * walking order, each leg's span along it with the region it crosses, the places it passes and
 * where it ends, how far you've come, the day and the hour, and what the road is waiting on.
 * The journey screen animates from one view to the next; nothing in the game reads the
 * animation, so it never changes what happens.
 */

/** Map units kept clear around the road when the map is framed on it. */
const FRAME_MARGIN = 10;
/** The least the frame shows across, so a one-day road isn't drawn at street scale. */
const FRAME_MIN_SPAN = 45;

export interface JourneyMapLeg extends LegSpan {
  readonly region: string;
  /** The region as a caption over the map: "The forest track". */
  readonly caption: string;
  readonly days: number;
  /** The location the leg heads for. */
  readonly toward: string;
}

export interface JourneyStop {
  readonly id: string;
  readonly name: string;
  /** Where along the road it stands, as a share of the whole. */
  readonly at: number;
  readonly kind: 'through' | 'destination';
}

/**
 * What the road waits on: walking the next leg, a road event, the fire, a fight or the story;
 * or nothing, the road walked and the place reached.
 */
export type JourneyWaiting = 'road' | 'road-event' | 'camp' | 'fight' | 'story' | 'arrived';

/** The place reached, for its title card: "After three days on the road". */
export interface Arrival {
  readonly name: string;
  readonly epithet: string;
  readonly backdrop: BackdropId;
  readonly line: string;
  /** The choice that closes the map: "Walk into Port Shiomachi". */
  readonly enter: string;
}

/** The part of the map to show, in map units. */
export interface MapFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface JourneyView {
  /** "The road to Kiri Ford". */
  readonly title: string;
  /** The country the road crosses, as the Travel tab draws it. */
  readonly map: TravelMap;
  readonly destination: string;
  readonly destinationName: string;
  readonly path: readonly MapPoint[];
  readonly legs: readonly JourneyMapLeg[];
  readonly stops: readonly JourneyStop[];
  /** Legs behind you. */
  readonly walked: number;
  /** Where your seal stands, as a share of the road. */
  readonly seal: number;
  readonly daysWalked: number;
  readonly daysInAll: number;
  /** How far you've come, in words: "A day behind you, two ahead". */
  readonly progress: string;
  readonly day: number;
  readonly slot: TimeSlot;
  readonly waiting: JourneyWaiting;
  readonly hurrying: boolean;
  readonly frame: MapFrame;
  /** Set once the road is walked. */
  readonly arrival: Arrival | null;
}

/** "forest-track" as a caption: "The forest track". */
export function regionCaption(region: string): string {
  const words = region.replace(/^the-/, '').replaceAll('-', ' ');
  return `The ${words}`;
}

const upper = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

function progressLine(walked: number, inAll: number): string {
  if (walked === 0) return `${upper(counted(inAll, 'day'))} on the road ahead`;
  if (walked >= inAll) return 'The road behind you';
  return `${upper(counted(walked, 'day'))} behind you, ${numberWord(inAll - walked)} ahead`;
}

function waitingOn(stage: MissionStage | null, roadEvent: boolean): JourneyWaiting {
  if (roadEvent) return 'road-event';
  if (!stage) return 'road';
  switch (stage.kind) {
    case 'leg':
      return 'road';
    case 'camp':
      return 'camp';
    case 'combat':
    case 'encounter':
      return 'fight';
    case 'narrative':
    case 'check':
    case 'decision':
    case 'ending':
      return 'story';
  }
}

/** The places the road reaches: each one where a stretch ends, the last its destination. */
function stopsOf(legs: readonly JourneyMapLeg[], ctx: GameContext): JourneyStop[] {
  return legs.flatMap((leg, i): JourneyStop[] => {
    const next = legs[i + 1];
    if (next?.toward === leg.toward) return [];
    const { id, name } = ctx.content.locations.require(leg.toward);
    return [{ id, name, at: leg.end, kind: next ? 'through' : 'destination' }];
  });
}

/** One axis of the frame: the road's extent, padded and widened, kept on the map. */
function frameAxis(values: readonly number[], size: number): { start: number; span: number } {
  const low = Math.min(...values) - FRAME_MARGIN;
  const high = Math.max(...values) + FRAME_MARGIN;
  const span = Math.min(size, Math.max(FRAME_MIN_SPAN, high - low));
  const middle = (low + high) / 2;
  return { start: clamp(middle - span / 2, 0, size - span), span };
}

function frameOf(path: readonly MapPoint[]): MapFrame {
  const x = frameAxis(
    path.map((p) => p.x),
    MAP_SIZE.width,
  );
  const y = frameAxis(
    path.map((p) => p.y),
    MAP_SIZE.height,
  );
  return { x: x.start, y: y.start, width: x.span, height: y.span };
}

/** Where the road has got to: the legs behind you and what it waits on, or its end. */
function whereNow(
  state: GameState,
  ctx: GameContext,
  legCount: number,
): { walked: number; waiting: JourneyWaiting } {
  const run = state.mission;
  const def = activeMission(state, ctx);
  if (!run || !def) return { walked: legCount, waiting: 'arrived' };
  const waiting = waitingOn(activeStage(state, ctx), run.roadEvent !== undefined);
  return { walked: legsWalked(run, def.stages), waiting };
}

/** The title card for the place you walk into. */
function arrivalAt(plan: JourneyPlan, days: number, ctx: GameContext): Arrival {
  const { name, epithet, backdrop } = ctx.content.locations.require(plan.to);
  const line = `After ${counted(days, 'day')} on the road`;
  return { name, epithet, backdrop, line, enter: `Walk into ${placeInText(name)}` };
}

/**
 * The trip under way as the map shows it, or the trip just ended while you take in where you
 * are (`journeyEnd`); null when you aren't on a trip of your own.
 */
export function journeyView(state: GameState, ctx: GameContext): JourneyView | null {
  const plan = state.mission ? state.mission.journey : state.journeyEnd;
  if (!plan) return null;
  const { points, spans } = journeyPath(plan, ctx);
  const legs = plan.legs.map((leg, i) => ({
    start: spans[i]?.start ?? 0,
    end: spans[i]?.end ?? 0,
    region: leg.region,
    caption: regionCaption(leg.region),
    days: leg.days,
    toward: leg.toward ?? plan.to,
  }));
  const { walked, waiting } = whereNow(state, ctx, legs.length);
  const days = (n: number) => legs.slice(0, n).reduce((sum, leg) => sum + leg.days, 0);
  return {
    title: journeyTitle(plan, ctx),
    map: travelMap(state, ctx),
    destination: plan.to,
    destinationName: ctx.content.locations.require(plan.to).name,
    path: points,
    legs,
    stops: stopsOf(legs, ctx),
    walked,
    seal: legs[walked - 1]?.end ?? 0,
    daysWalked: days(walked),
    daysInAll: days(legs.length),
    progress: progressLine(days(walked), days(legs.length)),
    day: state.time.day,
    slot: TIME_SLOTS[state.time.slot] ?? 'morning',
    waiting,
    hurrying: plan.quick,
    frame: frameOf(points),
    arrival: waiting === 'arrived' ? arrivalAt(plan, days(legs.length), ctx) : null,
  };
}
