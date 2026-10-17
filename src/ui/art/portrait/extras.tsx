import type { Age, FacialHair, Mark } from '@/game';

import type { FaceLayout } from './geometry';
import { CX, r1 } from './geometry';
import { INK } from './ink';

/** What years, a razor and a life leave on a face: lines, facial hair, freckles and scars. */

export function AgeLines({
  age,
  layout: g,
  shade,
}: {
  readonly age: Age;
  readonly layout: FaceLayout;
  readonly shade: string;
}) {
  if (age === 'young') return null;
  const smile = `M53.6 ${r1(g.noseY + 1)}Q51.6 ${r1(g.noseY + 5)} 53.4 ${r1(g.mouthY + 2)}M66.4 ${r1(g.noseY + 1)}Q68.4 ${r1(g.noseY + 5)} 66.6 ${r1(g.mouthY + 2)}`;
  const crows = `M42.6 ${r1(g.eyeY - 1)}l-2 -1.2M42.6 ${r1(g.eyeY + 1)}l-2.2 .4M77.4 ${r1(g.eyeY - 1)}l2 -1.2M77.4 ${r1(g.eyeY + 1)}l2.2 .4`;
  const bags = `M47 ${r1(g.eyeY + 4.4)}Q51 ${r1(g.eyeY + 6.2)} 55 ${r1(g.eyeY + 4.2)}M65 ${r1(g.eyeY + 4.2)}Q69 ${r1(g.eyeY + 6.2)} 73 ${r1(g.eyeY + 4.4)}`;
  return (
    <path
      d={age === 'old' ? `${smile}${crows}${bags}` : smile}
      stroke={shade}
      strokeWidth=".8"
      fill="none"
      strokeLinecap="round"
      opacity=".9"
    />
  );
}

function Moustache({ g, colour }: { readonly g: FaceLayout; readonly colour: string }) {
  const m = g.mouthY;
  return (
    <path
      d={`M54 ${r1(m + 0.6)}Q56 ${r1(m - 3.6)} 60 ${r1(m - 2.2)}Q64 ${r1(m - 3.6)} 66 ${r1(m + 0.6)}Q63 ${r1(m - 1.2)} 60 ${r1(m - 0.8)}Q57 ${r1(m - 1.2)} 54 ${r1(m + 0.6)}Z`}
      fill={colour}
      stroke={INK}
      strokeWidth=".7"
    />
  );
}

export interface FacialHairProps {
  readonly kind: FacialHair;
  readonly layout: FaceLayout;
  readonly colour: string;
}

/** Stubble shades the jaw; a goatee and a beard come with a moustache. */
export function Beard({ kind, layout: g, colour }: FacialHairProps) {
  const m = g.mouthY;
  switch (kind) {
    case 'none':
      return null;
    case 'stubble':
      return (
        <path
          d={`M${CX - g.jw} ${g.jawY - 6}C${CX - g.jw + 2} ${g.chinY - 2} ${CX - 6} ${g.chinY + 1} ${CX} ${g.chinY + 1}C${CX + 6} ${g.chinY + 1} ${CX + g.jw - 2} ${g.chinY - 2} ${CX + g.jw} ${g.jawY - 6}L${CX + 6} ${r1(m - 2)}Q${CX} ${r1(m - 4)} ${CX - 6} ${r1(m - 2)}Z`}
          fill={colour}
          opacity=".22"
        />
      );
    case 'moustache':
      return <Moustache g={g} colour={colour} />;
    case 'goatee':
      return (
        <>
          <path
            d={`M56.6 ${r1(m + 3.4)}Q60 ${r1(m + 2.4)} 63.4 ${r1(m + 3.4)}L62 ${g.chinY + 3}Q60 ${g.chinY + 5} 58 ${g.chinY + 3}Z`}
            fill={colour}
            stroke={INK}
            strokeWidth=".7"
          />
          <Moustache g={g} colour={colour} />
        </>
      );
    case 'beard':
      return (
        <>
          <path
            d={`M${CX - g.cw + 1} 64C${CX - g.cw} ${g.jawY + 4} ${CX - 8} ${g.chinY + 9} ${CX} ${g.chinY + 9}C${CX + 8} ${g.chinY + 9} ${CX + g.cw} ${g.jawY + 4} ${CX + g.cw - 1} 64L${CX + g.cw - 4} 68Q${CX + 8} ${r1(m - 1)} ${CX} ${r1(m + 3.6)}Q${CX - 8} ${r1(m - 1)} ${CX - g.cw + 4} 68Z`}
            fill={colour}
            stroke={INK}
            strokeWidth=".9"
          />
          <Moustache g={g} colour={colour} />
        </>
      );
  }
}

const FRECKLES: readonly (readonly [number, number])[] = [
  [48, 70],
  [50, 72],
  [46, 72.5],
  [52, 70.6],
  [70, 70],
  [72, 72],
  [74, 72.5],
  [68, 70.6],
];

/** Marks on the skin; earrings are drawn with the ears. */
export function SkinMark({
  mark,
  layout: g,
  shade,
}: {
  readonly mark: Mark;
  readonly layout: FaceLayout;
  readonly shade: string;
}) {
  const drop = g.eyeY - 62;
  switch (mark) {
    case 'none':
    case 'earrings':
      return null;
    case 'freckles':
      return (
        <g fill={shade}>
          {FRECKLES.map(([x, y]) => (
            <circle key={x} cx={x} cy={r1(y + drop * 1.5)} r=".55" />
          ))}
        </g>
      );
    case 'mole':
      return <circle cx="66" cy={r1(g.mouthY - 1)} r=".8" fill="#4a2a1a" />;
    case 'scar':
      return (
        <path
          d={`M70 ${r1(g.eyeY - 7)}L75 ${r1(g.eyeY + 8)}`}
          stroke="#9a5a44"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      );
  }
}
