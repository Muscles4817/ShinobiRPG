import { headerView, marketView } from '@/game';

import { Icon } from '../../art/Icon';
import { Banner } from '../../components/Banner';
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
            <span className="muted">Fed {view.fullness} / 100</span>
            <span className="fbar">
              <i style={{ width: `${view.fullness}%` }} />
            </span>
          </span>
        </section>
        {view.stalls.map((stall) => (
          <section key={stall.name} className="stall">
            <div className="stall-head">
              <Icon id={stall.icon} />
              <h2>{stall.name}</h2>
              <small className="muted">{stall.blurb}</small>
            </div>
            <div className="stall-items">
              {stall.items.map((item) => (
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
                  <span className="chips">
                    <span className="chip gain">Fed +{item.satiety}</span>
                    {item.energy > 0 && <span className="chip gain">Energy +{item.energy}</span>}
                    {item.slots > 0 && <span className="chip">{item.slots} slot</span>}
                  </span>
                  <small className={item.blocker ? 'blocker' : 'muted'}>
                    {item.blocker ?? `You’d be ${item.fullAfter} / 100 fed`}
                  </small>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
