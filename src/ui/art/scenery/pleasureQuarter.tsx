import type { House } from './buildings';
import { Townhouse } from './buildings';
import { r1, scatter } from './kit';
import { LanternString, SkyLights, paint } from './lights';
import { Willow } from './trees';

/**
 * A pleasure quarter: a gated street of tall houses that never sleep, every window lit, banners
 * hanging down their fronts, strings of red lanterns criss-crossing overhead, the great gate at
 * the near end and the glow of the whole district lighting the sky above it.
 */

const LEFT: readonly House[] = [
  { x: -10, w: 54, base: 240, h: 92, noren: '#8a2b22' },
  { x: 46, w: 40, base: 222, h: 70, noren: '#6b2a4a' },
  { x: 88, w: 32, base: 208, h: 54, noren: '#8a2b22' },
  { x: 122, w: 24, base: 198, h: 40 },
];

const RIGHT: readonly House[] = [
  { x: 356, w: 56, base: 240, h: 96, noren: '#6b2a4a' },
  { x: 316, w: 40, base: 222, h: 72, noren: '#8a2b22' },
  { x: 282, w: 32, base: 208, h: 56, noren: '#2e3d6b' },
  { x: 256, w: 24, base: 198, h: 42 },
];

const BACK = (() => {
  const next = scatter(131);
  return Array.from({ length: 9 }, (_, i) => ({
    x: 140 + i * 13,
    w: 14,
    h: r1(14 + next() * 26),
  }));
})();

const BANNERS = [
  { x: 30, y: 168, h: 34, c: '#c8432e' },
  { x: 70, y: 166, h: 28, c: '#e0c690' },
  { x: 334, y: 162, h: 30, c: '#e0c690' },
  { x: 384, y: 164, h: 38, c: '#c8432e' },
];

function Gate() {
  return (
    <g>
      <path className="bd-front" d="M146 240V180h11V240ZM243 240V180h11V240Z" />
      <path className="bd-roof" d="M128 186Q200 174 272 186L262 170H138Z" />
      <path className="bd-rim" d="M128 186Q200 174 272 186" strokeWidth="1" fill="none" />
      <rect x="180" y="180" width="40" height="11" fill="#2a1a1a" />
      <rect x="146" y="196" width="108" height="5" className="bd-front" />
      <path d="M186 185.5h28" stroke="#e8c070" strokeWidth="1.6" strokeDasharray="3 2" />
    </g>
  );
}

export function PleasureQuarter({ uid }: { readonly uid: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-district`} cx=".5" cy="1" r=".7">
          <stop offset="0" stopColor="#ff9a5a" stopOpacity=".5" />
          <stop offset="1" stopColor="#ff9a5a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <SkyLights uid={uid} moon={[310, 40]} sun={[320, 36]} seed={131} starDepth={90} />
      <rect
        className="bd-lit"
        x="40"
        y="60"
        width="320"
        height="140"
        fill={paint(uid, 'district')}
      />
      <g className="bd-mid">
        {BACK.map((b) => (
          <rect key={b.x} x={b.x} y={190 - b.h} width={b.w} height={b.h + 10} />
        ))}
      </g>
      <g>
        {BACK.map((b) => (
          <rect
            key={b.x}
            className="bd-lamp"
            x={b.x + 4}
            y={194 - b.h}
            width="6"
            height="3"
            fill={paint(uid, 'shoji')}
          />
        ))}
      </g>
      <path className="bd-near" d="M-10 240V198H410V240Z" />
      <path d="M150 240L190 198H210L250 240Z" fill="#c8a070" opacity=".18" />
      {[...LEFT].reverse().map((h) => (
        <Townhouse key={h.x} uid={uid} house={{ ...h, storeys: 3 }} />
      ))}
      {[...RIGHT].reverse().map((h) => (
        <Townhouse key={h.x} uid={uid} house={{ ...h, storeys: 3 }} />
      ))}
      {BANNERS.map((b) => (
        <rect key={b.x} x={b.x} y={b.y} width="7" height={b.h} fill={b.c} opacity=".85" />
      ))}
      <LanternString
        uid={uid}
        from={[120, 160]}
        to={[282, 154]}
        hang={{ sag: 12, count: 7, size: 2.2 }}
      />
      <LanternString
        uid={uid}
        from={[86, 154]}
        to={[316, 150]}
        hang={{ sag: 20, count: 9, size: 2.8 }}
      />
      <LanternString
        uid={uid}
        from={[44, 150]}
        to={[356, 146]}
        hang={{ sag: 28, count: 11, size: 3.4 }}
      />
      <Gate />
      <Willow at={[132, 240]} scale={0.8} seed={132} />
    </>
  );
}
