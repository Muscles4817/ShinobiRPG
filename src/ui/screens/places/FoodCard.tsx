import type { MarketItem } from '@/game';

import { Icon } from '../../art/Icon';
import type { PlaceProps } from '../types';

interface FoodCardProps {
  readonly item: MarketItem;
  readonly perform: PlaceProps['perform'];
}

/** A dish with its price tag and what it does for you; tap to buy and eat. */
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
      <span className="item-pic">
        <Icon id={item.icon} size={28} />
      </span>
      <b>{item.name}</b>
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
