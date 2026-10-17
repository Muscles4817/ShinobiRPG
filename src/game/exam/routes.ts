import type { PersonDef } from '@/content';
import {
  actReached,
  dangerAtLeast,
  isSeniorMission,
  type MissionDef,
  type MissionRun,
} from '@/systems/missions';

import type { GameContext } from '../context';
import { jobOf } from '../crew';
import { gradeOf } from '../debrief';
import { waysOf } from '../sensei/generate';
import type { GameState } from '../state';
import { examAnnounced } from './calendar';
import { nominationBlocker, readinessGap } from './entry';
import type { Ceremony } from './state';

/**
 * The other roads to chūnin. The exam is the main one; beside it, a genin who is ready (some
 * grades at chūnin level, `readinessGap`) can be raised for one outstanding job (a field
 * promotion), at the end of an arc whose patron puts them forward, or on their sensei's word
 * after a year of good work, when no exam is days away. Each sets the same ceremony as the exam, marked with its route.
 */

/** A sensei puts a student forward without the exam only after this many days as a genin. */
export const SENSEI_RECOMMENDATION_DAYS = 112;
/** …and only a student they rate this highly: past what turning up alone earns. */
export const SENSEI_RECOMMENDATION_REGARD = 80;

/** Whether a genin is free to be raised: no ceremony waiting and no exam under way. */
function raisable(state: GameState): boolean {
  return (
    state.standing.rank === 'genin' &&
    state.exams.ceremony === null &&
    state.exams.run === null &&
    readinessGap(state.character.stats) === null
  );
}

function withCeremony(state: GameState, ceremony: Ceremony): GameState {
  return { ...state, exams: { ...state.exams, ceremony } };
}

/** A job no genin is sent on lightly: B-rank or harder, or a foe a match for a chūnin. */
function outstandingJob(ctx: GameContext, def: MissionDef): boolean {
  const { danger } = jobOf(ctx, def);
  return isSeniorMission(def.rank) || (danger !== null && dangerAtLeast(danger, 'deadly'));
}

/** A field promotion: an outstanding job done cleanly by a genin who is ready. */
export function afterFieldWork(
  state: GameState,
  ctx: GameContext,
  def: MissionDef,
  run: MissionRun,
): GameState {
  if (!raisable(state) || gradeOf(run) !== 'clean' || !outstandingJob(ctx, def)) return state;
  return withCeremony(state, { rank: 'chunin', route: 'field', missionId: def.id });
}

/** The first finished arc whose patron puts a ready genin forward, if any. */
export function arcRecommendation(state: GameState, ctx: GameContext): Ceremony | null {
  if (!raisable(state)) return null;
  const done = state.board.completed;
  const arc = ctx.content.arcs.all.find(
    (a) => a.recommends !== undefined && actReached(a, done) === a.acts.length,
  );
  return arc ? { rank: 'chunin', route: 'arc', arcId: arc.id } : null;
}

/** Whether this sensei would put you forward without the exam. */
function senseiWouldRecommend(state: GameState, ctx: GameContext, sensei: PersonDef): boolean {
  // A sensei who holds students back never lets one skip the exam, and none skips one that is
  // only days away: they put you forward for that instead.
  return (
    waysOf(sensei)?.gatekeeping.nominates !== 'late' &&
    examAnnounced(state, ctx) === null &&
    state.time.day > SENSEI_RECOMMENDATION_DAYS &&
    state.mentor.regard >= SENSEI_RECOMMENDATION_REGARD &&
    nominationBlocker(state, ctx) === null
  );
}

/** After a lesson: a sensei who rates you highly enough, after a year, recommends you. */
export function afterLessonRecommendation(
  state: GameState,
  ctx: GameContext,
  sensei: PersonDef,
): GameState {
  if (!raisable(state) || !senseiWouldRecommend(state, ctx, sensei)) return state;
  return withCeremony(state, { rank: 'chunin', route: 'sensei' });
}
