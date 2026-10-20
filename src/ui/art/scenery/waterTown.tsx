import type { Point } from './kit';
import { r1, ropePath } from './kit';
import { paint } from './lights';

/**
 * Pieces of a town built on water: domed drum towers banded like barrels, the tall tower of
 * whoever rules it, plank bridges slung between towers, houses on stilts with nets drying,
 * a fishing boat under its lantern and paper lanterns floating out on the tide.
 */

export interface DrumTower {
  readonly x: number;
  readonly w: number;
  readonly top: number;
  readonly base: number;
}

interface TowerProps {
  readonly uid: string;
  readonly tower: DrumTower;
  readonly className: string;
  /** Rows of lit windows, as shares of the height from the top. */
  readonly lit?: readonly number[];
}

/** A drum tower: banded walls, a shallow dome with a finial, a row or two of lit windows. */
export function DomedTower({ uid, tower: t, className, lit = [0.3] }: TowerProps) {
  const rx = t.w / 2;
  const cx = t.x + rx;
  const at = (share: number) => r1(t.top + (t.base - t.top) * share);
  return (
    <g>
      <path
        className={className}
        d={`M${t.x} ${t.base}V${t.top}A${rx} ${r1(rx * 0.6)} 0 0 1 ${t.x + t.w} ${t.top}V${t.base}Z`}
      />
      <path
        className="bd-tile"
        d={`M${t.x} ${at(0.22)}h${t.w}M${t.x} ${at(0.5)}h${t.w}M${t.x} ${at(0.78)}h${t.w}`}
        strokeWidth="1"
        opacity=".7"
      />
      <path
        className="bd-rim"
        d={`M${t.x} ${t.top}A${rx} ${r1(rx * 0.6)} 0 0 1 ${t.x + t.w} ${t.top}`}
        strokeWidth=".8"
        fill="none"
      />
      <rect
        className={className}
        x={r1(cx - 0.8)}
        y={r1(t.top - rx * 0.6 - 7)}
        width="1.6"
        height="8"
      />
      {lit.map((share) => (
        <g key={share} className="bd-lamp">
          {[-0.3, 0, 0.3].map((dx) => (
            <rect
              key={dx}
              x={r1(cx + dx * t.w - 2)}
              y={at(share)}
              width="4"
              height="5"
              fill={paint(uid, 'shoji')}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

/** The ruler's tower: a great drum, a balcony ring, a narrower drum above and a high dome. */
export function RulersTower({ uid, at: [x, base] }: { readonly uid: string; readonly at: Point }) {
  const lower = { x, w: 44, top: base - 120, base };
  const upper = { x: x + 8, w: 28, top: base - 150, base: base - 118 };
  const ring = base - 92;
  const banners = [x + 5, x + 35].map((bx) => `M${bx} ${ring + 6}h4v34l-2 -3l-2 3Z`).join('');
  return (
    <g>
      <DomedTower uid={uid} tower={lower} className="bd-far" lit={[0.12, 0.42, 0.7]} />
      <DomedTower uid={uid} tower={upper} className="bd-far" lit={[0.45]} />
      <path className="bd-roof" d={`M${x - 8} ${ring}h60l-6 5h-48Z`} />
      <path className="bd-rim" d={`M${x - 8} ${ring}h60`} strokeWidth=".9" fill="none" />
      <path className="bd-roof" d={`M${x + 2} ${upper.base}h40l-4 4h-32Z`} />
      <path d={banners} fill="#3c5a78" opacity=".85" />
      <circle className="bd-lamp" cx={x + 22} cy={ring - 3} r="18" fill={paint(uid, 'halo')} />
      <circle
        className="bd-lamp"
        cx={x + 22}
        cy={upper.top - 16}
        r="10"
        fill={paint(uid, 'glow')}
      />
    </g>
  );
}

/** A plank bridge slung between two towers, with its handrope and the hangers between. */
export function PlankBridge({
  from,
  to,
  sag,
}: {
  readonly from: Point;
  readonly to: Point;
  readonly sag: number;
}) {
  const rail: Point = [from[0], from[1] - 7];
  const railEnd: Point = [to[0], to[1] - 7];
  const steps = 6;
  const hangers = Array.from({ length: steps - 1 }, (_, i) => {
    const t = (i + 1) / steps;
    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t + sag * 4 * t * (1 - t);
    return `M${r1(x)} ${r1(y)}v-7`;
  }).join('');
  return (
    <g fill="none">
      <path className="bd-front-stroke" d={ropePath(from, to, sag)} strokeWidth="2.2" />
      <path className="bd-front-stroke" d={ropePath(rail, railEnd, sag)} strokeWidth=".8" />
      <path className="bd-front-stroke" d={hangers} strokeWidth=".7" />
    </g>
  );
}

export interface StiltHouseSpec {
  readonly x: number;
  readonly w: number;
  readonly h: number;
}

/** A house on stilts: a curved gable, a lit window, a veranda rail and the posts in the water. */
export function StiltHouse({
  uid,
  house: h,
  waterline,
}: {
  readonly uid: string;
  readonly house: StiltHouseSpec;
  readonly waterline: number;
}) {
  const floor = waterline - 6;
  const top = floor - h.h;
  const posts = [0.08, 0.38, 0.68, 0.94].map((s) => `M${r1(h.x + h.w * s)} ${floor}v16`).join('');
  return (
    <g>
      <path className="bd-front-stroke" d={posts} strokeWidth="2.2" />
      <rect className="bd-near" x={h.x} y={top} width={h.w} height={h.h} />
      <path
        className="bd-roof"
        d={`M${h.x - 7} ${top + 2}Q${h.x + h.w / 2} ${top - 16} ${h.x + h.w + 7} ${top + 2}Z`}
      />
      <path
        className="bd-rim"
        d={`M${h.x - 7} ${top + 2}Q${h.x + h.w / 2} ${top - 16} ${h.x + h.w + 7} ${top + 2}`}
        strokeWidth=".9"
        fill="none"
      />
      <rect
        className="bd-lamp"
        x={h.x + h.w * 0.3}
        y={top + 6}
        width={h.w * 0.4}
        height="8"
        fill={paint(uid, 'shoji')}
      />
      <path
        className="bd-tile"
        d={`M${h.x - 4} ${floor}h${h.w + 8}M${h.x - 4} ${floor - 5}h${h.w + 8}`}
        strokeWidth="1"
      />
    </g>
  );
}

/** A net hung to dry between two poles: the sag and its mesh. */
export function DryingNet({ from, to }: { readonly from: Point; readonly to: Point }) {
  const sag = 7;
  const bottom: Point = [from[0], from[1] + 12];
  const bottomEnd: Point = [to[0], to[1] + 12];
  const mesh = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 0.5) / 9;
    const x = from[0] + (to[0] - from[0]) * t;
    const top = from[1] + sag * 4 * t * (1 - t);
    return `M${r1(x)} ${r1(top)}l3 12M${r1(x)} ${r1(top)}l-3 12`;
  }).join('');
  return (
    <g fill="none">
      <path
        className="bd-front-stroke"
        d={`M${from[0]} ${from[1] - 4}V${from[1] + 24}M${to[0]} ${to[1] - 4}V${to[1] + 24}`}
        strokeWidth="1.6"
      />
      <path className="bd-tile" d={ropePath(from, to, sag)} strokeWidth="1.1" />
      <path className="bd-tile" d={mesh} strokeWidth=".5" opacity=".8" />
      <path className="bd-tile" d={ropePath(bottom, bottomEnd, sag)} strokeWidth=".7" />
    </g>
  );
}

/** A fishing boat riding at anchor with its lantern up on a pole, and the light on the water. */
export function LanternBoat({ uid, at: [x, y] }: { readonly uid: string; readonly at: Point }) {
  const hull = `M${x - 4} ${y - 3}Q${x + 2} ${y} ${x + 8} ${y}h40q6 0 10 -4l-6 10h-48Z`;
  return (
    <g>
      <rect
        className="bd-lamp"
        x={x + 32}
        y={y + 4}
        width="4"
        height="24"
        fill={paint(uid, 'shoji')}
        opacity=".35"
      />
      <path className="bd-front" d={hull} />
      <path className="bd-near" d={`M${x + 14} ${y}v-7h16v7Z`} />
      <path
        className="bd-front-stroke"
        d={`M${x + 24} ${y - 7}V${y - 32}l10 -3`}
        strokeWidth="1.4"
        fill="none"
      />
      <circle className="bd-lamp" cx={x + 34} cy={y - 31} r="14" fill={paint(uid, 'glow')} />
      <rect
        className="bd-lamp"
        x={x + 31.5}
        y={y - 34}
        width="5"
        height="7"
        rx="1.5"
        fill={paint(uid, 'white')}
      />
    </g>
  );
}

/** A paper lantern set floating on the tide, its halo and its streak on the water. */
export function DriftLantern({ uid, at: [x, y] }: { readonly uid: string; readonly at: Point }) {
  return (
    <g className="bd-lamp">
      <circle cx={x} cy={y - 3} r="10" fill={paint(uid, 'glow')} />
      <rect x={x - 1} y={y + 1} width="2" height="11" fill={paint(uid, 'shoji')} opacity=".4" />
      <rect x={x - 3} y={y - 6} width="6" height="6" rx="1" fill={paint(uid, 'red')} />
      <path d={`M${x - 4} ${y}h8`} stroke="#141016" strokeWidth="1" />
    </g>
  );
}

/** A stone lantern on a rock in the water, lit for the drowned: cap, light box, post, base. */
export function StoneLantern({ uid, at: [x, y] }: { readonly uid: string; readonly at: Point }) {
  const rock = `M${x - 16} ${y + 10}Q${x - 10} ${y - 2} ${x} ${y}Q${x + 12} ${y - 2} ${x + 18} ${y + 10}Z`;
  return (
    <g>
      <path className="bd-front" d={rock} />
      <path className="bd-front" d={`M${x - 7} ${y}h14l-2 -3h-10ZM${x - 2} ${y - 3}v-10h4v10Z`} />
      <rect className="bd-front" x={x - 6} y={y - 21} width="12" height="8" />
      <rect
        className="bd-lamp"
        x={x - 3}
        y={y - 19}
        width="6"
        height="4"
        fill={paint(uid, 'shoji')}
      />
      <circle className="bd-lamp" cx={x} cy={y - 17} r="12" fill={paint(uid, 'glow')} />
      <path className="bd-front" d={`M${x - 11} ${y - 21}Q${x} ${y - 29} ${x + 11} ${y - 21}Z`} />
    </g>
  );
}
