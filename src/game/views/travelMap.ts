import { MAP_SIZE } from '@/content';
import type { Danger } from '@/systems/missions';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * The Travel tab's map: every location as a point, every route as a line between two of them
 * (closed while either end is locked), and where you stand. Positions come from the pack
 * (`LocationDef.map`), in the units of `MAP_SIZE`.
 */

export interface MapPoint {
  readonly x: number;
  readonly y: number;
}

export interface MapPlace extends MapPoint {
  readonly id: string;
  readonly name: string;
  readonly here: boolean;
  /** Still coming soon: shown, but with what opens it. */
  readonly locked: boolean;
}

export interface MapRoad {
  readonly id: string;
  readonly from: MapPoint;
  readonly to: MapPoint;
  /** Both ends are open: a road you could walk. */
  readonly open: boolean;
  readonly danger: Danger;
}

export interface TravelMap {
  readonly width: number;
  readonly height: number;
  readonly places: readonly MapPlace[];
  readonly roads: readonly MapRoad[];
}

export function travelMap(state: GameState, ctx: GameContext): TravelMap {
  const { locations, routes } = ctx.content;
  const at = (id: string): MapPoint => locations.require(id).map;
  const locked = (id: string) => locations.require(id).lockedReason !== undefined;
  return {
    ...MAP_SIZE,
    places: locations.all.map((l) => ({
      id: l.id,
      name: l.name,
      ...l.map,
      here: l.id === state.locationId,
      locked: l.lockedReason !== undefined,
    })),
    roads: routes.all.map((r) => ({
      id: r.id,
      from: at(r.from),
      to: at(r.to),
      open: !locked(r.from) && !locked(r.to),
      danger: r.danger,
    })),
  };
}
