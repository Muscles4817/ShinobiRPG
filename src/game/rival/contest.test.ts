import { createRng } from '@/core';
import { bondWith } from '@/systems/bonds';
import { createStats } from '@/systems/stats';
import { act, ctx, fightOut, newGame } from '@/test/gameFixtures';

import { findPerson } from '../people/cast';
import { peopleGrown } from '../people/progress';
import type { GameState } from '../state';
import { raceView } from '../views/race';
import { rivalScene } from '../views/rival';
import { rivalryView } from '../views/rivalry';
import { PURSE } from './contest';
import { trailsYou } from './drive';
import { provocationToday } from './provocations';
import { finishOf, legEdge, newRace, RACE_LEGS, runLeg } from './race';
import { noteRival } from './record';
import type { RaceMove, Rival } from './state';

function withRival(state: GameState, patch: Partial<Rival>): GameState {
  return { ...state, rival: { ...state.rival!, ...patch } };
}

const rivalOf = (state: GameState) => findPerson(state, ctx, state.rival!.personId)!;

function race(theirMove: RaceMove, patch: Partial<ReturnType<typeof newRace>> = {}) {
  return { ...newRace('pride', { theirMove, read: true }), ...patch };
}

function runAll(state: GameState, move: RaceMove): GameState {
  let next = state;
  while (next.rival?.race) next = act(next, { type: 'runRaceLeg', move });
  return next;
}

describe('the race rules', () => {
  it('gives the leg to whoever has more of what it asks', () => {
    const quick = createStats(5, { speed: 12 });
    const slow = createStats(5, { speed: 6 });
    expect(legEdge(quick, slow, RACE_LEGS[0]!)).toBeGreaterThan(0);
    expect(legEdge(slow, quick, RACE_LEGS[0]!)).toBeLessThan(0);
  });

  it('answers each move with another: steady rides a push, a push outruns a gamble', () => {
    const rng = () => createRng(3);
    const leg = (yourMove: RaceMove, theirMove: RaceMove) =>
      runLeg({ race: race(theirMove), yourMove, edge: 0, rattled: false }, rng()).gained;
    expect(leg('steady', 'push')).toBe(0);
    expect(leg('push', 'steady')).toBe(0);
    expect(leg('push', 'push')).toBe(0);
    // Against a gambler, a push gains its ground whatever the roofs give them.
    const gambles = Array.from({ length: 20 }, (_, i) =>
      runLeg({ race: race('gamble'), yourMove: 'push', edge: 0, rattled: false }, createRng(i)),
    );
    const average = gambles.reduce((sum, r) => sum + r.gained, 0) / gambles.length;
    expect(average).toBeGreaterThan(1);
  });

  it('makes a push tell on the legs after it, and a rattled rival run worse', () => {
    const tired = race('steady', { yourStrain: 2 });
    const fresh = race('steady');
    const go = (r: ReturnType<typeof race>, rattled = false) =>
      runLeg({ race: r, yourMove: 'steady', edge: 0, rattled }, createRng(1)).gained;
    expect(go(tired)).toBeLessThan(go(fresh));
    expect(go(fresh, true)).toBeGreaterThan(go(fresh));
  });

  it('calls a finish inside a stride a dead heat', () => {
    expect(finishOf(0.2)).toBe('tie');
    expect(finishOf(2)).toBe('won');
    expect(finishOf(-2)).toBe('lost');
  });
});

describe('racing your rival', () => {
  it('is run leg by leg from their challenge, reading them as you go, and goes in the tally', () => {
    const challenged = withRival(newGame(), {
      challenge: { day: 1, line: 'Race.', contest: 'race' },
    });
    const started = act(challenged, { type: 'acceptChallenge' });
    expect(started.rival!.race?.leg).toBe(0);
    expect(started.character.vitals.energy).toBeLessThan(challenged.character.vitals.energy);
    const view = raceView(started, ctx)!;
    expect(view.moves.map((m) => m.label)).toEqual(['Hold steady', 'Push', 'Take the roofs']);
    expect(view.read.length).toBeGreaterThan(0);
    expect(() => act(started, { type: 'sleep' })).toThrow(/middle of a race/);
    const done = runAll(started, 'push');
    const { races, beat, race: running } = done.rival!;
    expect(running).toBeNull();
    const decided = races.you + races.them;
    expect(decided).toBeLessThanOrEqual(1);
    expect(beat?.kind === 'after-race').toBe(decided === 1);
  });

  it('can be put to them for a purse, which the winner takes', () => {
    const game = withRival(newGame(), { lastChallengeDay: -5 });
    const ryo = game.wallet.ryo;
    const done = runAll(
      act(game, { type: 'challengeRival', contest: 'race', stakes: 'purse' }),
      'steady',
    );
    const { races } = done.rival!;
    const expected = races.you ? ryo + PURSE : races.them ? ryo - PURSE : ryo;
    expect(done.wallet.ryo).toBe(expected);
  });

  it('is once a day on your terms, and a purse needs the ryo', () => {
    const game = withRival(newGame(), { lastChallengeDay: -5 });
    const once = runAll(
      act(game, { type: 'challengeRival', contest: 'race', stakes: 'pride' }),
      'steady',
    );
    const again = { ...once, rival: { ...once.rival!, beat: null } };
    expect(() => act(again, { type: 'challengeRival', contest: 'race', stakes: 'pride' })).toThrow(
      /already had it out/,
    );
    const broke = { ...game, wallet: { ryo: 0 } };
    expect(() => act(broke, { type: 'challengeRival', contest: 'spar', stakes: 'purse' })).toThrow(
      /purse needs/,
    );
  });

  it('settles a purse on a spar you put to them', () => {
    const game = withRival(newGame(), { lastChallengeDay: -5 });
    const ryo = game.wallet.ryo;
    const done = fightOut(act(game, { type: 'challengeRival', contest: 'spar', stakes: 'purse' }));
    const won = done.rival!.spars.you === 1;
    expect(done.wallet.ryo).toBe(won ? ryo + PURSE : ryo - PURSE);
    expect(done.rival!.sparStakes).toBeNull();
  });
});

describe('provocations', () => {
  const quiet = (state: GameState) =>
    withRival(state, {
      challenge: null,
      beat: null,
      lastProvocationDay: -10,
      lastChallengeDay: 99,
    });

  function provokedDay(state: GameState): number {
    const rival = quiet(state).rival!;
    const day = Array.from({ length: 60 }, (_, i) => i + 2).find(
      (d) => provocationToday(rival, state.board.seed, d) !== null,
    );
    if (day === undefined) throw new Error('No provocation in sixty days');
    return day;
  }

  it('come on a quiet day as it turns, as something specific they did', () => {
    const game = quiet(newGame());
    const day = provokedDay(game);
    const later = { ...game, time: { day, slot: 0 } };
    const next = noteRival(game, later, ctx);
    expect(next.rival!.beat?.kind).toBe('provocation');
    expect(rivalScene(next, ctx)!.title).toMatch(/again$/);
  });

  it('can be answered cruelly only once you know where it hurts, and cruelty rattles them', () => {
    const game = withRival(quiet(newGame()), { beat: { kind: 'provocation', id: 'took-job' } });
    const tones = (s: GameState) => rivalScene(s, ctx)!.choices.map((c) => c.tone);
    expect(tones(game)).not.toContain('Cruel');
    const id = game.rival!.personId;
    const known = {
      ...game,
      people: {
        ...game.people,
        bonds: { ...game.people.bonds, [id]: bondWith(30) },
      },
    };
    const cruelIndex = tones(known).indexOf('Cruel');
    expect(cruelIndex).toBeGreaterThan(-1);
    const after = act(known, { type: 'answerRival', choiceIndex: cruelIndex }).rival!;
    const letGo = act(known, { type: 'answerRival', choiceIndex: 0 }).rival!;
    expect(after.rattled).toBe(true);
    expect(letGo.rattled).toBe(false);
    expect(after.heat).toBeLessThan(letGo.heat);
  });

  it('settle it: telling them to name the day has them challenge you', () => {
    const game = withRival(quiet(newGame()), { beat: { kind: 'provocation', id: 'took-job' } });
    const index = rivalScene(game, ctx)!.choices.findIndex((c) => c.tone === 'Challenge');
    const after = act(game, { type: 'answerRival', choiceIndex: index }).rival!;
    expect(after.challenge).not.toBeNull();
  });

  it('are heard by your team, who lean by their tastes', () => {
    const game = withRival(quiet(newGame()), { beat: { kind: 'provocation', id: 'took-job' } });
    const choices = rivalScene(game, ctx)!.choices;
    const teased = choices.findIndex((c) => c.tone === 'Tease');
    const after = act(game, { type: 'answerRival', choiceIndex: teased });
    const moved = Object.keys(after.people.bonds).filter(
      (id) => after.people.bonds[id]?.points !== game.people.bonds[id]?.points,
    );
    expect(moved.length > 0).toBe(choices[teased]!.heard !== null);
  });
});

describe('closing the gap', () => {
  it('lets a rival who has fallen behind train harder, and says so', () => {
    const game = newGame();
    const theirs = rivalOf(game).stats;
    const ahead = { ...game, character: { ...game.character, stats: createStats(30, {}) } };
    expect(trailsYou(ahead, game.rival!.personId, theirs)).toBe(true);
    expect(rivalryView(ahead, ctx, game.rival!.personId)!.driven).toMatch(/train harder/);
    const seeded = (s: GameState) => ({ ...s, people: peopleGrown(s, ctx) });
    const later = (s: GameState) => ({ ...s, time: { ...s.time, day: s.time.day + 5 } });
    const grow = (s: GameState) =>
      peopleGrown(later(seeded(s)), ctx).progress[game.rival!.personId]!.stats;
    const grownAhead = grow(ahead);
    const grownUsual = grow({ ...ahead, rival: null });
    const total = (s: typeof grownAhead) => Object.values(s).reduce((a, b) => a + b, 0);
    expect(total(grownAhead)).toBeGreaterThan(total(grownUsual));
  });

  it('offers both grounds with whose edge it is, and the ways that apply', () => {
    const game = newGame();
    const behind = { ...game, character: { ...game.character, stats: createStats(2, {}) } };
    const view = rivalryView(behind, ctx, game.rival!.personId)!;
    expect(view.offers.map((o) => o.contest)).toEqual(['spar', 'race']);
    expect(view.offers.every((o) => o.edge === 'Their ground')).toBe(true);
    expect(view.ways[0]).toMatch(/^Swallow your pride/);
    expect(view.tally.map((t) => t.label)).toContain('Races');
  });
});
