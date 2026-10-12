import { personStats } from '@/game/people/progress';
import { evenAptitude, fightingPower, STAT_IDS } from '@/systems/stats';
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
 * A focused player (see `focusedPlayer.ts`) lives day by day through real actions: drills
 * every day, the sensei's lesson every week. Growth falls steeply by grade (progression plan,
 * Phase 2): solo practice is effective at E, mild at D and far too slow to fill C. The player
 * here has an ordinary talent in everything, so the targets measure the formula, not the dice.
 * Set VITE_BENCH_REPORT=true to print the day-by-day grades.
 */

/** Target: a focused player is ready for the chūnin exam after about this many days… */
const CHUNIN_READY_DAYS = 60;
/** …give or take this many. */
const CHUNIN_READY_WINDOW = 15;
/** What "ready" means for now: the focused stat at the chūnin grade. */
const CHUNIN_GRADE = 'C';
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
};

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
    expect(run.state.people.team?.lastLessonDay).not.toBeNull();
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
    const later = playFocused(run.state, TAIJUTSU_FOCUS, MONTH).days.at(-1)!;
    expect(later.stats.taijutsu - last.stats.taijutsu).toBeLessThan(C_BAND * C_STALL_SHARE);
  });

  it.todo(
    'solo drilling alone stalls in D: without a teacher C is far off (Phase 3: today the ' +
      'weekly lesson adds little, so a drilling player reaches C mostly alone and stalls there)',
  );
  it.todo('training with someone a grade or two higher is what carries a stat into C (Phase 2)');
  it.todo('the focused player is nominated for the chūnin exam inside the window (Phase 6)');
});
