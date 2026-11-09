import { r1, ridge, scatter } from './kit';
import { Campfire, SkyLights, paint } from './lights';
import { Boulder, Reeds } from './terrain';
import { Willow } from './trees';

/**
 * A braided river plain: shallow channels running over a wide bed of grey shingle,
 * low dry hills on either side, herons standing in the water, and a fire on the near island
 * where travellers wait for the river to fall.
 */

const HORIZON = 150;
const FAR = ridge({ x1: 400, y: 136, amp: 12, seed: 171, bottom: 240, freq: 1.1 });

/** The channels, widening as they come near: each a band of water over the shingle. */
const CHANNELS = [
  'M180 150C170 162 150 170 120 180C80 192 40 200 -10 206V214C50 210 100 200 140 188C170 178 186 166 192 150Z',
  'M210 150C220 164 250 176 290 190C330 204 370 214 410 220V230C360 226 320 214 280 200C240 186 214 170 204 150Z',
  'M196 150C196 172 190 196 170 240H232C214 200 204 172 200 150Z',
];

const HERONS = [
  { x: 100, y: 194, s: 1 },
  { x: 300, y: 204, s: 0.8 },
  { x: 250, y: 178, s: 0.5 },
];

const STONES = (() => {
  const next = scatter(172);
  return Array.from({ length: 40 }, () => {
    const y = HORIZON + 6 + next() ** 1.2 * 84;
    return { x: r1(next() * 400), y: r1(y), r: r1(0.6 + (y - HORIZON) / 40) };
  });
})();

/** A heron standing in the shallows: body, neck and legs. */
function Heron({ x, y, s }: { readonly x: number; readonly y: number; readonly s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="bd-front-stroke" d="M0 0V-10M3 0V-10" strokeWidth="1" />
      <path className="bd-front" d="M-6 -12Q0 -20 8 -14Q2 -9 -6 -12Z" />
      <path
        className="bd-front-stroke"
        d="M6 -16Q8 -24 4 -28L10 -27"
        strokeWidth="1.6"
        fill="none"
      />
    </g>
  );
}

export function RiverPlain({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[96, 46]} sun={[90, 56]} seed={171} starDepth={110} />
      <path className="bd-far" d={FAR} />
      <rect y="130" width="400" height="30" fill={paint(uid, 'mist')} />
      <rect y={HORIZON} width="400" height={240 - HORIZON} fill="#8d8a7e" />
      <g fill="#6e6b62" opacity=".7">
        {STONES.map((st) => (
          <circle key={`${st.x}-${st.y}`} cx={st.x} cy={st.y} r={st.r} />
        ))}
      </g>
      {CHANNELS.map((d) => (
        <path key={d} className="bd-sea" d={d} />
      ))}
      <g stroke="#fff3e0" strokeOpacity=".3" fill="none">
        <path d="M60 204q12 -3 24 0M140 186q10 -2 20 0M300 208q14 -3 28 0M190 214q10 -2 18 0" />
      </g>
      <rect className="bd-dusk" width="400" height="240" />
      <Willow at={[44, 182]} scale={0.5} seed={173} />
      <Willow at={[350, 176]} scale={0.45} seed={174} />
      {HERONS.map((h) => (
        <Heron key={h.x} {...h} />
      ))}
      <Campfire uid={uid} at={[300, 238]} />
      <Reeds at={[20, 240]} count={10} seed={175} scale={1.1} />
      <Reeds at={[384, 240]} count={8} seed={176} />
      <Boulder at={[250, 240]} size={10} seed={177} />
    </>
  );
}
