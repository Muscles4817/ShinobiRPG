import { useId } from 'react';

import type { TravelMap } from '@/game';

import { curvePath } from './mapCurve';

/** The land and sea under the roads: drawn once per map, inked a little unevenly. */
export function MapCountry({ map }: { readonly map: TravelMap }) {
  const id = useId();
  const land = map.lands.map((l) => curvePath(l, true)).join(' ');
  return (
    <>
      <defs>
        <filter id={`${id}ink`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves={2} seed={4} />
          <feDisplacementMap in="SourceGraphic" scale={1.4} />
        </filter>
        <pattern id={`${id}hatch`} width="1.6" height="1.1" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0.5" x2="1.1" y2="0.5" className="map-hatch" />
        </pattern>
        <clipPath id={`${id}land`}>
          <path d={land} />
        </clipPath>
      </defs>
      <rect width={map.width} height={map.height} className="map-sea" />
      <g filter={`url(#${id}ink)`}>
        <path d={land} className="map-shore" stroke={`url(#${id}hatch)`} />
        <path d={land} className="map-land" />
        <path d={curvePath(map.home, true)} className="map-home" clipPath={`url(#${id}land)`} />
        {map.borders.map((b, i) => (
          <path key={`border${i}`} d={curvePath(b, false)} className="map-border" />
        ))}
        {map.rivers.map((r, i) => (
          <path key={`river${i}`} d={curvePath(r, false)} className="map-river" />
        ))}
      </g>
      {map.labels.map((l) => (
        <text
          key={l.text}
          x={l.at.x}
          y={l.at.y}
          className={`map-label ${l.kind}${l.large ? ' large' : ''}`}
        >
          {l.text}
        </text>
      ))}
    </>
  );
}
