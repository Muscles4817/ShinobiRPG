import { clamp } from '@/core';
import { MAP_SIZE, type MapPoint } from '@/content';
import type { MissionStage } from '@/systems/missions';
import { TIME_SLOTS, type TimeSlot } from '@/systems/time';

import type { GameContext } from '../context';
import { legsWalked } from '../journeys';
import { activeMission, activeStage } from '../missionFlow';
import type { GameState } from '../state';
import { journeyPath, type LegSpan } from './journeyPath';

/**
 * A trip as the map shows it (`docs/design/journeys-plan.md` 3.1): the road as one line in
 * walking order, each leg's span along it with the region it crosses, the places it passes and
 * where it ends, how far you've come, the day and the hour, and what the road is waiting on.
 * The journey screen animates from one view to the next; nothing in the game reads the
 * animation, so it never changes what happens.
 */

/** Map units kept clear around the road when the map is framed on it. */
const FRAME_MARGIN = 8;
/** The least the frame shows across, so a one-day road isn't drawn at street scale. */
const FRAME_MIN_SPAN = 30;

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

/** What the road waits on: walking the next leg, a road event, the fire, a fight or the story. */
export type JourneyWaiting = 'road' | 'road-event' | 'camp' | 'fight' | 'story';

/** The part of the map to show, in map units. */
export interface MapFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface JourneyView {
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
  readonly day: number;
  readonly slot: TimeSlot;
  readonly waiting: JourneyWaiting;
  readonly hurrying: boolean;
  readonly frame: MapFrame;
}

/** "forest-track" as a caption: "The forest track". */
export function regionCaption(region: string): string {
  const words = region.replace(/^the-/, '').replaceAll('-', ' ');
  return `The ${words}`;
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

/** The trip under way as the map shows it, or null when you aren't on a trip of your own. */
export function journeyView(state: GameState, ctx: GameContext): JourneyView | null {
  const run = state.mission;
  const plan = run?.journey;
  const def = activeMission(state, ctx);
  if (!run || !plan || !def) return null;
  const { points, spans } = journeyPath(plan, ctx);
  const legs = plan.legs.map((leg, i) => ({
    start: spans[i]?.start ?? 0,
    end: spans[i]?.end ?? 0,
    region: leg.region,
    caption: regionCaption(leg.region),
    days: leg.days,
    toward: leg.toward ?? plan.to,
  }));
  const walked = legsWalked(run, def.stages);
  const days = (n: number) => legs.slice(0, n).reduce((sum, leg) => sum + leg.days, 0);
  return {
    destination: plan.to,
    destinationName: ctx.content.locations.require(plan.to).name,
    path: points,
    legs,
    stops: stopsOf(legs, ctx),
    walked,
    seal: legs[walked - 1]?.end ?? 0,
    daysWalked: days(walked),
    daysInAll: days(legs.length),
    day: state.time.day,
    slot: TIME_SLOTS[state.time.slot] ?? 'morning',
    waiting: waitingOn(activeStage(state, ctx), run.roadEvent !== undefined),
    hurrying: plan.quick,
    frame: frameOf(points),
  };
}
