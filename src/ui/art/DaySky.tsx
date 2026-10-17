/**
 * The strip of sky above the end-of-day sheet: the village's roofs under a moon after a day
 * that ends in bed, or under a pale dawn when you pushed on through the night.
 */

const STARS = [
  [40, 20],
  [90, 38],
  [160, 16],
  [230, 34],
  [262, 64],
  [128, 58],
] as const;
const WINDOWS = [30, 110, 200, 290, 350] as const;

function Night() {
  return (
    <>
      <defs>
        <radialGradient id="day-sky-moon">
          <stop offset="0" stopColor="#ffe9b8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe9b8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="140" fill="#171329" />
      <circle cx="320" cy="45" r="55" fill="url(#day-sky-moon)" />
      <circle cx="320" cy="45" r="20" fill="#f4e6c4" />
      {STARS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="#fff" opacity="0.7" />
      ))}
    </>
  );
}

function Dawn() {
  return (
    <>
      <defs>
        <linearGradient id="day-sky-dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2a4a" />
          <stop offset="0.55" stopColor="#8a5a6e" />
          <stop offset="1" stopColor="#f0a868" />
        </linearGradient>
      </defs>
      <rect width="390" height="140" fill="url(#day-sky-dawn)" />
      <circle cx="318" cy="96" r="24" fill="#ffd9a0" opacity="0.9" />
    </>
  );
}

export function DaySky({ dawn }: { readonly dawn: boolean }) {
  const windows = dawn ? 0.35 : 1;
  return (
    <svg viewBox="0 0 390 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {dawn ? <Dawn /> : <Night />}
      <path
        d="M0 100 L50 80 L90 92 L140 70 L200 90 L260 76 L320 94 L390 82 L390 140 L0 140Z"
        fill={dawn ? '#4a3550' : '#241d33'}
      />
      <path
        d="M0 118 h70 v-12 l14-9 l14 9 v12 h80 v-18 l18-12 l18 12 v18 h80 v-10 l14-8 l14 8 v10 h70 v22 H0Z"
        fill={dawn ? '#2a1d2c' : '#110e1a'}
      />
      {WINDOWS.map((x) => (
        <rect key={x} x={x} y="122" width="5" height="6" fill="#f0a050" opacity={windows} />
      ))}
    </svg>
  );
}
