import { gearShopView, headerView, type GearItem } from '@/game';

import { Icon } from '../../art/Icon';
import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

interface ShopItemProps {
  readonly item: GearItem;
  readonly perform: PlaceProps['perform'];
}

/** One piece on the rack: price tag, what it adds, and buy or wear. */
function RackItem({ item, perform }: ShopItemProps) {
  const action = item.owned ? item.equip : item.buy;
  const label = item.equipped ? 'Wearing' : item.owned ? 'Wear' : 'Buy';
  return (
    <article className={item.equipped ? 'rack-item worn' : 'rack-item'}>
      {!item.owned && <span className="tag num">{item.cost}</span>}
      <span className="item-pic">
        <Icon id={item.icon} size={28} />
      </span>
      <b>{item.name}</b>
      <span className="chips">
        {item.bonuses.map((b) => (
          <span key={b} className="chip gain">
            {b}
          </span>
        ))}
      </span>
      <small className="muted">{item.description}</small>
      {action?.blocker && !item.owned && <small className="blocker">{action.blocker}</small>}
      <button
        type="button"
        className={item.owned ? 'btn ghost small' : 'btn small'}
        disabled={action?.blocker !== null}
        onClick={() => {
          if (action) perform(action.action);
        }}
      >
        {label}
      </button>
    </article>
  );
}

/** A gear shop as racks by slot: weapons, armour, charms. */
export function GearShopPage({
  ctx,
  state,
  perform,
  onBack,
  placeId,
}: PlaceProps & { readonly placeId: string }) {
  const view = gearShopView(state, ctx, placeId);
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
        <section className="purse">
          <span className="purse-ryo num">
            {view.ryo}
            <small> ryo</small>
          </span>
          <span className="muted small">
            Gear adds to your stats in fights. New gear goes on if the slot is free.
          </span>
        </section>
        {view.racks.map((rack) => (
          <section key={rack.slot} className="rack" aria-label={rack.label}>
            <h2 className="label">{rack.label}</h2>
            <div className="rack-items">
              {rack.items.map((item) => (
                <RackItem key={item.id} item={item} perform={perform} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
