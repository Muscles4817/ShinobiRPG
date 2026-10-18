import { counted } from '@/core';
import type { GameContext } from '../context';
import { examAnnounced } from '../exam/calendar';
import { examWord, finalsToday, type ExamWord } from '../exam/spectators';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * The exam for those not sitting it, on the village screen: in the week before, who told you
 * it is coming and what they said; on the day, the finals to go and watch.
 */

export interface ExamFinalsView {
  readonly name: string;
  /** "Today", "Tomorrow", "In 5 days". */
  readonly when: string;
  readonly word: ExamWord | null;
  /** Going to watch the finals, on the day (with why not, once watched or too late). */
  readonly watch: Choice | null;
}

function whenText(days: number): string {
  if (days === 0) return 'Today';
  return days === 1 ? 'Tomorrow' : `In ${counted(days, 'day')}`;
}

export function examFinalsView(state: GameState, ctx: GameContext): ExamFinalsView | null {
  if (state.exams.run) return null;
  const today = finalsToday(state, ctx);
  const word = examWord(state, ctx);
  const coming = examAnnounced(state, ctx);
  const exam = today ?? (word ? coming?.exam : null);
  if (!exam) return null;
  return {
    name: exam.name,
    when: today ? 'Today' : whenText(coming?.daysAway ?? 0),
    word,
    watch: today ? choice(state, ctx, { type: 'watchFinals' }) : null,
  };
}
