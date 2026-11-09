import { campView, headerView } from '@/game';

import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

/** A camp in wild country: the spot, what's in your pack, and a night under the sky. */
export function CampPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = campView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle="A night under the sky"
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        <section className="room-slip">
          <h2>Make camp</h2>
          <p className="story">{view.blurb}</p>
          <p className="room-price num">
            {view.rations === 1
              ? 'A day of food in your pack'
              : `${view.rations} days of food in your pack`}
          </p>
          <button
            type="button"
            className="btn wide"
            disabled={view.makeCamp.blocker !== null}
            onClick={() => {
              perform(view.makeCamp.action);
            }}
          >
            Make camp and sleep till dawn
          </button>
          {view.makeCamp.blocker && <p className="muted small">{view.makeCamp.blocker}</p>}
        </section>
      </main>
    </>
  );
}
