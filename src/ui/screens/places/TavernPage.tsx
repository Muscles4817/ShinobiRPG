import { useState } from 'react';

import { headerView, tavernView, type GameAction, type TavernView } from '@/game';

import { Icon } from '../../art/Icon';
import { Banner } from '../../components/Banner';
import { Avatar } from '../../components/Faces';
import type { PlaceProps } from '../types';
import { DiceTable } from './DiceTable';
import { FoodCard } from './FoodCard';
import { ToneStamp } from './ToneStamp';

type Perform = PlaceProps['perform'];

/**
 * The bar: a lantern-lit counter, tonight's regulars (sit down with one, or stand them all a
 * round), the back tables, the menu and the talk.
 */
export function TavernPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = tavernView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner title={view.name} slot={header.slot} onBack={onBack} backLabel={header.location} />
      <main className="page tavern">
        <p className="tavern-keeper">
          <Icon id="sake" size={20} /> {view.keeper}
        </p>
        {view.closed ? (
          <p className="tavern-closed">
            {view.closed} The shutters are down and the lantern is out.
          </p>
        ) : (
          <>
            <Crowd view={view} perform={perform} />
            <BackTables view={view} perform={perform} />
            <section aria-label="Menu">
              <h2 className="label">Menu</h2>
              <div className="stall-items">
                {view.menu.map((item) => (
                  <FoodCard key={item.id} item={item} perform={perform} />
                ))}
              </div>
            </section>
            {view.overheard.length > 0 && (
              <section className="overheard" aria-label="Overheard">
                <h2 className="label">Overheard at the counter</h2>
                <ul>
                  {view.overheard.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

/** Tonight's regulars: pick one to sit with, or stand everyone a round. */
function Crowd({ view, perform }: { readonly view: TavernView; readonly perform: Perform }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const seat = view.seats.find((s) => s.face.id === chosen) ?? view.seats[0];
  return (
    <section className="tavern-crowd" aria-label="Tonight's crowd">
      <h2 className="label">Tonight’s crowd</h2>
      {view.seats.length === 0 ? (
        <p className="muted">Nobody you know is in yet.</p>
      ) : (
        <div className="crowd-row" role="group" aria-label="Sit with">
          {view.seats.map(({ face }) => (
            <button
              key={face.id}
              type="button"
              className="crowd-face"
              aria-pressed={face.id === seat?.face.id}
              onClick={() => {
                setChosen(face.id);
              }}
            >
              <Avatar face={face} size={40} />
              <small>{face.name}</small>
            </button>
          ))}
        </div>
      )}
      {seat && (
        <div className="bar-seat" aria-label={`A drink with ${seat.face.name}`} role="group">
          <p className="bar-seat-head">
            Sit down with {seat.face.name} <span className="badge">{seat.stage}</span>
          </p>
          <div className="drink-ways">
            {seat.drinks.map((drink) => (
              <button
                key={drink.id}
                type="button"
                className="drink-way"
                disabled={drink.blocker !== null}
                onClick={() => {
                  perform(drink.action);
                }}
              >
                <b>{drink.label}</b>
                <small>{drink.line}</small>
                <ToneStamp read={drink.read} />
              </button>
            ))}
          </div>
          <p className="muted small">
            <span className="chip cost">−{view.cupCost} ryo</span> Counts as your time with{' '}
            {seat.face.name} today.
          </p>
          {seat.drinks[0]?.blocker && <small className="blocker">{seat.drinks[0].blocker}</small>}
        </div>
      )}
      <button
        type="button"
        className="btn small"
        disabled={view.round.blocker !== null}
        onClick={() => {
          perform(view.round.action);
        }}
      >
        Stand everyone a round
      </button>
      <span className="chips">
        <span className="chip cost">−{view.round.cost} ryo</span>
        <span className="chip gain">Bonds +{view.round.bond} each</span>
      </span>
      {view.round.blocker && <small className="blocker">{view.round.blocker}</small>}
    </section>
  );
}

/** What is played at the back tables tonight: most you watch, a dice table you can join. */
function BackTables({
  view,
  perform,
}: {
  readonly view: TavernView;
  readonly perform: (action: GameAction) => void;
}) {
  if (view.pastimes.length === 0) return null;
  return (
    <section className="back-tables" aria-label="At the back tables">
      <h2 className="label">At the back tables</h2>
      <ul>
        {view.pastimes.map((p) => (
          <li key={p.id} className="pastime">
            <b>{p.name}</b>
            <p className="story">{p.scene}</p>
            {p.dice && <DiceTable view={p.dice} perform={perform} />}
          </li>
        ))}
      </ul>
    </section>
  );
}
