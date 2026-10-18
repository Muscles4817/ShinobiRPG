import { capitalise, listed } from '@/core';
import { RANK_LABELS } from '@/systems/standing';

import type { GameContext } from '../context';
import type { DayEnd } from '../daybook/state';
import type { DayGrowth } from './dayEndGrowth';
import type { DayHurt, DayPerson } from './dayEndRows';

/**
 * The end-of-day sheet's headline: one sentence about the day, as you might write it in a
 * diary, from the biggest two things that happened in it (a rank, a technique, a job, a grade,
 * the work, the people), in that order. Read from the same record as the sheet's rows.
 */

export interface DiaryParts {
  readonly growth: readonly DayGrowth[];
  readonly people: readonly DayPerson[];
  readonly hurts: readonly DayHurt[];
}

/** The day's clauses that a sentence may be made of, at most this many. */
const CLAUSES = 2;
/** Stats named in "you worked on…"; past these, "among other things". */
const WORK_NAMED = 2;

function rankClauses(ended: DayEnd, ctx: GameContext): string[] {
  const learned = ended.learned.flatMap((id) => ctx.content.techniques.get(id)?.name ?? []);
  return [
    ...(ended.rank ? [`you were made ${RANK_LABELS[ended.rank].toLowerCase()}`] : []),
    ...(learned.length > 0 ? [`you learned ${listed(learned)}`] : []),
    ...ended.jobs.map((title) => `you saw ${title} through`),
  ];
}

function workClauses(parts: DiaryParts, ended: DayEnd): string[] {
  const up = parts.growth.filter((g) => g.up);
  const grew = parts.growth.filter((g) => !g.up).map((g) => g.name.toLowerCase());
  const named = listed(grew.slice(0, WORK_NAMED));
  const more = grew.length > WORK_NAMED ? ', among other things' : '';
  return [
    ...up.map((g) => `your ${g.name.toLowerCase()} reached ${g.grade}`),
    ...(ended.injuries.length > 0 ? ['you came home hurt'] : []),
    ...(grew.length > 0 ? [`you worked on your ${named}${more}`] : []),
  ];
}

/** "Goro and Gōran know you now"; a sensei who thinks better or worse of you. */
function peopleClauses(parts: DiaryParts): string[] {
  const closer = parts.people.filter((p) => p.stamp?.startsWith('Now '));
  const byStamp = new Map<string, string[]>();
  for (const p of closer) {
    const pair = (p.stamp ?? '').slice('Now '.length);
    byStamp.set(pair, [...(byStamp.get(pair) ?? []), p.face.name]);
  }
  const regard = parts.people.filter((p) => p.stamp && !p.stamp.startsWith('Now '));
  return [
    ...[...byStamp].map(([pair, names]) =>
      names.length === 1
        ? `you and ${names.join('')} are ${pair} now`
        : `${listed([...names, 'you'])} are ${pair} now`,
    ),
    ...regard.map((p) => `${p.face.name} ${(p.stamp ?? '').toLowerCase()}`),
  ];
}

function hungerClause(parts: DiaryParts): string[] {
  const hungry = parts.hurts.find((h) => h.title === 'Hungry' || h.title === 'Starving');
  return hungry ? [`you went to bed ${hungry.title.toLowerCase()}`] : [];
}

function opening(ended: DayEnd): string | null {
  if (!ended.slept) return 'you never made it to bed';
  return ended.days > 1 ? 'you spent the days in bed, mending' : null;
}

/** One sentence about the day that ended. */
export function diaryLine(ended: DayEnd, parts: DiaryParts, ctx: GameContext): string {
  const first = opening(ended);
  const clauses = [
    ...(first ? [first] : []),
    ...rankClauses(ended, ctx),
    ...workClauses(parts, ended),
    ...peopleClauses(parts),
    ...hungerClause(parts),
  ].slice(0, CLAUSES);
  if (clauses.length === 0) return 'A quiet day, with nothing in particular to show for it.';
  return `${capitalise(clauses.join(', and '))}.`;
}
