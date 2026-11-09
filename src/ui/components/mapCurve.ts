import type { MapPoint } from '@/game';

/**
 * Turns a few map points into a smooth SVG path (a Catmull-Rom curve through every point),
 * so a coast or a road drawn from a handful of points reads as hand-inked, not ruled. A
 * journey's seal and the road walked so far are found along the same curve (`alongCurve`).
 */

/** Never reached: every index is folded into the list first. */
const ORIGIN: MapPoint = { x: 0, y: 0 };

/** One stretch of the curve as a cubic Bézier: from, two pulls, to. */
type Segment = readonly [MapPoint, MapPoint, MapPoint, MapPoint];

function segmentsOf(points: readonly MapPoint[], closed: boolean): Segment[] {
  const count = points.length;
  if (count < 2) return [];
  const at = (i: number): MapPoint =>
    points[closed ? (i + count) % count : Math.max(0, Math.min(count - 1, i))] ?? ORIGIN;
  const segments: Segment[] = [];
  for (let i = 0; i < (closed ? count : count - 1); i++) {
    const [before, from, to, after] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const first = { x: from.x + (to.x - before.x) / 6, y: from.y + (to.y - before.y) / 6 };
    const second = { x: to.x - (after.x - from.x) / 6, y: to.y - (after.y - from.y) / 6 };
    segments.push([from, first, second, to]);
  }
  return segments;
}

function fixed(p: MapPoint): string {
  return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
}

function pathOf(segments: readonly Segment[]): string {
  const start = segments[0]?.[0];
  if (!start) return '';
  const curves = segments.map(([, a, b, to]) => ` C${fixed(a)} ${fixed(b)} ${fixed(to)}`);
  return `M${fixed(start)}${curves.join('')}`;
}

export function curvePath(points: readonly MapPoint[], closed: boolean): string {
  const path = pathOf(segmentsOf(points, closed));
  return closed && path ? `${path} Z` : path;
}

const mix = (a: MapPoint, b: MapPoint, t: number): MapPoint => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/** The first part of a segment, up to `t` (de Casteljau): it ends on the curve at `t`. */
function upTo([p0, p1, p2, p3]: Segment, t: number): Segment {
  const a = mix(p0, p1, t);
  const b = mix(p1, p2, t);
  const c = mix(p2, p3, t);
  const ab = mix(a, b, t);
  const bc = mix(b, c, t);
  return [p0, a, ab, mix(ab, bc, t)];
}

/**
 * The point `share` of the way along an open curve, and the curve drawn up to it. Shares are
 * measured on the straight line between the points, as the game measures a road's legs, so a
 * leg's end falls exactly on the place it reaches.
 */
export function alongCurve(
  points: readonly MapPoint[],
  share: number,
): { readonly point: MapPoint; readonly path: string } {
  const segments = segmentsOf(points, false);
  const lengths = segments.map(([from, , , to]) => Math.hypot(to.x - from.x, to.y - from.y));
  const total = lengths.reduce((sum, l) => sum + l, 0);
  let left = Math.max(0, Math.min(1, share)) * total;
  for (let i = 0; i < segments.length; i++) {
    const length = lengths[i] ?? 0;
    const segment = segments[i];
    if (segment && (left <= length || i === segments.length - 1)) {
      const part = upTo(segment, length > 0 ? Math.min(1, left / length) : 1);
      return { point: part[3], path: pathOf([...segments.slice(0, i), part]) };
    }
    left -= length;
  }
  return { point: points[0] ?? ORIGIN, path: '' };
}
