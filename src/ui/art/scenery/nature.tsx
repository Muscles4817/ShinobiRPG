import type { Point } from './kit';
import { r1, scatter } from './kit';

/**
 * Growing things for the painted backdrops: black pines with flat clouds of needles, a sakura
 * bough with falling petals, and round broadleaf crowns. Their colours follow the time of day
 * through `bd-pine`, `bd-leaf` and `bd-leaf-lit` (theme/scenery.css).
 */

const PINE_PADS: readonly (readonly [number, number, number, number])[] = [
  [-14, -34, 16, 5],
  [10, -44, 18, 5.5],
  [-4, -56, 14, 5],
  [20, -28, 12, 4],
  [-22, -22, 10, 3.5],
];
const PAD_CLUMP: readonly (readonly [number, number, number])[] = [
  [-0.45, 0.15, 0.6],
  [0, -0.1, 0.75],
  [0.45, 0.2, 0.55],
  [0.15, 0.35, 0.6],
];

/** A Japanese black pine leaning from its root at `at`. */
export function Pine({
  at: [x, y],
  scale: s = 1,
}: {
  readonly at: Point;
  readonly scale?: number;
}) {
  const trunk = `M${x} ${y}C${r1(x + 2 * s)} ${r1(y - 20 * s)} ${r1(x - 6 * s)} ${r1(y - 34 * s)} ${r1(x + 2 * s)} ${r1(y - 56 * s)}M${r1(x - s)} ${r1(y - 30 * s)}L${r1(x - 14 * s)} ${r1(y - 32 * s)}M${r1(x + s)} ${r1(y - 40 * s)}L${r1(x + 12 * s)} ${r1(y - 43 * s)}`;
  return (
    <g>
      <path
        className="bd-front-stroke"
        d={trunk}
        strokeWidth={r1(3 * s)}
        strokeLinecap="round"
        fill="none"
      />
      {PINE_PADS.map(([dx, dy, rx, ry]) => {
        const cx = x + dx * s;
        const cy = y + dy * s;
        return (
          <g key={`${dx}-${dy}`}>
            {PAD_CLUMP.map(([ox, oy, k]) => (
              <ellipse
                key={`${ox}-${oy}`}
                className="bd-pine"
                cx={r1(cx + ox * rx * s)}
                cy={r1(cy + oy * ry * s)}
                rx={r1(rx * s * k)}
                ry={r1(ry * s * (0.7 + k * 0.4))}
              />
            ))}
            <path
              className="bd-rim"
              d={`M${r1(cx - rx * s * 0.7)} ${r1(cy - ry * s * 0.55)}Q${r1(cx)} ${r1(cy - ry * s * 1.3)} ${r1(cx + rx * s * 0.75)} ${r1(cy - ry * s * 0.45)}`}
              strokeWidth={r1(1.1 * s)}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}

interface Blossom {
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly turn: number;
  readonly pale: boolean;
}

const BOUGH =
  'M-10 18C30 22 62 34 92 52C110 62 130 64 150 60M60 32C70 14 84 6 100 2M92 52C96 70 92 84 82 96M120 60C134 74 146 78 162 78';
const BOUGH_KNOTS: readonly Point[] = [
  [20, 22],
  [40, 26],
  [58, 30],
  [74, 38],
  [88, 48],
  [104, 56],
  [124, 60],
  [142, 60],
  [158, 58],
  [66, 22],
  [74, 14],
  [86, 8],
  [98, 4],
  [94, 66],
  [90, 80],
  [84, 92],
  [132, 70],
  [146, 76],
  [160, 78],
];

const BLOSSOMS: readonly Blossom[] = (() => {
  const next = scatter(7);
  return BOUGH_KNOTS.flatMap(([x, y]) =>
    [0, 1].map((k) => ({
      x: r1(x + (next() - 0.5) * 18),
      y: r1(y + (next() - 0.5) * 16),
      s: r1(4 + next() * 3),
      turn: r1(next() * 72),
      pale: k === 0,
    })),
  );
})();

const PETAL_TURNS = [0, 72, 144, 216, 288];

/** A sakura bough reaching in from the top-left corner (mirror it for the right). */
export function SakuraBough({ transform }: { readonly transform?: string }) {
  return (
    <g transform={transform}>
      <path
        className="bd-front-stroke"
        d={BOUGH}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="bd-front-stroke"
        d="M-10 18C30 22 62 34 92 52"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {BLOSSOMS.map((b, i) => (
        <g key={i}>
          <g fill={b.pale ? '#ffe6ec' : '#ffc4d3'} stroke="#e889a6" strokeWidth={r1(b.s * 0.08)}>
            {PETAL_TURNS.map((t) => (
              <ellipse
                key={t}
                cx={b.x}
                cy={r1(b.y - b.s * 0.55)}
                rx={r1(b.s * 0.36)}
                ry={r1(b.s * 0.55)}
                transform={`rotate(${r1(b.turn + t)} ${b.x} ${b.y})`}
              />
            ))}
          </g>
          <circle cx={b.x} cy={b.y} r={r1(b.s * 0.2)} fill="#c2405e" />
        </g>
      ))}
    </g>
  );
}

/** Petals drifting across the scene. */
export function FallingPetals({
  seed,
  count = 22,
}: {
  readonly seed: number;
  readonly count?: number;
}) {
  const next = scatter(seed);
  const petals = Array.from({ length: count }, () => ({
    x: r1(next() * 400),
    y: r1(20 + next() * 200),
    rx: r1(1.4 + next() * 1.2),
    turn: r1(next() * 180),
    o: r1(0.5 + next() * 0.5),
  }));
  return (
    <g fill="#ffc6d4">
      {petals.map((p, i) => (
        <ellipse
          key={i}
          cx={p.x}
          cy={p.y}
          rx={p.rx}
          ry=".9"
          opacity={p.o}
          transform={`rotate(${p.turn} ${p.x} ${p.y})`}
        />
      ))}
    </g>
  );
}

/** A round broadleaf crown: a clump of shaded circles lit along the top. */
export function Crown({
  at: [x, y],
  size: s,
  seed,
}: {
  readonly at: Point;
  readonly size: number;
  readonly seed: number;
}) {
  const next = scatter(seed);
  const lobes = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + next();
    return {
      x: r1(x + Math.cos(a) * s * 0.55),
      y: r1(y + Math.sin(a) * s * 0.35),
      r: r1(s * (0.45 + next() * 0.2)),
    };
  });
  return (
    <g>
      {lobes.map((l, i) => (
        <circle key={i} className="bd-leaf" cx={l.x} cy={l.y} r={l.r} />
      ))}
      <circle className="bd-leaf" cx={x} cy={y} r={r1(s * 0.7)} />
      {lobes
        .filter((l) => l.y < y)
        .map((l, i) => (
          <circle
            key={i}
            className="bd-leaf-lit"
            cx={r1(l.x - l.r * 0.15)}
            cy={r1(l.y - l.r * 0.25)}
            r={r1(l.r * 0.6)}
          />
        ))}
    </g>
  );
}
