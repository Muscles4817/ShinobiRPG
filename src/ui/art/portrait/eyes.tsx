import type { BrowShape, Expression, EyeShape } from '@/game';

import { INK, WHITE } from './ink';
import { r1 } from './geometry';

/**
 * Eyes and brows. One eye is drawn at the origin, its inner corner towards +x, and mirrored
 * for the other. An expression lifts or knits the brows and narrows the lower lid, so a smile
 * reaches the eyes.
 */

interface EyeSpec {
  /** Width, the depth of the upper and lower lid, and how far the outer corner lifts. */
  readonly w: number;
  readonly upper: number;
  readonly lower: number;
  readonly tilt: number;
  readonly iris: number;
  /** A fold drawn above the lid. */
  readonly crease: boolean;
  /** How far a heavy lid comes down over the eye, 0–1. */
  readonly hood?: number;
}

const EYES: Readonly<Record<EyeShape, EyeSpec>> = {
  almond: { w: 12.4, upper: 3.8, lower: 2.2, tilt: 0.8, iris: 3.3, crease: true },
  round: { w: 12, upper: 5.6, lower: 4.4, tilt: -0.2, iris: 4, crease: true },
  narrow: { w: 13, upper: 1.9, lower: 1, tilt: 0.4, iris: 2.8, crease: false },
  upturned: { w: 13, upper: 3.2, lower: 1.6, tilt: 4.2, iris: 3, crease: false },
  downturned: { w: 12, upper: 3.8, lower: 2.8, tilt: -3, iris: 3.3, crease: true },
  hooded: { w: 12.4, upper: 3.8, lower: 2.2, tilt: 0.2, iris: 3.2, crease: false, hood: 0.55 },
};

interface BrowSpec {
  readonly thickness: number;
  readonly arch: number;
  /** Positive drops the outer end. */
  readonly angle: number;
  readonly bushy?: boolean;
}

const BROWS: Readonly<Record<BrowShape, BrowSpec>> = {
  straight: { thickness: 1.6, arch: 0.8, angle: 0 },
  arched: { thickness: 1.4, arch: 3, angle: 0.5 },
  thick: { thickness: 2.8, arch: 1.2, angle: 0.2 },
  angled: { thickness: 1.8, arch: 1.4, angle: -2.2 },
  thin: { thickness: 0.9, arch: 2.2, angle: 0.6 },
  bushy: { thickness: 3.2, arch: 1, angle: 0, bushy: true },
};

/** What an expression does to the eyes: brow ends up (negative) or down, and the squint. */
export interface EyeMood {
  readonly browInner: number;
  readonly browOuter: number;
  readonly squint: number;
}

export const EYE_MOODS: Readonly<Record<Expression, EyeMood>> = {
  calm: { browInner: 0, browOuter: 0, squint: 0 },
  smile: { browInner: -0.6, browOuter: 0, squint: 1.4 },
  grin: { browInner: -1, browOuter: -0.4, squint: 2 },
  smirk: { browInner: 0.4, browOuter: -1.2, squint: 0.5 },
  stern: { browInner: 1.8, browOuter: -0.2, squint: 0.4 },
  worried: { browInner: -2.2, browOuter: 1, squint: 0 },
};

/** A squint this deep lifts the lower lid into a visible line. */
const HAPPY_SQUINT = 1;

export interface EyeProps {
  readonly uid: string;
  readonly shape: EyeShape;
  readonly brows: BrowShape;
  readonly mood: EyeMood;
  readonly colours: { readonly iris: string; readonly skin: string; readonly brow: string };
}

function Brow({
  e,
  brow,
  mood,
  colour,
}: {
  readonly e: EyeSpec;
  readonly brow: BrowSpec;
  readonly mood: EyeMood;
  readonly colour: string;
}) {
  const inner = [e.w / 2 + 1.2, -e.upper - 4.2 + mood.browInner] as const;
  const outer = [-e.w / 2 - 1.4, -e.tilt - e.upper - 2.8 + brow.angle + mood.browOuter] as const;
  const mid = [(inner[0] + outer[0]) / 2 - 1, Math.min(inner[1], outer[1]) - brow.arch] as const;
  return (
    <>
      <path
        d={`M${r1(inner[0])} ${r1(inner[1])}Q${r1(mid[0])} ${r1(mid[1])} ${r1(outer[0])} ${r1(outer[1])}`}
        stroke={colour}
        strokeWidth={brow.thickness}
        fill="none"
        strokeLinecap="round"
      />
      {brow.bushy && (
        <path
          d={`M${r1(inner[0])} ${r1(inner[1] - 1)}l-2 -1.4M${r1(mid[0] + 1)} ${r1(mid[1] + 0.2)}l-2 -1.2M${r1(outer[0] + 2)} ${r1(outer[1] - 0.8)}l-1.6 -0.8`}
          stroke={colour}
          strokeWidth="1"
          strokeLinecap="round"
        />
      )}
    </>
  );
}

/** One eye and its brow; `side` picks the clip id so the mirrored copy has its own. */
export function Eye({
  uid,
  shape,
  brows,
  mood,
  colours,
  side,
}: EyeProps & { readonly side: 'l' | 'r' }) {
  const e = EYES[shape];
  const hw = e.w / 2;
  const lower = Math.max(0.6, e.lower - mood.squint);
  const upperLid = `M${hw} 0Q${r1(-hw * 0.1)} ${r1(-2 * e.upper)} ${-hw} ${r1(-e.tilt)}`;
  const lowerLid = `Q${r1(-hw * 0.05)} ${r1(2 * lower)} ${hw} 0`;
  const white = `${upperLid}${lowerLid}Z`;
  const irisY = r1(-e.tilt * 0.4 + 0.3);
  const clip = `${uid}-eye-${side}`;
  const hoodY = e.hood === undefined ? 0 : r1(-e.upper * (2 - e.hood * 2.2));
  return (
    <>
      <clipPath id={clip}>
        <path d={white} />
      </clipPath>
      <path d={white} fill={WHITE} />
      <g clipPath={`url(#${clip})`}>
        <circle cx="-0.6" cy={irisY} r={e.iris} fill={`url(#${uid}-iris)`} />
        <circle cx="-0.6" cy={irisY} r={r1(e.iris * 0.45)} fill={INK} />
        <path
          d={`M-9 -9H9V${r1(-e.upper * 0.6)}Q0 ${r1(-e.upper * 0.2)} -9 ${r1(-e.upper * 0.6)}Z`}
          fill={INK}
          opacity=".16"
        />
      </g>
      <circle
        cx={r1(-0.6 + e.iris * 0.35)}
        cy={r1(-e.tilt * 0.4 - e.iris * 0.35)}
        r={r1(e.iris * 0.28)}
        fill="#fff"
      />
      {e.hood === undefined ? (
        <path d={upperLid} stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <path
            d={`M${hw + 1} 1L${hw + 1} -9H${-hw - 1}V${r1(-e.tilt + 1)}Q0 ${hoodY} ${hw + 1} 1Z`}
            fill={colours.skin}
          />
          <path
            d={`M${hw} 0.2Q0 ${hoodY} ${-hw} ${r1(-e.tilt + 0.4)}`}
            stroke={INK}
            strokeWidth="1.9"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {e.crease && (
        <path
          d={`M${r1(hw * 0.5)} ${r1(-e.upper * 1.55)}Q${r1(-hw * 0.2)} ${r1(-e.upper * 2.05)} ${r1(-hw * 0.95)} ${r1(-e.tilt - e.upper * 0.9)}`}
          stroke={INK}
          strokeWidth=".6"
          fill="none"
          opacity=".55"
        />
      )}
      <path
        d={`M${-hw} ${r1(-e.tilt)}l-1.6 ${r1(-1 - e.tilt * 0.25)}`}
        stroke={INK}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {mood.squint > HAPPY_SQUINT && (
        <path
          d={`M${-hw} ${r1(-e.tilt)}${lowerLid}`}
          stroke={INK}
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />
      )}
      <Brow e={e} brow={BROWS[brows]} mood={mood} colour={colours.brow} />
    </>
  );
}
