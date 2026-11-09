import type { House } from './buildings';
import { Townhouse } from './buildings';
import { ridge } from './kit';
import { Lantern, SkyLights, paint } from './lights';
import { Tufts } from './terrain';
import { Willow } from './trees';

/**
 * A highway town: the great road running straight away to the hills, inns lining one side of it
 * smaller and smaller into the distance, a mile post at the roadside, willows along the ditch on
 * the other, and a teahouse bench with its red parasol for those just come in.
 */

const VANISH: readonly [number, number] = [236, 160];
const HILLS = ridge({ x1: 400, y: 150, amp: 22, seed: 121, bottom: 240, freq: 1.4 });
const NEAR_HILLS = ridge({ x1: 400, y: 166, amp: 10, seed: 122, bottom: 240, freq: 2.2 });

/** Inns from the near corner back to the bend, each smaller and higher than the last. */
const INNS: readonly House[] = [
  { x: -12, w: 70, base: 236, h: 64, noren: '#2e3d6b' },
  { x: 60, w: 52, base: 214, h: 46, noren: '#6b3a22' },
  { x: 114, w: 38, base: 198, h: 32, noren: '#2f5a4a' },
  { x: 154, w: 28, base: 186, h: 23, noren: '#8a2b22' },
  { x: 184, w: 20, base: 177, h: 16 },
  { x: 206, w: 14, base: 171, h: 11 },
];

function MilePost() {
  return (
    <g>
      <rect className="bd-front" x="250" y="196" width="6" height="34" />
      <path className="bd-front" d="M249 196l4 -4l4 4z" />
      <path
        d="M252 202v20"
        stroke="#e8dcc4"
        strokeOpacity=".4"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
    </g>
  );
}

function Teahouse({ uid }: { readonly uid: string }) {
  return (
    <g>
      <path d="M330 206Q346 192 362 206Z" fill="#b8352a" />
      <path className="bd-front-stroke" d="M346 200V230" strokeWidth="1.4" />
      <rect x="320" y="222" width="52" height="4" fill="#a8423a" />
      <path className="bd-front-stroke" d="M324 226v8M368 226v8" strokeWidth="1.4" />
      <Lantern uid={uid} at={[380, 210]} size={2.6} />
    </g>
  );
}

export function HighwayTown({ uid }: { readonly uid: string }) {
  const [vx, vy] = VANISH;
  return (
    <>
      <SkyLights uid={uid} moon={[320, 50]} sun={[330, 48]} seed={121} starDepth={120} />
      <path className="bd-far" d={HILLS} />
      <path className="bd-mid" d={NEAR_HILLS} />
      <rect y="150" width="400" height="30" fill={paint(uid, 'mist')} />
      <path className="bd-near" d={`M-10 240V${vy + 6}H410V240Z`} />
      <path d={`M${vx - 3} ${vy}H${vx + 3}L320 240H130Z`} fill="#b8a889" opacity=".3" />
      <path
        d={`M${vx} ${vy}L226 240M${vx} ${vy}L250 240`}
        stroke="#7a6a50"
        strokeOpacity=".3"
        strokeDasharray="3 6"
      />
      {[...INNS].reverse().map((h) => (
        <Townhouse key={h.x} uid={uid} house={{ ...h, storeys: h.h > 40 ? 2 : 1 }} />
      ))}
      <Lantern uid={uid} at={[64, 186]} size={3} white />
      <Lantern uid={uid} at={[116, 178]} size={2.2} white />
      <Willow at={[290, 196]} scale={0.6} seed={123} />
      <Willow at={[262, 182]} scale={0.4} seed={124} />
      <Willow at={[392, 236]} scale={1.3} seed={125} />
      <MilePost />
      <Teahouse uid={uid} />
      <Tufts from={[270, 236]} to={[400, 232]} count={14} seed={126} />
    </>
  );
}
