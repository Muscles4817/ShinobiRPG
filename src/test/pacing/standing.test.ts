import { createNewGame, type GameState } from '@/game';
import { quickGrades, type ClassStanding } from '@/systems/profile';
import { fullVitals } from '@/systems/vitals';
import { against, classmate, classmateIds, contentBench } from '@/test/bench/content';
import { ctx, draft, formTeam, postEverything } from '@/test/gameFixtures';

import { dayReached, playFocused, type FocusPlan } from './focusedPlayer';

/**
 * PACING BY CLASS STANDING
 *
 * Where you stood in your class is how hard the game is. The same focused player (drills every
 * day, the sensei weekly, a job every other day) reaches the chūnin grade in their specialty at
 * very different speeds from the bottom of the class and from the top, and the dead last, who
 * start out beaten by every classmate, climb by hard work. Seeds are a few real rolls of the
 * hidden talent, so the targets are medians.
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
/** A genius needs at least this long: talent is not a shortcut past the work. */
const GENIUS_FLOOR_DAYS = 25;
/** The climb: four months of hard work, and the dead last win this often against their year… */
const CLIMB_DAYS = 120;
const CLIMB_WIN_RATE = 0.15;
/** …from a start where they win almost never. */
const DEAD_LAST_START_WIN_RATE = 0.05;

function start(standing: ClassStanding, seed: number): GameState {
  const grades = quickGrades(
    { specialty: 'taijutsu', strength: 'ninjutsu', weakness: 'genjutsu' },
    standing,
  );
  return postEverything(formTeam(createNewGame({ draft: draft({ standing, grades }), seed }, ctx)));
}

function daysToChunin(standing: ClassStanding): number {
  const days = SEEDS.map((seed) => {
    const game = start(standing, seed);
    const reached = dayReached(playFocused(game, FOCUS, DAYS), FOCUS.focus, 'C');
    return reached === null ? Infinity : reached - game.time.day;
  }).sort((a, b) => a - b);
  return days[1]!;
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
    deadLast: daysToChunin('dead-last'),
    middle: daysToChunin('middle'),
    genius: daysToChunin('genius'),
  };

  it('the higher you stood, the sooner you make the chūnin grade in your art', () => {
    expect(days.genius).toBeLessThan(days.middle);
    expect(days.middle).toBeLessThan(days.deadLast);
    expect(days.genius).toBeGreaterThanOrEqual(GENIUS_FLOOR_DAYS);
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
