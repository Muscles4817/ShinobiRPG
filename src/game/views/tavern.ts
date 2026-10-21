import type { PersonDef } from '@/content';

import { ROUND_BOND, tavernCrowd } from '../actions/tavern';
import { DRINK_WAYS } from '../bar';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { closedSign, menuToday, rumoursOverheard } from '../village';
import { choice, type Choice } from './common';
import { diceTableView, type DiceTableView } from './diceTable';
import { foodItem, type MarketItem } from './market';
import { companion, toneRead, type Companion, type ToneRead } from './outings';
import { townPrice } from '../greetings';

/**
 * The bar: who's in tonight, a seat beside one of them, a round for the house, what is being
 * played at the back tables, the menu, and talk at the counter.
 */
export interface TavernView {
  readonly name: string;
  readonly keeper: string;
  readonly ryo: number;
  /** "Closed. Opens this evening." while shut. */
  readonly closed: string | null;
  /** Tonight's crowd; sit down with one for a drink, spent one of three ways. */
  readonly seats: readonly BarSeat[];
  readonly cupCost: number;
  readonly round: Choice & { readonly cost: number; readonly bond: number };
  /** What is played at the back tables, and the tables you can sit down at. */
  readonly pastimes: readonly PastimeView[];
  readonly menu: readonly MarketItem[];
  readonly overheard: readonly string[];
}

export interface BarSeat extends Companion {
  readonly drinks: readonly DrinkChoice[];
}

export interface DrinkChoice extends Choice {
  readonly id: string;
  readonly label: string;
  readonly line: string;
  /** Whether it is their kind of night, once you know their tastes. */
  readonly read: ToneRead;
}

export interface PastimeView {
  readonly id: string;
  readonly name: string;
  readonly scene: string;
  /** A table you can sit down at, or null for one you only watch. */
  readonly dice: DiceTableView | null;
}

function seat(state: GameState, ctx: GameContext, person: PersonDef): BarSeat {
  return {
    ...companion(state, person),
    drinks: DRINK_WAYS.map((way) => ({
      ...choice(state, ctx, { type: 'drinkWith', personId: person.id, way: way.id }),
      id: way.id,
      label: way.label,
      line: way.line,
      read: toneRead(state, ctx, person, way.tone),
    })),
  };
}

export function tavernView(state: GameState, ctx: GameContext): TavernView | null {
  const tavern = placeHere(state, ctx, 'tavern');
  if (!tavern) return null;
  const closed = closedSign(tavern.hours, state);
  return {
    name: tavern.name,
    keeper: tavern.keeper,
    ryo: state.wallet.ryo,
    closed,
    seats: tavernCrowd(state, ctx).map((p) => seat(state, ctx, p)),
    cupCost: townPrice(tavern.cupCost, state, ctx),
    round: {
      ...choice(state, ctx, { type: 'buyRound' }),
      cost: townPrice(tavern.roundCost, state, ctx),
      bond: ROUND_BOND,
    },
    pastimes: (tavern.pastimes ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      scene: p.scene,
      dice: closed ? null : diceTableView(state, ctx, tavern.id, p),
    })),
    menu: menuToday(tavern.foodIds, state, ctx).map((id) => foodItem(state, ctx, id)),
    overheard: closed ? [] : rumoursOverheard(state, ctx).map((r) => r.text),
  };
}
