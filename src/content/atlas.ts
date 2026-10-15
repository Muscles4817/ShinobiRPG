/**
 * A pack's map as drawn on the Travel tab: the land and sea, the home country, borders,
 * rivers and names, in the units of `MAP_SIZE`. Shapes are outlines through a few points; the
 * screen draws them as smooth, hand-inked curves. What you can do is still the routes and
 * locations: the atlas is only how the country looks.
 */

export interface MapPoint {
  readonly x: number;
  readonly y: number;
}

/** Where a place's name sits beside its seal, so names don't run into each other. */
export type MapLabelSide = 'above' | 'below' | 'left' | 'right';

export interface AtlasLabel {
  readonly text: string;
  readonly at: MapPoint;
  /** A country, a sea, or a feature (a forest, a range). */
  readonly kind: 'land' | 'sea' | 'feature';
  /** A big country's name; the rest are smaller. */
  readonly large?: boolean;
}

export interface AtlasDef {
  /** Coastlines: each a closed outline of land. Everything else is sea. */
  readonly lands: readonly (readonly MapPoint[])[];
  /** The home country's outline, washed in colour; drawn only where there is land. */
  readonly home: readonly MapPoint[];
  /** Borders between countries, as open lines. */
  readonly borders: readonly (readonly MapPoint[])[];
  readonly rivers: readonly (readonly MapPoint[])[];
  readonly labels: readonly AtlasLabel[];
}
