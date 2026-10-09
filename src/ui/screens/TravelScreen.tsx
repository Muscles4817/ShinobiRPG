import { headerView, travelView } from '@/game';

import { Backdrop } from '../art/Backdrop';
import { Banner } from '../components/Banner';
import type { ScreenProps } from './types';

/** Destination cards. A map can replace this list once the world is big enough. */
export function TravelScreen({ ctx, state, perform }: ScreenProps) {
  const header = headerView(state, ctx);
  const destinations = travelView(state, ctx);
  return (
    <>
      <Banner
        title="Where to?"
        subtitle={`From ${header.location} · ${header.date}`}
        slot={header.slot}
      />
      <main className="page">
        {destinations.map((d) => (
          <article
            key={d.id}
            className={`dest sky${d.lockedReason && !d.here ? ' locked' : ''}`}
            data-slot="afternoon"
            data-land={d.backdrop}
          >
            <Backdrop id={d.backdrop} />
            <div className="dest-in">
              <h2>{d.name}</h2>
              <p className="dest-epithet">{d.epithet}</p>
              {!d.here && (
                <span className="dest-meta">
                  <span>{d.days === 1 ? '1 day' : `${d.days} days`}</span>
                  <span>{d.cost > 0 ? `${d.cost} ryo` : 'Free on foot'}</span>
                  <span>{d.danger}</span>
                  {d.lockedReason && <span className="dest-lock">{d.lockedReason}</span>}
                </span>
              )}
            </div>
            {d.here && <span className="here">You are here</span>}
            {!d.here && !d.lockedReason && (
              <button
                type="button"
                className="btn small dest-go"
                disabled={d.blocker !== null}
                title={d.blocker ?? undefined}
                onClick={() => {
                  perform(d.action);
                }}
              >
                Travel
              </button>
            )}
          </article>
        ))}
      </main>
    </>
  );
}
