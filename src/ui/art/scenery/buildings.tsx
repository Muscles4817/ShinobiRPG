import type { Point } from './kit';
import { r1, scatter } from './kit';
import { Lantern, paint } from './lights';

/**
 * Buildings for the painted backdrops: tiled townhouses with lit shoji, a five-storey pagoda
 * hung with lanterns, and a torii. Walls and roofs take the time of day's ink through CSS
 * classes (`bd-front`, `bd-roof`, `bd-tile`, `bd-rim`); lit paper glows only after dark.
 */

export interface House {
  readonly x: number;
  readonly w: number;
  /** The street line the house stands on, and its height to the eaves. */
  readonly base: number;
  readonly h: number;
  readonly storeys?: number;
  /** Colour of the shop curtain at the door, if any. */
  readonly noren?: string;
}

const LIT_SHARE = 0.78;
const PANE_WIDTH = 14;

/** A tiled roof over the span [x, x + w], its eaves at `eave`. */
function Roof({
  x,
  w,
  eave,
  rise,
}: {
  readonly x: number;
  readonly w: number;
  readonly eave: number;
  readonly rise: number;
}) {
  const over = rise > 8 ? 9 : 5;
  const l = x - over;
  const r = x + w + over;
  const tiles: string[] = [];
  for (let tx = l + 4; tx < r - 2; tx += 3.2) {
    const top = tx < x + 6 || tx > x + w - 6 ? eave - rise * 0.6 : eave - rise;
    tiles.push(`M${r1(tx)} ${r1(eave - 1)}V${r1(top + 1)}`);
  }
  const mid = r1((l + r) / 2);
  return (
    <>
      <path
        className="bd-roof"
        d={`M${l} ${eave + 1}Q${mid} ${eave + 4} ${r} ${eave + 1}L${r - 2} ${eave - 3}L${x + w - 4} ${eave - rise}L${x + 4} ${eave - rise}L${l + 2} ${eave - 3}Z`}
      />
      <path className="bd-tile" d={tiles.join('')} strokeWidth="1" />
      <path
        className="bd-rim"
        d={`M${l} ${eave + 1}Q${mid} ${eave + 4} ${r} ${eave + 1}`}
        strokeWidth="1.2"
        fill="none"
      />
    </>
  );
}

/** One storey's row of shoji, some lit; which ones is fixed by where the house stands. */
function Windows({
  uid,
  x,
  w,
  top,
  height,
}: {
  readonly uid: string;
  readonly x: number;
  readonly w: number;
  readonly top: number;
  readonly height: number;
}) {
  const lit = scatter(Math.round(x * 7 + top));
  const panes = Math.max(2, Math.round(w / PANE_WIDTH));
  const pw = (w - 10) / panes;
  const wy = top + height * 0.28;
  const wh = height * 0.5;
  return (
    <>
      {Array.from({ length: panes }, (_, p) => {
        const px = x + 5 + p * pw;
        const on = lit() < LIT_SHARE;
        return (
          <g key={p}>
            <rect
              className={on ? 'bd-lamp' : 'bd-dark'}
              x={r1(px + 0.6)}
              y={r1(wy)}
              width={r1(pw - 1.2)}
              height={r1(wh)}
              fill={on ? paint(uid, 'shoji') : undefined}
            />
            {on && (
              <path
                d={`M${r1(px + pw / 3)} ${r1(wy)}v${r1(wh)}M${r1(px + (2 * pw) / 3)} ${r1(wy)}v${r1(wh)}M${r1(px)} ${r1(wy + wh / 2)}h${r1(pw)}`}
                stroke="#5a2f17"
                strokeOpacity=".55"
                strokeWidth=".7"
              />
            )}
          </g>
        );
      })}
    </>
  );
}

/** A machiya townhouse: storeys of shoji under tiled roofs, a noren at the door. */
export function Townhouse({ uid, house }: { readonly uid: string; readonly house: House }) {
  const { x, w, base, h, storeys = 2, noren } = house;
  const floor = h / storeys;
  const doorTop = base - floor * 0.85;
  const nw = Math.min(w * 0.4, 26);
  const nx = x + w * 0.3;
  return (
    <g>
      <rect className="bd-front" x={x} y={base - h} width={w} height={h} />
      {Array.from({ length: storeys }, (_, s) => (
        <g key={s}>
          <Windows uid={uid} x={x} w={w} top={base - h + s * floor} height={floor} />
          {s > 0 && <Roof x={x} w={w} eave={base - h + s * floor} rise={6} />}
        </g>
      ))}
      {noren && (
        <path
          d={`M${r1(nx)} ${r1(doorTop)}h${r1(nw)}v${r1(floor * 0.38)}h-${r1(nw / 2 - 1)}v-${r1(floor * 0.3)}h-2v${r1(floor * 0.3)}h-${r1(nw / 2 - 1)}Z`}
          fill={noren}
        />
      )}
      <Roof x={x} w={w} eave={base - h} rise={14} />
    </g>
  );
}

const PAGODA_TIERS = 5;

/** A five-storey pagoda with a lantern at every roof corner and a finial on top. */
export function Pagoda({
  uid,
  at: [cx, base],
  scale: k = 1,
}: {
  readonly uid: string;
  readonly at: Point;
  readonly scale?: number;
}) {
  const tiers: {
    readonly body: string;
    readonly y: number;
    readonly bw: number;
    readonly th: number;
    readonly roof: string;
    readonly eave: string;
    readonly l: number;
    readonly r: number;
  }[] = [];
  let y = base;
  for (let i = 0; i < PAGODA_TIERS; i++) {
    const bw = (46 - i * 6) * k;
    const th = (20 - i * 1.5) * k;
    const body = `M${r1(cx - bw / 2)} ${r1(y)}V${r1(y - th)}H${r1(cx + bw / 2)}V${r1(y)}Z`;
    const top = y - th;
    const l = cx - (bw + 26 * k) / 2;
    const r = cx + (bw + 26 * k) / 2;
    const eave = `M${r1(l)} ${r1(top - 5 * k)}Q${r1(l + 6 * k)} ${r1(top + 1)} ${r1(l + 14 * k)} ${r1(top + 1)}H${r1(r - 14 * k)}Q${r1(r - 6 * k)} ${r1(top + 1)} ${r1(r)} ${r1(top - 5 * k)}`;
    const roof = `${eave}L${r1(cx + bw / 2 - 2)} ${r1(top - 9 * k)}H${r1(cx - bw / 2 + 2)}Z`;
    tiers.push({ body, y, bw, th, roof, eave, l, r });
    y = top - 9 * k;
  }
  return (
    <g>
      {tiers.map((t, i) => (
        <g key={i}>
          <path className="bd-front" d={t.body} />
          {[0.18, 0.44, 0.7].map((share) => (
            <rect
              key={share}
              className="bd-lamp"
              x={r1(cx - t.bw / 2 + t.bw * share)}
              y={r1(t.y - t.th * 0.78)}
              width={r1(t.bw * 0.12)}
              height={r1(t.th * 0.5)}
              fill={paint(uid, 'shoji')}
            />
          ))}
          <path className="bd-roof" d={t.roof} />
          <path className="bd-rim" d={t.eave} strokeWidth="1.1" fill="none" />
          <Lantern uid={uid} at={[t.l + 1, t.y - t.th + 4 * k]} size={2.4 * k} />
          <Lantern uid={uid} at={[t.r - 1, t.y - t.th + 4 * k]} size={2.4 * k} />
        </g>
      ))}
      <path
        className="bd-front-stroke"
        d={`M${r1(cx)} ${r1(y)}V${r1(y - 30 * k)}`}
        strokeWidth={r1(2.4 * k)}
      />
      {[0, 1, 2, 3, 4, 5].map((ring) => (
        <ellipse
          key={ring}
          className="bd-roof"
          cx={r1(cx)}
          cy={r1(y - 6 * k - ring * 3.6 * k)}
          rx={r1(3.2 * k)}
          ry={r1(0.9 * k)}
        />
      ))}
      <circle cx={r1(cx)} cy={r1(y - 33 * k)} r={r1(2.6 * k)} fill="#ffd27a" />
    </g>
  );
}

/** A vermilion torii: its top rail curving up at the ends, `w` wide and `h` tall. */
export function Torii({
  at: [x, y],
  w,
  h,
}: {
  readonly at: Point;
  readonly w: number;
  readonly h: number;
}) {
  const post = w * 0.065;
  return (
    <g fill="#b8352a">
      <path
        d={`M${x} ${y}Q${r1(x + w / 2)} ${r1(y - h * 0.13)} ${x + w} ${y}L${r1(x + w - 2)} ${r1(y + h * 0.1)}Q${r1(x + w / 2)} ${r1(y - h * 0.02)} ${x + 2} ${r1(y + h * 0.1)}Z`}
      />
      <rect x={r1(x + w * 0.08)} y={r1(y + h * 0.22)} width={r1(w * 0.84)} height={r1(h * 0.07)} />
      <rect x={r1(x + w * 0.16)} y={r1(y + h * 0.08)} width={r1(post)} height={r1(h * 0.92)} />
      <rect
        x={r1(x + w * 0.84 - post)}
        y={r1(y + h * 0.08)}
        width={r1(post)}
        height={r1(h * 0.92)}
      />
      <path
        className="bd-rim"
        d={`M${x} ${y}Q${r1(x + w / 2)} ${r1(y - h * 0.13)} ${x + w} ${y}`}
        strokeWidth=".9"
        fill="none"
      />
    </g>
  );
}
