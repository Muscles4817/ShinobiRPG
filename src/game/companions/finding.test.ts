import { act, ctx, newGame, pressOn, withAllStats, withHound } from '@/test/gameFixtures';
import { BOND_STAGES } from '@/systems/bonds';
import { daysToWin, RESCUED_START_BOND, WILD_START_BOND } from '@/systems/companions';

import { blockerFor } from '../dispatch';
import type { GameState } from '../state';
import { playerCompanion } from './make';
import { wildHere } from './wild';

const WOODS = 'lantern-woods';

/** A sharp-eyed game whose seed has a wolf living in the woods. */
function wolfInTheWoods(): GameState {
  for (let seed = 1; seed < 200; seed++) {
    const game = withAllStats(newGame(), 20);
    const seeded = { ...game, board: { ...game.board, seed } };
    if (wildHere(seeded, ctx, WOODS)) return seeded;
  }
  throw new Error('no seed has a wolf in the woods');
}

function nextMorning(state: GameState): GameState {
  const time = { ...state.time, day: state.time.day + 1, slot: 0 };
  const vitals = { ...state.character.vitals, energy: 100 };
  return { ...state, time, character: { ...state.character, vitals } };
}

function playMission(state: GameState, missionId: string): GameState {
  let s = act(state, { type: 'startMission', missionId });
  for (let i = 0; i < 200 && (s.mission || s.combat); i++) s = pressOn(s);
  return s;
}

describe('finding a companion', () => {
  it('lives in some woods and not others, and only for someone without a companion', () => {
    const seeds = Array.from({ length: 40 }, (_, seed) => {
      const game = newGame();
      return wildHere({ ...game, board: { ...game.board, seed } }, ctx, WOODS) !== null;
    });
    expect(seeds).toContain(true);
    expect(seeds).toContain(false);
    expect(wildHere(withHound(wolfInTheWoods()), ctx, WOODS)).toBeNull();
    expect(wildHere(wolfInTheWoods(), ctx, 'canal-river')).toBeNull();
  });

  it('a wolf tracked over enough good days comes to you, untamed and slow to take orders', () => {
    let state = wolfInTheWoods();
    for (let day = 0; day < 40 && !playerCompanion(state); day++) {
      state = act(state, { type: 'trackWild', placeId: WOODS });
      if (!playerCompanion(state)) {
        expect(blockerFor(state, { type: 'trackWild', placeId: WOODS }, ctx)).toMatch(/enough/);
      }
      state = nextMorning(state);
    }
    const wolf = playerCompanion(state);
    expect(wolf?.kindId).toBe('forest-wolf');
    expect(wolf?.bond).toBe(WILD_START_BOND);
    expect(state.companions.befriending).toBeNull();
    expect(state.journal.entries.some((e) => e.heading?.includes(wolf?.name ?? '?'))).toBe(true);
  });

  it('takes at least as many days as a wild one needs, and not at night', () => {
    let state = wolfInTheWoods();
    for (let day = 1; day < daysToWin('wild'); day++) {
      state = nextMorning(act(state, { type: 'trackWild', placeId: WOODS }));
    }
    expect(playerCompanion(state)).toBeNull();
    const night = { ...state, time: { ...state.time, slot: 3 } };
    expect(blockerFor(night, { type: 'trackWild', placeId: WOODS }, ctx)).toMatch(/dark/);
  });

  it('tracking a wild one and winning over a stray keep their own records', () => {
    const state = act(wolfInTheWoods(), { type: 'trackWild', placeId: WOODS });
    expect(state.companions.tracking?.kindId).toBe('forest-wolf');
    expect(state.companions.befriending).toBeNull();
  });

  it('the clinic sells a pup, and gives one to a close friend of the vet', () => {
    const clinic = newGame();
    const rich = { ...clinic, wallet: { ...clinic.wallet, ryo: 1000 } };
    const bought = act(rich, { type: 'takePup' });
    expect(playerCompanion(bought)?.kindId).toBe('kennel-hound');
    expect(bought.wallet.ryo).toBe(400);
    expect(blockerFor(bought, { type: 'takePup' }, ctx)).toMatch(/already/);

    const poor = { ...clinic, wallet: { ...clinic.wallet, ryo: 0 } };
    expect(blockerFor(poor, { type: 'takePup' }, ctx)).toMatch(/close friends/);
    const close = BOND_STAGES[3].min;
    const bonds = { ...poor.people.bonds, kaori: { points: close, lastTalkDay: null, heard: [] } };
    const friend = { ...poor, people: { ...poor.people, bonds } };
    const given = act(friend, { type: 'takePup' });
    expect(playerCompanion(given)?.kindId).toBe('kennel-hound');
    expect(given.wallet.ryo).toBe(0);
  });

  it('a rescued pup waits at the clinic for you, taken home only once you have room', () => {
    const start = withAllStats(newGame(), 30);
    const veteran = { ...start, standing: { ...start.standing, missionsCompleted: 1 } };
    const owner = withHound(veteran);
    const done = playMission(owner, 'pup-in-the-culvert');
    const pup = done.companions.waiting;
    expect(pup?.kindId).toBe('stray-hound');
    expect(pup?.name).not.toBe('Ash');
    expect(pup?.bond).toBe(RESCUED_START_BOND);
    expect(done.reports.at(-1)).toMatchObject({ kind: 'mission-complete', companion: pup?.name });
    expect(blockerFor(done, { type: 'takeRescued' }, ctx)).toMatch(/Rehome Ash first/);

    const rehomed = act(done, { type: 'rehomeCompanion' });
    expect(playerCompanion(rehomed)).toBeNull();
    expect(rehomed.companions.strayed?.name).toBe('Ash');
    const taken = act(rehomed, { type: 'takeRescued' });
    expect(playerCompanion(taken)?.name).toBe(pup?.name);
    expect(taken.companions.waiting).toBeNull();
  });
});
