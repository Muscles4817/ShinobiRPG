import type { MarketItem } from '@/game';

import { Icon } from '../../art/Icon';
import type { PlaceProps } from '../types';

interface FoodCardProps {
  readonly item: MarketItem;
  readonly perform: PlaceProps['perform'];
}

/** A dish on a hanging menu slip: price, what it does for you; tap to buy and eat. */
export function FoodCard({ item, perform }: FoodCardProps) {
  return (
    <button
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
      <span className="chips">
        <span className="chip gain">Hunger −{item.satiety}</span>
        {item.energy > 0 && <span className="chip gain">Energy +{item.energy}</span>}
        {item.slots > 0 && <span className="chip">{item.slots} slot</span>}
      </span>
      {item.blocker ? (
        <small className="blocker">{item.blocker}</small>
      ) : (
        item.wasted > 0 && (
          <small className="muted">Too full: {item.wasted} would go to waste</small>
        )
      )}
    </button>
  );
}
