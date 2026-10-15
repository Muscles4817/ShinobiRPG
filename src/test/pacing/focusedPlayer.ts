import {
  blockerFor,
  dispatch,
  trainingView,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';
import { isRentOverdue } from '@/systems/housing';
import {
  STAT_GRADES,
  statTier,
  STAT_IDS,
  type StatGrade,
  type StatId,
  type Stats,
} from '@/systems/stats';
import { isHungry, MAX_HEALTH } from '@/systems/vitals';
import { ctx as originalPack } from '@/test/gameFixtures';

/**
 * THE PACING HARNESS
 *
 * A scripted "focused player" who lives day by day through real `dispatch` actions, the way a
 * keen player would: keeping the sessions their sensei plans, training with their sensei
 * whenever they can and with any genin better
 * than them in their focus (unless the plan says to drill alone), the standing job every few
 * days for money, food when hungry, the hospital when badly hurt, and otherwise the one drill
 * they've chosen, napping when out of energy and sleeping at the end of the day. It records
 * every stat's grade at the end of each day, so milestone windows (how long until a stat
 * reaches C, until chūnin readiness) can be measured and, once growth is tuned, asserted.
 */

export interface FocusPlan {
  /** The stat this player cares about. */
  readonly focus: StatId;
  /** The drill they repeat (a `TrainingDef` id offered at the start location). */
  readonly drillId: string;
  /** How often they take the standing job, in days. */
  readonly missionEveryDays: number;
  /**
   * Whether they train with people better than them: their sensei whenever they can, and any
   * genin ahead of them in their focus. Off, they only drill (and fight).
   */
  readonly withTeachers: boolean;
  /** Whether they skip the short sessions their sensei plans (the lesson they still take). */
  readonly skipsSessions?: boolean;
}

export interface DayRecord {
  readonly day: number;
  readonly stats: Stats;
  readonly grades: Readonly<Record<StatId, StatGrade>>;
  readonly ryo: number;
  readonly missionsCompleted: number;
}

/**
 * Below this fraction of health the focused player pays for the hospital: missions turn away
 * anyone under 40%, and a night's sleep doesn't always bring a growing body back above it.
 */
const SEEK_TREATMENT_BELOW = 0.4;
/** Any one day can't take more decisions than this; more means the harness is stuck. */
const MAX_ACTIONS_PER_DAY = 60;
/** A mission (or its fight) longer than this many steps means the harness is stuck. */
const MAX_SCENE_STEPS = 400;
/** Fight options tried in order: start the round, then watch it exchange by exchange. */
const FIGHT_OPTIONS = ['begin', 'next', 'search', 'guard'] as const;

function allowed(state: GameState, action: GameAction, context: GameContext): boolean {
  return blockerFor(state, action, context) === null;
}

function apply(state: GameState, action: GameAction, context: GameContext): GameState {
  const result = dispatch(state, action, context);
  if (!result.ok) throw new Error(`Pacing: ${action.type} refused: ${result.error}`);
  return result.value;
}

/** Plays one scene step: a fight option, a story beat, or the first approach of a check. */
function sceneStep(state: GameState, context: GameContext): GameState {
  if (state.combat) {
    for (const optionId of FIGHT_OPTIONS) {
      const next = dispatch(state, { type: 'combatAct', optionId }, context);
      if (next.ok) return next.value;
    }
    throw new Error('Pacing: no fight option worked.');
  }
  const onward = dispatch(state, { type: 'missionContinue' }, context);
  return onward.ok
    ? onward.value
    : apply(state, { type: 'missionChoose', approachIndex: 0 }, context);
}

function playMission(state: GameState, missionId: string, context: GameContext): GameState {
  let current = apply(state, { type: 'startMission', missionId }, context);
  for (let i = 0; current.mission || current.combat; i++) {
    if (i >= MAX_SCENE_STEPS) throw new Error('Pacing: mission never ended.');
    current = sceneStep(current, context);
  }
  return current;
}

function standingJob(context: GameContext): string {
  const job = context.content.missions.all.find((m) => m.standing);
  if (!job) throw new Error('Pacing: the pack has no standing job.');
  return job.id;
}

/** Foods worth buying, the most filling for the money first. */
function menu(context: GameContext): readonly string[] {
  return [...context.content.foods.all]
    .filter((f) => f.satiety > 0)
    .sort((a, b) => b.satiety / b.cost - a.satiety / a.cost)
    .map((f) => f.id);
}

interface Today {
  readonly plan: FocusPlan;
  readonly context: GameContext;
  readonly jobId: string;
  readonly foods: readonly string[];
  /** Whether today's job has been done (or tried) already. */
  readonly jobDone: boolean;
}

/** Upkeep comes first: rent once it's overdue, food when hungry, a medic when badly hurt. */
function upkeep(state: GameState, today: Today): GameAction | null {
  const { context } = today;
  const { vitals } = state.character;
  const options: GameAction[] = [
    ...(isRentOverdue(state.housing, state.time.day) ? [{ type: 'payRent' } as const] : []),
    ...(isHungry(vitals) ? today.foods.map((foodId) => ({ type: 'eat', foodId }) as const) : []),
    ...(vitals.health < MAX_HEALTH * SEEK_TREATMENT_BELOW ? [{ type: 'treat' } as const] : []),
  ];
  return options.find((a) => allowed(state, a, context)) ?? null;
}

/**
 * Sessions worth taking now: the sensei in whatever they offer (the focus if they let you
 * choose), then any genin who can teach the focus.
 */
function teacherSessions(state: GameState, today: Today): GameAction[] {
  if (!today.plan.withTeachers) return [];
  const offers = trainingView(state, today.context)?.teachers ?? [];
  const { focus } = today.plan;
  return offers.flatMap((offer) => {
    const open = offer.open.filter((s) => s.blocker === null);
    const pick = open.find((s) => s.id === focus) ?? (offer.isSensei ? open[0] : undefined);
    return pick && (offer.isSensei || offer.isPeer) ? [pick.action] : [];
  });
}

/** The focused player's next move today. */
function nextAction(state: GameState, today: Today): GameAction {
  const { context, plan } = today;
  const jobDay = state.time.day % plan.missionEveryDays === 0 && !today.jobDone;
  const work: GameAction[] = [
    { type: 'dismissReport' },
    ...(plan.withTeachers && !plan.skipsSessions ? [{ type: 'senseiSession' } as const] : []),
    ...teacherSessions(state, today),
    ...(jobDay ? [{ type: 'startMission', missionId: today.jobId } as const] : []),
    { type: 'train', trainingId: plan.drillId },
    { type: 'rest' },
  ];
  const chosen = upkeep(state, today) ??
    work.find((a) => allowed(state, a, context)) ?? { type: 'sleep' };
  return chosen;
}

function record(state: GameState): DayRecord {
  const { stats } = state.character;
  const grades = Object.fromEntries(STAT_IDS.map((id) => [id, statTier(stats[id]).grade]));
  return {
    day: state.time.day,
    stats,
    grades: grades as Record<StatId, StatGrade>,
    ryo: state.wallet.ryo,
    missionsCompleted: state.standing.missionsCompleted,
  };
}

/** Lives one in-game day, from wherever the clock stands until the next day begins. */
function liveDay(state: GameState, base: Omit<Today, 'jobDone'>): GameState {
  const day = state.time.day;
  let current = state;
  let jobDone = false;
  for (let i = 0; current.time.day === day; i++) {
    if (i >= MAX_ACTIONS_PER_DAY) throw new Error(`Pacing: day ${day} never ended.`);
    const action = nextAction(current, { ...base, jobDone });
    if (action.type === 'startMission') {
      jobDone = true;
      current = playMission(current, action.missionId, base.context);
    } else current = apply(current, action, base.context);
  }
  return current;
}

export interface PacingRun {
  readonly state: GameState;
  /** The day the run began, then one record per day lived. */
  readonly days: readonly DayRecord[];
}

/** Plays `days` in-game days as a focused player, from a game ready to play. */
export function playFocused(
  start: GameState,
  plan: FocusPlan,
  days: number,
  context: GameContext = originalPack,
): PacingRun {
  const base = { plan, context, jobId: standingJob(context), foods: menu(context) };
  const records = [record(start)];
  let state = start;
  for (let i = 0; i < days; i++) {
    state = liveDay(state, base);
    records.push(record(state));
  }
  return { state, days: records };
}

/** The first day a stat reached `grade` (or better), or null if it never did. */
export function dayReached(run: PacingRun, stat: StatId, grade: StatGrade): number | null {
  const found = run.days.find((d) => gradeIndex(d.grades[stat]) >= gradeIndex(grade));
  return found ? found.day : null;
}

export function gradeIndex(grade: StatGrade): number {
  return STAT_GRADES.indexOf(grade);
}
