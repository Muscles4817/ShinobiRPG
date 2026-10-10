import { headerView, marketView } from '@/game';

import { Icon } from '../../art/Icon';
import { Banner } from '../../components/Banner';
import { FoodCard } from './FoodCard';
import type { PlaceProps } from '../types';

const CURTAINS = ['#a3361f', '#2b4f7a', '#4a6b3a', '#5a3a6e'];

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
                    <span className="item-pic">
                      <Icon id={item.icon} size={28} />
                    </span>
                    <b>{item.name}</b>
                    <small className={item.blocker ? 'blocker' : 'muted'}>
                      {item.blocker ??
                        (item.inPantry > 0 ? `${item.inPantry} at home` : 'For cooking at home')}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </>
  );
}
