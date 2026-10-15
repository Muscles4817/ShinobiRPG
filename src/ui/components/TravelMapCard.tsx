import { useId } from 'react';

import type { MapRoad, TravelMap } from '@/game';

import { curvePath } from './mapCurve';

/** Roads where the worst on them is deadly or worse are inked in red. */
const DANGEROUS = new Set<MapRoad['danger']>(['deadly', 'elite']);

interface TravelMapProps {
  readonly map: TravelMap;
  readonly selected: string | null;
  readonly onSelect: (id: string) => void;
}

/**
 * The country on paper, like a printed chart: hatched coasts, the home country washed in
 * ember, dashed borders, rivers and names; roads as brush lines through their bends (dotted
 * while closed, red where deadly), places as ink seals you can tap, and a stamp where you
 * stand.
 */
export function TravelMapCard({ map, selected, onSelect }: TravelMapProps) {
  return (
    <section
      className="map-paper"
      aria-label="Map"
      style={{ aspectRatio: `${map.width} / ${map.height}` }}
    >
      <svg viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden="true">
        <Country map={map} />
        {map.roads.map((r) => (
          <path
            key={r.id}
            d={curvePath(r.path, false)}
            className={`map-road${r.open ? '' : ' closed'}${DANGEROUS.has(r.danger) ? ' deadly' : ''}`}
          />
        ))}
      </svg>
      {map.places.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`map-place label-${p.label}${p.here ? ' here' : ''}${p.locked ? ' locked' : ''}${p.id === selected ? ' selected' : ''}`}
          style={{ left: `${(p.x / map.width) * 100}%`, top: `${(p.y / map.height) * 100}%` }}
          aria-pressed={p.id === selected}
          onClick={() => {
            onSelect(p.id);
          }}
        >
          <span className="map-seal" aria-hidden="true" />
          <span className="map-name">{p.name}</span>
        </button>
      ))}
    </section>
  );
}

/** The land and sea under the roads: drawn once per map, inked a little unevenly. */
function Country({ map }: { readonly map: TravelMap }) {
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
