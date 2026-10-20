import { counted, listed } from '@/core';
import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { examAnnounced } from '../exam/calendar';
import {
  nominationBlocker,
  replacementCandidates,
  senseiOf,
  teammateBlocker,
  toleratesReplacement,
  type Replacement,
} from '../exam/entry';
import { requirePerson } from '../people/cast';
import { fillNames } from '../people/talk';
import type { GameState } from '../state';
import { choice } from './common';

/**
 * The exam's notice on the mission hall's board, in the week before and on the day: when it is,
 * what your sensei says (their nomination, or why not yet), your team's standing, and the ways
 * to enter (as you are, or with a replacement where your sensei allows one).
 */

/** Replacements offered per teammate who can't sit it. */
const MAX_CANDIDATES = 3;

export interface ExamTeammate {
  readonly name: string;
  /** Why they can't sit it, or null when they will. */
  readonly blocker: string | null;
}

export interface ExamEntry {
  readonly label: string;
  readonly action: GameAction;
  readonly blocker: string | null;
}

export interface ExamNotice {
  readonly name: string;
  /** "Today", "Tomorrow", "In 5 days". */
  readonly when: string;
  readonly today: boolean;
  /** Your sensei's word: the announcement once they nominate you, else why not yet. */
  readonly sensei: {
    readonly name: string;
    readonly words: string;
    readonly nominated: boolean;
  } | null;
  readonly team: readonly ExamTeammate[];
  /** What your sensei thinks of replacing a teammate, when one can't sit it. */
  readonly replacementRule: string | null;
  readonly entries: readonly ExamEntry[];
}

function whenText(days: number): string {
  if (days === 0) return 'Today';
  return days === 1 ? 'Tomorrow' : `In ${counted(days, 'day')}`;
}

function replacementSets(state: GameState, ctx: GameContext): Replacement[][] {
  const blocked = (state.people.team?.teammateIds ?? []).filter(
    (id) => teammateBlocker(state, ctx, requirePerson(state, ctx, id)) !== null,
  );
  const candidates = replacementCandidates(state, ctx).slice(0, MAX_CANDIDATES);
  const [first, second] = blocked;
  if (!first) return [];
  const singles = candidates.map((c) => [{ leaving: first, joining: c.id }]);
  if (!second) return singles;
  return candidates.flatMap((a) =>
    candidates
      .filter((b) => b.id !== a.id)
      .map((b) => [
        { leaving: first, joining: a.id },
        { leaving: second, joining: b.id },
      ]),
  );
}

function entries(state: GameState, ctx: GameContext): ExamEntry[] {
  const plain = { label: 'Sign up as a team', ...choice(state, ctx, { type: 'enterExam' }) };
  if (!toleratesReplacement(state, ctx)) return [plain];
  const swaps = replacementSets(state, ctx).map((replacements) => ({
    label: `Sit it with ${listed(replacements.map((r) => requirePerson(state, ctx, r.joining).name))}`,
    ...choice(state, ctx, { type: 'enterExam', replacements }),
  }));
  return [plain, ...swaps];
}

function senseiWords(state: GameState, ctx: GameContext, announcement: string) {
  const sensei = senseiOf(state, ctx);
  if (!sensei) return null;
  const blocker = nominationBlocker(state, ctx);
  const words = blocker ?? fillNames(announcement, { you: state.character.name, them: sensei });
  return { name: sensei.name, words, nominated: blocker === null };
}

export function examNotice(state: GameState, ctx: GameContext): ExamNotice | null {
  const coming = examAnnounced(state, ctx);
  if (!coming) return null;
  const team = (state.people.team?.teammateIds ?? []).map((id) => {
    const person = requirePerson(state, ctx, id);
    return { name: person.name, blocker: teammateBlocker(state, ctx, person) };
  });
  const someoneOut = team.some((t) => t.blocker !== null);
  const sensei = senseiOf(state, ctx);
  return {
    name: coming.exam.name,
    when: whenText(coming.daysAway),
    today: coming.daysAway === 0,
    sensei: senseiWords(state, ctx, coming.exam.announcement),
    team,
    replacementRule:
      someoneOut && sensei
        ? toleratesReplacement(state, ctx)
          ? `${sensei.name} will let another genin sit in, but the one left out will take it hard.`
          : `${sensei.name} won’t hear of a replacement: a team is a team.`
        : null,
    entries: coming.daysAway === 0 ? entries(state, ctx) : [],
  };
}
