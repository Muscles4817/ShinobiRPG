import type { Point } from './kit';
import { r1 } from './kit';
import { paint } from './lights';

/**
 * What lives and moves at the desert's edge: date palms, the sand priests' barges with their
 * battened sails, camels, a well sweep (a long pole that lifts the bucket) and a collared hound
 * of the Breaking Pens. Drawn in their own colours, the hound in the front ink.
 */

const TRUNK = '#6a4426';
const FROND = '#5a6a32';
const FROND_LIT = '#7f8c44';
const HULL = '#5a3420';
const HULL_LIT = '#8a5a34';
const SAIL = '#efe0c0';
const SAIL_SHADE = '#cdb48a';
const ROPE = '#3a2416';
const CAMEL = '#7a5434';

/** A date palm: a leaning, ringed trunk and a crown of drooping fronds. */
export function Palm({
  at: [x, base],
  h,
  lean,
}: {
  readonly at: Point;
  readonly h: number;
  readonly lean: number;
}) {
  const tx = x + lean;
  const ty = base - h;
  const fronds = [-150, -120, -80, -40, -10, 20].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const len = h * 0.42;
    const ex = r1(tx + Math.cos(rad) * len);
    const ey = r1(ty - Math.sin(rad) * len * 0.5 + len * 0.35);
    const mx = r1(tx + Math.cos(rad) * len * 0.5);
    const my = r1(ty - h * 0.12);
    return { deg, d: `M${r1(tx)} ${r1(ty)}Q${mx} ${my} ${ex} ${ey}` };
  });
  return (
    <g>
      <path
        d={`M${x - 2} ${base}Q${r1(x + lean * 0.2)} ${r1(base - h * 0.6)} ${r1(tx - 1)} ${r1(ty)}h3Q${r1(x + lean * 0.25 + 3)} ${r1(base - h * 0.6)} ${x + 3} ${base}z`}
        fill={TRUNK}
      />
      <g fill="none" strokeLinecap="round">
        {fronds.map((f) => (
          <path key={f.deg} d={f.d} stroke={f.deg < -60 ? FROND_LIT : FROND} strokeWidth="3.4" />
        ))}
      </g>
      <circle cx={r1(tx)} cy={r1(ty + 3)} r="2.6" fill="#8a3a1a" />
    </g>
  );
}

export interface BargeSpec {
  readonly at: Point;
  /** Length of the hull. */
  readonly len: number;
  /** Which way the prow points: 1 right, -1 left. */
  readonly facing: 1 | -1;
  /** A priest at the helm, with a lamp lit at night. */
  readonly crewed?: boolean;
}

/** A sand barge: a long hull on runners, a mast with a battened sail, a lamp at the stern. */
export function SandBarge({ uid, barge }: { readonly uid: string; readonly barge: BargeSpec }) {
  const {
    at: [x, y],
    len,
    facing,
    crewed = false,
  } = barge;
  const s = facing;
  const prow = x + (s * len) / 2;
  const stern = x - (s * len) / 2;
  const mast = x + s * len * 0.06;
  const sailTop = y - len * 0.7;
  const sailW = len * 0.42;
  const sailX = s === 1 ? mast - sailW * 0.15 : mast - sailW * 0.85;
  const battens = [0.2, 0.4, 0.6, 0.8].map((t) => r1(sailTop + (y - 8 - sailTop) * t));
  return (
    <g>
      <path
        d={`M${r1(stern)} ${y + 4}L${r1(prow + s * 6)} ${y + 2}`}
        stroke={ROPE}
        strokeWidth="2"
      />
      <path
        d={`M${r1(stern)} ${y - 8}L${r1(prow + s * 4)} ${y - 12}Q${r1(prow - s * 2)} ${y} ${r1(prow - s * 14)} ${y + 2}H${r1(stern + s * 6)}Q${r1(stern - s * 2)} ${y} ${r1(stern)} ${y - 8}z`}
        fill={HULL}
      />
      <path
        d={`M${r1(stern + s * 4)} ${y - 6}H${r1(prow - s * 6)}`}
        stroke={HULL_LIT}
        strokeWidth="1.5"
      />
      <path d={`M${r1(mast)} ${y - 6}V${r1(sailTop - 6)}`} stroke={ROPE} strokeWidth="2" />
      <rect
        x={r1(sailX)}
        y={r1(sailTop)}
        width={r1(sailW)}
        height={r1(y - 10 - sailTop)}
        fill={SAIL}
      />
      <rect
        x={r1(sailX + sailW * 0.6)}
        y={r1(sailTop)}
        width={r1(sailW * 0.4)}
        height={r1(y - 10 - sailTop)}
        fill={SAIL_SHADE}
        opacity=".7"
      />
      <path
        d={battens.map((by) => `M${r1(sailX - 1)} ${by}h${r1(sailW + 2)}`).join('')}
        stroke={ROPE}
        strokeWidth="1"
      />
      <path
        d={`M${r1(mast)} ${r1(sailTop - 6)}L${r1(prow + s * 4)} ${y - 12}`}
        stroke={ROPE}
        strokeWidth=".8"
      />
      {crewed && (
        <g>
          <path
            d={`M${r1(stern + s * 8)} ${y - 8}v-9a3 3 0 0 1 6 0v9z`}
            fill="#2a1810"
            transform={s === -1 ? `translate(-6 0)` : undefined}
          />
          <circle
            className="bd-lit"
            cx={r1(stern + s * 2)}
            cy={y - 20}
            r="16"
            fill={paint(uid, 'glow')}
          />
          <circle cx={r1(stern + s * 2)} cy={y - 20} r="2.6" fill={paint(uid, 'white')} />
        </g>
      )}
    </g>
  );
}

/** A camel standing side on, head up, in shadowed tan. */
export function Camel({
  at: [x, base],
  scale = 1,
  facing = 1,
}: {
  readonly at: Point;
  readonly scale?: number;
  readonly facing?: 1 | -1;
}) {
  return (
    <path
      fill={CAMEL}
      transform={`translate(${x} ${base}) scale(${r1(scale * facing)} ${r1(scale)})`}
      d="M-14 0v-14c-2-6 0-12 6-14 4-6 10-6 13 0 4-1 7 1 8 5l5-12c1-3 4-4 6-3l3 2-1 3-3-1-5 14c0 4-2 6-4 7v13h-2v-12h-12v12h-2v-13c-4 0-8-2-10-5v18z"
    />
  );
}

/** A well sweep: a post, a long beam with a stone at one end and a bucket on a rope at the other. */
export function WellSweep({ at: [x, base] }: { readonly at: Point }) {
  return (
    <g>
      <path d={`M${x - 10} ${base}h20v-6h-20z`} fill="#a8703f" />
      <path d={`M${x} ${base - 6}V${base - 34}`} stroke={ROPE} strokeWidth="2.5" />
      <path d={`M${x - 26} ${base - 24}L${x + 30} ${base - 44}`} stroke={ROPE} strokeWidth="2" />
      <circle cx={x - 26} cy={base - 22} r="4" fill="#6a5a4a" />
      <path d={`M${x + 30} ${base - 44}V${base - 16}`} stroke={ROPE} strokeWidth=".8" />
      <path d={`M${x + 27} ${base - 16}h6l-1 5h-4z`} fill={HULL} />
    </g>
  );
}

/** A lean hound of the Breaking Pens, sitting, with its collar on. */
export function CollaredHound({ at: [x, base] }: { readonly at: Point }) {
  return (
    <g transform={`translate(${x} ${base})`}>
      <path
        className="bd-front"
        d="M-8 0c0-6 1-11 4-14l1-8c0-3 2-5 5-5l3-5 1 4 2 1c2 0 3 2 3 3l-4 2-2 6c3 4 3 9 2 16h-3l-1-6-3 6z"
      />
      <path d="M1-22l5 1" stroke="#b8321c" strokeWidth="2" />
    </g>
  );
}
