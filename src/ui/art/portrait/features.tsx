import type { ReactNode } from 'react';

import type { EarShape, Expression, NoseShape } from '@/game';

import type { FaceLayout } from './geometry';
import { CX, r1 } from './geometry';
import { INK, WHITE } from './ink';

/**
 * Noses, ears and mouths. A nose is drawn from the bridge to the tip with a shadow on its far
 * side; ears sit on the cheekbone line, mirrored; a mouth is the resting expression's.
 */

type NoseDrawing = (y: number, shade: string) => ReactNode;

const line = { fill: 'none', strokeLinecap: 'round' } as const;

const NOSES: Readonly<Record<NoseShape, NoseDrawing>> = {
  button: (y, c) => (
    <>
      <path
        d={`M58.4 ${y - 0.6}Q60 ${y + 1} 61.6 ${y - 0.6}`}
        stroke={c}
        strokeWidth="1.3"
        {...line}
      />
      <circle cx="60.8" cy={r1(y - 1.6)} r=".6" fill="#fff" opacity=".6" />
    </>
  ),
  straight: (y, c) => (
    <>
      <path
        d={`M61 ${y - 9}L62.2 ${y - 1}Q61.4 ${y + 1} 59 ${y + 0.4}`}
        stroke={c}
        strokeWidth="1.3"
        {...line}
      />
      <path d={`M58 ${y}q.8 .8 1.6 .4`} stroke={c} strokeWidth=".8" fill="none" />
    </>
  ),
  hooked: (y, c) => (
    <>
      <path d={`M60.6 ${y - 10}Q64.6 ${y - 5} 63 ${y}L61.4 ${y - 6}Z`} fill={c} opacity=".35" />
      <path
        d={`M60.4 ${y - 10}Q64.4 ${y - 5} 62.8 ${y - 0.4}Q61.4 ${y + 1.6} 58.8 ${y + 0.4}`}
        stroke={c}
        strokeWidth="1.35"
        {...line}
      />
    </>
  ),
  broad: (y, c) => (
    <>
      <path
        d={`M62 ${y - 9}Q64 ${y - 3} 64.6 ${y - 1}Q62.6 ${y} 62 ${y - 9}Z`}
        fill={c}
        opacity=".35"
      />
      <path
        d={`M55.6 ${y - 1.4}Q56.4 ${y + 1.2} 58.6 ${y + 0.8}M61.4 ${y + 0.8}Q63.6 ${y + 1.2} 64.4 ${y - 1.4}`}
        stroke={c}
        strokeWidth="1.35"
        {...line}
      />
      <path
        d={`M58.4 ${y + 0.6}Q60 ${y + 2} 61.6 ${y + 0.6}`}
        stroke={c}
        strokeWidth=".9"
        fill="none"
      />
    </>
  ),
  long: (y, c) => (
    <>
      <path d={`M61 ${y - 11}Q62 ${y - 3} 62.6 ${y + 1.4}L61.2 ${y - 4}Z`} fill={c} opacity=".35" />
      <path
        d={`M60.8 ${y - 11}Q61.6 ${y - 3} 62.4 ${y + 1.4}Q61.2 ${y + 3} 59 ${y + 2.2}`}
        stroke={c}
        strokeWidth="1.3"
        {...line}
      />
    </>
  ),
  snub: (y, c) => (
    <>
      <path
        d={`M57.4 ${y - 0.6}Q60 ${y - 3.4} 62.6 ${y - 0.6}Q60 ${y + 1} 57.4 ${y - 0.6}Z`}
        fill={c}
        opacity=".35"
      />
      <circle cx="58.7" cy={r1(y - 0.2)} r=".8" fill={c} />
      <circle cx="61.3" cy={r1(y - 0.2)} r=".8" fill={c} />
    </>
  ),
};

export function Nose({
  shape,
  layout,
  shade,
}: {
  readonly shape: NoseShape;
  readonly layout: FaceLayout;
  readonly shade: string;
}) {
  return <>{NOSES[shape](layout.noseY, shade)}</>;
}

interface EarSpec {
  readonly top: number;
  readonly bottom: number;
  /** How far it stands from the head, and how low the lobe hangs. */
  readonly out: number;
  readonly lobe: number;
  readonly pointed?: boolean;
}

const EARS: Readonly<Record<EarShape, EarSpec>> = {
  small: { top: 58, bottom: 67, out: 4, lobe: 0 },
  large: { top: 55, bottom: 71, out: 6, lobe: 0 },
  protruding: { top: 57, bottom: 69, out: 8, lobe: 0 },
  lobed: { top: 57, bottom: 70, out: 4.6, lobe: 3 },
  pointed: { top: 52, bottom: 68, out: 5.6, lobe: 0, pointed: true },
};

export interface EarsProps {
  readonly shape: EarShape;
  readonly layout: FaceLayout;
  readonly skin: string;
  readonly shade: string;
  readonly earrings: boolean;
}

/** Both ears, the far one a mirror of the near. */
export function Ears({ shape, layout, skin, shade, earrings }: EarsProps) {
  const e = EARS[shape];
  const x = r1(CX - layout.cw + 0.8);
  const rise = e.pointed
    ? `L${r1(x - e.out - 1.4)} ${e.top}`
    : `C${r1(x - e.out * 0.6)} ${e.top - 1} ${r1(x - e.out)} ${e.top + 2} ${r1(x - e.out)} ${e.top + 5}`;
  const bottom = e.bottom + e.lobe;
  const outline = `M${x} ${e.top + 2}${rise}C${r1(x - e.out)} ${e.bottom - 3} ${r1(x - e.out * 0.6)} ${bottom} ${r1(x - 1)} ${bottom}Z`;
  const inner = `M${r1(x - 1)} ${e.top + 4}C${r1(x - e.out * 0.75)} ${e.top + 3} ${r1(x - e.out * 0.7)} ${e.bottom - 4} ${r1(x - 1.5)} ${e.bottom - 3}`;
  const one = (
    <>
      <path d={outline} fill={skin} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <path d={inner} stroke={shade} strokeWidth="1" fill="none" />
      {earrings && (
        <circle
          cx={r1(x - e.out * 0.45)}
          cy={r1(bottom + 1.4)}
          r="1.5"
          fill="none"
          stroke="#e0a83a"
          strokeWidth="1"
        />
      )}
    </>
  );
  return (
    <>
      {one}
      <g transform="matrix(-1 0 0 1 120 0)">{one}</g>
    </>
  );
}

const MOUTHS: Readonly<Record<Expression, (y: number) => string>> = {
  calm: (y) => `M56 ${y}Q60 ${y + 1} 64 ${y}`,
  smile: (y) => `M55 ${y - 1}Q60 ${y + 3.6} 65 ${y - 1}`,
  grin: (y) => `M54.5 ${y - 1.4}Q60 ${y + 5.8} 65.5 ${y - 1.4}Q60 ${y + 1} 54.5 ${y - 1.4}Z`,
  smirk: (y) => `M56 ${y + 0.6}Q60.5 ${y + 1.2} 64.6 ${y - 1.6}`,
  stern: (y) => `M56.4 ${y + 0.4}H63.6`,
  worried: (y) => `M56 ${y + 1.2}Q60 ${y - 0.8} 64 ${y + 1.2}`,
};

export interface MouthProps {
  readonly expression: Expression;
  readonly layout: FaceLayout;
  readonly shade: string;
}

const LIP = '#7a3a2a';

/** The mouth at rest, with what the expression adds: teeth, a dimple, set corners. */
export function Mouth({ expression, layout, shade }: MouthProps) {
  const y = layout.mouthY;
  const d = MOUTHS[expression](y);
  if (expression === 'grin') {
    return (
      <>
        <path d={d} fill={WHITE} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
        <path
          d={`M56 ${r1(y - 0.4)}Q60 ${r1(y + 1.4)} 64 ${r1(y - 0.4)}`}
          stroke={INK}
          strokeWidth=".5"
          fill="none"
          opacity=".4"
        />
      </>
    );
  }
  return (
    <>
      <path d={d} stroke={LIP} strokeWidth="1.3" {...line} />
      <path
        d={`M58 ${r1(y + 2.6)}Q60 ${r1(y + 3.2)} 62 ${r1(y + 2.6)}`}
        stroke={shade}
        strokeWidth=".8"
        fill="none"
        opacity=".7"
      />
      {expression === 'smirk' && (
        <path d={`M65.6 ${r1(y - 2.2)}q.6 1.2 0 2`} stroke={shade} strokeWidth=".8" fill="none" />
      )}
      {expression === 'stern' && (
        <path d={`M56 ${r1(y - 0.8)}v2M64 ${r1(y - 0.8)}v2`} stroke={shade} strokeWidth=".7" />
      )}
    </>
  );
}
