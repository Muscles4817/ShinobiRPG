import type { Point } from './kit';
import { ridge } from './kit';
import { SkyLights, paint } from './lights';
import type { DrumTower, StiltHouseSpec } from './waterTown';
import {
  DomedTower,
  DriftLantern,
  DryingNet,
  LanternBoat,
  PlankBridge,
  RulersTower,
  StiltHouse,
  StoneLantern,
} from './waterTown';

/**
 * The village hidden in the mist: grey islands behind, the ruler's tower standing out of the
 * fog over ranks of domed drum towers, plank bridges between them, stilt houses and drying
 * nets along the canal, a lantern boat at anchor, lanterns floating out on the tide, and the
 * water holding a dim copy of all of it.
 */

const WATERLINE = 200;

const FAR_TOWERS: readonly DrumTower[] = [
  { x: 14, w: 26, top: 120, base: 184 },
  { x: 58, w: 20, top: 132, base: 184 },
  { x: 262, w: 30, top: 114, base: 184 },
  { x: 318, w: 22, top: 128, base: 184 },
  { x: 362, w: 30, top: 118, base: 184 },
];

const MID_TOWERS: readonly DrumTower[] = [
  { x: 96, w: 38, top: 140, base: WATERLINE },
  { x: 232, w: 44, top: 132, base: WATERLINE },
  { x: 296, w: 30, top: 150, base: WATERLINE },
];

const HOUSES: readonly StiltHouseSpec[] = [
  { x: -6, w: 66, h: 30 },
  { x: 70, w: 38, h: 22 },
  { x: 330, w: 76, h: 34 },
];

const DRIFT: readonly Point[] = [
  [128, 226],
  [160, 233],
  [196, 222],
  [256, 229],
  [292, 220],
  [318, 234],
];

const SHIMMER = 'M24 214h30M90 224h44M150 214h26M214 236h40M262 218h36M300 228h28M352 216h34';

export function MistVillage({ uid }: { readonly uid: string }) {
  return (
    <>
      <SkyLights uid={uid} moon={[66, 44]} sun={[74, 42]} seed={17} starDepth={60} />
      <path
        className="bd-far"
        opacity=".55"
        d={ridge({ x1: 160, y: 156, amp: 30, seed: 7, bottom: 200 })}
      />
      <path
        className="bd-far"
        opacity=".55"
        d={ridge({ x0: 230, x1: 400, y: 150, amp: 34, seed: 11, bottom: 200 })}
      />
      <rect y="120" width="400" height="60" fill={paint(uid, 'mist')} />
      {FAR_TOWERS.map((t) => (
        <DomedTower key={t.x} uid={uid} tower={t} className="bd-far" lit={[0.35]} />
      ))}
      <RulersTower uid={uid} at={[166, 186]} />
      <rect y="150" width="400" height="44" fill={paint(uid, 'mist')} />
      {MID_TOWERS.map((t) => (
        <DomedTower key={t.x} uid={uid} tower={t} className="bd-mid" lit={[0.28, 0.6]} />
      ))}
      <PlankBridge from={[134, 168]} to={[232, 164]} sag={7} />
      <PlankBridge from={[276, 160]} to={[296, 168]} sag={3} />
      <rect className="bd-sea" y={WATERLINE} width="400" height={240 - WATERLINE} />
      <g opacity=".22">
        {MID_TOWERS.map((t) => (
          <rect
            key={t.x}
            className="bd-mid"
            x={t.x + 3}
            y={WATERLINE}
            width={t.w - 6}
            height="26"
          />
        ))}
      </g>
      <rect y={WATERLINE - 12} width="400" height="26" fill={paint(uid, 'mist')} />
      {HOUSES.map((h) => (
        <StiltHouse key={h.x} uid={uid} house={h} waterline={WATERLINE} />
      ))}
      <path className="bd-front" d={`M108 ${WATERLINE - 6}h222v3h-222Z`} />
      <path
        className="bd-front-stroke"
        d={`M126 ${WATERLINE - 6}v14M176 ${WATERLINE - 6}v14M226 ${WATERLINE - 6}v14M276 ${WATERLINE - 6}v14M318 ${WATERLINE - 6}v14`}
        strokeWidth="2"
      />
      <DryingNet from={[138, 176]} to={[182, 176]} />
      <LanternBoat uid={uid} at={[176, 218]} />
      {DRIFT.map((d) => (
        <DriftLantern key={d[0]} uid={uid} at={d} />
      ))}
      <g stroke="#e6eef4" strokeOpacity=".28" strokeWidth="1">
        <path d={SHIMMER} />
      </g>
      <rect y="214" width="400" height="26" fill={paint(uid, 'mist')} />
      <path className="bd-front" d="M22 240V206h7V240ZM-2 240C10 232 24 230 40 236L44 240Z" />
      <StoneLantern uid={uid} at={[62, 226]} />
      <path className="bd-front" d="M360 240C366 226 384 222 404 226V240Z" />
    </>
  );
}
