import type { ClayHouse } from './desertTown';
import { ClayHouseShape, WaterJar } from './desertTown';
import { Camel, Palm, SandBarge, WellSweep } from './desertLife';
import { ridge } from './kit';
import { Lantern, SkyLights, paint } from './lights';

/**
 * The landing at the edge of the sand: dunes to the end of the world, shimmering by day; the
 * caravanserai's walled yard with camels at its gate, date palms and a well sweep; and on the
 * big dune the sand priests' barges drawn up with their battened sails, one crewed and lit at
 * the stern, a plank ramp and a heap of ballast stones nobody in town will carry. Clay and sand
 * keep their own colours under the dusk wash (`bd-dusk`).
 */

const SERAI: readonly ClayHouse[] = [
  { x: 30, w: 30, top: 150, base: 186, dome: true },
  { x: 92, w: 34, top: 156, base: 186, dome: true },
];

const WALL =
  'M8 202V166h6v-4h6v4h10v-4h6v4h10v-4h6v4h10v-4h6v4h10v-4h6v4h10v-4h6v4h10v-4h6v4h10v-4h6v4h8V202Z';

const STONES: readonly [number, number, number][] = [
  [262, 226, 5],
  [271, 228, 4],
  [266, 220, 4],
  [278, 224, 3.4],
  [256, 230, 3.6],
];

export function BargeLanding({ uid }: { readonly uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-dune`} x2="0" y2="1">
          <stop offset="0" stopColor="#f2c584" />
          <stop offset="1" stopColor="#d49456" />
        </linearGradient>
      </defs>
      <SkyLights uid={uid} moon={[64, 40]} sun={[70, 38]} seed={31} starDepth={110} />
      <path
        d={ridge({ x1: 400, y: 156, amp: 8, seed: 3, bottom: 200 })}
        fill="#efcf9c"
        opacity=".65"
      />
      <path
        d={ridge({ x1: 400, y: 166, amp: 12, seed: 9, bottom: 210 })}
        fill="#e6b47a"
        opacity=".8"
      />
      <g className="bd-day" stroke="#fff6e0" strokeOpacity=".35" strokeWidth="1" fill="none">
        <path d="M150 160q8-2 16 0t16 0M210 164q8-2 16 0t16 0M330 158q6-2 12 0t12 0" />
      </g>
      {SERAI.map((h) => (
        <ClayHouseShape key={h.x} uid={uid} house={h} />
      ))}
      <path d={WALL} fill="#d9a46c" />
      <path d="M8 172h134" stroke="#a8703f" strokeWidth="1.2" />
      <path d="M66 202v-18a9 9 0 0 1 18 0v18z" fill="#4a2a18" />
      <circle className="bd-lit" cx="75" cy="190" r="22" fill={paint(uid, 'glow')} />
      <path d="M68 202v-17a7 7 0 0 1 14 0v17z" className="bd-lamp" fill={paint(uid, 'shoji')} />
      <Palm at={[28, 204]} h={46} lean={-6} />
      <Palm at={[150, 202]} h={54} lean={8} />
      <Camel at={[106, 204]} scale={0.9} />
      <Camel at={[126, 206]} scale={0.8} facing={-1} />
      <WellSweep at={[184, 206]} />
      <path
        d="M210 240C230 196 270 168 330 160C360 156 384 160 400 166V240Z"
        fill={paint(uid, 'dune')}
      />
      <path
        d="M330 160C360 156 384 160 400 166V240H352C356 210 350 182 330 160Z"
        fill="#b87a44"
        opacity=".55"
      />
      <SandBarge uid={uid} barge={{ at: [300, 172], len: 70, facing: -1 }} />
      <SandBarge uid={uid} barge={{ at: [340, 204], len: 96, facing: -1, crewed: true }} />
      <path d="M232 236L292 206" stroke="#5a3420" strokeWidth="6" />
      <path d="M240 232l3 6M252 226l3 6M264 220l3 6M276 214l3 6" stroke="#3a2416" strokeWidth="1" />
      {STONES.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#8a7a66" />
      ))}
      <path d="M0 214C60 206 140 208 230 222L250 240H0Z" fill={paint(uid, 'dune')} />
      <WaterJar at={[48, 232]} h={16} />
      <path d="M218 240V188" stroke="#3a2416" strokeWidth="2" />
      <path d="M218 190h10" stroke="#3a2416" strokeWidth="1.5" />
      <Lantern uid={uid} at={[228, 200]} size={5} white />
      <g stroke="#fff3d6" strokeOpacity=".45" fill="none" strokeWidth="1">
        <path d="M20 226c30-4 60-4 90 0M120 232c24-3 50-3 74 0" />
      </g>
      <rect className="bd-dusk" width="400" height="240" />
    </>
  );
}
