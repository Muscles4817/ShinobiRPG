import type { House } from './buildings';
import { Pagoda, Torii, Townhouse } from './buildings';
import { ridge } from './kit';
import { Clouds, LanternString, SkyLights, paint } from './lights';
import { FallingPetals, SakuraBough } from './nature';

/**
 * Lantern rooftops: a town of lit townhouses under a five-storey pagoda, lantern strings
 * across the lane, a torii at its end and a sakura bough in the corner. Drawn 400×240 and
 * anchored to the bottom, so a short banner still shows the lane and its lanterns.
 */

const FAR = ridge({ x1: 400, y: 150, amp: 34, seed: 3, bottom: 240, freq: 1.2 });
const MID = ridge({ x1: 400, y: 170, amp: 22, seed: 11, bottom: 240, freq: 1.8 });

const HOUSES: readonly House[] = [
  { x: -6, w: 64, base: 238, h: 70, noren: '#2e3d6b' },
  { x: 62, w: 50, base: 236, h: 54, noren: '#8a2b22' },
  { x: 282, w: 50, base: 236, h: 56, noren: '#2f5a4a' },
  { x: 336, w: 70, base: 238, h: 78, noren: '#8a2b22' },
];

/** Low roofs of the far side of town, stepping up the slope. */
const BACK_ROW = [176, 204, 234, 262, 292, 322, 352, 382].map((x, i) => ({
  x,
  h: 12 + ((i * 7) % 9),
  lit: i % 3 !== 1,
}));

/** Someone keeping watch from the tallest ridge, cut out against the sky. */
function Watcher() {
  return (
    <g className="bd-front" transform="translate(372 147) scale(.75) translate(-356 -336)">
      <circle cx="356" cy="309" r="4.2" />
      <path d="M352 308Q344 304 337 308Q345 307 352 310ZM354 314Q340 312 330 319Q342 317 353 318ZM352 313Q349 321 352 327L362 327Q362 319 359 313ZM352 327L345 336H360V329ZM358 327L366 322L369 336H364L363 329ZM358 315L367 323L365 325L356 319Z" />
    </g>
  );
}

export function LanternRooftops({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[246, 58]} sun={[250, 50]} seed={7} />
      <Clouds at={[214, 70]} scale={0.9} />
      <Clouds at={[-30, 104]} scale={0.7} />
      <path className="bd-far" d={FAR} />
      <path className="bd-mid" d={MID} />
      <rect y="150" width="400" height="44" fill={paint(uid, 'mist')} />
      <path
        className="bd-near"
        d="M-10 200C40 178 86 172 130 176C176 180 214 190 244 200V240H-10Z"
      />
      <path className="bd-front" d="M64 188H156L166 210H54Z" />
      <path
        className="bd-tile"
        d="M60 196H160M57 203H163M84 188v8M110 188v8M136 188v8M72 196v7M98 196v7M124 196v7M150 196v7"
        strokeWidth="1"
      />
      <Pagoda uid={uid} at={[110, 188]} scale={0.8} />
      {BACK_ROW.map((b) => (
        <g key={b.x}>
          <path
            className="bd-roof"
            d={`M${b.x - 4} ${196 - b.h}L${b.x + 4} ${188 - b.h}H${b.x + 22}L${b.x + 30} ${196 - b.h}Z`}
          />
          <rect className="bd-near" x={b.x} y={196 - b.h} width="26" height={b.h + 30} />
          {b.lit && (
            <rect
              className="bd-lamp"
              x={b.x + 8}
              y={200 - b.h}
              width="6"
              height="5"
              fill="#ffc070"
            />
          )}
        </g>
      ))}
      <rect y="186" width="400" height="40" fill={paint(uid, 'mist')} />
      {HOUSES.map((h) => (
        <Townhouse key={h.x} uid={uid} house={h} />
      ))}
      <Watcher />
      <path d="M0 232H400V240H0Z" fill={paint(uid, 'ground')} />
      <Torii at={[166, 196]} w={68} h={42} />
      <LanternString
        uid={uid}
        from={[60, 182]}
        to={[284, 186]}
        hang={{ sag: 7, count: 7, size: 3.2 }}
      />
      <LanternString
        uid={uid}
        from={[-4, 204]}
        to={[340, 200]}
        hang={{ sag: 11, count: 9, size: 4.2 }}
      />
      <SakuraBough transform="matrix(-.55 0 0 .55 404 36)" />
      <FallingPetals seed={19} />
    </>
  );
}
