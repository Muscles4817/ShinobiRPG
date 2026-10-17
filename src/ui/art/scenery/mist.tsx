import { r1 } from './kit';
import { SkyLights, paint } from './lights';

/**
 * The mist: a town on the water, its round towers fading rank by rank into fog, houses on
 * stilts along a pier, and still water holding their reflections.
 */

interface Tower {
  readonly x: number;
  readonly w: number;
  readonly top: number;
  readonly base: number;
}

const FAR_TOWERS: readonly Tower[] = [
  { x: 30, w: 34, top: 110, base: 186 },
  { x: 180, w: 44, top: 94, base: 186 },
  { x: 320, w: 30, top: 118, base: 186 },
];
const NEAR_TOWERS: readonly Tower[] = [
  { x: 96, w: 40, top: 130, base: 200 },
  { x: 262, w: 48, top: 120, base: 200 },
];

const WATERLINE = 204;

/** A round water tower: a drum with a shallow dome and a ring of windows. */
function RoundTower({
  tower: t,
  className,
  uid,
}: {
  readonly tower: Tower;
  readonly className: string;
  readonly uid: string;
}) {
  const rx = t.w / 2;
  const cx = t.x + rx;
  return (
    <g>
      <path
        className={className}
        d={`M${t.x} ${t.base}V${t.top}A${rx} ${r1(rx * 0.55)} 0 0 1 ${t.x + t.w} ${t.top}V${t.base}Z`}
      />
      <path
        className="bd-tile"
        d={`M${t.x} ${r1(t.top + (t.base - t.top) * 0.45)}h${t.w}M${t.x} ${r1(t.top + (t.base - t.top) * 0.7)}h${t.w}`}
        strokeWidth="1.2"
      />
      <path
        className="bd-roof"
        d={`M${t.x - 4} ${t.top + 2}Q${cx} ${r1(t.top - rx * 0.9)} ${t.x + t.w + 4} ${t.top + 2}Z`}
      />
      <path
        className="bd-rim"
        d={`M${t.x - 4} ${t.top + 2}Q${cx} ${r1(t.top - rx * 0.9)} ${t.x + t.w + 4} ${t.top + 2}`}
        strokeWidth=".9"
        fill="none"
      />
      <rect className="bd-roof" x={r1(cx - 1)} y={r1(t.top - rx * 0.45 - 8)} width="2" height="8" />
      {[0.3, 0.55].map((share) => (
        <rect
          key={share}
          className="bd-lamp"
          x={r1(cx - 3)}
          y={r1(t.top + (t.base - t.top) * share)}
          width="6"
          height="5"
          fill={paint(uid, 'shoji')}
        />
      ))}
    </g>
  );
}

const STILT_HOUSES = [
  { x: 0, w: 56, h: 24 },
  { x: 150, w: 44, h: 20 },
  { x: 330, w: 70, h: 28 },
] as const;

export function Mist({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[310, 52]} sun={[300, 48]} seed={13} starDepth={70} />
      {FAR_TOWERS.map((t) => (
        <RoundTower key={t.x} tower={t} className="bd-far" uid={uid} />
      ))}
      <rect y="120" width="400" height="80" fill={paint(uid, 'mist')} />
      <rect y="150" width="400" height="50" fill={paint(uid, 'mist')} />
      {NEAR_TOWERS.map((t) => (
        <RoundTower key={t.x} tower={t} className="bd-mid" uid={uid} />
      ))}
      <rect className="bd-sea" y={WATERLINE} width="400" height={240 - WATERLINE} />
      <g opacity=".3">
        {NEAR_TOWERS.map((t) => (
          <rect
            key={t.x}
            className="bd-mid"
            x={t.x + 2}
            y={WATERLINE}
            width={t.w - 4}
            height="22"
          />
        ))}
      </g>
      <rect y={WATERLINE - 10} width="400" height="30" fill={paint(uid, 'mist')} />
      <rect className="bd-near" y={WATERLINE + 2} width="400" height="3" />
      {STILT_HOUSES.map((h) => (
        <g key={h.x}>
          <path
            className="bd-roof"
            d={`M${h.x - 6} ${WATERLINE - h.h}L${h.x + h.w / 2} ${WATERLINE - h.h - 12}L${h.x + h.w + 6} ${WATERLINE - h.h}Z`}
          />
          <rect className="bd-near" x={h.x} y={WATERLINE - h.h} width={h.w} height={h.h - 4} />
          <rect
            className="bd-lamp"
            x={h.x + h.w * 0.35}
            y={WATERLINE - h.h + 5}
            width={h.w * 0.3}
            height="7"
            fill={paint(uid, 'shoji')}
          />
          <path
            className="bd-front-stroke"
            d={`M${h.x + 4} ${WATERLINE - 4}v18M${h.x + h.w - 4} ${WATERLINE - 4}v18M${h.x + h.w / 2} ${WATERLINE - 4}v18`}
            strokeWidth="2"
          />
        </g>
      ))}
      <g stroke="#e6eef4" strokeOpacity=".3" strokeWidth="1">
        <path d="M30 218h40M120 226h60M220 214h50M300 230h70M60 234h30" />
      </g>
      <rect y="210" width="400" height="30" fill={paint(uid, 'mist')} />
    </>
  );
}
