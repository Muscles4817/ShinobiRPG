import { newGame } from '@/test/gameFixtures';

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
 * A focused player (see `focusedPlayer.ts`) lives day by day through real actions. Today's
 * growth is fast and flat: a taijutsu specialist drilling taijutsu reaches C in a few days and
 * S within a month. The growth model (progression plan, Phase 2) brings diminishing solo
 * returns and teachers, which should put chūnin readiness at about two months. When it lands,
 * turn the `it.todo`s into real tests against the named targets below.
 * Set VITE_BENCH_REPORT=true to print the day-by-day grades.
 */

/** Target: a focused player is ready for the chūnin exam after about this many days… */
const CHUNIN_READY_DAYS = 60;
/** …give or take this many. */
const CHUNIN_READY_WINDOW = 15;
/** What "ready" means for now: the focused stat at the chūnin grade. */
const CHUNIN_GRADE = 'C';

/** Today's coarse check: a month of focused play lifts the focused stat a grade or more. */
const MONTH = 30;

const TAIJUTSU_FOCUS: FocusPlan = {
  focus: 'taijutsu',
  drillId: 'post-kicks',
  missionEveryDays: 2,
};

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';

function report(run: PacingRun, plan: FocusPlan): void {
  if (!REPORT) return;
  for (const d of run.days) {
    const value = d.stats[plan.focus].toFixed(1);
    console.warn(`day ${d.day}: ${plan.focus} ${value} (${d.grades[plan.focus]}), ${d.ryo} ryo`);
  }
}

describe('pacing: a focused player', () => {
  const run = playFocused(newGame(), TAIJUTSU_FOCUS, MONTH);
  report(run, TAIJUTSU_FOCUS);
  const first = run.days[0]!;
  const last = run.days.at(-1)!;

  it('lives every day of the month through real actions', () => {
    expect(run.days).toHaveLength(MONTH + 1);
    expect(last.day).toBe(first.day + MONTH);
    expect(last.missionsCompleted).toBeGreaterThan(0);
    expect(run.state.people.team?.lastLessonDay).not.toBeNull();
  });

  it('plays the same month for the same game', () => {
    expect(playFocused(newGame(), TAIJUTSU_FOCUS, MONTH).days).toEqual(run.days);
  });

  it('a month of focus lifts the focused stat at least a grade', () => {
    const start = gradeIndex(first.grades.taijutsu);
    expect(gradeIndex(last.grades.taijutsu)).toBeGreaterThan(start);
  });

  it('records a grade for every stat every day', () => {
    for (const day of run.days) expect(Object.keys(day.grades)).toHaveLength(12);
    expect(dayReached(run, 'taijutsu', first.grades.taijutsu)).toBe(first.day);
  });

  it.todo(
    `the focused stat reaches ${CHUNIN_GRADE} on day ${CHUNIN_READY_DAYS} ± ${CHUNIN_READY_WINDOW} (Phase 2)`,
  );
  it.todo('solo drilling alone stalls in D: without a teacher C is far off (Phase 2)');
  it.todo('training with someone a grade or two higher is what carries a stat into C (Phase 2)');
  it.todo('the focused player is nominated for the chūnin exam inside the window (Phase 6)');
});
