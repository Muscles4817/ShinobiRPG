import { evenAptitude } from '@/systems/stats';
import { ctx, newGame } from '@/test/gameFixtures';

import { lessonAway } from './actions/trainWith';
import { requirePerson } from './people/cast';
import { characterModifiers } from './profile';
import {
  ASSIGNMENT_DONE_REGARD,
  ASSIGNMENT_MISSED_REGARD,
  ASSIGNMENT_STEP,
  coachAfterLesson,
} from './sensei/coaching';
import { LAYER_STATS, weakestLayer } from './sensei/read';
import { ASSIGNMENT_GROWTH } from './sensei/state';
import type { GameState } from './state';
import { senseiWeekView } from './views/senseiWeek';

/** Your sensei's word after each lesson: the verdict, a gift seen, the read, the next work. */

function under(senseiId: string, state: GameState = newGame()): GameState {
  const team = { ...state.people.team!, senseiId };
  return { ...state, people: { ...state.people, team } };
}

function coach(state: GameState): GameState {
  const sensei = requirePerson(state, ctx, state.people.team!.senseiId!);
  return coachAfterLesson(state, ctx, sensei);
}

function withStat(state: GameState, stat: keyof GameState['character']['stats'], value: number) {
  const stats = { ...state.character.stats, [stat]: value };
  return { ...state, character: { ...state.character, stats } };
}

describe('the assignment your sensei sets', () => {
  it('is set at the lesson, by their lens, a step up from where the stat stands', () => {
    const goran = coach(under('goran'));
    const work = goran.character.assignment!;
    expect(work.stat).toBe('taijutsu');
    expect(work.target).toBeGreaterThan(work.from);
    // Tetsu reads what will get you killed: the work is in your thinnest layer of defence.
    const tetsu = coach(under('tetsu')).character.assignment!;
    expect(LAYER_STATS[weakestLayer(newGame().character.stats)]).toContain(tetsu.stat);
    expect(ASSIGNMENT_STEP.E).toBeGreaterThan(ASSIGNMENT_STEP.C);
  });

  it('comes with the lesson itself, and says so in their word', () => {
    const state = under('goran');
    const taught = lessonAway(state, ctx, requirePerson(state, ctx, 'goran'))!;
    expect(taught.character.assignment).not.toBeNull();
    const word = taught.journal.entries.find((e) => e.heading === 'Gōran’s word');
    expect(word?.chips).toContainEqual({ label: 'Assignment: Taijutsu', tone: 'info' });
    expect(senseiWeekView(taught, ctx)?.assignment).toEqual({
      stat: 'Taijutsu',
      progress: 'barely started',
    });
  });

  it('done, earns regard and a reward of their kind; not done, costs regard', () => {
    const set = coach(under('goran'));
    const work = set.character.assignment!;
    const done = coach(withStat(set, work.stat, work.target));
    expect(done.mentor.regard).toBe(set.mentor.regard + ASSIGNMENT_DONE_REGARD);
    expect(done.journal.entries.at(-1)?.chips).toContainEqual({
      label: 'Assignment done',
      tone: 'gain',
    });
    const missed = coach(set);
    expect(missed.mentor.regard).toBe(set.mentor.regard - ASSIGNMENT_MISSED_REGARD);
  });

  it('a gift-giving sensei hands over a piece for their art', () => {
    const set = coach(under('tetsu'));
    const work = set.character.assignment!;
    const done = coach(withStat(set, work.stat, work.target));
    const gifts = done.inventory;
    expect(gifts).not.toEqual(set.inventory);
  });

  it('pushes growth on the work, but not on your best art', () => {
    const set = coach(under('tetsu'));
    const work = set.character.assignment!;
    expect(work.stat).not.toBe('taijutsu');
    expect(characterModifiers(set.character, ctx).growth[work.stat]).toBeCloseTo(
      characterModifiers(newGame().character, ctx).growth[work.stat] * ASSIGNMENT_GROWTH,
    );
    const goran = coach(under('goran'));
    expect(characterModifiers(goran.character, ctx).growth.taijutsu).toBeCloseTo(
      characterModifiers(newGame().character, ctx).growth.taijutsu,
    );
  });
});

describe('your sensei’s read', () => {
  it('a sensei who looks for hidden talent names one you haven’t found', () => {
    const start = under('akari');
    const aptitude = { ...evenAptitude(1), fuuinjutsu: 1.6 };
    const unknown = { ...start.character.aptitudeKnown, fuuinjutsu: 'unknown' as const };
    const gifted = {
      ...start,
      character: { ...start.character, aptitude, aptitudeKnown: unknown },
    };
    const seen = coach(gifted);
    expect(seen.character.aptitudeKnown.fuuinjutsu).toBe('sense');
    expect(seen.character.assignment?.stat).toBe('fuuinjutsu');
  });

  it('brings up the job that beat you, once', () => {
    const beaten = {
      ...under('goran'),
      mentor: { ...under('goran').mentor, lastBeaten: 'Archers: close in.' },
    };
    const told = coach(beaten);
    expect(told.journal.entries.at(-1)?.text).toMatch(
      /You went down on that job. Archers: close in./,
    );
    expect(told.mentor.lastBeaten).toBeNull();
  });

  it('ends with the genin years', () => {
    const state = newGame();
    const chunin = { ...state, standing: { ...state.standing, rank: 'chunin' as const } };
    expect(coach(chunin)).toBe(chunin);
  });
});
