import { gearShopView, headerView, type GearItem, type ToolItem } from '@/game';

import { GearChips, GearKind } from './GearTags';

import { Icon } from '../../art/Icon';
import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';

interface ShopItemProps {
  readonly item: GearItem;
  readonly perform: PlaceProps['perform'];
}

/** One piece on the rack: price tag, kind and rank, what it does, and buy or wear. */
function RackItem({ item, perform }: ShopItemProps) {
  const action = item.owned ? item.equip : item.buy;
  const label = item.equipped ? 'Wearing' : item.owned ? 'Wear' : 'Buy';
  return (
    <article className={item.equipped ? 'rack-item worn' : 'rack-item'}>
      {!item.owned && <span className="tag num">{item.cost}</span>}
      <span className="rack-pic">
        <Icon id={item.icon} size={30} />
      </span>
      <b>{item.name}</b>
      <GearKind item={item} />
      <GearChips item={item} />
      <small className="rack-desc muted">{item.description}</small>
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

interface ToolProps {
  readonly item: ToolItem;
  readonly perform: PlaceProps['perform'];
}

/** A fight tool on the counter: price, how many you carry, buy one more. */
function TrayItem({ item, perform }: ToolProps) {
  const { buy } = item;
  return (
    <article className="rack-item">
      <span className="tag num">{item.cost}</span>
      <span className="rack-pic">
        <Icon id={item.icon} size={30} />
      </span>
      <b>{item.name}</b>
      <span className="chips">
        <span className="chip">
          In pouch {item.count}/{item.limit}
        </span>
      </span>
      <small className="rack-desc muted">{item.description}</small>
      {buy.blocker && <small className="blocker">{buy.blocker}</small>}
      <button
        type="button"
        className="btn small"
        disabled={buy.blocker !== null}
        onClick={() => {
          perform(buy.action);
        }}
      >
        Buy
      </button>
    </article>
  );
}

/** A gear shop as wall racks by slot (held, thrown, armour, focus), each piece on a bar. */
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
            Gear changes how you fight, not your stats. Rank B is sold to chūnin. New gear goes on
            if the slot is free.
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
        {view.tools.length > 0 && (
          <section className="rack" aria-label="Fight tools">
            <h2 className="label">Fight tools</h2>
            <p className="muted small">Used up in fights, in any fight style.</p>
            <div className="rack-items">
              {view.tools.map((item) => (
                <TrayItem key={item.id} item={item} perform={perform} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
