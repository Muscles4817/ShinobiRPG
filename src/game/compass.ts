/**
 * Which way one place lies from another on the pack's map, in words ("north", "south-east"),
 * so a road can say where it is going. Map points run x east and y south.
 */

const POINTS = [
  'east',
  'south-east',
  'south',
  'south-west',
  'west',
  'north-west',
  'north',
  'north-east',
] as const;
export type Bearing = (typeof POINTS)[number];

interface Point {
  readonly x: number;
  readonly y: number;
}

export function bearing(from: Point, to: Point): Bearing {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const step = Math.round(angle / (Math.PI / 4));
  return POINTS[(step + POINTS.length) % POINTS.length] ?? 'east';
}
