import { headerView, hubView } from '@/game';

import type { ScreenProps } from '../screens/types';

interface PlaceRailProps extends ScreenProps {
  /** The place page open now, marked in the list. */
  readonly openPlaceId: string | null;
  readonly onOpenPlace: (placeId: string) => void;
}

/** The side rail's list of the village's places: one click to any of them from any tab. */
export function PlaceRail({ ctx, state, openPlaceId, onOpenPlace }: PlaceRailProps) {
  const header = headerView(state, ctx);
  const { places } = hubView(state, ctx);
  return (
    <section className="rail-places" aria-label={`Places in ${header.location}`}>
      <h2>Places in {header.location}</h2>
      <ul>
        {places.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={p.id === openPlaceId ? 'rail-place on' : 'rail-place'}
              aria-current={p.id === openPlaceId ? 'page' : undefined}
              disabled={p.closed !== null}
              onClick={() => {
                onOpenPlace(p.id);
              }}
            >
              <span>{p.name}</span>
              {p.closed ? (
                <small>{p.closed}</small>
              ) : (
                p.badge && <span className="place-badge">{p.badge}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
