import { headerView, travelView } from '@/game';

import { Backdrop } from '../art/Backdrop';
import { Banner } from '../components/Banner';
import type { ScreenProps } from './types';

/**
 * Destination cards: the way there, what to know before you go, and two ways to set out
 * (camping between legs, or hurrying on until the road stops you). The map replaces the list
 * later (world plan, step 7).
 */
export function TravelScreen({ ctx, state, perform }: ScreenProps) {
  const header = headerView(state, ctx);
  const { leave, destinations } = travelView(state, ctx);
  return (
    <>
      <Banner
        title="Where to?"
        subtitle={`From ${header.location}, ${header.date}`}
        slot={header.slot}
      />
      <main className="page">
        {leave && <p className="leave-slip">{leave}</p>}
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
                  {d.via && <span>{d.via}</span>}
                  {d.lockedReason && <span className="dest-lock">{d.lockedReason}</span>}
                </span>
              )}
              {d.warnings.length > 0 && (
                <ul className="dest-notes">
                  {d.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
              {!d.here && !d.lockedReason && (
                <div className="dest-go">
                  <button
                    type="button"
                    className="btn small"
                    disabled={d.blocker !== null}
                    title={d.blocker ?? undefined}
                    onClick={() => {
                      perform(d.action);
                    }}
                  >
                    Set out
                  </button>
                  <button
                    type="button"
                    className="btn small ghost"
                    disabled={d.quick.blocker !== null}
                    title={d.quick.blocker ?? undefined}
                    onClick={() => {
                      perform(d.quick.action);
                    }}
                  >
                    Hurry
                  </button>
                </div>
              )}
            </div>
            {d.here && <span className="here">You are here</span>}
          </article>
        ))}
      </main>
    </>
  );
}
