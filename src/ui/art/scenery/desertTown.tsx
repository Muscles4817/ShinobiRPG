import type { Point } from './kit';
import { r1 } from './kit';
import { paint } from './lights';

/**
 * The desert towns' buildings: houses of sun-dried clay with rounded shoulders, beam ends and
 * round windows lit from inside, the Kazekage's great domed tower with the wind's sign on its
 * banner disc, striped bazaar awnings and the clay jars water is kept in. Clay keeps its own
 * colours; a scene lays its dusk wash (`bd-dusk`) over them.
 */

const CLAY = '#d9a46c';
const CLAY_SHADE = '#a8703f';
const CLAY_DARK = '#5a3420';
const BEAM = '#4a2a18';

export interface ClayHouse {
  readonly x: number;
  readonly w: number;
  readonly top: number;
  readonly base: number;
  /** A dome on the roof instead of a flat parapet. */
  readonly dome?: boolean;
  /** Round windows, as shares across and down the wall. */
  readonly windows?: readonly Point[];
}

function DomeCap({ x, w, top }: Pick<ClayHouse, 'x' | 'w' | 'top'>) {
  const r = w * 0.36;
  const cx = x + w / 2;
  return (
    <>
      <path d={`M${r1(cx - r)} ${top}a${r1(r)} ${r1(r * 0.9)} 0 0 1 ${r1(r * 2)} 0z`} fill={CLAY} />
      <path
        d={`M${r1(cx)} ${r1(top - r * 0.9)}a${r1(r)} ${r1(r * 0.9)} 0 0 1 ${r1(r)} ${r1(r * 0.9)}h${r1(-r)}z`}
        fill={CLAY_SHADE}
        opacity=".6"
      />
    </>
  );
}

/** A clay house: lit face and shaded side, beam ends under the roof, glowing round windows. */
export function ClayHouseShape({
  uid,
  house,
}: {
  readonly uid: string;
  readonly house: ClayHouse;
}) {
  const { x, w, top, base, dome = false, windows = [[0.5, 0.5]] } = house;
  const h = base - top;
  const beams = Array.from({ length: Math.max(2, Math.floor(w / 9)) }, (_, i) => x + 4 + i * 9);
  return (
    <g>
      {dome && <DomeCap x={x} w={w} top={top} />}
      <rect x={x} y={top} width={w} height={h} rx="4" fill={CLAY} />
      <rect
        x={r1(x + w * 0.68)}
        y={top}
        width={r1(w * 0.32)}
        height={h}
        fill={CLAY_SHADE}
        opacity=".7"
      />
      {beams.map((bx) => (
        <rect key={bx} x={bx} y={top + 4} width="3" height="3" fill={BEAM} />
      ))}
      {windows.map(([wx, wy]) => {
        const cx = r1(x + w * wx);
        const cy = r1(top + h * wy);
        return (
          <g key={`${wx}-${wy}`}>
            <circle cx={cx} cy={cy} r="3.4" fill={CLAY_DARK} />
            <circle className="bd-lamp" cx={cx} cy={cy} r="3.4" fill={paint(uid, 'shoji')} />
          </g>
        );
      })}
    </g>
  );
}

/** Three curled strokes: the wind's sign, painted on the tower's banner disc. */
function WindSign({ at: [x, y], r }: { readonly at: Point; readonly r: number }) {
  const s = r * 0.5;
  return (
    <g stroke="#7a2a1a" strokeWidth={r1(r * 0.14)} fill="none" strokeLinecap="round">
      <path
        d={`M${r1(x - s)} ${r1(y - s * 0.6)}q${r1(s)} ${r1(-s * 0.5)} ${r1(s * 1.6)} 0q${r1(s * 0.4)} ${r1(s * 0.4)} 0 ${r1(s * 0.6)}`}
      />
      <path d={`M${r1(x - s * 1.1)} ${r1(y + s * 0.1)}h${r1(s * 1.9)}`} />
      <path d={`M${r1(x - s)} ${r1(y + s * 0.7)}q${r1(s)} ${r1(s * 0.5)} ${r1(s * 1.6)} 0`} />
    </g>
  );
}

/** The Kazekage's tower: a drum of clay crowned with a dome, rings of windows, the wind's disc. */
export function KazeTower({ uid, at: [cx, base] }: { readonly uid: string; readonly at: Point }) {
  const w = 74;
  const top = base - 96;
  const x = cx - w / 2;
  const rings = [0.3, 0.55, 0.8];
  return (
    <g>
      <path d={`M${x - 4} ${top + 2}a${w / 2 + 4} ${w * 0.42} 0 0 1 ${w + 8} 0z`} fill={CLAY} />
      <path
        d={`M${cx} ${r1(top + 2 - w * 0.42)}a${w / 2 + 4} ${w * 0.42} 0 0 1 ${w / 2 + 4} ${r1(w * 0.42)}h${-(w / 2 + 4)}z`}
        fill={CLAY_SHADE}
        opacity=".55"
      />
      <rect x={x} y={top} width={w} height={base - top} fill={CLAY} />
      <rect
        x={r1(x + w * 0.66)}
        y={top}
        width={r1(w * 0.34)}
        height={base - top}
        fill={CLAY_SHADE}
        opacity=".7"
      />
      <path d={`M${x - 4} ${top + 2}h${w + 8}v4h${-(w + 8)}z`} fill={CLAY_SHADE} />
      {rings.flatMap((ry) =>
        [0.2, 0.5, 0.8].map((rx) => {
          const wx = r1(x + w * rx);
          const wy = r1(top + (base - top) * ry);
          return (
            <g key={`${rx}-${ry}`}>
              <rect x={wx - 3} y={wy - 4} width="6" height="8" rx="3" fill={CLAY_DARK} />
              <rect
                className="bd-lamp"
                x={wx - 3}
                y={wy - 4}
                width="6"
                height="8"
                rx="3"
                fill={paint(uid, 'shoji')}
              />
            </g>
          );
        }),
      )}
      <circle cx={cx} cy={top + 18} r="13" fill="#f2e2c4" />
      <circle cx={cx} cy={top + 18} r="13" fill="none" stroke="#7a2a1a" strokeWidth="1.5" />
      <WindSign at={[cx, top + 18]} r={13} />
      <circle className="bd-lit" cx={cx} cy={base - 30} r="40" fill={paint(uid, 'glow')} />
    </g>
  );
}

const STRIPES = ['#b8321c', '#efe0c0'];

/** A bazaar awning: striped cloth sloping down from the wall to two poles. */
export function Awning({ at: [x, y], w }: { readonly at: Point; readonly w: number }) {
  const n = Math.max(3, Math.round(w / 8));
  const step = w / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d={`M${r1(x + i * step)} ${y}h${r1(step)}l2 12h${r1(-step)}z`}
          fill={STRIPES[i % 2]}
        />
      ))}
      <path
        d={`M${x + 2} ${y + 12}v18M${r1(x + w)} ${y + 12}v18`}
        stroke={BEAM}
        strokeWidth="1.6"
      />
    </g>
  );
}

/** A tall clay water jar, a little lit on its left shoulder. */
export function WaterJar({ at: [x, base], h }: { readonly at: Point; readonly h: number }) {
  const w = h * 0.7;
  return (
    <g>
      <path
        d={`M${r1(x - w * 0.22)} ${r1(base - h)}h${r1(w * 0.44)}q${r1(w * 0.5)} ${r1(h * 0.3)} ${r1(w * 0.3)} ${r1(h * 0.8)}q${r1(-w * 0.1)} ${r1(h * 0.2)} ${r1(-w * 0.52)} ${r1(h * 0.2)}q${r1(-w * 0.42)} 0 ${r1(-w * 0.52)} ${r1(-h * 0.2)}q${r1(-w * 0.2)} ${r1(-h * 0.5)} ${r1(w * 0.3)} ${r1(-h * 0.8)}z`}
        fill={CLAY_SHADE}
      />
      <ellipse
        cx={r1(x - w * 0.14)}
        cy={r1(base - h * 0.55)}
        rx={r1(w * 0.1)}
        ry={r1(h * 0.22)}
        fill="#f2c890"
        opacity=".45"
      />
    </g>
  );
}
