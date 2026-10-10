import { ROUND_BOND, tavernCrowd } from '../actions/tavern';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { closedSign, rumoursOverheard } from '../village';
import { choice, type Choice } from './common';
import { foodItem, type MarketItem } from './market';
import { personFace, type PersonFace } from './people';

/** The izakaya: who's in tonight, the menu, a round for the house, and talk at the counter. */
export interface TavernView {
  readonly name: string;
  readonly keeper: string;
  readonly ryo: number;
  /** "Closed. Opens this evening." while shut. */
  readonly closed: string | null;
  readonly crowd: readonly PersonFace[];
  readonly round: Choice & { readonly cost: number; readonly bond: number };
  readonly menu: readonly MarketItem[];
  readonly overheard: readonly string[];
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
    crowd: tavernCrowd(state, ctx).map((p) => personFace(state, p)),
    round: {
      ...choice(state, ctx, { type: 'buyRound' }),
      cost: tavern.roundCost,
      bond: ROUND_BOND,
    },
    menu: tavern.foodIds.map((id) => foodItem(state, ctx, id)),
    overheard: closed ? [] : rumoursOverheard(state, ctx).map((r) => r.text),
  };
}
