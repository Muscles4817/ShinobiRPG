import { headerView, houseView, type Choice, type GameAction } from '@/game';

import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

function ChoiceButton({
  choice,
  label,
  perform,
}: {
  readonly choice: Choice;
  readonly label: string;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <>
      <button
        type="button"
        className="btn wide"
        disabled={choice.blocker !== null}
        onClick={() => {
          perform(choice.action);
        }}
      >
        {label}
      </button>
      {choice.blocker && <p className="muted small">{choice.blocker}</p>}
    </>
  );
}

/** A house in a town: the deed on paper while it's for sale, and your own key once it's not. */
export function HousePage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = houseView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={view.owned ? 'Your house' : view.seller}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page">
        <section className="room-slip">
          <h2>{view.owned ? 'Home away from home' : 'For sale'}</h2>
          <p className="story">{view.blurb}</p>
          {view.owned ? (
            <>
              <ChoiceButton choice={view.sleep} label="Sleep till dawn" perform={perform} />
              <ChoiceButton choice={view.rest} label="Take a nap" perform={perform} />
            </>
          ) : (
            <>
              <p className="room-price num">{view.price} ryo</p>
              <ChoiceButton choice={view.buy} label="Buy the house" perform={perform} />
            </>
          )}
        </section>
      </main>
    </>
  );
}
