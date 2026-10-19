import { useState } from 'react';

import { headerView, travelView, type CompanionOption } from '@/game';

import { Backdrop } from '../art/Backdrop';
import { Banner } from '../components/Banner';
import { TravelMapCard } from '../components/TravelMapCard';
import { Pane } from '../layout/Pane';
import type { ScreenProps } from './types';

/**
 * Destination cards: the way there, what to know before you go, and two ways to set out
 * (camping between legs, or hurrying on until the road stops you). The map above shows the
 * roads; tap a place on it to see just its card.
 */
export function TravelScreen({ ctx, state, perform }: ScreenProps) {
  const header = headerView(state, ctx);
  const [asked, setAsked] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const { leave, companions, along, destinations, map } = travelView(state, ctx, asked);
  const shown = picked === null ? destinations : destinations.filter((d) => d.id === picked);
  return (
    <>
      <Banner
        title="Where to?"
        subtitle={`From ${header.location}, ${header.date}`}
        slot={header.slot}
      />
      <main className="page">
        {leave && <p className="leave-slip">{leave}</p>}
        {along && <p className="leave-slip">{along} is travelling with you.</p>}
        <CompanionPicker companions={companions} onAsk={setAsked} />
        <Pane name="map">
          <TravelMapCard
            map={map}
            selected={picked}
            onSelect={(id) => {
              setPicked(id === picked ? null : id);
            }}
          />
          {picked !== null && (
            <button
              type="button"
              className="btn small ghost map-all"
              onClick={() => {
                setPicked(null);
              }}
            >
              Every place
            </button>
          )}
        </Pane>
        <Pane name="destinations">
          {shown.map((d) => (
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
                {d.closedRoads.length > 0 && (
                  <ul className="dest-notes dest-ways">
                    {d.closedRoads.map((w) => (
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
        </Pane>
      </main>
    </>
  );
}

interface PickerProps {
  readonly companions: readonly CompanionOption[];
  readonly onAsk: (id: string | null) => void;
}

/** Friends who would come along: tap one to ask them, again to go alone. */
function CompanionPicker({ companions, onAsk }: PickerProps) {
  if (companions.length === 0) return null;
  return (
    <section className="companions" aria-label="Who’s coming">
      <h2>Who’s coming?</h2>
      <div className="companion-row">
        {companions.map((c) => (
          <button
            key={c.id}
            type="button"
            className={c.asked ? 'btn small' : 'btn small ghost'}
            aria-pressed={c.asked}
            onClick={() => {
              onAsk(c.asked ? null : c.id);
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="muted small">
        {companions.some((c) => c.asked) ? 'They’ll come with you.' : 'You’ll go alone.'}
      </p>
    </section>
  );
}
