import type { IconId, PlaceDef, PlaceKind } from '@/content';
import { daysOfRentLeft, isRentFree, isRentOverdue } from '@/systems/housing';
import { isHungry, maxHealth } from '@/systems/vitals';

import type { GameContext } from '../context';
import { currentLocation, healthFraction } from '../ops';
import type { GameState } from '../state';
import { choice } from './common';
import { facesByPlace, type PersonFace } from './people';

/** A place on the village screen, with one live line about it. */
export interface PlaceCard {
  readonly id: string;
  readonly kind: PlaceKind;
  readonly name: string;
  readonly icon: IconId;
  readonly line: string;
  /** The one place the game suggests going next. */
  readonly suggested: boolean;
  /** Who is there right now. */
  readonly people: readonly PersonFace[];
}

export interface HubView {
  readonly places: readonly PlaceCard[];
  /** The latest record entry, for the ticker above the dock. */
  readonly latest: {
    readonly heading: string;
    readonly chips: readonly { label: string; tone: string }[];
  } | null;
}

function liveLine(place: PlaceDef, state: GameState, ctx: GameContext): string {
  switch (place.kind) {
    case 'missions': {
      const open = place.missionIds.filter(
        (id) => choice(state, ctx, { type: 'startMission', missionId: id }).blocker === null,
      ).length;
      return open > 0 ? `${open} jobs you can take` : 'No jobs you can take now';
    }
    case 'training':
      return `${place.trainingIds.length} drills`;
    case 'market':
      return isHungry(state.character.vitals) ? 'You’re hungry' : place.blurb;
    case 'academy':
      return academyLine(place.techniqueIds, state, ctx);
    case 'home':
      return homeLine(state, place.blurb);
    case 'hospital':
      return state.character.vitals.health < maxHealth(state.character.stats)
        ? `Treatment ${place.treatmentCost} ryo`
        : 'You’re healthy';
  }
}

function academyLine(ids: readonly string[], state: GameState, ctx: GameContext): string {
  const studying = ids.find((id) => (state.techniques.progress[id] ?? 0) > 0);
  if (!studying)
    return `${ids.filter((id) => !state.techniques.known.includes(id)).length} scrolls`;
  const def = ctx.content.techniques.require(studying);
  const pct = Math.round(((state.techniques.progress[studying] ?? 0) / def.difficulty) * 100);
  return `${def.name} ${pct}%`;
}

function homeLine(state: GameState, blurb: string): string {
  if (isRentFree(state.housing)) return state.housing.lodging ?? blurb;
  if (isRentOverdue(state.housing, state.time.day)) return 'Rent overdue';
  const left = daysOfRentLeft(state.housing, state.time.day);
  if (left === 0) return 'Rent due tomorrow';
  return blurb;
}

/** Picks the place most worth visiting next, in order of urgency. */
function suggestion(state: GameState, places: readonly PlaceDef[]): PlaceKind | null {
  const { vitals } = state.character;
  const has = (kind: PlaceKind) => places.some((p) => p.kind === kind);
  const order: [boolean, PlaceKind][] = [
    [healthFraction(state) < 0.4, 'hospital'],
    [isRentOverdue(state.housing, state.time.day), 'home'],
    [isHungry(vitals), 'market'],
    [vitals.energy < 20 || state.time.slot === 3, 'home'],
    [true, 'missions'],
  ];
  return order.find(([when, kind]) => when && has(kind))?.[1] ?? null;
}

export function hubView(state: GameState, ctx: GameContext): HubView {
  const { places } = currentLocation(state, ctx);
  const suggested = suggestion(state, places);
  const faces = facesByPlace(state, ctx);
  const last = state.journal.entries.at(-1);
  return {
    places: places.map((p) => ({
      id: p.id,
      kind: p.kind,
      name: p.kind === 'home' && isRentFree(state.housing) ? 'Home' : p.name,
      icon: p.icon,
      line: liveLine(p, state, ctx),
      suggested: p.kind === suggested,
      people: faces.get(p.id) ?? [],
    })),
    latest: last ? { heading: last.heading ?? last.text, chips: last.chips ?? [] } : null,
  };
}
