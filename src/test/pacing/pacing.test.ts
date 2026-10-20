import { nominationBlocker } from '@/game/exam/entry';
import { personStats } from '@/game/people/progress';
import { evenAptitude, fightingPower, STAT_IDS } from '@/systems/stats';
import { ctx, newGame } from '@/test/gameFixtures';

import {
  dayReached,
  gradeIndex,
  playFocused,
  type FocusPlan,
  type PacingRun,
} from './focusedPlayer';

/**
 * PACING
 *
 * A focused player (see `focusedPlayer.ts`) lives day by day through real actions: drills
 * every day, the sensei's lesson every week. Growth falls steeply by grade (progression plan,
 * Phase 2): solo practice is effective at E, mild at D and far too slow to fill C. The player
 * here has an ordinary talent in everything, so the targets measure the formula, not the dice.
 * Set VITE_BENCH_REPORT=true to print the day-by-day grades.
 */

/**
 * Target: a focused player is ready for the chūnin exam after about this many days… (A middle
 * graduate starts with their art a solid D, so the climb to C is about a month.)
 */
const CHUNIN_READY_DAYS = 30;
/** …give or take this many. */
const CHUNIN_READY_WINDOW = 10;
/** What "ready" means for now: the focused stat at the chūnin grade. */
const CHUNIN_GRADE = 'C';
/**
 * The sensei puts the focused player forward for the chūnin exam about this many days in…
 * (Gōran is a specialist: the art at chūnin level is not enough until the player can also get
 * in close, which the player works on as Gōran steers them. Measured: day 79; it was 45 when one
 * stat at C was readiness.)
 */
const NOMINATION_DAYS = 80;
/** …give or take this many. */
const NOMINATION_WINDOW = 15;
/** Training with the sensei every week gets the focus to C at least this many days sooner. */
const TEACHERS_LEAD_DAYS = 4;
/** Long enough to see the window close. */
const DAYS = CHUNIN_READY_DAYS + CHUNIN_READY_WINDOW;
/** After reaching C, a month alone fills less than this share of the C band (13 to 20). */
const C_STALL_SHARE = 0.25;
const C_BAND = 7;
const MONTH = 30;
/** Over a month, a teammate's specialty grows at least this much on their own… */
const PEER_MONTHLY_GROWTH = 1.5;
/** …and their fighting power stays within this share of the player's, either way. */
const PEER_BAND = 0.25;

const TAIJUTSU_FOCUS: FocusPlan = {
  focus: 'taijutsu',
  drillId: 'post-kicks',
  missionEveryDays: 2,
  withTeachers: true,
  followsAssignment: true,
};

/** The same player, drilling alone: no sensei, no better genin. */
const SOLO_FOCUS: FocusPlan = { ...TAIJUTSU_FOCUS, withTeachers: false };

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';

function report(run: PacingRun, plan: FocusPlan): void {
  if (!REPORT) return;
  for (const d of run.days) {
    const value = d.stats[plan.focus].toFixed(2);
    console.warn(`day ${d.day}: ${plan.focus} ${value} (${d.grades[plan.focus]}), ${d.ryo} ryo`);
  }
}

function ordinaryTalent() {
  const game = newGame();
  return { ...game, character: { ...game.character, aptitude: evenAptitude(1) } };
}

describe('pacing: a focused player', () => {
  const run = playFocused(ordinaryTalent(), TAIJUTSU_FOCUS, DAYS);
  const month = playFocused(ordinaryTalent(), TAIJUTSU_FOCUS, MONTH);
  report(run, TAIJUTSU_FOCUS);
  const first = run.days[0]!;
  const last = run.days.at(-1)!;

  it('lives every day through real actions', () => {
    expect(run.days).toHaveLength(DAYS + 1);
    expect(last.day).toBe(first.day + DAYS);
    expect(last.missionsCompleted).toBeGreaterThan(0);
    const senseiId = run.state.people.team?.senseiId ?? '';
    expect(run.state.people.taught[senseiId]).toBeDefined();
  });

  it('plays the same days for the same game', () => {
    expect(month.days).toEqual(run.days.slice(0, MONTH + 1));
  });

  it('teammates grow alongside: a month on, they are still a fair match', () => {
    const { state } = month;
    const mates = state.people.generated.filter((p) =>
      state.people.team?.teammateIds.includes(p.id),
    );
    const yours = fightingPower(state.character.stats);
    expect(mates).toHaveLength(2);
    for (const mate of mates) {
      const specialty = mate.specialty ?? 'taijutsu';
      const now = personStats(mate, state);
      expect(now[specialty] - mate.stats[specialty]).toBeGreaterThan(PEER_MONTHLY_GROWTH);
      expect(Math.abs(fightingPower(now) / yours - 1)).toBeLessThan(PEER_BAND);
    }
  });

  it('records a grade for every stat every day', () => {
    for (const day of run.days) expect(Object.keys(day.grades)).toHaveLength(STAT_IDS.length);
    expect(dayReached(run, 'taijutsu', first.grades.taijutsu)).toBe(first.day);
  });

  it(`the focused stat reaches ${CHUNIN_GRADE} on day ${CHUNIN_READY_DAYS} ± ${CHUNIN_READY_WINDOW}`, () => {
    expect(gradeIndex(first.grades.taijutsu)).toBeLessThan(gradeIndex(CHUNIN_GRADE));
    const reached = dayReached(run, 'taijutsu', CHUNIN_GRADE);
    expect(reached).not.toBeNull();
    expect(Math.abs((reached ?? 0) - first.day - CHUNIN_READY_DAYS)).toBeLessThanOrEqual(
      CHUNIN_READY_WINDOW,
    );
  });

  it('solo drilling stalls in C: a month alone barely dents the band', () => {
    expect(last.grades.taijutsu).toBe(CHUNIN_GRADE);
    const later = playFocused(run.state, SOLO_FOCUS, MONTH).days.at(-1)!;
    expect(later.stats.taijutsu - last.stats.taijutsu).toBeLessThan(C_BAND * C_STALL_SHARE);
  });

  it.todo(
    'solo drilling alone stalls in D: without a teacher C is far off (Phase 3: today the ' +
      'weekly lesson adds little, so a drilling player reaches C mostly alone and stalls there)',
  );
  it('training with someone a grade or two higher carries a stat into C well ahead of drilling', () => {
    const reached = dayReached(run, 'taijutsu', CHUNIN_GRADE) ?? 0;
    const solo = dayReached(
      playFocused(ordinaryTalent(), SOLO_FOCUS, DAYS),
      'taijutsu',
      CHUNIN_GRADE,
    );
    expect(solo ?? Infinity).toBeGreaterThanOrEqual(reached + TEACHERS_LEAD_DAYS);
  });
  it(`the focused player is nominated for the chūnin exam on day ${NOMINATION_DAYS} ± ${NOMINATION_WINDOW}`, () => {
    let state = ordinaryTalent();
    const start = state.time.day;
    let nominated: number | null = null;
    for (let day = 0; day <= NOMINATION_DAYS + NOMINATION_WINDOW && nominated === null; day++) {
      if (nominationBlocker(state, ctx) === null) nominated = state.time.day - start;
      else state = playFocused(state, TAIJUTSU_FOCUS, 1).state;
    }
    expect(nominated).not.toBeNull();
    expect(Math.abs((nominated ?? 0) - NOMINATION_DAYS)).toBeLessThanOrEqual(NOMINATION_WINDOW);
  });
});
