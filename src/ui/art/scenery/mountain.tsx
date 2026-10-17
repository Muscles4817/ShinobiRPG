import { Torii } from './buildings';
import { r1, ridge } from './kit';
import { Lantern, SkyLights, paint } from './lights';
import { Pine } from './nature';

/**
 * The mountains: a snow peak over ranges fading into mist, and a shrine on the near slope
 * with lanterns at its door, a torii and stone steps climbing to it between pines.
 */

const RANGES = [
  {
    d: ridge({ x1: 400, y: 150, amp: 40, seed: 31, bottom: 240, freq: 0.9 }),
    className: 'bd-far',
    mist: 160,
  },
  {
    d: ridge({ x1: 400, y: 172, amp: 30, seed: 32, bottom: 240, freq: 1.4 }),
    className: 'bd-mid',
    mist: 182,
  },
  {
    d: ridge({ x1: 400, y: 192, amp: 22, seed: 33, bottom: 240, freq: 1.9 }),
    className: 'bd-near',
    mist: 202,
  },
] as const;

const STEPS = Array.from({ length: 14 }, (_, i) => {
  const t = i / 13;
  const w = 24 - t * 15;
  return {
    x: r1(214 + t * 30 - w / 2),
    y: r1(236 - t * 66),
    w: r1(w),
    h: r1(2.2 - t),
    o: r1(0.8 - t * 0.4),
  };
});

export function Mountain({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[64, 58]} sun={[70, 52]} seed={5} starDepth={90} />
      <path className="bd-far" d="M70 160L134 60L160 98L176 80L234 160Z" opacity=".75" />
      <path d="M122 78L134 60L146 78L140 76L134 84L128 76Z" fill="#fff4f0" opacity=".85" />
      {RANGES.map((r) => (
        <g key={r.className}>
          <path className={r.className} d={r.d} />
          <rect y={r.mist} width="400" height="30" fill={paint(uid, 'mist')} />
        </g>
      ))}
      <path
        className="bd-front"
        d="M150 240C180 204 210 176 260 162C300 154 340 158 410 166V240Z"
      />
      <g fill="#a89ab8">
        {STEPS.map((s) => (
          <rect key={s.y} x={s.x} y={s.y} width={s.w} height={s.h} opacity={s.o} />
        ))}
      </g>
      <g className="bd-front">
        <rect x="240" y="142" width="34" height="22" />
        <path d="M230 144Q257 138 284 144L276 130H238Z" />
        <path d="M244 130Q257 122 270 130L266 124H248Z" />
      </g>
      <path className="bd-rim" d="M230 144Q257 138 284 144" strokeWidth="1" fill="none" />
      <rect className="bd-lamp" x="252" y="150" width="10" height="12" fill={paint(uid, 'shoji')} />
      <Lantern uid={uid} at={[236, 154]} size={2.6} />
      <Lantern uid={uid} at={[278, 154]} size={2.6} />
      <Torii at={[226, 180]} w={30} h={24} />
      <path className="bd-front" d="M-10 240V196C20 186 60 188 90 202C110 212 124 226 132 240Z" />
      <Pine at={[52, 200]} scale={1.3} />
      <Pine at={[362, 172]} scale={0.9} />
    </>
  );
}
