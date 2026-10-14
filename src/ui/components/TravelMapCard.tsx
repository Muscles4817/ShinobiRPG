import type { MapRoad, TravelMap } from '@/game';

/** Roads where the worst on them is deadly or worse are inked in red. */
const DANGEROUS = new Set<MapRoad['danger']>(['deadly', 'elite']);

interface TravelMapProps {
  readonly map: TravelMap;
  readonly selected: string | null;
  readonly onSelect: (id: string) => void;
}

/**
 * The region on paper: roads as brush lines (dotted while a place at either end is still
 * coming soon, red where the road is deadly), places as ink seals you can tap, and a stamp
 * where you stand.
 */
export function TravelMapCard({ map, selected, onSelect }: TravelMapProps) {
  return (
    <section
      className="map-paper"
      aria-label="Map"
      style={{ aspectRatio: `${map.width} / ${map.height}` }}
    >
      <svg viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden="true">
        {map.roads.map((r) => (
          <line
            key={r.id}
            x1={r.from.x}
            y1={r.from.y}
            x2={r.to.x}
            y2={r.to.y}
            className={`map-road${r.open ? '' : ' closed'}${DANGEROUS.has(r.danger) ? ' deadly' : ''}`}
          />
        ))}
      </svg>
      {map.places.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`map-place${p.here ? ' here' : ''}${p.locked ? ' locked' : ''}${p.id === selected ? ' selected' : ''}`}
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
