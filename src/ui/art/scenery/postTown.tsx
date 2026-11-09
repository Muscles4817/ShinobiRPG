import type { House } from './buildings';
import { Townhouse } from './buildings';
import { r1, ridge } from './kit';
import { Clouds, Lantern, SkyLights, paint } from './lights';
import { Boulder, Tufts } from './terrain';
import { Cedar, Maple } from './trees';

/**
 * The post town below the pass: snow on the peaks behind, a row of travellers' inns stepping up
 * the road with lanterns at their doors, and in front the arched wooden bridge the town is named
 * for, over a mountain stream, between autumn maples.
 */

const PEAKS = 'M-10 150L40 96L70 120L110 70L150 112L190 88L240 140L290 84L330 118L370 92L410 150Z';
const SNOW =
  'M98 84L110 70L122 86L116 84L110 92L104 84ZM280 96L290 84L300 98L294 96L290 102L286 96ZM180 98L190 88L198 100L190 104Z';
const FOOTHILLS = ridge({ x1: 400, y: 166, amp: 18, seed: 61, bottom: 240, freq: 1.6 });

const INNS: readonly House[] = [
  { x: 140, w: 44, base: 196, h: 40, noren: '#2e3d6b' },
  { x: 190, w: 40, base: 190, h: 38, noren: '#6b3a22' },
  { x: 236, w: 46, base: 184, h: 40, noren: '#2f5a4a' },
  { x: 288, w: 38, base: 178, h: 34, noren: '#8a2b22' },
];

/** The feather bridge: a high wooden arch on posts, with its rail. */
function Bridge() {
  const arch = 'M190 222Q250 182 310 222';
  return (
    <g>
      <path className="bd-front-stroke" d={arch} strokeWidth="5" fill="none" />
      <path
        className="bd-front-stroke"
        d="M194 210Q250 172 306 210"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        className="bd-front-stroke"
        d={[0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9]
          .map((t) => {
            const x = 190 + t * 120;
            const y = 222 - Math.sin(t * Math.PI) * 30;
            return `M${r1(x)} ${r1(y)}V${r1(y - 11)}`;
          })
          .join('')}
        strokeWidth="1.2"
      />
      <path className="bd-front-stroke" d="M204 214V240M296 214V240" strokeWidth="3" />
      <path className="bd-rim" d={arch} strokeWidth=".9" fill="none" />
    </g>
  );
}

export function PostTown({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[320, 48]} sun={[330, 42]} seed={61} starDepth={80} />
      <Clouds at={[20, 60]} scale={0.7} />
      <path className="bd-far" d={PEAKS} />
      <path d={SNOW} fill="#fff4f0" opacity=".8" />
      <path className="bd-mid" d={FOOTHILLS} />
      <rect y="160" width="400" height="30" fill={paint(uid, 'mist')} />
      <path
        className="bd-near"
        d="M-10 240V200C60 196 120 190 180 184C240 178 300 168 410 160V240Z"
      />
      <path d="M120 240L180 196L330 172L340 176L200 206L160 240Z" fill="#b8a889" opacity=".22" />
      {INNS.map((h) => (
        <Townhouse key={h.x} uid={uid} house={{ ...h, storeys: 2 }} />
      ))}
      {INNS.map((h) => (
        <Lantern key={h.x} uid={uid} at={[h.x + 6, h.base - h.h * 0.42]} size={2.2} white />
      ))}
      <Cedar at={[110, 204]} scale={0.8} seed={62} />
      <Cedar at={[350, 176]} scale={0.7} seed={63} />
      <path className="bd-sea" d="M150 240Q220 226 260 232Q300 238 350 240Z" opacity=".8" />
      <path
        d="M180 238q20 -4 40 0M262 236q20 -3 36 0"
        stroke="#fff3e0"
        strokeOpacity=".35"
        fill="none"
      />
      <Bridge />
      <path className="bd-front" d="M-10 240V214C30 206 80 208 130 222C150 228 166 234 176 240Z" />
      <path
        className="bd-front"
        d="M410 240V208C380 204 350 208 330 220C318 228 312 234 308 240Z"
      />
      <Maple at={[44, 222]} scale={1.2} seed={64} />
      <Maple at={[372, 214]} scale={1} seed={65} />
      <Boulder at={[150, 240]} size={10} seed={66} />
      <Tufts from={[0, 238]} to={[150, 236]} count={18} seed={67} />
    </>
  );
}
