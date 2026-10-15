import { MAP_SIZE } from './art';
import type { MapPoint } from './atlas';
import type { ContentPack } from './types';

/**
 * Checks the map's drawing: every shape has enough points to be a shape, every point (of the
 * atlas and of a road's bends) is on the map, and every label says something.
 */
export function validateAtlas(pack: ContentPack): string[] {
  const { atlas } = pack;
  return [
    ...(atlas.lands.length === 0 ? ['the atlas has no land'] : []),
    ...shapeProblems('land', atlas.lands, 3),
    ...shapeProblems('home country', [atlas.home], 3),
    ...shapeProblems('border', atlas.borders, 2),
    ...shapeProblems('river', atlas.rivers, 2),
    ...atlas.labels
      .filter((l) => l.text.trim() === '' || !onTheMap(l.at))
      .map((l) => `atlas label "${l.text}" is empty or off the map`),
    ...pack.routes
      .filter((r) => !(r.trail ?? []).every(onTheMap))
      .map((r) => `route "${r.id}" bends off the map`),
  ];
}

function shapeProblems(
  what: string,
  shapes: readonly (readonly MapPoint[])[],
  fewest: number,
): string[] {
  return shapes.flatMap((points, i) => [
    ...(points.length < fewest ? [`atlas ${what} ${i + 1} has too few points`] : []),
    ...(points.every(onTheMap) ? [] : [`atlas ${what} ${i + 1} goes off the map`]),
  ]);
}

/** Inside the map, edges included: land may run off it. */
function onTheMap(at: MapPoint): boolean {
  return at.x >= 0 && at.x <= MAP_SIZE.width && at.y >= 0 && at.y <= MAP_SIZE.height;
}
