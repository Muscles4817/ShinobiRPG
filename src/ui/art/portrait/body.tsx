import type { Figure, HeadbandPlace } from '@/game';

import type { FaceLayout } from './geometry';
import { CX, r1 } from './geometry';
import { INK } from './ink';

/**
 * The neck and shoulders under a face, by figure: a slight one narrow and sloping, a broad one
 * square with a thick neck. The village plate is worn at the throat, on the arm or the belt.
 */

interface FigureSpec {
  readonly neck: number;
  readonly shoulders: number;
  /** How far the shoulders fall from the neck. */
  readonly slope: number;
}

const FIGURE_SPECS: Readonly<Record<Figure, FigureSpec>> = {
  slight: { neck: 11, shoulders: 40, slope: 14 },
  average: { neck: 15, shoulders: 47, slope: 10 },
  broad: { neck: 21, shoulders: 54, slope: 6 },
};

/** A neck this wide shows its cords. */
const CORDED_NECK = 18;

const PLATE = '#c9ccd6';
const CLOTH = '#2b3a66';

export interface BodyProps {
  readonly uid: string;
  readonly figure: Figure;
  readonly layout: FaceLayout;
  readonly colours: { readonly skin: string; readonly shade: string; readonly outfit: string };
  readonly headband: HeadbandPlace;
  /** False for an avatar, cropped at the chin: only the neck shows. */
  readonly shoulders: boolean;
}

function Plate({
  headband,
  n,
  s,
}: {
  readonly headband: HeadbandPlace;
  readonly n: number;
  readonly s: number;
}) {
  switch (headband) {
    case 'forehead':
      return null;
    case 'neck':
      return (
        <>
          <rect
            x={CX - n - 0.5}
            y="92"
            width={2 * n + 1}
            height="5"
            fill={CLOTH}
            stroke={INK}
            strokeWidth="1"
          />
          <rect
            x={CX - 4.5}
            y="91.6"
            width="9"
            height="5.8"
            rx="1"
            fill={PLATE}
            stroke={INK}
            strokeWidth="1"
          />
        </>
      );
    case 'arm':
      return (
        <rect
          x={CX - s + 2}
          y="124"
          width="12"
          height="6"
          rx="1.4"
          fill={PLATE}
          stroke={INK}
          strokeWidth="1"
          transform={`rotate(-28 ${CX - s + 8} 127)`}
        />
      );
    case 'belt':
      return (
        <rect
          x={CX - 9}
          y="143"
          width="18"
          height="6"
          rx="1.4"
          fill={PLATE}
          stroke={INK}
          strokeWidth="1"
        />
      );
  }
}

export function Body({ uid, figure, layout: g, colours, headband, shoulders: bust }: BodyProps) {
  const f = FIGURE_SPECS[figure];
  const n = f.neck / 2;
  const s = f.shoulders;
  const base = r1(101 - f.slope * 0.2);
  const shoulders = `M${CX - s - 4} 151C${CX - s - 2} ${118 + f.slope} ${CX - s + 12} ${r1(100 + f.slope * 0.6)} ${CX - n - 1} 101L${CX} 110L${CX + n + 1} 101C${CX + s - 12} ${r1(100 + f.slope * 0.6)} ${CX + s + 2} ${118 + f.slope} ${CX + s + 4} 151Z`;
  return (
    <>
      <path
        d={`M${CX - n} ${g.jawY - 4}V${base}Q${CX} 106 ${CX + n} ${base}V${g.jawY - 4}Z`}
        fill={colours.skin}
        stroke={INK}
        strokeWidth="1.1"
      />
      <path
        d={`M${CX - n} ${g.jawY}Q${CX} ${g.chinY + 9} ${CX + n} ${g.jawY}V${g.chinY + 6}Q${CX} ${g.chinY + 12} ${CX - n} ${g.chinY + 6}Z`}
        fill={colours.shade}
        opacity=".8"
      />
      {f.neck > CORDED_NECK && (
        <path
          d={`M${CX - n + 2} ${g.chinY + 6}L${CX - 3} 100M${CX + n - 2} ${g.chinY + 6}L${CX + 3} 100`}
          stroke={colours.shade}
          strokeWidth=".9"
          fill="none"
        />
      )}
      {bust && (
        <>
          <path d={shoulders} fill={colours.outfit} stroke={INK} strokeWidth="1.1" />
          <path d={`M${CX} 110V151`} stroke={INK} strokeWidth=".8" opacity=".5" />
          <path
            d={`M${CX - n - 1} 101L${CX} 113L${CX + n + 1} 101`}
            fill="none"
            stroke="#efe3c8"
            strokeWidth="2.6"
          />
          <g clipPath={`url(#${uid}-far)`}>
            <path d={shoulders} fill="#000" opacity=".28" />
          </g>
          <Plate headband={headband} n={n} s={s} />
        </>
      )}
    </>
  );
}

/** The plate tied across the brow, over the fringe. */
export function Headband({ layout: g }: { readonly layout: FaceLayout }) {
  return (
    <>
      <path
        d={`M${r1(CX - g.tw - 1)} 46Q60 40 ${r1(CX + g.tw + 1)} 46L${r1(CX + g.tw + 1)} 52.5Q60 46.5 ${r1(CX - g.tw - 1)} 52.5Z`}
        fill={CLOTH}
        stroke={INK}
        strokeWidth="1.1"
      />
      <rect
        x="49"
        y="41.8"
        width="22"
        height="9.8"
        rx="1.6"
        fill={PLATE}
        stroke={INK}
        strokeWidth="1.1"
      />
      <g stroke="#4a5060" strokeWidth=".9" fill="none">
        <ellipse cx="60" cy="46.7" rx="2.6" ry="3.1" />
        <path d="M57.4 46.7H62.6" />
      </g>
    </>
  );
}
