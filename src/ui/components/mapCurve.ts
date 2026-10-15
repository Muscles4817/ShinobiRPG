import type { MapPoint } from '@/game';

/**
 * Turns a few map points into a smooth SVG path (a Catmull-Rom curve through every point),
 * so a coast or a road drawn from a handful of points reads as hand-inked, not ruled.
 */
/** Never reached: every index is folded into the list first. */
const ORIGIN: MapPoint = { x: 0, y: 0 };

export function curvePath(points: readonly MapPoint[], closed: boolean): string {
  const count = points.length;
  if (count < 2) return '';
  const at = (i: number): MapPoint =>
    points[closed ? (i + count) % count : Math.max(0, Math.min(count - 1, i))] ?? ORIGIN;
  const segments = closed ? count : count - 1;
  let path = `M${fixed(at(0))}`;
  for (let i = 0; i < segments; i++) {
    const [before, from, to, after] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const pull = { x: (to.x - before.x) / 6, y: (to.y - before.y) / 6 };
    const push = { x: (after.x - from.x) / 6, y: (after.y - from.y) / 6 };
    const first = { x: from.x + pull.x, y: from.y + pull.y };
    const second = { x: to.x - push.x, y: to.y - push.y };
    path += ` C${fixed(first)} ${fixed(second)} ${fixed(to)}`;
  }
  return closed ? `${path} Z` : path;
}

function fixed(p: MapPoint): string {
  return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
}
