import type { Point } from './kit';
import { alongRope, r1, ropePath, scatter, specks } from './kit';

/**
 * Lights and sky for the painted backdrops: paper lanterns and the strings they hang on, the
 * gradients every scene shares, and the sky's moon, sun, stars and cloud. Glows are radial
 * gradients, never blur filters, so they stay cheap on a phone. What shows by day or night is
 * left to CSS (`.bd-night`, `.bd-day`, `.bd-lit` in theme/scenery.css), keyed on the sky's slot.
 */

/** A gradient id unique to one drawing of a backdrop, so many can share a page. */
export const paint = (uid: string, name: string): string => `url(#${uid}-${name})`;

const LAMP_INK = '#141016';

/** Gradients every scene may use, prefixed with the drawing's uid. */
export function SharedDefs({ uid }: { readonly uid: string }) {
  return (
    <>
      <radialGradient id={`${uid}-glow`}>
        <stop offset="0" stopColor="#ffb35c" stopOpacity=".55" />
        <stop offset=".35" stopColor="#ff8a3d" stopOpacity=".22" />
        <stop offset="1" stopColor="#ff7a2e" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-red`} cx=".42" cy=".4" r=".7">
        <stop offset="0" stopColor="#ffe7a8" />
        <stop offset=".45" stopColor="#ff9a3c" />
        <stop offset="1" stopColor="#b8321c" />
      </radialGradient>
      <radialGradient id={`${uid}-white`} cx=".42" cy=".4" r=".7">
        <stop offset="0" stopColor="#fffbe8" />
        <stop offset=".5" stopColor="#ffd890" />
        <stop offset="1" stopColor="#c77a2a" />
      </radialGradient>
      <linearGradient id={`${uid}-shoji`} x2="0" y2="1">
        <stop offset="0" stopColor="#ffe0a0" />
        <stop offset="1" stopColor="#f08a3c" />
      </linearGradient>
      <radialGradient id={`${uid}-halo`}>
        <stop offset="0" stopColor="#ffe9c4" stopOpacity=".35" />
        <stop offset=".3" stopColor="#ffd9a8" stopOpacity=".12" />
        <stop offset="1" stopColor="#ffd9a8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-moon`} cx=".4" cy=".38">
        <stop offset="0" stopColor="#fffaf0" />
        <stop offset=".7" stopColor="#f6e6c4" />
        <stop offset="1" stopColor="#e3c99a" />
      </radialGradient>
      <radialGradient id={`${uid}-sun`}>
        <stop offset="0" stopColor="#fff8e0" stopOpacity=".9" />
        <stop offset=".25" stopColor="#ffe6a8" stopOpacity=".45" />
        <stop offset="1" stopColor="#ffe6a8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-mist`} x2="0" y2="1">
        <stop offset="0" className="bd-mist-stop" stopOpacity="0" />
        <stop offset=".5" className="bd-mist-stop" />
        <stop offset="1" className="bd-mist-stop" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${uid}-scrim`} x2="0" y2="1">
        <stop offset="0" stopColor="#0a0810" stopOpacity=".45" />
        <stop offset=".3" stopColor="#0a0810" stopOpacity="0" />
        <stop offset=".62" stopColor="#0a0810" stopOpacity="0" />
        <stop offset="1" stopColor="#0a0810" stopOpacity=".6" />
      </linearGradient>
      <linearGradient id={`${uid}-ground`} x2="0" y2="1">
        <stop offset="0" className="bd-near-stop" />
        <stop offset="1" className="bd-front-stop" />
      </linearGradient>
    </>
  );
}

export interface LanternProps {
  readonly uid: string;
  readonly at: Point;
  /** Half the body's height. */
  readonly size: number;
  readonly white?: boolean;
  /** Degrees it swings from its cord. */
  readonly swing?: number;
}

const RIB_STEPS = [-2, -1, 0, 1, 2];

/** A paper chōchin: glow, ribbed body, lacquer caps and a catchlight. */
export function Lantern({ uid, at: [x, y], size: s, white = false, swing = 0 }: LanternProps) {
  const ribs = RIB_STEPS.map((i) => {
    const ry = y + i * s * 0.36;
    const half = s * 0.8 * Math.sqrt(1 - (i * 0.36) ** 2);
    return `M${r1(x - half)} ${r1(ry)}Q${r1(x)} ${r1(ry + s * 0.12)} ${r1(x + half)} ${r1(ry)}`;
  }).join('');
  return (
    <g transform={`rotate(${r1(swing)} ${r1(x)} ${r1(y - s * 1.4)})`}>
      <circle className="bd-lit" cx={r1(x)} cy={r1(y)} r={r1(s * 4.2)} fill={paint(uid, 'glow')} />
      <path
        d={`M${r1(x)} ${r1(y - s * 1.6)}V${r1(y - s)}`}
        stroke={LAMP_INK}
        strokeWidth={r1(s * 0.12)}
      />
      <ellipse
        cx={r1(x)}
        cy={r1(y)}
        rx={r1(s * 0.8)}
        ry={r1(s)}
        fill={paint(uid, white ? 'white' : 'red')}
      />
      <path d={ribs} stroke="#7a1d12" strokeOpacity=".45" strokeWidth={r1(s * 0.07)} fill="none" />
      <rect
        x={r1(x - s * 0.42)}
        y={r1(y - s * 1.1)}
        width={r1(s * 0.84)}
        height={r1(s * 0.24)}
        fill={LAMP_INK}
      />
      <rect
        x={r1(x - s * 0.42)}
        y={r1(y + s * 0.88)}
        width={r1(s * 0.84)}
        height={r1(s * 0.24)}
        fill={LAMP_INK}
      />
      <ellipse
        cx={r1(x - s * 0.22)}
        cy={r1(y - s * 0.2)}
        rx={r1(s * 0.18)}
        ry={r1(s * 0.45)}
        fill="#fff2c8"
        opacity=".55"
      />
    </g>
  );
}

export interface LanternStringProps {
  readonly uid: string;
  readonly from: Point;
  readonly to: Point;
  /** How far the rope sags, and how many lanterns of what size hang from it. */
  readonly hang: { readonly sag: number; readonly count: number; readonly size: number };
}

/** A rope across a street, hung with lanterns; every third is white paper. */
export function LanternString({ uid, from, to, hang }: LanternStringProps) {
  const sway = scatter(Math.round(from[0] * 31 + to[1]));
  return (
    <g>
      <path d={ropePath(from, to, hang.sag)} stroke={LAMP_INK} strokeWidth=".9" fill="none" />
      {Array.from({ length: hang.count }, (_, i) => {
        const [x, y] = alongRope(from, to, hang.sag, (i + 1) / (hang.count + 1));
        return (
          <Lantern
            key={i}
            uid={uid}
            at={[x, y + hang.size * 1.7]}
            size={hang.size}
            white={(i + 1) % 3 === 0}
            swing={(sway() - 0.5) * 8}
          />
        );
      })}
    </g>
  );
}

export interface SkyProps {
  readonly uid: string;
  /** Where the moon hangs by night; the sun takes its place by day. */
  readonly moon: Point;
  readonly sun?: Point;
  readonly seed: number;
  /** How far down stars reach. */
  readonly starDepth?: number;
}

/** Stars, the moon with its halo, and the sun: each shown only in its own time of day. */
export function SkyLights({
  uid,
  moon: [mx, my],
  sun = [mx, my],
  seed,
  starDepth = 120,
}: SkyProps) {
  const stars = specks(seed, 70, { w: 400, h: starDepth });
  return (
    <>
      <g className="bd-night">
        <g fill="#fff6e0">
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
          ))}
        </g>
        <circle cx={mx} cy={my} r="90" fill={paint(uid, 'halo')} />
        <circle cx={mx} cy={my} r="17" fill={paint(uid, 'moon')} />
        <g fill="#d9c7a4" opacity=".35">
          <circle cx={mx - 5} cy={my - 4} r="3" />
          <circle cx={mx + 5} cy={my + 5} r="2" />
          <circle cx={mx - 7} cy={my + 5} r="1.5" />
        </g>
      </g>
      <g className="bd-day">
        <circle cx={sun[0]} cy={sun[1]} r="70" fill={paint(uid, 'sun')} />
        <circle cx={sun[0]} cy={sun[1]} r="12" fill="#fffaf0" opacity=".95" />
      </g>
    </>
  );
}

/** Long thin clouds, tinted by the time of day. */
export function Clouds({ at: [x, y], scale = 1 }: { readonly at: Point; readonly scale?: number }) {
  return (
    <g className="bd-cloud" transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 10c18-8 40-6 56-1 20-8 52-8 74 0 14-2 30 0 40 5-30 6-72 6-110 4-24 2-46 0-60-8z" />
      <path d="M40-22c14-5 30-4 42 0 16-5 38-4 52 2-22 4-52 4-72 3-10 0-18-2-22-5z" opacity=".7" />
    </g>
  );
}

/** A small fire on the ground at `at` (its base), with the glow it throws once the light goes. */
export function Campfire({
  uid,
  at: [x, base],
  size: s = 1,
}: {
  readonly uid: string;
  readonly at: Point;
  readonly size?: number;
}) {
  return (
    <g>
      <circle
        className="bd-lit"
        cx={x}
        cy={r1(base - 4 * s)}
        r={r1(18 * s)}
        fill={paint(uid, 'glow')}
      />
      <path
        d={`M${r1(x - 6 * s)} ${base}l${r1(6 * s)} ${r1(-10 * s)}l${r1(6 * s)} ${r1(10 * s)}z`}
        fill="#f2a24a"
      />
    </g>
  );
}
