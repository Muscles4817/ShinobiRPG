import type { MapRoad, TravelMap } from '@/game';

import { MapCountry } from './MapCountry';
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
      data-style={map.style}
      aria-label="Map"
      style={{ aspectRatio: `${map.width} / ${map.height}` }}
    >
      <svg viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden="true">
        <MapCountry map={map} />
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
          data-kind={p.kind}
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
