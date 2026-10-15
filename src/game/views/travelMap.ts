import { MAP_SIZE, type AtlasLabel, type MapLabelSide, type MapPoint } from '@/content';
import type { Danger } from '@/systems/missions';

import type { GameContext } from '../context';
import { DEFAULT_MAP_STYLE, type MapStyle } from '../mapStyle';
import { roadOpen } from '../routeNeeds';
import type { GameState } from '../state';

/**
 * The Travel tab's map: the pack's atlas (land, sea, the home country, borders, rivers,
 * names), every location as a point with its name on the side the pack chose, every route as
 * a line through its bends (closed while either end is locked or it needs what you lack), and
 * where you stand. Positions are in the units of `MAP_SIZE`.
 */

export type { AtlasLabel, MapLabelSide, MapPoint };

export interface MapPlace extends MapPoint {
  readonly id: string;
  readonly name: string;
  readonly here: boolean;
  /** Still coming soon: shown, but with what opens it. */
  readonly locked: boolean;
  readonly label: MapLabelSide;
}

export interface MapRoad {
  readonly id: string;
  /** From one end to the other through its bends. */
  readonly path: readonly MapPoint[];
  /** Both ends are open and you meet its needs: a road you could walk. */
  readonly open: boolean;
  readonly danger: Danger;
}

export interface TravelMap {
  /** How the player chose to have it inked. */
  readonly style: MapStyle;
  readonly width: number;
  readonly height: number;
  readonly lands: readonly (readonly MapPoint[])[];
  readonly home: readonly MapPoint[];
  readonly borders: readonly (readonly MapPoint[])[];
  readonly rivers: readonly (readonly MapPoint[])[];
  readonly labels: readonly AtlasLabel[];
  readonly places: readonly MapPlace[];
  readonly roads: readonly MapRoad[];
}

export function travelMap(state: GameState, ctx: GameContext): TravelMap {
  const { locations, routes, atlas } = ctx.content;
  const at = (id: string): MapPoint => {
    const { x, y } = locations.require(id).map;
    return { x, y };
  };
  return {
    ...MAP_SIZE,
    ...atlas,
    style: state.settings.mapStyle ?? DEFAULT_MAP_STYLE,
    places: locations.all.map((l) => ({
      id: l.id,
      name: l.name,
      x: l.map.x,
      y: l.map.y,
      label: l.map.label ?? 'below',
      here: l.id === state.locationId,
      locked: l.lockedReason !== undefined,
    })),
    roads: routes.all.map((r) => ({
      id: r.id,
      path: [at(r.from), ...(r.trail ?? []), at(r.to)],
      open: roadOpen(state, ctx, r),
      danger: r.danger,
    })),
  };
}
