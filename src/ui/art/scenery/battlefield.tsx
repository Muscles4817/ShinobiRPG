import { r1, ridge, scatter } from './kit';
import { Campfire, SkyLights, paint } from './lights';
import { Boulder, Tufts } from './terrain';
import { Snag } from './trees';

/**
 * The old battlefield: a dry plain under low hills, blades still standing in the earth where
 * they were left, row on row going small into the haze, a torn banner on its pole, dead trees,
 * a memorial stone with its offerings, and the keeper's fire by a lean-to at the edge.
 */

const HORIZON = 160;
const HILLS = ridge({ x1: 400, y: 138, amp: 14, seed: 101, bottom: 240, freq: 0.9 });
const RISE = ridge({ x1: 400, y: 158, amp: 8, seed: 102, bottom: 240, freq: 1.8 });

/** Blades in the ground, scattered more thinly and drawn larger as they come near. */
const BLADES = (() => {
  const next = scatter(103);
  return Array.from({ length: 70 }, () => {
    const depth = next();
    const y = HORIZON + 4 + depth ** 1.4 * 74;
    const s = 0.35 + depth * 1.4;
    return { x: r1(next() * 400), y: r1(y), s: r1(s), lean: r1((next() - 0.5) * 14 * s) };
  }).sort((a, b) => a.y - b.y);
})();

function Blade({ x, y, s, lean }: (typeof BLADES)[number]) {
  const h = 16 * s;
  return (
    <g>
      <path
        d={`M${x} ${y}L${r1(x + lean)} ${r1(y - h)}`}
        stroke="#7c766c"
        strokeWidth={r1(1.4 * s)}
        strokeLinecap="round"
      />
      <path
        d={`M${r1(x + lean * 0.8 - 3 * s)} ${r1(y - h * 0.78)}h${r1(6 * s)}`}
        stroke="#4a3a2e"
        strokeWidth={r1(1.2 * s)}
      />
    </g>
  );
}

function Banner() {
  return (
    <g>
      <path className="bd-front-stroke" d="M96 226L102 120" strokeWidth="2.4" />
      <path
        d="M101 126C118 130 128 124 140 132L134 146L142 160C128 154 116 160 100 154Z"
        fill="#7a2a22"
        opacity=".85"
      />
      <path d="M118 136l6 6l-6 6l-6 -6z" fill="#e0c690" opacity=".5" />
    </g>
  );
}

function Keeper({ uid }: { readonly uid: string }) {
  return (
    <g>
      <path className="bd-front" d="M300 212L326 186L352 212Z" />
      <path className="bd-rim" d="M300 212L326 186L352 212" strokeWidth=".9" fill="none" />
      <path className="bd-dark" d="M318 212L326 200L334 212Z" />
      <Campfire uid={uid} at={[366, 214]} size={1.2} />
      <path className="bd-front-stroke" d="M358 216l16 -4M358 212l16 4" strokeWidth="1.6" />
    </g>
  );
}

function Memorial() {
  return (
    <g>
      <path className="bd-front" d="M196 222V176Q204 168 212 176V222Z" />
      <path className="bd-rim" d="M196 222V176Q204 168 212 176V222" strokeWidth=".8" fill="none" />
      <rect className="bd-front" x="186" y="220" width="36" height="6" />
      <path d="M190 220v-4h3v4zM216 220v-5h3v5z" fill="#e8dcc4" opacity=".7" />
      <path d="M202 188h4M202 194h4M202 200h4" stroke="#e8dcc4" strokeOpacity=".35" />
    </g>
  );
}

export function Battlefield({ uid }: { readonly uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-plain`} x2="0" y2="1">
          <stop offset="0" stopColor="#b49a72" />
          <stop offset="1" stopColor="#6e5a40" />
        </linearGradient>
      </defs>
      <SkyLights uid={uid} moon={[300, 50]} sun={[300, 64]} seed={101} starDepth={110} />
      <path className="bd-far" d={HILLS} />
      <rect y="132" width="400" height="34" fill={paint(uid, 'mist')} />
      <path d={RISE} fill={paint(uid, 'plain')} />
      {BLADES.map((b) => (
        <Blade key={`${b.x}-${b.y}`} {...b} />
      ))}
      <rect className="bd-dusk" width="400" height="240" />
      <Snag at={[40, 214]} scale={1.2} seed={104} />
      <Snag at={[262, 180]} scale={0.7} seed={105} />
      <Banner />
      <Memorial />
      <Keeper uid={uid} />
      <Boulder at={[150, 240]} size={16} seed={106} />
      <Tufts from={[0, 238]} to={[400, 236]} count={30} seed={107} height={6} />
    </>
  );
}
