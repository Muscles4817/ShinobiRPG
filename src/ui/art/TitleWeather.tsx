import type { TitleLight, TitleWeather } from '@/game';

/**
 * The title's weather, laid over its sky (`TitleSky`): a grey veil under cloud and rain, banks
 * of cloud, mist lying in the valleys between the hills and the village, and rain or snow
 * falling in front of everything, the lanterns too. The fall is a tile that slides down by its
 * own height (title-sky.css), so it never jumps; it stands still under reduced motion.
 */

/** How grey each weather turns the sky, and the grey it uses by day and by night. */
const VEIL: Readonly<Record<TitleWeather, number>> = {
  clear: 0,
  mist: 0.25,
  cloudy: 0.35,
  rain: 0.55,
  snow: 0.4,
};

const BANKS: readonly string[] = [
  'M-10 70c10-18 40-22 54-8 14-14 46-12 54 8 16 0 22 16 10 24H-14c-16-4-12-22 4-24Z',
  'M150 40c8-14 32-16 42-6 11-11 36-9 42 6 13 0 17 12 8 18H146c-12-3-9-17 4-18Z',
  'M270 96c9-16 36-19 48-7 12-12 40-10 47 7 14 0 19 14 9 21H266c-14-3-10-19 4-21Z',
];

function isDark(sky: TitleLight['sky']): boolean {
  return sky === 'night' || sky === 'evening';
}

/** The grey over the sky, and the cloud banks on it. */
export function WeatherVeil({
  light,
  weather,
}: {
  readonly light: TitleLight;
  readonly weather: TitleWeather;
}) {
  const veil = VEIL[weather];
  if (veil === 0) return null;
  const dark = isDark(light.sky);
  const banked = weather === 'cloudy' || weather === 'rain' || weather === 'snow';
  return (
    <g className="title-veil">
      <rect
        x="-20"
        y="-20"
        width="430"
        height="300"
        fill={dark ? '#14141c' : '#7c8290'}
        opacity={veil}
      />
      {banked && (
        <g className="title-clouds" fill={dark ? '#2c2c3a' : '#c9ccd4'} opacity={dark ? 0.8 : 0.75}>
          {BANKS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
    </g>
  );
}

/** Mist lying low across the valley, in front of the hills and behind the roofs. */
export function MistBands({
  weather,
  light,
}: {
  readonly weather: TitleWeather;
  readonly light: TitleLight;
}) {
  if (weather !== 'mist' && weather !== 'rain') return null;
  const tint = isDark(light.sky) ? '#8a8aa0' : '#eef0f2';
  const strength = weather === 'mist' ? 1 : 0.5;
  return (
    <g className="title-mist" fill={tint}>
      <path d="M-20 236c60-10 120 6 200-4s150-14 230 2v22H-20Z" opacity={0.28 * strength} />
      <path d="M-20 262c70-8 140 8 220-2s130-10 210 4v18H-20Z" opacity={0.34 * strength} />
      <path d="M-20 200c50-6 110 4 170-2s120-8 260 4v14H-20Z" opacity={0.16 * strength} />
    </g>
  );
}

/** Rain or snow falling in front of the whole picture. */
export function Precipitation({ weather }: { readonly weather: TitleWeather }) {
  if (weather !== 'rain' && weather !== 'snow') return null;
  const rain = weather === 'rain';
  return (
    <>
      <defs>
        <pattern id="title-rain" width="24" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M4 0l-3 14M16 22l-3 14M10 42l-3 14M22 8l-2 10"
            stroke="#c9d6e6"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.55"
          />
        </pattern>
        <pattern id="title-snow" width="97" height="60" patternUnits="userSpaceOnUse">
          <g fill="#f4f6fa" opacity="0.6">
            <circle cx="7" cy="9" r="1" />
            <circle cx="31" cy="27" r="0.8" />
            <circle cx="52" cy="4" r="1.1" />
            <circle cx="66" cy="41" r="0.7" />
            <circle cx="88" cy="18" r="0.9" />
            <circle cx="19" cy="49" r="0.8" />
            <circle cx="77" cy="56" r="1" />
          </g>
        </pattern>
        <pattern id="title-snow-near" width="143" height="120" patternUnits="userSpaceOnUse">
          <g fill="#f8f9fc" opacity="0.85">
            <circle cx="12" cy="20" r="2" />
            <circle cx="61" cy="71" r="1.6" />
            <circle cx="104" cy="33" r="2.2" />
            <circle cx="131" cy="96" r="1.7" />
            <circle cx="38" cy="108" r="1.9" />
          </g>
        </pattern>
      </defs>
      <g className={rain ? 'title-fall rain' : 'title-fall snow'}>
        <rect
          x="-20"
          y="-60"
          width="430"
          height="420"
          fill={rain ? 'url(#title-rain)' : 'url(#title-snow)'}
        />
      </g>
      {!rain && (
        <g className="title-fall snow-near">
          <rect x="-20" y="-120" width="430" height="480" fill="url(#title-snow-near)" />
        </g>
      )}
    </>
  );
}
