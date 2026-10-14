import { createNewGame, type GameState } from '@/game';
import type { ClassStanding } from '@/systems/profile';
import type { StatGrade } from '@/systems/stats';
import { fullVitals } from '@/systems/vitals';
import { against, classmate, classmateIds, contentBench } from '@/test/bench/content';
import { ctx, draft, formTeam, postEverything } from '@/test/gameFixtures';

import { dayReached, playFocused, type FocusPlan } from './focusedPlayer';

/**
 * PACING BY CLASS STANDING
 *
 * Where you stood in your class is how hard the game is. The same focused player (drills every
 * day, the sensei weekly, a job every other day) reaches the chūnin grade in their specialty at
 * very different speeds from the bottom of the class and from the top (a genius graduates
 * there), and the dead last, who start out beaten by most of their year, climb by hard work.
 * Seeds are a few real rolls of the hidden talent, so the targets are medians.
 */

const FOCUS: FocusPlan = {
  focus: 'taijutsu',
  drillId: 'post-kicks',
  missionEveryDays: 2,
  withTeachers: true,
};
const SEEDS = [11, 22, 33] as const;
const DAYS = 160;
/** The dead last still make the chūnin grade in their art within this many days, by hard work. */
const DEAD_LAST_CHUNIN_DAYS = 150;
/** A genius graduates at C, but jōnin grade (B) is at least this far off: talent is not a shortcut past the work. */
const GENIUS_JONIN_FLOOR_DAYS = 120;
/** The climb: four months of hard work, and the dead last win this often against their year… */
const CLIMB_DAYS = 120;
const CLIMB_WIN_RATE = 0.4;
/** …from a start where most of their year beats them. */
const DEAD_LAST_START_WIN_RATE = 0.3;

function start(standing: ClassStanding, seed: number): GameState {
  const quickPick = { archetype: 'steady', specialty: 'taijutsu' } as const;
  return postEverything(
    formTeam(createNewGame({ draft: draft({ standing, quickPick }), seed }, ctx)),
  );
}

function daysToGrade(standing: ClassStanding, grade: StatGrade, days = DAYS): number {
  const reachedIn = SEEDS.map((seed) => {
    const game = start(standing, seed);
    const reached = dayReached(playFocused(game, FOCUS, days), FOCUS.focus, grade);
    return reached === null ? Infinity : reached - game.time.day;
  }).sort((a, b) => a - b);
  return reachedIn[1]!;
}

/** Win rate against every genin of their year, rested and fed. */
function againstTheirYear(state: GameState): number {
  const rested = {
    ...state,
    character: { ...state.character, injuries: [], vitals: fullVitals(state.character.stats) },
  };
  const ids = classmateIds(rested);
  const total = ids.reduce(
    (sum, id) => sum + contentBench(against(rested, classmate(rested, id)), 20).winRate,
    0,
  );
  return total / ids.length;
}

describe('pacing by class standing', () => {
  const days = {
    deadLast: daysToGrade('dead-last', 'C'),
    middle: daysToGrade('middle', 'C'),
    genius: daysToGrade('genius', 'C'),
    geniusToJonin: daysToGrade('genius', 'B'),
  };

  it('the higher you stood, the sooner you make the chūnin grade in your art', () => {
    expect(days.genius).toBeLessThan(days.middle);
    expect(days.middle).toBeLessThan(days.deadLast);
  });

  it('a genius graduates at chūnin grade, and jōnin grade is still a long climb', () => {
    expect(days.genius).toBe(0);
    expect(days.geniusToJonin).toBeGreaterThanOrEqual(GENIUS_JONIN_FLOOR_DAYS);
  });

  it(`the dead last make it within ${DEAD_LAST_CHUNIN_DAYS} days, by hard work`, () => {
    expect(days.deadLast).toBeLessThanOrEqual(DEAD_LAST_CHUNIN_DAYS);
  });

  it('the dead last start beaten by their year, and climb', () => {
    const game = start('dead-last', SEEDS[0]);
    expect(againstTheirYear(game)).toBeLessThanOrEqual(DEAD_LAST_START_WIN_RATE);
    const later = playFocused(game, FOCUS, CLIMB_DAYS).state;
    expect(againstTheirYear(later)).toBeGreaterThanOrEqual(CLIMB_WIN_RATE);
  });

  it('a genius starts ahead of the middle of the class against their year', () => {
    expect(againstTheirYear(start('genius', SEEDS[0]))).toBeGreaterThan(
      againstTheirYear(start('middle', SEEDS[0])),
    );
  });
});
