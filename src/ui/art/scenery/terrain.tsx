import type { Point } from './kit';
import { r1, scatter } from './kit';

/**
 * The ground the backdrops stand on: boulders, crags and rock spires, a waterfall into its pool,
 * grass tufts and reeds. Rock and grass take the hour's inks (`bd-near`, `bd-front`, `bd-leaf`);
 * falling water keeps its own pale white.
 */

/** A boulder: a lumpy dome, lit along its top edge. */
export function Boulder({
  at: [x, y],
  size: s,
  seed,
  className = 'bd-front',
}: {
  readonly at: Point;
  readonly size: number;
  readonly seed: number;
  readonly className?: string;
}) {
  const next = scatter(seed);
  const lean = (next() - 0.5) * s * 0.5;
  const top = y - s * (0.7 + next() * 0.4);
  const d = `M${r1(x - s)} ${y}C${r1(x - s)} ${r1(top + s * 0.3)} ${r1(x - s * 0.4 + lean)} ${r1(top)} ${r1(x + lean)} ${r1(top)}C${r1(x + s * 0.6 + lean)} ${r1(top)} ${r1(x + s)} ${r1(top + s * 0.4)} ${r1(x + s)} ${y}Z`;
  return (
    <g>
      <path className={className} d={d} />
      <path
        className="bd-rim"
        d={`M${r1(x - s * 0.8)} ${r1(top + s * 0.35)}C${r1(x - s * 0.4 + lean)} ${r1(top + s * 0.02)} ${r1(x + s * 0.3 + lean)} ${r1(top)} ${r1(x + s * 0.7)} ${r1(top + s * 0.25)}`}
        strokeWidth=".9"
        fill="none"
      />
    </g>
  );
}

/** A tall rock spire, ridged down its face, of the kind that stands in misty mountains. */
export function Spire({
  at: [x, y],
  height: h,
  width: w,
  className = 'bd-mid',
}: {
  readonly at: Point;
  readonly height: number;
  readonly width: number;
  readonly className?: string;
}) {
  return (
    <g>
      <path
        className={className}
        d={`M${r1(x - w / 2)} ${y}C${r1(x - w * 0.45)} ${r1(y - h * 0.5)} ${r1(x - w * 0.3)} ${r1(y - h * 0.9)} ${r1(x - w * 0.05)} ${r1(y - h)}C${r1(x + w * 0.2)} ${r1(y - h * 0.95)} ${r1(x + w * 0.35)} ${r1(y - h * 0.6)} ${r1(x + w / 2)} ${y}Z`}
      />
      <path
        className="bd-rim"
        d={`M${r1(x - w * 0.05)} ${r1(y - h)}C${r1(x - w * 0.25)} ${r1(y - h * 0.7)} ${r1(x - w * 0.3)} ${r1(y - h * 0.4)} ${r1(x - w * 0.38)} ${r1(y - h * 0.1)}`}
        strokeWidth=".8"
        fill="none"
        opacity=".7"
      />
    </g>
  );
}

/**
 * A waterfall dropping from a lip to a pool: ribbons of white falling water, spray at the foot
 * and rings spreading on the pool.
 */
export function Waterfall({
  top: [x, top],
  foot,
  width: w,
  seed,
}: {
  readonly top: Point;
  readonly foot: number;
  readonly width: number;
  readonly seed: number;
}) {
  const next = scatter(seed);
  const ribbons = Array.from({ length: 7 }, (_, i) => {
    const rx = x - w / 2 + (i + 0.5) * (w / 7) + (next() - 0.5) * 2;
    return { rx: r1(rx), o: r1(0.45 + next() * 0.5), sw: r1(1.2 + next() * 1.8) };
  });
  return (
    <g>
      <rect
        x={r1(x - w / 2)}
        y={top}
        width={w}
        height={r1(foot - top)}
        fill="#dfe9f0"
        opacity=".35"
      />
      <g stroke="#f4f8fb" fill="none">
        {ribbons.map((r) => (
          <path
            key={r.rx}
            d={`M${r.rx} ${top}C${r1(r.rx + 1)} ${r1(top + (foot - top) * 0.4)} ${r1(r.rx - 1)} ${r1(top + (foot - top) * 0.7)} ${r.rx} ${foot}`}
            strokeWidth={r.sw}
            strokeOpacity={r.o}
          />
        ))}
      </g>
      <ellipse cx={x} cy={foot} rx={r1(w * 1.1)} ry={r1(w * 0.22)} fill="#f4f8fb" opacity=".45" />
      <g stroke="#f4f8fb" fill="none" strokeOpacity=".35" strokeWidth=".8">
        <ellipse cx={x} cy={r1(foot + w * 0.3)} rx={r1(w * 1.6)} ry={r1(w * 0.25)} />
        <ellipse cx={x} cy={r1(foot + w * 0.55)} rx={r1(w * 2.2)} ry={r1(w * 0.32)} />
      </g>
    </g>
  );
}

/** Tufts of grass along a line, each a fan of blades. */
export function Tufts({
  from: [x0, y0],
  to: [x1, y1],
  count,
  seed,
  height = 7,
}: {
  readonly from: Point;
  readonly to: Point;
  readonly count: number;
  readonly seed: number;
  readonly height?: number;
}) {
  const next = scatter(seed);
  const blades = Array.from({ length: count }, (_, i) => {
    const t = (i + next() * 0.8) / count;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    const h = height * (0.6 + next() * 0.8);
    return `M${r1(x)} ${r1(y)}q${r1(-h * 0.3)} ${r1(-h * 0.5)} ${r1(-h * 0.5)} ${r1(-h)}M${r1(x)} ${r1(y)}q0 ${r1(-h * 0.6)} ${r1(h * 0.1)} ${r1(-h * 1.1)}M${r1(x)} ${r1(y)}q${r1(h * 0.3)} ${r1(-h * 0.5)} ${r1(h * 0.55)} ${r1(-h * 0.9)}`;
  });
  return <path className="bd-leaf-stroke" d={blades.join('')} strokeWidth=".9" fill="none" />;
}

/** Reeds by water: tall stems with seed heads, leaning with the wind. */
export function Reeds({
  at: [x, y],
  count,
  seed,
  scale: s = 1,
}: {
  readonly at: Point;
  readonly count: number;
  readonly seed: number;
  readonly scale?: number;
}) {
  const next = scatter(seed);
  const stems = Array.from({ length: count }, (_, i) => {
    const bx = x + (i - count / 2) * 3 * s + (next() - 0.5) * 3;
    const h = (24 + next() * 18) * s;
    const lean = (4 + next() * 6) * s;
    return { bx: r1(bx), h, lean, head: next() < 0.6 };
  });
  return (
    <g>
      <path
        className="bd-front-stroke"
        d={stems
          .map(
            (st) =>
              `M${st.bx} ${y}q${r1(st.lean * 0.2)} ${r1(-st.h * 0.6)} ${r1(st.lean)} ${r1(-st.h)}`,
          )
          .join('')}
        strokeWidth={r1(0.9 * s)}
        fill="none"
      />
      {stems
        .filter((st) => st.head)
        .map((st) => (
          <ellipse
            key={st.bx}
            className="bd-front"
            cx={r1(st.bx + st.lean)}
            cy={r1(y - st.h + 2 * s)}
            rx={r1(1.1 * s)}
            ry={r1(3.4 * s)}
            transform={`rotate(${r1(st.lean * 2)} ${r1(st.bx + st.lean)} ${r1(y - st.h + 2 * s)})`}
          />
        ))}
    </g>
  );
}
