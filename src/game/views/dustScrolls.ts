import { SCROLL_SESSIONS } from '@/systems/dusts';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * S-rank dust scrolls you hold (`dust/scrolls.ts`), on the Shinobi tab: what each teaches, how
 * far you have read it, in words, and a day's study.
 */

export interface DustScrollRow {
  readonly dustId: string;
  readonly name: string;
  readonly description: string;
  readonly progress: string;
  readonly study: Choice;
}

function progressWords(sessions: number): string {
  if (sessions === 0) return 'Unread. The seal alone is hard to look at.';
  return sessions < SCROLL_SESSIONS / 2
    ? 'You have made a start on it.'
    : 'Most of it makes sense now. A few more days.';
}

/** The scrolls you hold and haven't mastered. */
export function dustScrollRows(state: GameState, ctx: GameContext): readonly DustScrollRow[] {
  return state.dustScrolls.flatMap((scroll) => {
    const def = ctx.content.dusts.get(scroll.dustId);
    if (!def || scroll.sessions >= SCROLL_SESSIONS) return [];
    return [
      {
        dustId: def.id,
        name: `The ${def.name} Scroll`,
        description: def.description,
        progress: progressWords(scroll.sessions),
        study: choice(state, ctx, { type: 'studyDustScroll', dustId: def.id }),
      },
    ];
  });
}
