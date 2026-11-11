import type { Age, FacialHair, Mark } from '@/game';

import { Brush } from './Brush';
import { points, type Point } from './brush';
import { SHADE } from './ink';

/** What sits on a face beyond its features: the years, a beard, a mark. */

export function AgeLines({ age }: { readonly age: Age }) {
  if (age === 'young') return null;
  const old = age === 'old';
  return (
    <g>
      <Brush
        pts={points([190, 264, 197, 276, 199, 286])}
        w={old ? 2.2 : 1.8}
        opacity={old ? 0.7 : 0.45}
        lift={0.5}
      />
      {old && (
        <>
          <Brush pts={points([198, 240, 206, 246, 216, 248])} w={1.6} opacity={0.4} />
          <Brush pts={points([130, 242, 136, 246, 143, 247])} w={1.3} opacity={0.35} />
          <Brush pts={points([246, 216, 253, 213, 259, 208])} w={1.3} opacity={0.35} />
        </>
      )}
    </g>
  );
}

/** The jaw a beard or stubble covers; drawn clipped to the face, so it follows any jaw. */
const BEARD =
  'M112 236C118 268 136 300 160 322C176 334 196 332 214 322C240 306 258 284 268 244L246 252C240 274 224 286 200 284C182 270 166 270 152 282C138 276 128 258 124 240Z';
const GOATEE = 'M158 304C166 300 190 300 198 304C200 318 190 334 178 336C166 334 156 318 158 304Z';

interface BeardProps {
  readonly kind: FacialHair;
  readonly colour: string;
}

/** Drawn inside the face's clip. */
export function Beard({ kind, colour }: BeardProps) {
  if (kind === 'none') return null;
  if (kind === 'stubble') return <path d={BEARD} fill={colour} opacity=".22" />;
  return (
    <g>
      {kind === 'beard' && <path d={BEARD} fill={colour} />}
      {kind === 'goatee' && <path d={GOATEE} fill={colour} />}
      {kind !== 'goatee' && (
        <>
          <Brush
            pts={points([176, 281, 164, 284, 150, 290])}
            w={7}
            colour={colour}
            land={0.1}
            lift={0.6}
          />
          <Brush
            pts={points([176, 281, 190, 283, 204, 288])}
            w={7.5}
            colour={colour}
            land={0.1}
            lift={0.6}
          />
        </>
      )}
    </g>
  );
}

const FRECKLES: readonly Point[] = points([
  208, 252, 218, 257, 228, 252, 222, 263, 136, 254, 144, 258,
]);

/** Drawn inside the face's clip. Earrings hang from the ear, not here. */
export function SkinMark({ mark }: { readonly mark: Mark }) {
  if (mark === 'freckles') {
    return (
      <g fill={SHADE} opacity=".3">
        {FRECKLES.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />
        ))}
      </g>
    );
  }
  if (mark === 'mole') return <circle cx="202" cy="303" r="2.4" fill={SHADE} />;
  if (mark === 'scar') {
    return (
      <g>
        <Brush
          pts={points([236, 232, 242, 258, 244, 288])}
          w={3.6}
          colour="#8a3d2c"
          opacity={0.85}
          land={0.2}
        />
        <Brush pts={points([233, 248, 251, 244])} w={2} colour="#8a3d2c" opacity={0.8} />
        <Brush pts={points([236, 270, 254, 266])} w={2} colour="#8a3d2c" opacity={0.8} />
      </g>
    );
  }
  return null;
}
