import { SkyLights, paint } from './lights';

/**
 * The dunes: a domed town on the sand, the near dunes lit on one face and shaded on the
 * other, wind lines on their crests. The sand keeps its own colours; after sundown a dusk
 * wash (`bd-dusk`) lies over it, under the lit doorways.
 */

interface Dome {
  readonly x: number;
  readonly w: number;
  readonly y: number;
  readonly h: number;
}

const DOMES: readonly Dome[] = [
  { x: 60, w: 30, y: 138, h: 28 },
  { x: 96, w: 22, y: 132, h: 34 },
  { x: 140, w: 34, y: 142, h: 24 },
  { x: 222, w: 26, y: 140, h: 26 },
  { x: 300, w: 22, y: 146, h: 20 },
];

function DomeHouse({ dome: { x, w, y, h }, uid }: { readonly dome: Dome; readonly uid: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#c98a58" />
      <path d={`M${x} ${y}a${w / 2} ${w / 2.2} 0 0 1 ${w} 0z`} fill="#b87648" />
      <rect x={x + w / 2} y={y} width={w / 2} height={h} fill="#9a5e38" opacity=".55" />
      <rect
        x={x + w * 0.38}
        y={y + h * 0.4}
        width={w * 0.24}
        height={h * 0.6}
        rx={w * 0.12}
        fill="#4a2a1a"
      />
      <rect
        className="bd-lamp"
        x={x + w * 0.38}
        y={y + h * 0.4}
        width={w * 0.24}
        height={h * 0.6}
        rx={w * 0.12}
        fill={paint(uid, 'shoji')}
      />
    </g>
  );
}

export function Dunes({ uid }: { readonly uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-lit`} x2="0" y2="1">
          <stop offset="0" stopColor="#f6c784" />
          <stop offset="1" stopColor="#d89a5a" />
        </linearGradient>
        <linearGradient id={`${uid}-shade`} x2="0" y2="1">
          <stop offset="0" stopColor="#a8643c" />
          <stop offset="1" stopColor="#7a4428" />
        </linearGradient>
      </defs>
      <SkyLights uid={uid} moon={[300, 58]} sun={[300, 50]} seed={17} starDepth={110} />
      <path
        d="M0 152C60 138 110 140 170 150C230 160 300 140 400 146V240H0Z"
        fill="#e2b07a"
        opacity=".75"
      />
      <path d="M124 114h14l-7-12z" fill="#9a5e38" />
      <rect x="126" y="114" width="10" height="52" fill="#b87648" />
      {DOMES.map((d) => (
        <DomeHouse key={d.x} dome={d} uid={uid} />
      ))}
      <path
        d="M0 170C70 150 140 156 200 172C250 186 320 160 400 166V240H0Z"
        fill={paint(uid, 'lit')}
      />
      <path
        d="M200 172C250 186 320 160 400 166V240H260C240 210 220 188 200 172Z"
        fill={paint(uid, 'shade')}
        opacity=".85"
      />
      <path
        d="M0 210C60 190 120 192 170 206C200 214 230 206 260 196C300 186 350 192 400 202V240H0Z"
        fill={paint(uid, 'lit')}
      />
      <path
        d="M170 206C200 214 230 206 260 196C240 212 220 226 210 240H120C140 226 158 214 170 206Z"
        fill={paint(uid, 'shade')}
        opacity=".7"
      />
      <g stroke="#fff3d6" strokeOpacity=".5" fill="none" strokeWidth="1">
        <path d="M20 196C60 186 100 186 140 194M280 182C320 176 350 178 380 182" />
      </g>
      <rect className="bd-dusk" width="400" height="240" />
      <g className="bd-lit">
        {DOMES.map((d) => (
          <circle
            key={d.x}
            cx={d.x + d.w / 2}
            cy={d.y + d.h * 0.7}
            r="12"
            fill={paint(uid, 'glow')}
          />
        ))}
      </g>
    </>
  );
}
