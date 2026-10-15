import type { PersonDef } from '@/content';
import { stageOf } from '@/systems/bonds';
import type { JournalChip } from '@/systems/journal';
import { STAT_IDS, STAT_INFO, statTier, type StatGrade, type StatId } from '@/systems/stats';

import type { GameContext } from '../context';
import { logDiscoveries } from '../growth';
import { chip, log } from '../ops';
import { underSensei } from '../mentorship';
import { bondOf } from '../people/cast';
import type { Character, GameState } from '../state';
import { lensStat, senseiRead } from './read';
import { rewardFor } from './rewards';
import { withRegard, type Assignment } from './state';

/**
 * What your sensei does at the end of each weekly lesson: judges last week's assignment
 * (a reward for work done, lost regard for work not), maybe names a talent you haven't found,
 * reads you aloud (what will get you killed, what beat you, your edge) and sets the next
 * assignment by their lens: a stat to raise by a step before the next lesson.
 */

export const ASSIGNMENT_DONE_REGARD = 5;
export const ASSIGNMENT_MISSED_REGARD = 2;
/** A sensei who doesn't look for hidden talent sees it anyway once you are this close. */
export const REVEAL_STAGE = 3;

/** How far an assignment asks a stat to move in a week, by its grade: less as it climbs. */
export const ASSIGNMENT_STEP: Readonly<Record<StatGrade, number>> = {
  E: 0.5,
  D: 0.35,
  C: 0.2,
  B: 0.1,
  A: 0.05,
  S: 0.03,
};

interface Coached {
  readonly state: GameState;
  readonly lines: readonly string[];
  readonly chips: readonly JournalChip[];
}

function label(stat: StatId): string {
  return STAT_INFO[stat].label.toLowerCase();
}

function judge(state: GameState, ctx: GameContext, sensei: PersonDef): Coached {
  const work = state.character.assignment;
  if (!work) return { state, lines: [], chips: [] };
  const cleared = { ...state, character: { ...state.character, assignment: null } };
  if (state.character.stats[work.stat] < work.target) {
    return {
      state: { ...cleared, mentor: withRegard(cleared.mentor, -ASSIGNMENT_MISSED_REGARD) },
      lines: [`${sensei.name} checks your ${label(work.stat)}. Not enough. They don’t hide it.`],
      chips: [chip(`${sensei.name}’s regard falls`, 'cost')],
    };
  }
  const given = rewardFor(cleared, ctx, sensei);
  return {
    state: { ...given.state, mentor: withRegard(given.state.mentor, ASSIGNMENT_DONE_REGARD) },
    lines: [`You did the work on your ${label(work.stat)}.`, given.line],
    chips: [chip('Assignment done', 'gain'), given.chip],
  };
}

/** A gift you haven't found: the highest aptitude you have no read on, if it's a real one. */
function hiddenGift(character: Character): StatId | null {
  return STAT_IDS.filter((id) => character.aptitudeKnown[id] === 'unknown' && id !== 'reserves')
    .filter((id) => character.aptitude[id] > 1)
    .reduce<StatId | null>(
      (top, id) => (top && character.aptitude[top] >= character.aptitude[id] ? top : id),
      null,
    );
}

function reveal(state: GameState, ctx: GameContext, sensei: PersonDef): Coached {
  const ways = sensei.sensei?.ways;
  const looks =
    ways?.lens === 'hidden-talent' || stageOf(bondOf(state, sensei.id).points) >= REVEAL_STAGE;
  const gift = looks ? hiddenGift(state.character) : null;
  if (!gift) return { state, lines: [], chips: [] };
  const { character } = state;
  const known = { ...character, aptitudeKnown: { ...character.aptitudeKnown, [gift]: 'sense' } };
  return {
    state: logDiscoveries({ ...state, character: known }, [gift], ctx),
    lines: [
      `${sensei.name} watches you a long while. “There’s a gift in your ${label(gift)} you’ve never used.”`,
    ],
    chips: [chip(`${STAT_INFO[gift].label}: a gift`, 'gain')],
  };
}

function assign(state: GameState, ctx: GameContext, sensei: PersonDef): Coached {
  const lens = sensei.sensei?.ways.lens ?? 'weakest-stat';
  const stat = lensStat(state, ctx, lens);
  const from = state.character.stats[stat];
  const assignment: Assignment = {
    stat,
    from,
    target: from + ASSIGNMENT_STEP[statTier(from).grade],
  };
  return {
    state: { ...state, character: { ...state.character, assignment } },
    lines: [`“By the next lesson, I want to see your ${label(stat)} come on.”`],
    chips: [chip(`Assignment: ${STAT_INFO[stat].label}`, 'info')],
  };
}

function readAloud(state: GameState, sensei: PersonDef): readonly string[] {
  const read = senseiRead(state, sensei);
  const lens = sensei.sensei?.ways.lens;
  const order =
    lens === 'specialty' || lens === 'hidden-talent' ? [read.edge, read.danger] : [read.danger];
  return [...(read.beaten ? [read.beaten] : []), ...order];
}

/** After the weekly lesson: the verdict, a gift seen, the read and the next assignment. */
export function coachAfterLesson(state: GameState, ctx: GameContext, sensei: PersonDef): GameState {
  if (!sensei.sensei || !underSensei(state)) return state;
  const judged = judge(state, ctx, sensei);
  const seen = reveal(judged.state, ctx, sensei);
  const read = readAloud(seen.state, sensei);
  const set = assign(
    { ...seen.state, mentor: { ...seen.state.mentor, lastBeaten: null } },
    ctx,
    sensei,
  );
  return log(set.state, {
    heading: `${sensei.name}’s word`,
    text: [...judged.lines, ...seen.lines, ...read, ...set.lines].join(' '),
    tone: 'info',
    chips: [...judged.chips, ...seen.chips, ...set.chips],
  });
}
