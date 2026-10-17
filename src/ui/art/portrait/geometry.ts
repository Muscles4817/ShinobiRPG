import type { FaceShape } from '@/game';

/**
 * Where a face's lines go. A shape is its widths at the temples, cheekbones and jaw corners,
 * how low the jaw and chin sit, and how sharply the jaw turns; eyes, nose and mouth move
 * down a long face. The portrait is drawn in a 120×150 box centred on x = 60.
 */

export const CX = 60;

export interface FaceGeometry {
  /** Half-widths at the temples, cheekbones and jaw corners, and of the chin. */
  readonly tw: number;
  readonly cw: number;
  readonly jw: number;
  readonly chinW: number;
  readonly jawY: number;
  readonly chinY: number;
  /** How far the chin rounds below its corners. */
  readonly chinR: number;
  /** 0 a sharp jaw corner, 1 a soft one. */
  readonly corner: number;
}

export const FACE_GEOMETRY: Readonly<Record<FaceShape, FaceGeometry>> = {
  oval: { tw: 18, cw: 20, jw: 15, jawY: 78, chinW: 5, chinY: 89, chinR: 2, corner: 0.5 },
  round: { tw: 20.5, cw: 24, jw: 21.5, jawY: 75, chinW: 10.5, chinY: 85, chinR: 3.6, corner: 0.8 },
  square: { tw: 19.5, cw: 21, jw: 20.5, jawY: 83, chinW: 10, chinY: 89, chinR: 1, corner: 0.1 },
  long: { tw: 16, cw: 17.5, jw: 14.5, jawY: 87, chinW: 6.5, chinY: 98, chinR: 2, corner: 0.45 },
  heart: { tw: 20.5, cw: 21, jw: 12, jawY: 79, chinW: 3, chinY: 90, chinR: 1.2, corner: 0.6 },
  angular: { tw: 15.5, cw: 21.5, jw: 13, jawY: 80, chinW: 4.5, chinY: 92, chinR: 0.6, corner: 0.2 },
};

/** Where the features sit on a face of this shape. */
export interface FaceLayout extends FaceGeometry {
  readonly eyeY: number;
  readonly noseY: number;
  readonly mouthY: number;
}

export function layoutOf(shape: FaceShape): FaceLayout {
  const g = FACE_GEOMETRY[shape];
  const longness = (g.chinY - 89) * 0.35;
  return {
    ...g,
    eyeY: r1(62 + longness * 0.4),
    noseY: r1(72 + longness * 0.9),
    mouthY: r1(80 + longness * 1.3),
  };
}

export const r1 = (n: number): number => Math.round(n * 10) / 10;

type Point = readonly [number, number];

/** One side's three curves from temple to chin; `s` is -1 for the left side, +1 the right. */
function sideCurves(g: FaceGeometry, s: number): readonly (readonly [Point, Point, Point])[] {
  const x = (d: number) => r1(CX + s * d);
  const bend = 6 + g.corner * 6;
  const jawTurn = g.jw - (g.jw - g.chinW) * (0.25 + g.corner * 0.3);
  return [
    [
      [x(g.tw), 48],
      [x(g.cw), 51],
      [x(g.cw), 60],
    ],
    [
      [x(g.cw), r1(66 + g.corner * 2)],
      [x(g.jw + (g.cw - g.jw) * g.corner), r1(g.jawY - bend)],
      [x(g.jw), g.jawY],
    ],
    [
      [x(jawTurn), r1(g.jawY + (g.chinY - g.jawY) * (0.5 - g.corner * 0.2))],
      [x(g.chinW + 2), g.chinY],
      [x(g.chinW), g.chinY],
    ],
  ];
}

const cubic = ([a, b, c]: readonly [Point, Point, Point]) =>
  `C${a[0]} ${a[1]} ${b[0]} ${b[1]} ${c[0]} ${c[1]}`;

/** The face's outline: down the left side, round the chin, up the right, over the brow. */
export function facePath(g: FaceGeometry): string {
  const left = sideCurves(g, -1);
  const right = sideCurves(g, 1);
  const starts: readonly Point[] = [[r1(CX + g.tw), 42], ...right.slice(0, 2).map((c) => c[2])];
  // The right side is walked chin to temple: each curve reversed onto the point it began at.
  const up = [2, 1, 0]
    .map((i) => {
      const [a, b] = right[i] ?? [];
      const from = starts[i];
      return a && b && from ? cubic([b, a, from]) : '';
    })
    .join('');
  const top = `C${r1(CX + g.tw)} 30 ${CX + 8} 26 ${CX} 26C${CX - 8} 26 ${r1(CX - g.tw)} 30 ${r1(CX - g.tw)} 42`;
  return `M${r1(CX - g.tw)} 42${left.map(cubic).join('')}Q${CX} ${r1(g.chinY + g.chinR)} ${r1(CX + g.chinW)} ${g.chinY}${up}${top}Z`;
}
