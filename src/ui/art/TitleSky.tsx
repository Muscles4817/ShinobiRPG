import type { TitleLight } from '@/game';

/**
 * The sky behind the title's lanterns, by the hour on the player's clock: a sun climbing out of
 * the hills at dawn and sinking at dusk, a plain day with a cloud or two, the moon and the stars
 * by night. The night keeps no sky of its own: the page's dark is the night.
 */

type Sky = TitleLight['sky'];

/** Top, middle and horizon of each sky that has one. */
const GRADIENTS: Readonly<Record<Exclude<Sky, 'night'>, readonly [string, string, string]>> = {
  dawn: ['#2b2a4a', '#9a5a78', '#f2a65e'],
  morning: ['#4d7fae', '#9cc3dc', '#f1dcb2'],
  day: ['#3f78b4', '#86b8dc', '#cfe4ee'],
  dusk: ['#2d2b55', '#a4486a', '#f08a4b'],
  evening: ['#141430', '#35294f', '#6e3a4d'],
};

/** The far hills and the near ones, washed by the light. */
export const HILLS: Readonly<Record<Sky, readonly [string, string]>> = {
  dawn: ['#4a3a55', '#352a42'],
  morning: ['#5f7a6a', '#4a6352'],
  day: ['#557466', '#43604f'],
  dusk: ['#3d2f4a', '#2c2338'],
  evening: ['#28223a', '#1f1a2d'],
  night: ['#221e2f', '#1b1825'],
};

const STARS: readonly (readonly [number, number, number])[] = [
  [30, 40, 1.1],
  [64, 120, 0.8],
  [120, 30, 0.9],
  [150, 150, 0.7],
  [236, 24, 1],
  [262, 96, 0.7],
  [350, 70, 1.1],
  [372, 150, 0.8],
  [180, 60, 0.6],
];

/** Where the sun stands: rising from behind the hills, high at noon, sinking again. */
function sunAt(sky: Sky, progress: number): { x: number; y: number } | null {
  switch (sky) {
    case 'dawn':
      return { x: 80 + 20 * progress, y: 214 - 60 * progress };
    case 'morning':
      return { x: 110 + 60 * progress, y: 150 - 60 * progress };
    case 'day':
      return { x: 190 + 60 * progress, y: 84 };
    case 'dusk':
      return { x: 290 + 20 * progress, y: 120 + 96 * progress };
    case 'evening':
    case 'night':
      return null;
  }
}

function SunAndGlow({ x, y, sky }: { readonly x: number; readonly y: number; readonly sky: Sky }) {
  const low = sky === 'dawn' || sky === 'dusk';
  return (
    <g className="title-sun">
      <circle cx={x} cy={y} r={low ? 70 : 54} fill="url(#sun-glow)" />
      <circle cx={x} cy={y} r={low ? 22 : 18} fill={low ? '#ffd39a' : '#fff6dc'} />
    </g>
  );
}

function Clouds() {
  return (
    <g className="title-clouds" fill="#ffffff">
      <path
        d="M40 92c6-10 22-12 30-4 8-8 26-6 30 6 10 0 14 10 6 14H38c-10-2-8-14 2-16Z"
        opacity="0.5"
      />
      <path
        d="M250 50c5-8 18-9 24-3 7-6 21-4 24 5 8 0 11 8 5 11H248c-8-2-6-11 2-13Z"
        opacity="0.4"
      />
    </g>
  );
}

export function TitleSky({ light }: { readonly light: TitleLight }) {
  const { sky, progress } = light;
  const gradient = sky === 'night' ? null : GRADIENTS[sky];
  const sun = sunAt(sky, progress);
  return (
    <>
      <defs>
        {gradient && (
          <linearGradient id="title-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={gradient[0]} />
            <stop offset="0.55" stopColor={gradient[1]} />
            <stop offset="0.85" stopColor={gradient[2]} />
          </linearGradient>
        )}
        <radialGradient id="sun-glow">
          <stop offset="0" stopColor="#fff1c8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff1c8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {gradient && <rect x="-20" y="-20" width="430" height="300" fill="url(#title-sky)" />}
      {(sky === 'night' || sky === 'evening') &&
        STARS.map(([x, y, r]) => (
          <circle
            key={`${String(x)}-${String(y)}`}
            className="title-star"
            cx={x}
            cy={y}
            r={r}
            fill="#f3e6c4"
            opacity={sky === 'night' ? 0.7 : 0.35}
          />
        ))}
      {sun && <SunAndGlow x={sun.x} y={sun.y} sky={sky} />}
      {(sky === 'morning' || sky === 'day') && <Clouds />}
      {sky === 'night' && (
        <>
          <circle cx="292" cy="150" r="46" fill="#f3e6c4" opacity="0.05" />
          <circle cx="292" cy="150" r="25" fill="#efe1bd" opacity="0.88" />
        </>
      )}
      {sky === 'evening' && <circle cx="320" cy="176" r="20" fill="#efe1bd" opacity="0.55" />}
    </>
  );
}
