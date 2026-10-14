import { headerView, marketView, type CookbookItem, type GameAction } from '@/game';

import { Icon } from '../../art/Icon';
import { Banner } from '../../components/Banner';
import { FoodCard } from './FoodCard';
import type { PlaceProps } from '../types';

const CURTAINS = ['#a3361f', '#2b4f7a', '#4a6b3a', '#5a3a6e'];

/** A cookbook on the grocer's shelf: what it teaches, and how much of it is new to you. */
function CookbookButton({
  book,
  perform,
}: {
  readonly book: CookbookItem;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <button
      type="button"
      className="item"
      disabled={book.blocker !== null}
      title={book.blocker ?? undefined}
      onClick={() => {
        perform(book.action);
      }}
    >
      <span className="tag num">{book.cost}</span>
      <b>
        <Icon id={book.icon} size={18} />
        {book.name}
      </b>
      <small className="muted">Teaches {book.recipes.join(', ')}</small>
      <small className={book.blocker ? 'blocker' : 'muted'}>
        {book.blocker ?? `${book.fresh} new to you`}
      </small>
    </button>
  );
}

/** A street of stalls: shop curtains, product cards with price tags, and your purse. */
export function MarketPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = marketView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner title={view.name} slot={header.slot} onBack={onBack} backLabel={header.location}>
        <div className="noren" aria-hidden="true">
          {view.stalls.map((s, i) => (
            <span key={s.name} style={{ background: CURTAINS[i % CURTAINS.length] }}>
              <Icon id={s.icon} size={20} />
            </span>
          ))}
        </div>
      </Banner>
      <main className="page">
        <section className="purse">
          <span className="purse-ryo num">
            {view.ryo}
            <small> ryo</small>
          </span>
          <span className="purse-fill">
            <span className="muted">Hunger {view.hunger} / 100</span>
            <span className="fbar">
              <i style={{ width: `${view.hunger}%` }} />
            </span>
          </span>
        </section>
        {view.coming.map((line) => (
          <p key={line} className="muted small">
            {line}
          </p>
        ))}
        {view.festival && (
          <p className="festival-note">{view.festival}: festival prices on every stall.</p>
        )}
        {view.stalls.map((stall) => (
          <section
            key={stall.name}
            className={stall.closed ? 'stall shut' : stall.festival ? 'stall festive' : 'stall'}
          >
            <div className="stall-head">
              <Icon id={stall.icon} />
              <h2>{stall.name}</h2>
              <small className="muted">{stall.closed ?? stall.blurb}</small>
            </div>
            {!stall.closed && (
              <div className="stall-items">
                {stall.items.map((item) => (
                  <FoodCard key={item.id} item={item} perform={perform} />
                ))}
                {stall.ingredients.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="item"
                    disabled={item.blocker !== null}
                    title={item.blocker ?? undefined}
                    onClick={() => {
                      perform(item.action);
                    }}
                  >
                    <span className="tag num">{item.cost}</span>
                    <b>
                      <Icon id={item.icon} size={18} />
                      {item.name}
                    </b>
                    {item.season && <span className="badge">{item.season}</span>}
                    <small className={item.blocker ? 'blocker' : 'muted'}>
                      {item.blocker ??
                        (item.inPantry > 0 ? `${item.inPantry} at home` : 'For cooking at home')}
                    </small>
                  </button>
                ))}
                {stall.cookbooks.map((book) => (
                  <CookbookButton key={book.id} book={book} perform={perform} />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </>
  );
}
