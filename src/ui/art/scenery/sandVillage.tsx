import type { ClayHouse } from './desertTown';
import { Awning, ClayHouseShape, KazeTower, WaterJar } from './desertTown';
import { CollaredHound } from './desertLife';
import { ridge } from './kit';
import { SkyLights, paint } from './lights';

/**
 * The village hidden in the sand: a ring of cliffs round a crater in the deep desert, the open
 * desert showing through the gorge, the Kazekage's domed tower over clay houses with round lit
 * windows, shade-cloths strung between the roofs, and the Outer Ring's bazaar in front, under
 * striped awnings, with water jars and a collared hound of the Breaking Pens on the step. The
 * clay and rock keep their own colours under the dusk wash (`bd-dusk`).
 */

const ROCK = '#c48a58';
const ROCK_SHADE = '#8a5634';
const STRATA = '#6e4026';

const BACK_HOUSES: readonly ClayHouse[] = [
  { x: 92, w: 30, top: 146, base: 196, dome: true },
  {
    x: 128,
    w: 40,
    top: 156,
    base: 196,
    windows: [
      [0.3, 0.45],
      [0.7, 0.45],
    ],
  },
  { x: 258, w: 34, top: 150, base: 196, dome: true },
  { x: 298, w: 30, top: 160, base: 196 },
];

const FRONT_HOUSES: readonly ClayHouse[] = [
  {
    x: 18,
    w: 54,
    top: 160,
    base: 214,
    windows: [
      [0.25, 0.35],
      [0.6, 0.35],
      [0.25, 0.7],
    ],
  },
  { x: 150, w: 38, top: 172, base: 214, dome: true },
  {
    x: 232,
    w: 46,
    top: 168,
    base: 214,
    windows: [
      [0.3, 0.4],
      [0.7, 0.4],
    ],
  },
  {
    x: 330,
    w: 62,
    top: 158,
    base: 214,
    dome: true,
    windows: [
      [0.25, 0.4],
      [0.55, 0.4],
      [0.4, 0.75],
    ],
  },
];

/** The crater's wall on one side: a flat-topped cliff with a lit face and banded strata. */
function CliffWall({
  d,
  shade,
  strata,
}: {
  readonly d: string;
  readonly shade: string;
  readonly strata: string;
}) {
  return (
    <g>
      <path d={d} fill={ROCK} />
      <path d={shade} fill={ROCK_SHADE} opacity=".8" />
      <path d={strata} stroke={STRATA} strokeOpacity=".45" strokeWidth="1.2" fill="none" />
    </g>
  );
}

export function SandVillage({ uid }: { readonly uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-street`} x2="0" y2="1">
          <stop offset="0" stopColor="#e9b980" />
          <stop offset="1" stopColor="#b8814e" />
        </linearGradient>
      </defs>
      <SkyLights uid={uid} moon={[318, 40]} sun={[310, 36]} seed={23} starDepth={90} />
      <path
        d={ridge({ x0: 100, x1: 320, y: 150, amp: 10, seed: 5, bottom: 200 })}
        fill="#e7bd86"
        opacity=".7"
      />
      <CliffWall
        d="M0 240V68l14-4 18 3 22-6 20 4 14-2 18 5 8 30 10 40 6 60V240Z"
        shade="M98 68l8 30 10 40 6 60V240H96c4-50 6-110 2-172z"
        strata="M0 96h96M0 124h104M0 150h112M0 174h116"
      />
      <CliffWall
        d="M400 240V76l-16-3-20 5-18-4-16 3-12 6-8 34-8 44-4 60V240Z"
        shade="M310 83l-8 34-8 44-4 60V240h20c-4-50-4-110 0-138z"
        strata="M400 104H306M400 130H300M400 156H296M400 180H294"
      />
      <path d="M118 164c40-6 80-6 120 0s50 4 64-2v40H118z" fill="#d6a06a" />
      {BACK_HOUSES.map((h) => (
        <ClayHouseShape key={h.x} uid={uid} house={h} />
      ))}
      <KazeTower uid={uid} at={[212, 200]} />
      <path d="M122 150q20 8 36 4M262 152q18 8 34 2" stroke="#efe0c0" strokeWidth="1" fill="none" />
      <path d="M126 150l14 8 18-6zM266 152l14 7 16-5z" fill="#efe0c0" opacity=".8" />
      {FRONT_HOUSES.map((h) => (
        <ClayHouseShape key={h.x} uid={uid} house={h} />
      ))}
      <path d="M72 178h78M188 186h44M278 182h52" stroke="#5a3420" strokeWidth="2" />
      <path d="M0 214H400V240H0Z" fill={paint(uid, 'street')} />
      <Awning at={[24, 196]} w={44} />
      <Awning at={[236, 198]} w={40} />
      <Awning at={[336, 194]} w={52} />
      <WaterJar at={[94, 230]} h={18} />
      <WaterJar at={[108, 232]} h={13} />
      <WaterJar at={[300, 230]} h={16} />
      <g stroke="#fff3d6" strokeOpacity=".45" fill="none" strokeWidth="1">
        <path d="M120 222c30-4 60-4 90 0M220 232c26-3 50-3 74 0M10 236c20-2 40-2 60 0" />
      </g>
      <CollaredHound at={[192, 236]} />
      <rect className="bd-dusk" width="400" height="240" />
      <g className="bd-lit">
        {[...BACK_HOUSES, ...FRONT_HOUSES].map((h) => (
          <circle
            key={h.x}
            cx={h.x + h.w / 2}
            cy={h.top + (h.base - h.top) * 0.45}
            r="14"
            fill={paint(uid, 'glow')}
          />
        ))}
      </g>
    </>
  );
}
