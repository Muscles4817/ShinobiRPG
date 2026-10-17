import { PAINT, SHINE, STEAM } from './palette';

/** Icons for food and drink: bowls, fish, rice, tea, sweets, the pot and the grill. */
export const FOOD_ICONS = {
  bowl: (
    <>
      <path d="M11 9c-1.5-2 1.5-3 0-5.5M16 9c-1.5-2 1.5-3 0-5.5" {...STEAM} />
      <path d="M19 3.5l8 10M22.5 2.5l7 9" stroke={PAINT.wood} strokeWidth="1.6" />
      <path d="M3 15h26a13 10 0 0 1-26 0z" fill={PAINT.red} />
      <path d="M6.5 19.5h19" stroke={PAINT.paper} strokeWidth="1.1" strokeDasharray="2 2" />
      <ellipse cx="16" cy="15" rx="13" ry="2.2" fill={PAINT.broth} />
      <circle cx="12" cy="14.8" r="2" fill={PAINT.white} strokeWidth="1" />
      <circle cx="12" cy="14.8" r=".9" fill="#ffb02e" stroke="none" />
      <path d="M17.5 14.4l3.5 1" stroke={PAINT.green} strokeWidth="1.8" />
      <path d="M12 25h8v2.5h-8z" fill={PAINT.redDark} />
    </>
  ),
  fish: (
    <>
      <path d="M24 16l6-5v10z" fill={PAINT.blueDark} />
      <path d="M3 16C8 8.5 19 8.5 24 16C19 23.5 8 23.5 3 16Z" fill={PAINT.blue} />
      <path
        d="M7 17.5C12 21 18 21 22.5 17.5"
        {...SHINE}
        stroke="#fff"
        strokeWidth="1.1"
        fill="none"
      />
      <path d="M14 11q2 5 0 10" strokeWidth="1" strokeOpacity=".6" />
      <circle cx="8.5" cy="14.8" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  rice: (
    <>
      <path
        d="M16 4C20 4 28 17 28 22.5C28 26.5 24 28 16 28C8 28 4 26.5 4 22.5C4 17 12 4 16 4Z"
        fill={PAINT.white}
      />
      <path d="M10 21.5h12V28H10z" fill={PAINT.nori} />
      <path d="M9.5 15q1.5-4.5 4.5-7.5" stroke={PAINT.broth} strokeWidth="1.4" fill="none" />
      <circle cx="16" cy="15" r="1.6" fill={PAINT.red} stroke="none" />
    </>
  ),
  pill: (
    <>
      <rect x="5" y="11" width="22" height="10" rx="5" fill={PAINT.white} />
      <path d="M16 11h-6a5 5 0 0 0 0 10h6z" fill={PAINT.red} />
      <path d="M16 11v10" />
      <path d="M8.5 14h5" {...SHINE} stroke="#fff" strokeWidth="1.2" fill="none" />
    </>
  ),
  tea: (
    <>
      <path d="M12 8c-1.5-2 1.5-3 0-5.5M18 8c-1.5-2 1.5-3 0-5.5" {...STEAM} />
      <path d="M6 12h20l-2 12a4 4 0 0 1-4 3.5h-8A4 4 0 0 1 8 24z" fill={PAINT.green} />
      <ellipse cx="16" cy="12" rx="10" ry="2" fill={PAINT.leaf} />
      <path d="M8.5 18.5h15" strokeWidth="1" strokeOpacity=".6" />
      <path d="M10 15l1.8 9" {...SHINE} stroke="#fff" strokeWidth="1.4" fill="none" opacity=".4" />
    </>
  ),
  dango: (
    <>
      <path d="M6 29L27 3" stroke={PAINT.wood} strokeWidth="1.8" />
      <circle cx="21.5" cy="9.8" r="4.6" fill={PAINT.pink} />
      <circle cx="16" cy="16.6" r="4.6" fill={PAINT.white} />
      <circle cx="10.5" cy="23.4" r="4.6" fill={PAINT.leaf} />
      <g {...SHINE} opacity=".7">
        <circle cx="20" cy="8.2" r="1.2" />
        <circle cx="14.5" cy="15" r="1.2" />
        <circle cx="9" cy="21.8" r="1.2" />
      </g>
    </>
  ),
  grill: (
    <>
      <path
        d="M10 8c-1.5-2 1.5-3 0-5.5M16 8c-1.5-2 1.5-3 0-5.5M22 8c-1.5-2 1.5-3 0-5.5"
        {...STEAM}
      />
      <path d="M9 25l-2 4.5M23 25l2 4.5" />
      <path d="M5 14h22a11 9 0 0 1-22 0z" fill={PAINT.iron} />
      <ellipse cx="16" cy="14" rx="11" ry="2" fill="#e2532e" />
      <path d="M4 12.5h24" stroke={PAINT.wood} strokeWidth="1.2" />
      <g fill={PAINT.clay} strokeWidth="1">
        <rect x="8" y="10.6" width="3" height="3" rx=".8" />
        <rect x="12" y="10.6" width="3" height="3" rx=".8" />
        <rect x="18" y="10.6" width="3" height="3" rx=".8" />
        <rect x="22" y="10.6" width="3" height="3" rx=".8" />
      </g>
    </>
  ),
  pot: (
    <>
      <path
        d="M10 9c-1.5-2 1.5-3 0-5.5M16 9c-1.5-2 1.5-3 0-5.5M22 9c-1.5-2 1.5-3 0-5.5"
        {...STEAM}
      />
      <path d="M5 14h22v6a8 7 0 0 1-8 7h-6a8 7 0 0 1-8-7z" fill={PAINT.iron} />
      <path d="M3 14h26" strokeWidth="2.2" />
      <path d="M2 17h3M27 17h3" strokeWidth="2.2" />
      <path
        d="M9 17.5q1 5 5 6.5"
        {...SHINE}
        stroke="#fff"
        strokeWidth="1.2"
        fill="none"
        opacity=".35"
      />
    </>
  ),
  veg: (
    <>
      <path d="M16 13V5" stroke={PAINT.green} />
      <path
        d="M16 9C12 9 10 6 10 3.5C13 3.5 16 6 16 9ZM16 9C20 9 22 6 22 3.5C19 3.5 16 6 16 9Z"
        fill={PAINT.leaf}
        strokeWidth="1.2"
      />
      <path d="M16 28c-6-3-9-9-7-15 3 0 6 2 7 5 1-3 4-5 7-5 2 6-1 12-7 15z" fill={PAINT.plum} />
      <path d="M11.5 15.5q-1 5 2.5 8.5" {...SHINE} stroke="#fff" strokeWidth="1.2" fill="none" />
    </>
  ),
  sake: (
    <>
      <path d="M11 4h4v5c3 2 4 5 4 9v10H7V18c0-4 1-7 4-9z" fill={PAINT.white} />
      <path d="M7.4 17h11.2v4H7.4z" fill={PAINT.blue} strokeWidth="1" />
      <path d="M22 20h6l-1 8h-4z" fill={PAINT.white} />
      <path d="M9.5 12q-.8 2-.8 4" {...SHINE} stroke={PAINT.paper} strokeWidth="1.2" fill="none" />
    </>
  ),
};
