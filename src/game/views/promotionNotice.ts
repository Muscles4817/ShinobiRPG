import { RANK_LABELS } from '@/systems/standing';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { daysToPromotion, homeHall, promotionWhen } from '../exam/promotionDay';
import type { GameState } from '../state';
import { capitalise, choice } from './common';

/**
 * A promotion the village has set a day for, pinned on the mission hall's board: when it is
 * held, or, once it was held without you, the way to take up the rank.
 */

export interface PromotionNotice {
  /** "Raised to chūnin". */
  readonly title: string;
  /** When it is held, or that it was held without you. */
  readonly when: string;
  readonly words: string;
  /** Taking up a rank held while you were away. */
  readonly collect: {
    readonly label: string;
    readonly action: GameAction;
    readonly blocker: string | null;
  } | null;
}

export function promotionNotice(state: GameState, ctx: GameContext): PromotionNotice | null {
  const due = state.exams.promotionDay;
  if (!due) return null;
  const title = `Raised to ${RANK_LABELS[due.ceremony.rank].toLowerCase()}`;
  const hall = homeHall(state, ctx)?.name ?? 'the mission hall';
  if (due.missed) {
    return {
      title,
      when: 'Waiting',
      words: `The ceremony was held while you were away. Your rank waits for you at ${hall}.`,
      collect: { label: 'Take up the rank', ...choice(state, ctx, { type: 'collectPromotion' }) },
    };
  }
  const days = daysToPromotion(state) ?? 0;
  const when = promotionWhen(days);
  return {
    title,
    when: capitalise(when),
    words:
      'The village holds it at home. No job that would keep you away over it will be signed out.',
    collect: null,
  };
}
