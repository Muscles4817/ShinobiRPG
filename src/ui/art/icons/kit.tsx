import { PAINT, SHINE } from './palette';

/**
 * Icons for training and gear: the disciplines' signs and a shinobi's kit. The discipline
 * signs (fist, wave, eye, wind) fill with a tint of the outline's ink, so a drill plaque in a
 * discipline's colour shows its sign in that colour too.
 */
const TINT = { fill: 'currentColor', fillOpacity: 0.28 } as const;

export const KIT_ICONS = {
  scroll: (
    <>
      <rect x="7" y="6" width="18" height="20" fill={PAINT.paper} />
      <rect x="4.5" y="4" width="23" height="3.6" rx="1.8" fill={PAINT.wood} />
      <rect x="4.5" y="24.4" width="23" height="3.6" rx="1.8" fill={PAINT.wood} />
      <path d="M11 11.5h10M11 15h8M11 18.5h10" strokeWidth="1" />
      <rect x="18.5" y="19.5" width="4" height="4" fill={PAINT.red} stroke="none" />
    </>
  ),
  seal: (
    <>
      <path d="M9 3h14v26H9z" fill={PAINT.paper} />
      <path d="M9 3h14v3.5H9z" fill={PAINT.gold} />
      <path d="M13 10c3 0 6 1.5 6 4.5s-4.5 2-4.5 5 3 3.5 4.5 5.5" strokeWidth="2" fill="none" />
      <circle cx="16" cy="25.5" r="2.3" fill={PAINT.red} stroke="none" />
    </>
  ),
  sword: (
    <>
      <path d="M26 3.2l2.8 2.8L12.5 22.3l-2.8-2.8z" fill={PAINT.steel} />
      <path d="M26.6 4.6L11.3 19.9" stroke="#fff" strokeWidth=".9" strokeOpacity=".8" />
      <ellipse
        cx="10.4"
        cy="21.6"
        rx="4"
        ry="1.8"
        transform="rotate(-45 10.4 21.6)"
        fill={PAINT.gold}
      />
      <path d="M3.5 28.5L8.6 23.4" strokeWidth="3.6" />
      <path d="M3.5 28.5L8.6 23.4" stroke={PAINT.red} strokeWidth="1.2" strokeDasharray="1.2 1.6" />
    </>
  ),
  fist: (
    <>
      <path
        d="M8 14V10a2 2 0 0 1 4 0v3M12 12V8a2 2 0 0 1 4 0v4M16 12V9a2 2 0 0 1 4 0v4M20 13v-1a2 2 0 0 1 4 0v6a9 9 0 0 1-9 9h-1a7 7 0 0 1-7-7v-4a2 2 0 0 1 4 0"
        {...TINT}
      />
      <path d="M3 9l2.5 1.5M2 15h3M3 21l2.5-1.5" strokeWidth="1.4" />
    </>
  ),
  wave: (
    <>
      <path d="M3 13c4-4 7-4 10 0s6 4 10 0 5-3 6-2v18H3z" {...TINT} stroke="none" />
      <path d="M3 13c4-4 7-4 10 0s6 4 10 0 5-3 6-2M3 21c4-4 7-4 10 0s6 4 10 0 5-3 6-2" />
      <path
        d="M8 10.5q2-1 4 .5M18 18.5q2-1 4 .5"
        {...SHINE}
        stroke="#fff"
        strokeWidth="1.1"
        fill="none"
      />
    </>
  ),
  eye: (
    <>
      <path d="M3 16c4-7 9-10 13-10s9 3 13 10c-4 7-9 10-13 10S7 23 3 16z" fill={PAINT.white} />
      <circle cx="16" cy="16" r="5" {...TINT} fillOpacity={0.7} />
      <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
      <circle cx="17.6" cy="14.4" r="1.1" {...SHINE} opacity=".9" />
    </>
  ),
  wind: (
    <>
      <path d="M3 12h16a4 4 0 1 0-4-4M3 18h20a4 4 0 1 1-4 4M3 24h8" />
      <path d="M22 6.5c3-1.4 6-.2 6-.2s-1.4 2.6-4.6 2.8z" fill={PAINT.leaf} strokeWidth="1.2" />
      <path d="M26 13.5c2-1 4 0 4 0s-1 1.8-3 1.8z" {...TINT} fillOpacity={0.5} strokeWidth="1" />
    </>
  ),
  leaf: (
    <>
      <path d="M6 26C6 12 14 6 27 5c0 13-6 21-21 21z" fill={PAINT.leaf} />
      <path d="M6 26L18 14M12 20l-1-5M15 17l4 .5" strokeWidth="1.2" />
      <path
        d="M10 19C11 12 16 9 22 8"
        {...SHINE}
        stroke="#fff"
        strokeWidth="1.1"
        fill="none"
        opacity=".45"
      />
    </>
  ),
  tree: (
    <>
      <path d="M16 29V21" stroke={PAINT.wood} strokeWidth="3" />
      <path d="M16 3l9 11h-5l6 8H6l6-8H7z" fill={PAINT.green} />
      <path
        d="M16 6.5l-4.5 5.5M13 15.5l-3.5 4.5"
        {...SHINE}
        stroke="#fff"
        strokeWidth="1.1"
        fill="none"
        opacity=".4"
      />
    </>
  ),
  anvil: (
    <>
      <path d="M14 6l2-3M19 7l3-2M23 9l3 .5" stroke={PAINT.gold} strokeWidth="1.4" />
      <path d="M4 10h20c0 4 2 6 5 6v3H18l2 7H9l2-7H4z" fill={PAINT.iron} />
      <path d="M5.5 11.5h17" {...SHINE} stroke="#fff" strokeWidth="1.1" fill="none" opacity=".45" />
      <path d="M8 26h13" strokeWidth="2.2" />
    </>
  ),
  vest: (
    <>
      <path d="M11 4l5 4 5-4 6 4-2 6v14H7V14L5 8z" fill={PAINT.olive} />
      <path d="M16 8v20" />
      <g fill="#4e5c38" strokeWidth="1">
        <rect x="9.5" y="16" width="5" height="4" rx=".8" />
        <rect x="17.5" y="16" width="5" height="4" rx=".8" />
        <rect x="9.5" y="21.5" width="5" height="4" rx=".8" />
        <rect x="17.5" y="21.5" width="5" height="4" rx=".8" />
      </g>
    </>
  ),
  charm: (
    <>
      <path d="M13 6.5c0-2 6-2 6 0" stroke={PAINT.gold} strokeWidth="1.6" fill="none" />
      <path d="M9 10q7-4 14 0v15a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2z" fill={PAINT.red} />
      <path d="M9.4 15h13.2" stroke={PAINT.gold} strokeWidth="1.4" />
      <path d="M16 18.5l2.5 3-2.5 3-2.5-3z" fill={PAINT.gold} strokeWidth="1" />
      <path
        d="M11.5 12.5v10"
        {...SHINE}
        stroke="#fff"
        strokeWidth="1.1"
        fill="none"
        opacity=".35"
      />
    </>
  ),
};
