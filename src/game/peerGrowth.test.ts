import { act, ctx, freshGame, newGame, veteran } from '@/test/gameFixtures';
import { evenAptitude, statTier, STAT_IDS } from '@/systems/stats';

import { companionCombatant } from './people/companions';
import { peopleGrown, personAptitude, personStats, trainPerson } from './people/progress';
import { isLessonDay } from './people/regimen';
import { scoutPerson } from './scouting';
import type { GameState } from './state';

/** The same game, `days` later, with the people caught up. */
function later(state: GameState, days: number): GameState {
  const moved = { ...state, time: { ...state.time, day: state.time.day + days } };
  return { ...moved, people: peopleGrown(moved, ctx) };
}

function dayByDay(state: GameState, days: number): GameState {
  let current = state;
  for (let i = 0; i < days; i++) current = later(current, 1);
  return current;
}

/** Starts everyone's growth today, so the next catch-up trains from here. */
function started(state: GameState): GameState {
  return later(state, 0);
}

function teammate(state: GameState) {
  const id = state.people.team?.teammateIds[0] ?? '';
  const person = state.people.generated.find((p) => p.id === id);
  if (!person) throw new Error('no teammate');
  return person;
}

describe('generated genin', () => {
  it('are made with a rank, a graduate’s stats and a talent of their own', () => {
    for (const person of newGame().people.generated) {
      expect(person.rank).toBe('genin');
      // Made like the player: early training on a file, nothing past C at graduation.
      for (const id of STAT_IDS) expect(statTier(person.stats[id]).grade).toMatch(/[EDC]/);
      expect(Math.max(...STAT_IDS.map((id) => person.stats[id]))).toBeGreaterThanOrEqual(6);
      expect(person.aptitude).toBeDefined();
    }
    // A year is a spread: some of it has a stat well into D.
    const best = newGame().people.generated.map((p) =>
      Math.max(...STAT_IDS.map((id) => p.stats[id])),
    );
    expect(Math.max(...best)).toBeGreaterThanOrEqual(10);
    const talents = newGame().people.generated.map((p) => JSON.stringify(p.aptitude));
    expect(new Set(talents).size).toBeGreaterThan(1);
  });

  it('come out the same for the same save', () => {
    const once = act(freshGame(), { type: 'assignTeam' });
    expect(act(freshGame(), { type: 'assignTeam' }).people.generated).toEqual(
      once.people.generated,
    );
  });
});

describe('real stats', () => {
  it('a teammate fights with their own stats, not your mission record', () => {
    const state = newGame();
    const mate = teammate(state);
    const before = companionCombatant(mate, state, ctx, 'Teammate').attributes;
    expect(companionCombatant(mate, veteran(state, 30), ctx, 'Teammate').attributes).toEqual(
      before,
    );
    expect(personStats(mate, state)).toEqual(mate.stats);
  });

  it('authored people keep their written stats and get a talent from their id', () => {
    const kaen = ctx.content.people.require('kaen');
    expect(personStats(kaen, newGame())).toEqual(kaen.stats);
    expect(personAptitude(kaen, ctx)).toEqual(personAptitude(kaen, ctx));
    const goran = ctx.content.people.require('goran');
    expect(statTier(goran.stats.taijutsu).grade).toBe('A');
  });

  it('scouting reads a person’s real stats', () => {
    const state = newGame();
    const kaen = ctx.content.people.require('kaen');
    const even = scoutPerson(state, ctx, 'kaen');
    const grown = { ...kaen.stats, ninjutsu: 30, speed: 20, strength: 20, stamina: 20 };
    const stronger = {
      ...state,
      people: { ...state.people, progress: { kaen: { stats: grown, lastGrownDay: 1 } } },
    };
    expect(scoutPerson(stronger, ctx, 'kaen')?.threat).not.toBe(even?.threat);
    expect(scoutPerson(stronger, ctx, 'kaen')?.threatLabel).toBe('Far stronger than you');
  });
});

describe('peers grow on their own', () => {
  it('genin train every day that passes, in their specialty most', () => {
    const start = started(newGame());
    const mate = teammate(start);
    const specialty = mate.specialty ?? 'taijutsu';
    const after = later(start, 14);
    const gain = personStats(mate, after)[specialty] - personStats(mate, start)[specialty];
    expect(gain).toBeGreaterThan(0.5);
    expect(after.people.progress[mate.id]?.lastGrownDay).toBe(after.time.day - 1);
    const kaen = ctx.content.people.require('kaen');
    expect(personStats(kaen, after).ninjutsu).toBeGreaterThan(kaen.stats.ninjutsu);
  });

  it('catching up many days at once is the same as day by day', () => {
    const start = started(newGame());
    expect(later(start, 10).people.progress).toEqual(dayByDay(start, 10).people.progress);
  });

  it('someone new starts growing from today, and adults do not grow', () => {
    const state = later(newGame(), 5);
    const kaen = ctx.content.people.require('kaen');
    expect(personStats(kaen, state)).toEqual(kaen.stats);
    expect(state.people.progress.goran).toBeUndefined();
    expect(later(state, 0).people).toBe(state.people);
  });

  it('more talent means faster growth: a rival can pull ahead', () => {
    const start = started(newGame());
    const mate = teammate(start);
    const specialty = mate.specialty ?? 'taijutsu';
    const withTalent = (value: number): GameState => {
      const generated = start.people.generated.map((p) =>
        p.id === mate.id ? { ...p, aptitude: evenAptitude(value) } : p,
      );
      return { ...start, people: { ...start.people, generated } };
    };
    const gifted = personStats(mate, later(withTalent(1.6), 30))[specialty];
    const poor = personStats(mate, later(withTalent(0.6), 30))[specialty];
    expect(gifted).toBeGreaterThan(poor + 1);
  });

  it('teammates also get the sensei’s weekly lesson', () => {
    const start = started(newGame());
    const mate = teammate(start);
    const senseiId = start.people.team?.senseiId ?? '';
    const taught = ctx.content.people.require(senseiId).sensei?.specialty ?? 'taijutsu';
    const noSensei = {
      ...start,
      people: { ...start.people, team: { ...start.people.team!, senseiId: null } },
    };
    const lessons = Array.from({ length: 14 }, (_, i) => start.time.day + i).filter((d) =>
      isLessonDay(mate.id, start.board.seed, d),
    );
    expect(lessons).toHaveLength(2);
    const withLessons = personStats(mate, later(start, 15))[taught];
    expect(withLessons).toBeGreaterThan(personStats(mate, later(noSensei, 15))[taught]);
  });

  it('a spar is practice for your partner too', () => {
    const kaen = ctx.content.people.require('kaen');
    const state = newGame();
    const people = trainPerson(state, ctx, kaen, { ninjutsu: 0.5, speed: 0.3 });
    expect(people.progress.kaen?.stats.ninjutsu).toBeGreaterThan(kaen.stats.ninjutsu);
    expect(people.progress.kaen?.lastGrownDay).toBe(state.time.day - 1);
  });
});
