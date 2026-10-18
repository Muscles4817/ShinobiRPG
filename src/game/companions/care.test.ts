import { act, ctx, draft, formTeam, newGame, veteran, withHound } from '@/test/gameFixtures';
import type { CombatOutcome } from '@/systems/combat';
import { hungerOf, KNOCKED_DOWN_DAYS, PLAYER_OWNER } from '@/systems/companions';
import { stock } from '@/systems/inventory';

import { contextForPack } from '../context';
import { createNewGame } from '../creation';
import { dispatch } from '../dispatch';
import type { GameState } from '../state';
import { favouriteOf, yourCompanion } from './care';
import { afterCompanionFight, companionAllies } from './combatant';
import { companionsDayPassed } from './routine';

const naruto = contextForPack('naruto')!;

function hound(state: GameState) {
  return state.companions.owned[PLAYER_OWNER]!;
}

/** Days later, with nothing done between but the mornings coming. */
function later(state: GameState, days: number, context = ctx): GameState {
  const time = { ...state.time, day: state.time.day + days };
  return companionsDayPassed({ ...state, time }, context);
}

function stocked(state: GameState, id: string, count = 3): GameState {
  return { ...state, inventory: stock(state.inventory, id, count) };
}

function downed(state: GameState): CombatOutcome {
  return {
    result: 'victory',
    rounds: 2,
    player: { health: 80, chakra: 20 },
    allies: { [`companion:${hound(state).id}`]: { health: 0 } },
  };
}

describe('feeding', () => {
  it('scraps keep it fed for free, once a day', () => {
    const state = withHound(newGame(), { lastFedDay: 0 });
    const fed = act(state, { type: 'feedCompanion', ingredientId: null });
    expect(hound(fed).lastFedDay).toBe(state.time.day);
    expect(hound(fed).bond).toBe(hound(state).bond);
    expect(dispatch(fed, { type: 'feedCompanion', ingredientId: null }, ctx).ok).toBe(false);
  });

  it('its favourite is a joy, found out by feeding it', () => {
    const state = withHound(newGame(), { lastFedDay: 0 });
    const { companion, kind } = yourCompanion(state, ctx)!;
    const favourite = favouriteOf(companion, kind, state.board.seed);
    const plain = kind.diet.find((id) => id !== favourite)!;
    const loved = act(stocked(state, favourite), {
      type: 'feedCompanion',
      ingredientId: favourite,
    });
    const liked = act(stocked(state, plain), { type: 'feedCompanion', ingredientId: plain });
    expect(hound(loved).favouriteKnown).toBe(true);
    expect(hound(loved).bond).toBeGreaterThan(hound(liked).bond);
    expect(hound(liked).bond).toBeGreaterThan(companion.bond);
  });

  it('goes hungry without meals, fights weaker, and a stray starved long enough leaves', () => {
    const state = withHound(newGame());
    expect(hungerOf(hound(later(state, 3)), state.time.day + 3)).toBe('hungry');
    const starving = later(state, 5);
    expect(hound(starving).bond).toBeLessThan(hound(state).bond);
    const gone = later(state, 9);
    expect(gone.companions.owned[PLAYER_OWNER]).toBeUndefined();
    expect(gone.companions.strayed?.name).toBe('Ash');
    expect(gone.companions.befriending?.kindId).toBe('stray-hound');
  });

  it('a clan-born companion never leaves, however hungry', () => {
    const game = formTeam(
      createNewGame({ draft: draft({ clanId: 'inuzuka' }, naruto), seed: 1 }, naruto),
      naruto,
    );
    expect(later(game, 20, naruto).companions.owned[PLAYER_OWNER]).toBeDefined();
  });

  it('on a job it eats from your pack', () => {
    const job = 'watch-over-the-smokehouse';
    const state = act(veteran(withHound(newGame()), 2), { type: 'startMission', missionId: job });
    expect(hungerOf(hound(later(state, 4)), state.time.day + 4)).toBe('fed');
  });
});

describe('play and training together', () => {
  it('a game a day, worth more by its tastes', () => {
    const state = withHound(newGame());
    const fetch = act(state, { type: 'playWithCompanion', play: 'fetch' });
    const walk = act(state, { type: 'playWithCompanion', play: 'walk' });
    expect(hound(fetch).bond).toBeGreaterThan(hound(walk).bond);
    expect(fetch.character.vitals.energy).toBeLessThan(state.character.vitals.energy);
    expect(dispatch(fetch, { type: 'playWithCompanion', play: 'rough' }, ctx).ok).toBe(false);
  });
});

describe('injuries and the vet', () => {
  it('knocked down, it is laid up and stays home', () => {
    const state = withHound(newGame());
    const hurt = afterCompanionFight(state, downed(state), ctx);
    expect(hound(hurt).injury?.until).toBe(state.time.day + KNOCKED_DOWN_DAYS);
    expect(companionAllies(hurt, ctx)).toEqual([]);
    expect(companionAllies(state, ctx)).toHaveLength(1);
  });

  it('stays out of spars: a spar is one against one', () => {
    const sparring = act(withHound(newGame()), { type: 'spar', personId: 'kaen' });
    const view = ctx.engines[0]!.view(sparring.combat!);
    expect(view.combatants.some((c) => c.name === 'Ash')).toBe(false);
  });

  it('the vet treats it once, medicine helps a day at a time', () => {
    const state = withHound(newGame({ wallet: { ryo: 500 } }));
    const hurt = afterCompanionFight(state, downed(state), ctx);
    const treated = act(hurt, { type: 'treatCompanion' });
    expect(hound(treated).injury!.until).toBeLessThan(hound(hurt).injury!.until);
    expect(treated.wallet.ryo).toBeLessThan(hurt.wallet.ryo);
    expect(dispatch(treated, { type: 'treatCompanion' }, ctx).ok).toBe(false);
    const bought = act(hurt, { type: 'buyMedicine' });
    const food = stocked(bought, 'eggs');
    const dosed = act(food, { type: 'doseCompanion', hidden: true });
    expect(hound(dosed).injury!.until).toBe(hound(hurt).injury!.until - 1);
    expect(dosed.companions.medicine).toBe(0);
  });

  it('the clan’s own kennels treat its children free', () => {
    const game = formTeam(
      createNewGame({ draft: draft({ clanId: 'inuzuka' }, naruto), seed: 1 }, naruto),
      naruto,
    );
    const hurt = afterCompanionFight(game, downed(game), naruto);
    const treated = act(hurt, { type: 'treatCompanion' }, naruto);
    expect(treated.wallet.ryo).toBe(hurt.wallet.ryo);
  });
});
