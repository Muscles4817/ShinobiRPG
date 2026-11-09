import type { Point } from './kit';
import { r1, scatter } from './kit';

/**
 * More trees for the painted backdrops, so no two kinds of country share a wood: tall cedars in
 * stacked tiers, groves of bamboo, maples in their autumn red, weeping willows, cypress spires
 * and dead snags. Every tree is drawn from its seed, so two cedars side by side are never the
 * same shape. Cedars, bamboo, willows and cypress take the hour's foliage ink (`bd-pine`,
 * `bd-leaf`); maples keep their own reds, as the sakura keeps its pinks.
 */

export interface TreeProps {
  readonly at: Point;
  readonly scale?: number;
  readonly seed: number;
}

const CEDAR_TIERS = 8;

/** A sugi: a straight trunk under overlapping skirts of drooping boughs, narrowing to a spire. */
export function Cedar({ at: [x, y], scale: s = 1, seed }: TreeProps) {
  const next = scatter(seed);
  const height = 96 * s * (0.85 + next() * 0.3);
  const tierH = (height * 0.92) / CEDAR_TIERS;
  const skirts = Array.from({ length: CEDAR_TIERS }, (_, i) => {
    const t = i / (CEDAR_TIERS - 1);
    const ty = y - height * 0.14 - i * tierH * 0.86;
    const half = 17 * s * (1 - t * 0.85) * (0.9 + next() * 0.25);
    const lean = (next() - 0.5) * 2.5 * s;
    const top = ty - tierH * 1.5;
    return `M${r1(x + lean - half)} ${r1(ty)}Q${r1(x + lean - half * 0.35)} ${r1(ty - tierH * 0.8)} ${r1(x + lean)} ${r1(top)}Q${r1(x + lean + half * 0.35)} ${r1(ty - tierH * 0.8)} ${r1(x + lean + half)} ${r1(ty)}Q${r1(x + lean + half * 0.4)} ${r1(ty - tierH * 0.15)} ${r1(x + lean)} ${r1(ty + tierH * 0.12)}Q${r1(x + lean - half * 0.4)} ${r1(ty - tierH * 0.15)} ${r1(x + lean - half)} ${r1(ty)}Z`;
  });
  return (
    <g>
      <path
        className="bd-front-stroke"
        d={`M${x} ${y}L${x} ${r1(y - height * 0.5)}`}
        strokeWidth={r1(3.4 * s)}
        strokeLinecap="round"
      />
      <path className="bd-pine" d={skirts.join('')} />
      <path
        className="bd-rim"
        d={skirts.slice(-4).join('')}
        strokeWidth={r1(0.5 * s)}
        fill="none"
        opacity=".55"
      />
    </g>
  );
}

/** A clump of bamboo: jointed culms swaying from one root, with sprays of narrow leaves. */
export function Bamboo({ at: [x, y], scale: s = 1, seed }: TreeProps) {
  const next = scatter(seed);
  const culms = Array.from({ length: 5 }, (_, i) => {
    const base = x + (i - 2) * 5 * s + (next() - 0.5) * 4 * s;
    const top = y - (110 + next() * 40) * s;
    const bend = (next() - 0.4) * 22 * s;
    return { base, top, bend, joints: Math.round(5 + next() * 3) };
  });
  return (
    <g>
      {culms.map((c, i) => {
        const tip = c.base + c.bend;
        return (
          <g key={i}>
            <path
              className="bd-front-stroke"
              d={`M${r1(c.base)} ${y}Q${r1(c.base)} ${r1((y + c.top) / 2)} ${r1(tip)} ${r1(c.top)}`}
              strokeWidth={r1(2.2 * s)}
              fill="none"
            />
            {Array.from({ length: c.joints }, (_, j) => {
              const t = (j + 1) / (c.joints + 1);
              const jx = c.base + c.bend * t * t;
              const jy = y + (c.top - y) * t;
              return (
                <g key={j}>
                  <path
                    className="bd-rim"
                    d={`M${r1(jx - 1.6 * s)} ${r1(jy)}h${r1(3.2 * s)}`}
                    strokeWidth=".6"
                  />
                  {t > 0.45 && (
                    <path
                      className="bd-leaf"
                      d={`M${r1(jx)} ${r1(jy)}q${r1(9 * s)} ${r1(-2 * s)} ${r1(16 * s)} ${r1(4 * s)}q${r1(-9 * s)} ${r1(1 * s)} ${r1(-16 * s)} ${r1(-4 * s)}M${r1(jx)} ${r1(jy)}q${r1(-8 * s)} ${r1(-3 * s)} ${r1(-14 * s)} ${r1(2 * s)}q${r1(8 * s)} ${r1(1 * s)} ${r1(14 * s)} ${r1(-2 * s)}`}
                    />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

const MAPLE_REDS = ['#c2412b', '#d9622f', '#a8322a', '#e5843a'];

/** A momiji in autumn: a forked trunk under a wide crown of red and orange leaf clouds. */
export function Maple({ at: [x, y], scale: s = 1, seed }: TreeProps) {
  const next = scatter(seed);
  const crown = y - 44 * s;
  const clumps = Array.from({ length: 11 }, () => ({
    cx: r1(x + (next() - 0.5) * 52 * s),
    cy: r1(crown + (next() - 0.6) * 24 * s),
    r: r1((7 + next() * 7) * s),
    fill: MAPLE_REDS[Math.floor(next() * MAPLE_REDS.length)],
  }));
  return (
    <g>
      <path
        className="bd-front-stroke"
        d={`M${x} ${y}C${r1(x + 2 * s)} ${r1(y - 20 * s)} ${r1(x - 4 * s)} ${r1(y - 30 * s)} ${r1(x - 14 * s)} ${r1(crown)}M${r1(x + 1 * s)} ${r1(y - 22 * s)}C${r1(x + 8 * s)} ${r1(y - 32 * s)} ${r1(x + 14 * s)} ${r1(y - 36 * s)} ${r1(x + 16 * s)} ${r1(crown - 4 * s)}`}
        strokeWidth={r1(3 * s)}
        strokeLinecap="round"
        fill="none"
      />
      {clumps.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} opacity=".92" />
      ))}
      <rect
        className="bd-dusk"
        x={r1(x - 34 * s)}
        y={r1(crown - 26 * s)}
        width={r1(68 * s)}
        height={r1(44 * s)}
        rx={r1(20 * s)}
      />
    </g>
  );
}

/** A weeping willow: a leaning trunk, its long strands hanging almost to the ground. */
export function Willow({ at: [x, y], scale: s = 1, seed }: TreeProps) {
  const next = scatter(seed);
  const top: Point = [x + 6 * s, y - 64 * s];
  const strands = Array.from({ length: 16 }, () => {
    const sx = top[0] + (next() - 0.5) * 50 * s;
    const sy = top[1] + next() * 12 * s;
    const len = (40 + next() * 22) * s;
    const sway = (next() - 0.5) * 8 * s;
    return `M${r1(sx)} ${r1(sy)}q${r1(sway)} ${r1(len * 0.5)} ${r1(sway * 1.6)} ${r1(len)}`;
  });
  return (
    <g>
      <path
        className="bd-front-stroke"
        d={`M${x} ${y}C${r1(x - 2 * s)} ${r1(y - 30 * s)} ${r1(x + 8 * s)} ${r1(y - 44 * s)} ${r1(top[0])} ${r1(top[1])}`}
        strokeWidth={r1(3.4 * s)}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse
        className="bd-leaf"
        cx={r1(top[0])}
        cy={r1(top[1] + 4 * s)}
        rx={r1(28 * s)}
        ry={r1(9 * s)}
      />
      <path className="bd-leaf-stroke" d={strands.join('')} strokeWidth={r1(1.4 * s)} fill="none" />
    </g>
  );
}

/** A hinoki cypress: a dark narrow spire, for temple grounds and graveyards. */
export function Cypress({ at: [x, y], scale: s = 1, seed }: TreeProps) {
  const next = scatter(seed);
  const h = (58 + next() * 20) * s;
  const w = (9 + next() * 4) * s;
  return (
    <g>
      <path
        className="bd-pine"
        d={`M${x} ${r1(y - h)}C${r1(x + w * 0.9)} ${r1(y - h * 0.7)} ${r1(x + w)} ${r1(y - h * 0.25)} ${r1(x + w * 0.4)} ${y}H${r1(x - w * 0.4)}C${r1(x - w)} ${r1(y - h * 0.25)} ${r1(x - w * 0.9)} ${r1(y - h * 0.7)} ${x} ${r1(y - h)}Z`}
      />
      <path
        className="bd-rim"
        d={`M${x} ${r1(y - h)}C${r1(x + w * 0.9)} ${r1(y - h * 0.7)} ${r1(x + w)} ${r1(y - h * 0.4)} ${r1(x + w * 0.8)} ${r1(y - h * 0.3)}`}
        strokeWidth=".7"
        fill="none"
      />
    </g>
  );
}

/** A dead tree: a bare trunk forking into crooked branches. */
export function Snag({ at: [x, y], scale: s = 1, seed }: TreeProps) {
  const next = scatter(seed);
  const top = y - (46 + next() * 16) * s;
  const branches = Array.from({ length: 5 }, (_, i) => {
    const t = 0.4 + i * 0.13;
    const by = y + (top - y) * t;
    const dir = i % 2 === 0 ? -1 : 1;
    const len = (10 + next() * 12) * s * (1 - t * 0.4);
    return `M${x} ${r1(by)}q${r1(dir * len * 0.6)} ${r1(-len * 0.2)} ${r1(dir * len)} ${r1(-len * 0.7)}`;
  });
  return (
    <path
      className="bd-front-stroke"
      d={`M${x} ${y}L${r1(x + 2 * s)} ${r1(top)}${branches.join('')}`}
      strokeWidth={r1(2.4 * s)}
      strokeLinecap="round"
      fill="none"
    />
  );
}
