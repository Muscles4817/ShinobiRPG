import { act, ctx, draft, formTeam, newGame } from '@/test/gameFixtures';
import { dispatch } from '@/game';
import { PLAYER_OWNER, STRAY_START_BOND, STRAY_VISITS_NEEDED } from '@/systems/companions';

import { contextForPack } from '../context';
import { createNewGame } from '../creation';
import type { GameState } from '../state';
import { companionAllies } from './combatant';
import { playerCompanion } from './make';
import { companionsDayPassed } from './routine';
import { strayToday } from './stray';

const naruto = contextForPack('naruto')!;

function inuzuka(): GameState {
  const fresh = createNewGame({ draft: draft({ clanId: 'inuzuka' }, naruto), seed: 1 }, naruto);
  return formTeam(fresh, naruto);
}

/** A game whose seed meets a stray, on a day it is about. */
function withStrayAbout(): GameState {
  for (let seed = 1; seed < 200; seed++) {
    const game = newGame();
    const seeded = { ...game, board: { ...game.board, seed } };
    if (strayToday(seeded, ctx)) return seeded;
  }
  throw new Error('no seed meets a stray');
}

/** The next day on which the stray is about again, from the next morning on. */
function nextStrayDay(state: GameState): GameState {
  for (let day = state.time.day + 1; day < state.time.day + 60; day++) {
    const later = { ...state, time: { ...state.time, day, slot: 0 } };
    if (strayToday(later, ctx)) return later;
  }
  throw new Error('the stray never comes back');
}

describe('companions', () => {
  it('a clan child grows up with one, and the clanless do not', () => {
    const state = inuzuka();
    const pup = playerCompanion(state);
    expect(pup?.kindId).toBe('ninken');
    expect(pup?.bond).toBe(30);
    expect(state.journal.entries.some((e) => e.text.includes(pup?.name ?? '?'))).toBe(true);
    expect(playerCompanion(newGame())).toBeNull();
  });

  it('keeps itself fit, a little, day by day', () => {
    const state = inuzuka();
    const pup = playerCompanion(state)!;
    const later = { ...state, time: { ...state.time, day: state.time.day + 10 } };
    const grown = companionsDayPassed(later, naruto).companions.owned[PLAYER_OWNER]!;
    expect(grown.stats.speed).toBeGreaterThan(pup.stats.speed);
    expect(grown.stats.speed - pup.stats.speed).toBeLessThan(3);
    expect(grown.stats.genjutsu).toBe(pup.stats.genjutsu);
  });

  it('a stray comes home after a few days’ visits, one a day', () => {
    let state = withStrayAbout();
    for (let visit = 1; visit <= STRAY_VISITS_NEEDED; visit++) {
      state = act(state, { type: 'befriendStray' });
      if (visit < STRAY_VISITS_NEEDED) {
        expect(dispatch(state, { type: 'befriendStray' }, ctx).ok).toBe(false);
        expect(playerCompanion(state)).toBeNull();
        state = nextStrayDay(state);
      }
    }
    const hound = playerCompanion(state);
    expect(hound?.kindId).toBe('stray-hound');
    expect(hound?.bond).toBe(STRAY_START_BOND);
    expect(state.companions.befriending).toBeNull();
    expect(strayToday(state, ctx)).toBeNull();
  });

  it('fights beside you, taking only the orders the bond has earned', () => {
    const state = inuzuka();
    const [ally] = companionAllies(state, naruto);
    expect(ally?.tag).toBe('Ninken');
    expect(ally?.orders).toEqual({});
    const pup = playerCompanion(state)!;
    const shy = {
      ...state,
      companions: { ...state.companions, owned: { [PLAYER_OWNER]: { ...pup, bond: 0 } } },
    };
    const [wary] = companionAllies(shy, naruto);
    expect(wary?.orders?.stanceLocked).toMatch(/doesn’t take that from you yet/);
    expect(companionAllies(newGame(), ctx)).toEqual([]);
  });
});
