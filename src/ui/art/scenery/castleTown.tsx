import type { House } from './buildings';
import { Townhouse } from './buildings';
import { r1, ridge } from './kit';
import { Clouds, LanternString, SkyLights, paint } from './lights';
import { Cypress } from './trees';

/**
 * A castle town: the keep on its hill, white walls under three tiers of dark roofs on a sloped
 * stone base, the town's roofs crowding down from it, and in front the festival street with its
 * lantern strings and stalls.
 */

const HILLS = ridge({ x1: 400, y: 150, amp: 20, seed: 111, bottom: 240, freq: 1.1 });

/** The keep's tiers from the bottom up: half-width, wall height. */
const TIERS = [
  [34, 18],
  [26, 16],
  [18, 14],
] as const;

const KEEP_X = 270;
const KEEP_BASE = 132;

const STREET: readonly House[] = [
  { x: -8, w: 58, base: 238, h: 62, noren: '#8a2b22' },
  { x: 52, w: 46, base: 236, h: 48, noren: '#2e3d6b' },
  { x: 300, w: 48, base: 236, h: 50, noren: '#6b3a22' },
  { x: 350, w: 60, base: 238, h: 66, noren: '#8a2b22' },
];

const TOWN: readonly House[] = [130, 168, 206, 244, 282, 320, 358].map((x, i) => ({
  x,
  w: 36,
  base: 190 + (i % 2) * 4,
  h: 22 + (i % 3) * 4,
}));

/** Each tier stands on the roof of the one below. */
const KEEP_TIERS = (() => {
  let foot: number = KEEP_BASE;
  return TIERS.map(([half, wall]) => {
    const tier = { half, top: foot - wall, foot };
    foot = tier.top - 6;
    return tier;
  });
})();
const KEEP_TOP = (KEEP_TIERS[KEEP_TIERS.length - 1]?.top ?? KEEP_BASE) - 6;

/** The keep: a battered stone base, then white tiers each under its own flared roof. */
function Keep({ uid }: { readonly uid: string }) {
  const tiers = KEEP_TIERS;
  const y = KEEP_TOP;
  return (
    <g>
      <path
        d={`M${KEEP_X - 52} 168L${KEEP_X - 40} ${KEEP_BASE}H${KEEP_X + 40}L${KEEP_X + 52} 168Z`}
        fill="#7a7468"
      />
      <path
        d={`M${KEEP_X - 46} 150H${KEEP_X + 46}M${KEEP_X - 49} 160H${KEEP_X + 49}`}
        stroke="#4e4a42"
        strokeOpacity=".5"
      />
      {tiers.map((t) => (
        <g key={t.top}>
          <rect
            x={KEEP_X - t.half}
            y={t.top}
            width={t.half * 2}
            height={t.foot - t.top}
            fill="#e8e2d4"
          />
          <rect
            className="bd-lamp"
            x={KEEP_X - t.half * 0.5}
            y={r1(t.top + 4)}
            width={r1(t.half)}
            height="4"
            fill={paint(uid, 'shoji')}
          />
          <path
            className="bd-roof"
            d={`M${KEEP_X - t.half - 10} ${t.top + 2}Q${KEEP_X} ${t.top - 4} ${KEEP_X + t.half + 10} ${t.top + 2}L${KEEP_X + t.half - 2} ${t.top - 7}H${KEEP_X - t.half + 2}Z`}
          />
        </g>
      ))}
      <path
        d={`M${KEEP_X - 6} ${y - 4}l-4 -3M${KEEP_X + 6} ${y - 4}l4 -3`}
        stroke="#d8b450"
        strokeWidth="2"
      />
    </g>
  );
}

export function CastleTown({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[90, 50]} sun={[80, 44]} seed={111} starDepth={110} />
      <Clouds at={[300, 40]} scale={0.8} />
      <path className="bd-far" d={HILLS} />
      <path
        className="bd-mid"
        d="M170 240V170C210 160 240 158 270 158C300 158 330 162 370 172V240Z"
      />
      <Keep uid={uid} />
      <Cypress at={[214, 168]} scale={0.6} seed={112} />
      <Cypress at={[330, 170]} scale={0.55} seed={113} />
      <rect y="166" width="400" height="30" fill={paint(uid, 'mist')} />
      {TOWN.map((h) => (
        <Townhouse key={h.x} uid={uid} house={h} />
      ))}
      <path className="bd-near" d="M-10 240V206C80 200 200 198 410 204V240Z" />
      {STREET.map((h) => (
        <Townhouse key={h.x} uid={uid} house={{ ...h, storeys: 2 }} />
      ))}
      <LanternString
        uid={uid}
        from={[50, 196]}
        to={[300, 194]}
        hang={{ sag: 16, count: 9, size: 3 }}
      />
      <LanternString
        uid={uid}
        from={[98, 210]}
        to={[300, 206]}
        hang={{ sag: 10, count: 6, size: 2.6 }}
      />
      <g>
        <path className="bd-front" d="M128 232h40v-14h-40z" />
        <path d="M124 220l24 -8l24 8z" fill="#8a2b22" />
        <path className="bd-front" d="M214 232h44v-14h-44z" />
        <path d="M210 220l26 -8l26 8z" fill="#2e3d6b" />
        <rect
          className="bd-lamp"
          x="134"
          y="222"
          width="28"
          height="5"
          fill={paint(uid, 'shoji')}
        />
        <rect
          className="bd-lamp"
          x="220"
          y="222"
          width="32"
          height="5"
          fill={paint(uid, 'shoji')}
        />
      </g>
    </>
  );
}
