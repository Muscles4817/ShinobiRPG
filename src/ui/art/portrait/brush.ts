/**
 * Brush lines. A line is a spline through a few points, drawn as a filled shape whose width
 * follows the pressure of a loaded brush: landing, travelling, lifting. Everything inked in a
 * portrait is made of these, so lines swell and thin like calligraphy, never a fixed stroke.
 */

export type Point = readonly [number, number];

export interface BrushStroke {
  /** The line's width where the brush is pressed fully down. */
  readonly w: number;
  /** How much of the line the brush takes to land (0 to 1). */
  readonly land?: number;
  /** How much of the line the brush takes to lift (0 to 1). */
  readonly lift?: number;
}

const DEFAULT_TAPER = 0.3;
/** Samples per span of the spline; enough that a curve never shows its corners. */
const SPAN_SAMPLES = 16;
/** The thinnest a line gets at its tips, as a share of its width. */
const TIP = 0.04;
const PRESSURE_CURVE = 0.7;

const r1 = (n: number): number => Math.round(n * 10) / 10;

/** Point lists are written flat (x, y, x, y…), which keeps a drawing's data on a few lines. */
export function points(flat: readonly number[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) out.push([flat[i] ?? 0, flat[i + 1] ?? 0]);
  return out;
}

type Span = readonly [number, number, number, number];

/** One coordinate of a Catmull-Rom span at `t`. */
function catmull([a, b, c, d]: Span, t: number): number {
  const t2 = t * t;
  return (
    0.5 *
    (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t2 * t)
  );
}

/** Points along the smooth curve through `pts`. */
export function splinePoints(pts: readonly Point[], perSpan = SPAN_SAMPLES): Point[] {
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (!first || !last) return [];
  const p = [first, ...pts, last];
  const out: Point[] = [];
  for (let i = 0; i + 3 < p.length; i++) {
    const [a, b, c, d] = [p[i], p[i + 1], p[i + 2], p[i + 3]];
    if (!a || !b || !c || !d) continue;
    for (let k = 0; k < perSpan; k++) {
      const t = k / perSpan;
      out.push([catmull([a[0], b[0], c[0], d[0]], t), catmull([a[1], b[1], c[1], d[1]], t)]);
    }
  }
  out.push(last);
  return out;
}

/** The smooth curve through `pts` as path data, without its leading `M`. */
export function splinePath(pts: readonly Point[]): string {
  return splinePoints(pts)
    .map(([x, y]) => `${r1(x)} ${r1(y)}`)
    .join('L');
}

/** How hard the brush is pressed at `u` along the line. */
function pressure(u: number, land: number, lift: number): number {
  const down = land > 0 ? Math.min(1, u / land) : 1;
  const up = lift > 0 ? Math.min(1, (1 - u) / lift) : 1;
  return Math.max(TIP, Math.pow(down, PRESSURE_CURVE) * Math.pow(up, PRESSURE_CURVE));
}

/** A brush line through `pts` as the outline of a filled shape. */
export function brushPath(pts: readonly Point[], stroke: BrushStroke): string {
  const line = splinePoints(pts);
  const land = stroke.land ?? DEFAULT_TAPER;
  const lift = stroke.lift ?? DEFAULT_TAPER;
  const left: string[] = [];
  const right: string[] = [];
  line.forEach(([x, y], j) => {
    const before = line[Math.max(0, j - 1)] ?? [x, y];
    const after = line[Math.min(line.length - 1, j + 1)] ?? [x, y];
    const dx = after[0] - before[0];
    const dy = after[1] - before[1];
    const length = Math.hypot(dx, dy) || 1;
    const half = (stroke.w / 2) * pressure(j / Math.max(1, line.length - 1), land, lift);
    const nx = (-dy / length) * half;
    const ny = (dx / length) * half;
    left.push(`${r1(x + nx)} ${r1(y + ny)}`);
    right.unshift(`${r1(x - nx)} ${r1(y - ny)}`);
  });
  return `M${left.join('L')}L${right.join('L')}Z`;
}
