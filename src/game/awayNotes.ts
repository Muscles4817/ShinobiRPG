import { capitalise, counted } from '@/core';
import { daysAway, type MissionDef } from '@/systems/missions';

import type { GameContext } from './context';
import { nextSitting } from './exam/calendar';
import { nominationBlocker, senseiOf } from './exam/entry';
import { promotionClash } from './exam/promotionDay';
import { jobAsWalked } from './jobRoads';
import type { GameState } from './state';

/**
 * What a job that keeps you away for days means at home. The village carries on without you
 * (the board, peers' training and gossip catch up by day), but an exam doesn't wait: a job that
 * would keep you out past one you could sit is a warning, and your sensei won't sign you out for
 * it once they would nominate you. Nor does a promotion the village has set a day for: the hall
 * won't send you out over it.
 */

export interface ExamClash {
  /** Your sensei refuses to let you go. */
  readonly blocks: boolean;
  readonly text: string;
}

function inDays(days: number): string {
  if (days === 0) return 'today';
  return days === 1 ? 'tomorrow' : `in ${counted(days, 'day')}`;
}

/** A day at home a job would make you miss (a promotion, then an exam), or null. */
export function dateClash(state: GameState, ctx: GameContext, def: MissionDef): ExamClash | null {
  const promotion = promotionClash(state, ctx, def);
  return promotion ? { blocks: true, text: promotion } : examClash(state, ctx, def);
}

/** The exam a job would make you miss, or null when you'd be back in time. */
function examClash(state: GameState, ctx: GameContext, def: MissionDef): ExamClash | null {
  const away = daysAway(jobAsWalked(state, ctx, def));
  const sitting = nextSitting(state, ctx);
  if (away === 0 || !sitting || sitting.daysAway >= away) return null;
  const when = inDays(sitting.daysAway);
  const sensei = senseiOf(state, ctx);
  if (sensei && nominationBlocker(state, ctx) === null) {
    return {
      blocks: true,
      text: `${sensei.name} won’t sign you out. ${sitting.exam.name}: ${when}, and you’re sitting it.`,
    };
  }
  return { blocks: false, text: `${sitting.exam.name}: ${when}. You’d be away.` };
}

/** How long a job keeps you away, in words, or null for one done within a day. */
export function awayFor(state: GameState, ctx: GameContext, def: MissionDef): string | null {
  const days = daysAway(jobAsWalked(state, ctx, def));
  if (days === 0) return null;
  return capitalise(`${counted(days, 'day')} away`);
}
