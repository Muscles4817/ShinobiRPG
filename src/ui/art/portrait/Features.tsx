import type { EarShape, Expression, NoseShape } from '@/game';

import { Brush } from './Brush';
import { points, type BrushStroke, type Point } from './brush';
import { INK, WHITE } from './ink';

/** The nose, mouth and near ear: a few brush lines each, set on the turned head. */

interface Line extends BrushStroke {
  readonly pts: readonly Point[];
  readonly opacity?: number;
}

/** A nose is the far edge of its bridge, then the tip and one nostril. */
const NOSES: Readonly<Record<NoseShape, readonly Line[]>> = {
  button: [
    {
      pts: points([166, 244, 160, 256, 158, 264]),
      w: 2.2,
      land: 0.5,
      lift: 0.15,
      opacity: 0.8,
    },
    {
      pts: points([158, 264, 163, 269, 170, 269, 175, 265]),
      w: 2.4,
      land: 0.15,
      lift: 0.45,
    },
  ],
  straight: [
    {
      pts: points([174, 214, 168, 236, 158, 256, 156, 266]),
      w: 2.6,
      land: 0.45,
      lift: 0.15,
    },
    {
      pts: points([157, 266, 162, 271, 171, 271, 177, 267]),
      w: 2.6,
      land: 0.15,
      lift: 0.45,
    },
  ],
  hooked: [
    {
      pts: points([174, 214, 173, 232, 162, 246, 156, 262, 157, 269]),
      w: 2.8,
      land: 0.4,
      lift: 0.1,
    },
    {
      pts: points([157, 269, 163, 274, 171, 273, 176, 268]),
      w: 2.6,
      land: 0.15,
      lift: 0.45,
    },
  ],
  broad: [
    {
      pts: points([174, 216, 168, 238, 157, 256, 154, 266]),
      w: 2.6,
      land: 0.45,
      lift: 0.15,
    },
    {
      pts: points([154, 266, 160, 273, 174, 274, 183, 267]),
      w: 3,
      land: 0.15,
      lift: 0.4,
    },
    {
      pts: points([179, 260, 185, 264, 186, 270]),
      w: 1.8,
      land: 0.3,
      lift: 0.4,
      opacity: 0.7,
    },
  ],
  long: [
    {
      pts: points([174, 214, 168, 238, 157, 262, 155, 274]),
      w: 2.6,
      land: 0.45,
      lift: 0.15,
    },
    {
      pts: points([156, 274, 161, 279, 170, 279, 176, 275]),
      w: 2.6,
      land: 0.15,
      lift: 0.45,
    },
  ],
  snub: [
    {
      pts: points([172, 224, 166, 242, 158, 254, 155, 260]),
      w: 2.4,
      land: 0.5,
      lift: 0.15,
      opacity: 0.85,
    },
    {
      pts: points([155, 260, 160, 267, 170, 268, 177, 261]),
      w: 2.6,
      land: 0.15,
      lift: 0.45,
    },
  ],
};

export function Nose({ shape }: { readonly shape: NoseShape }) {
  return (
    <g>
      {NOSES[shape].map((line, i) => (
        <Brush key={i} {...line} />
      ))}
    </g>
  );
}

/** The line of the lips, far corner to near, by what the face is doing. */
const MOUTHS: Readonly<Record<Expression, readonly Point[]>> = {
  calm: points([156, 294, 168, 296, 182, 295, 194, 293]),
  smile: points([154, 290, 166, 297, 182, 297, 198, 289]),
  grin: points([152, 288, 166, 295, 184, 295, 202, 286]),
  smirk: points([156, 295, 170, 296, 186, 293, 200, 286]),
  stern: points([157, 295, 169, 294, 182, 295, 193, 297]),
  worried: points([156, 296, 168, 294, 182, 294, 194, 297]),
};

interface MouthProps {
  readonly expression: Expression;
  /** How far below its usual place the mouth sits on this face. */
  readonly drop: number;
}

export function Mouth({ expression, drop }: MouthProps) {
  return (
    <g transform={`translate(0 ${drop})`}>
      {expression === 'grin' && (
        <>
          <path d="M152 288C166 294 186 294 202 286C196 305 166 308 152 288Z" fill={WHITE} />
          <Brush
            pts={points([155, 292, 171, 305, 192, 299, 202, 287])}
            w={3}
            land={0.2}
            lift={0.2}
          />
        </>
      )}
      <Brush pts={MOUTHS[expression]} w={3.6} land={0.25} />
      <Brush
        pts={points([166, 306, 176, 309, 186, 306])}
        w={2}
        opacity={0.45}
        land={0.4}
        lift={0.4}
      />
    </g>
  );
}

/** How each ear differs from the plain one: its size, and how far it stands off the head. */
const EARS: Readonly<Record<EarShape, { readonly size: number; readonly out: number }>> = {
  small: { size: 0.88, out: 0 },
  large: { size: 1.14, out: 0 },
  protruding: { size: 1.06, out: 7 },
  lobed: { size: 1, out: 0 },
  pointed: { size: 1, out: 0 },
};

/** Where the ear joins the head: it grows and stands off from here. */
const EAR_ROOT: Point = [261, 232];

const EAR_RIM: readonly Point[] = points([
  263, 206, 279, 197, 291, 213, 289, 238, 277, 257, 261, 258,
]);
const POINTED_RIM: readonly Point[] = points([
  263, 208, 280, 196, 300, 180, 293, 214, 289, 238, 277, 257, 261, 258,
]);
const LOBED_RIM: readonly Point[] = points([
  263, 206, 279, 197, 291, 213, 289, 238, 282, 262, 270, 268, 260, 260,
]);

function rimOf(shape: EarShape): readonly Point[] {
  if (shape === 'pointed') return POINTED_RIM;
  return shape === 'lobed' ? LOBED_RIM : EAR_RIM;
}

interface EarProps {
  readonly shape: EarShape;
  readonly skin: string;
  readonly earring: boolean;
}

export function Ear({ shape, skin, earring }: EarProps) {
  const { size, out } = EARS[shape];
  const rim = rimOf(shape);
  const [x, y] = EAR_ROOT;
  const outline = `M${rim.map(([px, py]) => `${px} ${py}`).join('L')}Z`;
  return (
    <g transform={`translate(${x + out} ${y}) scale(${size}) translate(${-x} ${-y})`}>
      <path d={outline} fill={skin} strokeLinejoin="round" stroke={skin} strokeWidth="6" />
      <Brush pts={rim} w={3} land={0.2} />
      <Brush
        pts={points([271, 215, 281, 217, 281, 233, 273, 245])}
        w={1.8}
        opacity={0.7}
        lift={0.4}
      />
      {earring && (
        <circle cx="279" cy="262" r="5.5" fill="none" stroke="#c9a23a" strokeWidth="2.6" />
      )}
      {earring && (
        <circle cx="279" cy="262" r="5.5" fill="none" stroke={INK} strokeWidth="0.8" opacity=".5" />
      )}
    </g>
  );
}
