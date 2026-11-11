import type { BrowShape, Expression, EyeShape } from '@/game';

import { Brush } from './Brush';
import type { Point } from './brush';
import { INK, WHITE } from './ink';

/**
 * Eyes and brows. An eye is drawn in its own space with its outer corner to +x, then set on
 * the face facing either way: the near eye full size, the far one narrowed by the turn.
 */

interface Lids {
  /** The upper lid's height above the eye's centre line, and the lower lid's depth below it. */
  readonly top: number;
  readonly bottom: number;
  /** How far the outer corner drops (or, negative, lifts). */
  readonly tilt: number;
}

const LIDS: Readonly<Record<EyeShape, Lids>> = {
  almond: { top: -10, bottom: 11, tilt: 0 },
  round: { top: -12, bottom: 13, tilt: 0 },
  narrow: { top: -6, bottom: 7, tilt: -1 },
  upturned: { top: -9, bottom: 9, tilt: -4 },
  downturned: { top: -9, bottom: 10, tilt: 4 },
  hooded: { top: -6, bottom: 10, tilt: 1 },
};

/** How far an expression narrows the eyes. */
const SQUINT: Readonly<Record<Expression, number>> = {
  calm: 0,
  smile: 2,
  grin: 3,
  smirk: 1,
  stern: 2,
  worried: 0,
};

export interface EyeProps {
  readonly uid: string;
  readonly at: Point;
  /** +1 for the near eye, -1 for the far one. */
  readonly dir: 1 | -1;
  readonly scale: number;
  readonly look: {
    readonly shape: EyeShape;
    readonly expression: Expression;
    readonly iris: string;
    readonly lashes: boolean;
  };
}

/** The smallest an iris may shrink as the lids close on it. */
const IRIS_MAX = 11.5;

export function Eye({ uid, at, dir, scale, look }: EyeProps) {
  const lids = LIDS[look.shape];
  const squint = SQUINT[look.expression];
  const top = lids.top + squint * 0.5;
  const bottom = lids.bottom - squint;
  const { tilt } = lids;
  const p = (x: number, y: number): Point => [at[0] + dir * x * scale, at[1] + y * scale];
  const xy = (x: number, y: number): string =>
    p(x, y)
      .map((n) => n.toFixed(1))
      .join(' ');
  const shape =
    `M${xy(-22, 3 - tilt)}C${xy(-12, top - 2)} ${xy(8, top - 3)} ${xy(24, tilt - 2)}` +
    `C${xy(14, bottom)} ${xy(-10, bottom + 1)} ${xy(-22, 3 - tilt)}Z`;
  const mid = (top + bottom) / 2;
  const iris = Math.min(IRIS_MAX, (bottom - top) * 0.62) * scale;
  const [ix, iy] = p(-1.5, mid - 0.5);
  const clip = `${uid}-${dir > 0 ? 'near' : 'far'}`;
  return (
    <g>
      <clipPath id={clip}>
        <path d={shape} />
      </clipPath>
      <path d={shape} fill={WHITE} />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx={ix} cy={iy} rx={iris * 0.92} ry={iris * 1.08} fill={look.iris} />
        <ellipse
          cx={ix}
          cy={iy - 3 * scale}
          rx={iris * 0.92}
          ry={iris * 0.7}
          fill={INK}
          opacity=".5"
        />
        <circle cx={ix} cy={iy} r={iris * 0.42} fill={INK} />
        <path
          d={`M${xy(-24, top - 6)}L${xy(26, top - 6)}L${xy(26, top + 3.5)}C${xy(8, top + 1)} ${xy(-12, top + 2)} ${xy(-24, top + 6)}Z`}
          fill={INK}
          opacity=".2"
        />
        <circle cx={ix - 3.2 * scale} cy={iy - 3.5 * scale} r={2.6 * scale} fill="#fffaf0" />
      </g>
      {/* The upper lid is the heaviest line on a face, pressed harder toward the outer corner. */}
      <Brush
        pts={[
          p(-23, 4 - tilt),
          p(-13, top),
          p(4, top - 2.5),
          p(17, top + 1.5 + tilt * 0.4),
          p(26, tilt - 1),
        ]}
        w={(look.shape === 'hooded' ? 7.4 : 6.2) * scale}
        land={0.35}
        lift={0.1}
      />
      {look.lashes && (
        <Brush
          pts={[p(22, tilt - 2), p(28, tilt - 6), p(33, tilt - 11)]}
          w={3.2 * scale}
          land={0.05}
          lift={0.8}
        />
      )}
      <Brush
        pts={[p(21, 1 + tilt), p(12, bottom - 1), p(-4, bottom + 0.5)]}
        w={2.2 * scale}
        land={0.1}
        lift={0.75}
      />
      <Brush
        pts={[p(-15, top - 6), p(2, top - 9.5), p(19, top - 5)]}
        w={1.7 * scale}
        opacity={0.6}
        land={0.4}
        lift={0.4}
      />
    </g>
  );
}

interface BrowLine {
  readonly arch: number;
  readonly w: number;
  /** How far the outer end drops (or, negative, lifts). */
  readonly tail: number;
}

const BROWS: Readonly<Record<BrowShape, BrowLine>> = {
  straight: { arch: 2, w: 6, tail: 0 },
  arched: { arch: 8, w: 5, tail: 2 },
  thick: { arch: 4, w: 9, tail: 0 },
  angled: { arch: 6, w: 6, tail: -3 },
  thin: { arch: 5, w: 3.6, tail: 1 },
  bushy: { arch: 4, w: 11, tail: 0 },
};

/** How an expression sets the brows: the inner end's drop, and the whole brow's. */
const BROW_MOOD: Readonly<Record<Expression, { readonly inner: number; readonly drop: number }>> = {
  calm: { inner: 0, drop: 0 },
  smile: { inner: -2, drop: -1 },
  grin: { inner: -3, drop: -2 },
  smirk: { inner: 2, drop: 0 },
  stern: { inner: 6, drop: 3 },
  worried: { inner: -6, drop: -1 },
};

export interface BrowProps {
  readonly at: Point;
  readonly dir: 1 | -1;
  readonly scale: number;
  readonly shape: BrowShape;
  readonly expression: Expression;
  readonly colour: string;
}

export function Brow({ at, dir, scale, shape, expression, colour }: BrowProps) {
  const line = BROWS[shape];
  const mood = BROW_MOOD[expression];
  const p = (x: number, y: number): Point => [
    at[0] + dir * x * scale,
    at[1] + (y + mood.drop) * scale,
  ];
  return (
    <Brush
      pts={[
        p(-24, mood.inner),
        p(-8, -line.arch * 0.6 + mood.inner * 0.4),
        p(10, -line.arch),
        p(28, -line.arch * 0.2 + line.tail),
      ]}
      w={line.w * scale}
      colour={colour}
      land={0.12}
      lift={0.55}
    />
  );
}
