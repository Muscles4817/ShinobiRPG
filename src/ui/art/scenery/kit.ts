/**
 * Geometry for the painted backdrops: a tiny seeded generator (art only, never game state),
 * natural ridgelines and the sag of a rope between two hangs. Everything here is computed once
 * at module load, so a scene is the same on every render and every device.
 */

export type Point = readonly [number, number];

/** A mulberry32 stream: scenery that looks scattered but is fixed by its seed. */
export function scatter(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One decimal place keeps the paths short. */
export const r1 = (n: number): number => Math.round(n * 10) / 10;

export interface RidgeSpec {
  readonly x0?: number;
  readonly x1: number;
  /** The baseline the hills rise from. */
  readonly y: number;
  /** How high the tallest swell rises. */
  readonly amp: number;
  readonly seed: number;
  /** Where the shape closes underneath. */
  readonly bottom: number;
  /** More swells across the width when above 1. */
  readonly freq?: number;
}

const RIDGE_STEP = 6;
const RIDGE_WAVES = 4;

/** A ridgeline from layered sine swells, closed down to `bottom`. */
export function ridge({ x0 = 0, x1, y, amp, seed, bottom, freq = 1 }: RidgeSpec): string {
  const next = scatter(seed);
  const waves = Array.from({ length: RIDGE_WAVES }, (_, i) => ({
    k: ((0.6 + next() * 0.8) * (i + 1) * 2 * Math.PI * freq) / (x1 - x0),
    phase: next() * Math.PI * 2,
    height: amp / (i + 1) ** 1.25,
  }));
  const points: string[] = [];
  for (let x = x0; x <= x1 + 0.01; x += RIDGE_STEP) {
    const swell = waves.reduce((h, w) => h + Math.sin(x * w.k + w.phase) * w.height, 0);
    points.push(`${r1(x)} ${r1(y - swell - (next() - 0.5) * amp * 0.06)}`);
  }
  return `M${x0} ${bottom}L${points.join('L')}L${x1} ${bottom}Z`;
}

/** The control point of a rope hung between a and b, sagging by `sag`. */
function sagControl(a: Point, b: Point, sag: number): Point {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag * 2];
}

/** Where a fraction t of the way along a sagging rope lies. */
export function alongRope(a: Point, b: Point, sag: number, t: number): Point {
  const c = sagControl(a, b, sag);
  const u = 1 - t;
  return [
    u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
    u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
  ];
}

export function ropePath(a: Point, b: Point, sag: number): string {
  const c = sagControl(a, b, sag);
  return `M${r1(a[0])} ${r1(a[1])}Q${r1(c[0])} ${r1(c[1])} ${r1(b[0])} ${r1(b[1])}`;
}

export interface Speck {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly o: number;
}

/** Stars, embers or motes: `count` specks over a box, denser towards its top. */
export function specks(
  seed: number,
  count: number,
  box: { readonly w: number; readonly h: number },
): readonly Speck[] {
  const next = scatter(seed);
  return Array.from({ length: count }, () => ({
    x: r1(next() * box.w),
    y: r1(next() ** 1.6 * box.h),
    r: r1(next() < 0.08 ? 1.2 : 0.35 + next() * 0.55),
    o: r1(0.35 + next() * 0.6),
  }));
}
