import { PAINT, SHINE, STEAM } from './palette';

/** Icons for places and the things in them: notices, buildings, shrines, lights and water. */
export const PLACE_ICONS = {
  post: (
    <>
      <rect x="9" y="9" width="3" height="20" fill={PAINT.wood} />
      <rect x="20" y="9" width="3" height="20" fill={PAINT.wood} />
      <path d="M6 9h20l-2-4H8z" fill={PAINT.redDark} />
      <rect x="7.5" y="12" width="17" height="7" fill={PAINT.paper} />
      <rect x="10" y="21" width="12" height="5" fill={PAINT.paper} />
      <path d="M10.5 15h7M10.5 17h5" strokeWidth="1" />
      <circle cx="21.5" cy="15.5" r="1.4" fill={PAINT.red} stroke="none" />
    </>
  ),
  board: (
    <>
      <path d="M8 23l-2 6M24 23l2 6" />
      <rect x="4" y="5" width="24" height="18" rx="1.5" fill={PAINT.wood} />
      <rect x="7" y="8" width="8" height="6" fill={PAINT.paper} />
      <rect x="17" y="8" width="8" height="11" fill={PAINT.paper} />
      <rect x="7" y="16" width="8" height="4" fill={PAINT.paper} />
      <path d="M19 11.5h4M19 14h3" strokeWidth="1" />
      <circle cx="11" cy="11" r="1.3" fill={PAINT.red} stroke="none" />
    </>
  ),
  stacks: (
    <>
      <rect x="5" y="4" width="22" height="24" fill={PAINT.wood} />
      <path d="M5 12h22M5 20h22" />
      <g strokeWidth="1">
        <rect x="7.5" y="6" width="2.6" height="6" fill={PAINT.red} />
        <rect x="10.4" y="6.8" width="2.6" height="5.2" fill={PAINT.blue} />
        <rect x="13.3" y="6" width="2.6" height="6" fill={PAINT.gold} />
        <rect x="8" y="14" width="2.6" height="6" fill={PAINT.green} />
        <rect x="11" y="14.8" width="2.6" height="5.2" fill={PAINT.paper} />
        <path d="M15 20l2.4-5.6 2.2 1-2.4 4.6z" fill={PAINT.red} />
        <rect x="18.5" y="22" width="2.6" height="6" fill={PAINT.blue} />
        <rect x="21.4" y="22.8" width="2.6" height="5.2" fill={PAINT.gold} />
      </g>
    </>
  ),
  house: (
    <>
      <path d="M7 14h18v13H7z" fill={PAINT.paper} />
      <path d="M11 17.5v4M21 17.5v4M9 19.5h4M19 19.5h4" strokeWidth="1" />
      <path d="M13.5 27v-7h5v7" fill={PAINT.wood} />
      <path d="M3 15L16 5l13 10z" fill={PAINT.iron} />
      <path d="M8 12.5l8-6" {...SHINE} stroke="#fff" strokeWidth="1.2" fill="none" />
    </>
  ),
  heal: (
    <>
      <path d="M13 5h6v8h8v6h-8v8h-6v-8H5v-6h8z" fill={PAINT.red} />
      <path d="M14.5 7v7.5H7" {...SHINE} stroke="#fff" strokeWidth="1.2" fill="none" />
    </>
  ),
  torii: (
    <>
      <rect x="8" y="10.5" width="3.3" height="18.5" fill={PAINT.red} />
      <rect x="20.7" y="10.5" width="3.3" height="18.5" fill={PAINT.red} />
      <rect x="6" y="13" width="20" height="2.8" fill={PAINT.red} />
      <rect x="14.6" y="10.5" width="2.8" height="3" fill={PAINT.lacquer} />
      <path d="M3 8Q16 4.5 29 8L27.6 11Q16 8.3 4.4 11Z" fill={PAINT.red} />
      <path d="M5 8.2Q16 5.4 27 8.2" {...SHINE} stroke="#fff" strokeWidth="1" fill="none" />
    </>
  ),
  lantern: (
    <>
      <path d="M16 2v4M16 26v4" />
      <ellipse cx="16" cy="16.5" rx="7.5" ry="8.5" fill={PAINT.red} />
      <path d="M9.2 12.5h13.6M8.6 16.5h14.8M9.2 20.5h13.6" strokeWidth="1" strokeOpacity=".6" />
      <ellipse cx="13.2" cy="14.5" rx="1.8" ry="3.8" {...SHINE} fill={PAINT.broth} opacity=".8" />
      <rect x="11.5" y="6" width="9" height="2.8" rx=".6" fill={PAINT.lacquer} />
      <rect x="11.5" y="24.2" width="9" height="2.8" rx=".6" fill={PAINT.lacquer} />
    </>
  ),
  spring: (
    <>
      <path d="M10 13c-2-2.5 2-4 0-7.5M16 13c-2-2.5 2-4 0-7.5M22 13c-2-2.5 2-4 0-7.5" {...STEAM} />
      <ellipse cx="16" cy="22" rx="13" ry="6.5" fill={PAINT.stone} />
      <ellipse cx="16" cy="21" rx="10" ry="4" fill={PAINT.water} />
      <path d="M10 21q3.5-1.5 7 0t6 0" {...SHINE} stroke="#fff" strokeWidth="1" fill="none" />
      <circle cx="6.5" cy="25.5" r="2.2" fill={PAINT.stone} />
    </>
  ),
  cart: (
    <>
      <path d="M16 10V4" />
      <path d="M16 4h7l-2 2.5 2 2.5h-7z" fill={PAINT.red} />
      <path d="M3 19h26l-3-9H6z" fill={PAINT.clay} />
      <path d="M8 13h16" strokeWidth="1" strokeOpacity=".6" />
      <circle cx="10" cy="24.5" r="3.5" fill={PAINT.wood} />
      <circle cx="23" cy="24.5" r="3.5" fill={PAINT.wood} />
      <circle cx="10" cy="24.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="23" cy="24.5" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
};
