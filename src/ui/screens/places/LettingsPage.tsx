import {
  headerView,
  lettingsView,
  type Choice,
  type FurnishingCard,
  type GameAction,
  type HomeCard,
} from '@/game';

import { HomePlan } from '../../art/HomePlan';
import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

type Perform = (action: GameAction) => void;

function Offer({
  label,
  choice,
  perform,
}: {
  readonly label: string;
  readonly choice: Choice;
  readonly perform: Perform;
}) {
  return (
    <button
      type="button"
      className="btn"
      disabled={choice.blocker !== null}
      onClick={() => {
        perform(choice.action);
      }}
    >
      {label}
    </button>
  );
}

/** Renting or buying a home not sealed, and why not when you can't yet. */
function Offers({ home, perform }: { readonly home: HomeCard; readonly perform: Perform }) {
  const offers = [home.rent, home.buy].filter((o) => o !== null);
  if (home.sealed !== null || offers.length === 0) return null;
  const blocker = offers.find((o) => o.choice.blocker !== null)?.choice.blocker ?? null;
  return (
    <>
      <span className="home-offers">
        {offers.map((o) => (
          <Offer key={o.label} label={o.label} choice={o.choice} perform={perform} />
        ))}
      </span>
      {blocker && <small className="home-why">{blocker}</small>}
    </>
  );
}

function HomeRung({ home, perform }: { readonly home: HomeCard; readonly perform: Perform }) {
  const look = `home-rung${home.current ? ' current' : ''}${home.sealed ? ' sealed' : ''}`;
  return (
    <li className={look}>
      <HomePlan rooms={home.rooms} hearth={home.spots.includes('hearth')} />
      <div>
        <h3>{home.name}</h3>
        <p>{home.blurb}</p>
        <span className="chips">
          {home.opens.map((o) => (
            <span key={o} className="chip gain">
              {o}
            </span>
          ))}
        </span>
        {home.current && <span className="home-stamp">Home</span>}
        {home.sealed && <p className="home-sealed">{home.sealed}</p>}
        <Offers home={home} perform={perform} />
      </div>
    </li>
  );
}

function Piece({ piece, perform }: { readonly piece: FurnishingCard; readonly perform: Perform }) {
  return (
    <li className="joiner-piece">
      <span className="joiner-head">
        <b>{piece.name}</b>
        <span className="joiner-price">{piece.owned ? 'Yours' : piece.price}</span>
      </span>
      <small>
        {piece.spot}. {piece.description}
      </small>
      <span className="chips">
        <span className={`chip ${piece.does === 'Comfort only' ? '' : 'gain'}`}>{piece.does}</span>
      </span>
      {!piece.owned && <Offer label="Buy and take it home" choice={piece.buy} perform={perform} />}
      {!piece.owned && piece.buy.blocker && <small className="home-why">{piece.buy.blocker}</small>}
    </li>
  );
}

/** The land office: the ladder of homes, and the joiner's furniture next door. */
export function LettingsPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = lettingsView(state, ctx);
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
        <section className="room-slip lettings">
          <h2>Homes to let</h2>
          {view.startHome && <p className="story">Where you live now: {view.startHome}.</p>}
          <ul className="home-ladder">
            {view.homes.map((home) => (
              <HomeRung key={home.id} home={home} perform={perform} />
            ))}
          </ul>
        </section>
        <section className="room-slip lettings">
          <h2>The joiner next door</h2>
          <p className="story">Every piece goes home with you, and comes with you when you move.</p>
          <ul className="joiner">
            {view.furniture.map((piece) => (
              <Piece key={piece.id} piece={piece} perform={perform} />
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
