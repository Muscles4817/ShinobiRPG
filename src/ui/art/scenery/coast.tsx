import { Torii } from './buildings';
import { r1, ridge, scatter } from './kit';
import { Clouds, SkyLights, paint } from './lights';
import { Pine } from './nature';

/**
 * The coast: a calm sea under the sky, light laid on the water, a torii standing in the
 * shallows, a sail on the horizon and a pine on the headland above a lit fisher's hut.
 */

const HORIZON = 154;
const ISLANDS = ridge({ x0: 170, x1: 400, y: 150, amp: 10, seed: 4, bottom: HORIZON + 2 });

const WAVES = (() => {
  const next = scatter(21);
  return Array.from({ length: 30 }, () => {
    const y = HORIZON + 6 + next() ** 1.4 * 80;
    const w = 8 + (y - HORIZON) * 0.35;
    return {
      d: `M${r1(next() * 400)} ${r1(y)}q${r1(w / 2)} -${r1(w * 0.12)} ${r1(w)} 0`,
      o: r1(0.15 + (y - HORIZON) / 260),
    };
  });
})();

const GLITTER = [
  [244, 166, 20],
  [240, 178, 28],
  [236, 194, 36],
  [232, 214, 44],
] as const;

export function Coast({ uid }: { readonly uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-shine`} x2="0" y2="1">
          <stop offset="0" stopColor="#fff1d0" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff1d0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <SkyLights uid={uid} moon={[254, 74]} sun={[254, 110]} seed={21} starDepth={110} />
      <Clouds at={[30, 70]} scale={0.8} />
      <Clouds at={[250, 50]} scale={0.6} />
      <path className="bd-far" d={ISLANDS} opacity=".8" />
      <rect className="bd-sea" y={HORIZON} width="400" height={240 - HORIZON} />
      <rect y={HORIZON} width="400" height="26" fill={`url(#${uid}-shine)`} />
      <path d={`M254 ${HORIZON}L234 240H274Z`} fill={`url(#${uid}-shine)`} />
      <g fill="#fff1d0" opacity=".65">
        {GLITTER.map(([x, y, w]) => (
          <rect key={y} x={x} y={y} width={w} height="1.6" />
        ))}
      </g>
      <g stroke="#fff3e0" fill="none" strokeWidth="1">
        {WAVES.map((w) => (
          <path key={w.d} d={w.d} strokeOpacity={w.o} />
        ))}
      </g>
      <Torii at={[306, 166]} w={44} h={38} />
      <g fill="#5a2a2a" opacity=".45">
        <rect x="313" y="204" width="3" height="14" />
        <rect x="334" y="204" width="3" height="14" />
      </g>
      <path className="bd-front" d="M156 170h30l-4 5h-22z" />
      <path d="M169 170V148L182 168Z" fill="#efe3c8" opacity=".9" />
      <path
        className="bd-front"
        d="M-10 240V128C10 122 30 124 44 134C60 140 74 152 84 170C96 190 110 220 120 240Z"
      />
      <path className="bd-rim" d="M44 134C60 140 74 152 84 170" strokeWidth="1.2" fill="none" />
      <Pine at={[36, 132]} scale={1.15} />
      <path className="bd-front" d="M92 218h52l-8-10h-36z" />
      <rect className="bd-front" x="98" y="218" width="40" height="22" />
      <rect className="bd-lamp" x="110" y="223" width="8" height="8" fill={paint(uid, 'shoji')} />
      <circle className="bd-lit" cx="114" cy="227" r="16" fill={paint(uid, 'glow')} />
    </>
  );
}
