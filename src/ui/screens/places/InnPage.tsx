import { headerView, innView } from '@/game';

import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

/** The front desk: a room slip from the keeper, and the key for the night. */
export function InnPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = innView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={view.keeper}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        <section className="room-slip">
          <h2>A room for the night</h2>
          <p className="story">{view.blurb}</p>
          <p className="room-price num">{view.roomCost} ryo</p>
          <button
            type="button"
            className="btn wide"
            disabled={view.takeRoom.blocker !== null}
            onClick={() => {
              perform(view.takeRoom.action);
            }}
          >
            Take a room and sleep till dawn
          </button>
          {view.takeRoom.blocker && <p className="muted small">{view.takeRoom.blocker}</p>}
        </section>
      </main>
    </>
  );
}
