import type { ReactNode } from 'react';

import type { HairStyle } from '@/game';

import { Brush } from './Brush';
import { points, type Point } from './brush';
import { INK, lit } from './ink';

/**
 * Hair in three layers: what falls behind the head, the mass over the skull, and the locks cut
 * over the brow (which fall over a headband). Each style is shapes in the person's hair colour
 * held by an ink line, with light dragged through them.
 */

/** The mass of hair over the skull, from the far temple round the crown to behind the ear. */
const CAP =
  'M110 196C92 120 148 68 214 68C276 68 312 120 300 194C299 206 294 218 288 226C290 196 280 166 258 150C226 130 172 132 142 152C124 166 114 182 110 196Z';

const r1 = (n: number): number => Math.round(n * 10) / 10;

/** One lock hanging from the hairline between x0 and x1, its tip at (tx, ty). */
function lock(x0: number, x1: number, tx: number, ty: number): string {
  const base = 128;
  const mid = (x0 + x1) / 2;
  return (
    `M${x0} ${base}C${x0 - 2} ${r1(base + (ty - base) * 0.55)} ${r1(tx - (mid - x0) * 0.25)} ${ty - 16} ${tx} ${ty}` +
    `C${r1(tx + (x1 - mid) * 0.45)} ${ty - 22} ${x1 + 2} ${r1(base + (ty - base) * 0.5)} ${x1} ${base}Z`
  );
}

type Lock = readonly [number, number, number, number];

/** Locks are written flat, four numbers each: where it hangs from, and its tip. */
function locksOf(flat: readonly number[]): Lock[] {
  const out: Lock[] = [];
  for (let i = 0; i + 3 < flat.length; i += 4) {
    out.push([flat[i] ?? 0, flat[i + 1] ?? 0, flat[i + 2] ?? 0, flat[i + 3] ?? 0]);
  }
  return out;
}

interface Style {
  readonly back?: readonly string[];
  readonly cap: string;
  /** Close-cropped: the mass is a shadow of stubble with no ink line. */
  readonly faint?: boolean;
  readonly front?: readonly string[];
  readonly locks?: readonly Lock[];
  /** Where the light lies: lines of sheen and their widths. */
  readonly sheen: readonly (readonly [readonly Point[], number])[];
}

const TOP_SHEEN: Style['sheen'] = [[points([150, 106, 192, 90, 240, 92, 274, 110]), 7]];

const STYLES: Readonly<Record<HairStyle, Style>> = {
  spiky: {
    cap: 'M108 200L78 164L104 162L74 112L118 126L104 62L150 100L160 36L196 86L226 26L244 86L296 48L286 106L340 100L306 152L340 196L296 204C292 184 282 164 258 150C226 130 172 132 142 152C124 166 114 184 108 200Z',
    locks: locksOf([
      114, 150, 120, 216, 140, 182, 158, 208, 176, 216, 190, 196, 208, 250, 240, 204, 244, 284, 280,
      212,
    ]),
    sheen: [
      [points([150, 104, 176, 84, 208, 96]), 6],
      [points([226, 92, 252, 80, 280, 100]), 5],
    ],
  },
  short: {
    cap: CAP,
    locks: locksOf([
      116, 150, 126, 196, 140, 178, 152, 200, 170, 210, 184, 192, 200, 240, 228, 190, 232, 270, 264,
      188, 258, 292, 288, 210,
    ]),
    sheen: TOP_SHEEN,
  },
  long: {
    back: [
      'M296 160C318 220 314 300 322 380C326 420 336 452 346 480L236 480C252 420 262 340 266 260Z',
    ],
    cap: CAP,
    front: [
      'M118 170C100 220 98 286 106 340C110 372 118 398 126 416C130 398 128 372 126 344C122 290 124 236 134 186Z',
      'M268 150C292 190 304 250 300 320C298 344 294 366 288 384C286 350 286 300 280 252C276 222 270 196 262 176Z',
      'M236 118C200 124 160 146 134 182C126 194 120 204 116 212C112 176 126 140 156 118C184 100 216 100 236 118Z',
      'M232 120C252 130 270 150 284 182C288 164 284 142 270 126C258 114 244 112 232 120Z',
    ],
    sheen: [
      ...TOP_SHEEN,
      [points([304, 260, 310, 330, 322, 410]), 5],
      [points([112, 250, 110, 310, 116, 370]), 3.4],
    ],
  },
  ponytail: {
    back: [
      'M270 84C330 70 372 120 366 200C362 250 340 296 316 326C330 276 334 220 318 170C310 144 296 124 274 112Z',
    ],
    cap: CAP,
    locks: locksOf([
      114, 144, 118, 238, 138, 168, 146, 204, 226, 262, 266, 204, 256, 298, 296, 264,
    ]),
    sheen: [...TOP_SHEEN, [points([338, 130, 352, 190, 342, 256]), 5]],
  },
  buns: {
    back: [
      'M120 96C100 72 108 40 138 34C168 30 186 56 174 84Z',
      'M236 78C226 50 244 24 274 28C304 34 314 66 294 90Z',
    ],
    cap: CAP,
    locks: locksOf([
      116, 150, 124, 210, 142, 184, 152, 196, 236, 276, 272, 200, 262, 296, 292, 226,
    ]),
    sheen: [
      ...TOP_SHEEN,
      [points([128, 58, 142, 48, 158, 56]), 4],
      [points([256, 50, 272, 42, 288, 54]), 4],
    ],
  },
  shaved: {
    cap: 'M114 190C100 124 150 80 212 80C270 80 304 124 294 190L288 216C288 186 278 160 256 146C222 126 170 130 140 150C126 162 116 176 114 190Z',
    faint: true,
    sheen: [[points([156, 108, 196, 94, 240, 98, 272, 118]), 8]],
  },
  bob: {
    back: ['M286 190C300 214 300 250 288 276C280 286 272 290 264 290C276 262 282 228 280 196Z'],
    cap: CAP,
    front: [
      'M110 196C100 150 124 100 168 84C210 70 268 82 292 126C304 150 302 188 294 216C294 196 290 182 284 174C266 196 236 204 206 204C176 204 148 198 128 186C120 190 114 194 110 196Z',
      'M112 190C102 220 104 250 116 272C122 262 124 240 124 214Z',
    ],
    sheen: [
      [points([138, 118, 182, 96, 236, 98, 280, 124]), 9],
      [points([150, 170, 200, 180, 252, 176]), 3],
    ],
  },
  topknot: {
    back: ['M196 70C178 44 190 14 220 12C250 12 262 42 244 70Z'],
    cap: CAP,
    locks: locksOf([
      116, 150, 124, 214, 142, 184, 150, 196, 176, 214, 196, 186, 238, 278, 276, 204, 264, 296, 292,
      232,
    ]),
    sheen: [...TOP_SHEEN, [points([206, 32, 222, 24, 238, 32]), 4]],
  },
  shaggy: {
    back: ['M274 196C300 232 304 286 288 326L262 304Z'],
    cap: 'M104 216L90 186L108 186C94 128 146 64 214 64C282 64 318 124 304 194L316 218L298 214L302 244L286 228C290 196 280 166 258 150C226 130 172 132 142 152C124 166 112 190 112 216Z',
    locks: locksOf([
      110, 148, 112, 250, 138, 184, 160, 218, 178, 220, 198, 204, 212, 256, 250, 216, 250, 296, 294,
      256,
    ]),
    sheen: [
      [points([148, 108, 190, 88, 240, 92, 278, 114]), 7],
      [points([120, 170, 112, 200, 112, 230]), 3],
    ],
  },
};

interface HairProps {
  readonly style: HairStyle;
  readonly colour: string;
}

function Shapes({
  shapes,
  colour,
}: {
  readonly shapes: readonly string[];
  readonly colour: string;
}) {
  return (
    <>
      {shapes.map((d) => (
        <path key={d} d={d} fill={colour} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      ))}
    </>
  );
}

/** What falls behind the head and shoulders: drawn before anything else. */
export function HairBack({ style, colour }: HairProps) {
  return <Shapes shapes={STYLES[style].back ?? []} colour={colour} />;
}

/** The mass over the skull: drawn over the face, under a headband. */
export function HairCap({ style, colour }: HairProps) {
  const { cap, faint } = STYLES[style];
  if (faint) return <path d={cap} fill={colour} opacity=".8" />;
  return <Shapes shapes={[cap]} colour={colour} />;
}

/** The locks over the brow, and the light in the hair: drawn last, over a headband. */
export function HairFront({ style, colour }: HairProps): ReactNode {
  const drawn = STYLES[style];
  const locks = (drawn.locks ?? []).map(([x0, x1, tx, ty]) => lock(x0, x1, tx, ty));
  const sheen = lit(colour, 0.5);
  return (
    <g>
      <Shapes shapes={drawn.front ?? []} colour={colour} />
      {locks.map((d) => (
        <g key={d}>
          <path d={d} fill={colour} />
          {/* Inked down both sides to the tip, and left open where the lock joins the mass. */}
          <path
            d={d.slice(0, -1)}
            fill="none"
            stroke={INK}
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      ))}
      {drawn.sheen.map(([pts, w], i) => (
        <Brush
          key={i}
          pts={pts}
          w={w}
          colour={sheen}
          opacity={drawn.faint ? 0.25 : 0.45}
          land={0.45}
          lift={0.45}
        />
      ))}
    </g>
  );
}
