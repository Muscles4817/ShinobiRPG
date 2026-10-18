import { act, ctx, newGame, withAllStats, withHound } from '@/test/gameFixtures';
import { blockerFor } from '@/game';
import { PLAYER_OWNER } from '@/systems/companions';

import type { GameState } from '../state';
import { companionAllies } from './combatant';
import { playerCompanion } from './make';
import { companionsDayPassed } from './routine';

/** The same game some days later, the companion fed all along. */
function daysLater(state: GameState, days: number, fed = true): GameState {
  const day = state.time.day + days;
  const later = { ...state, time: { ...state.time, day } };
  const pet = playerCompanion(later)!;
  const owned = { [PLAYER_OWNER]: { ...pet, lastFedDay: fed ? day - 1 : pet.lastFedDay } };
  return companionsDayPassed({ ...later, companions: { ...later.companions, owned } }, ctx);
}

function kennelPup(): GameState {
  return act(newGame({ wallet: { ryo: 1000 } }), { type: 'takePup' });
}

describe('growing up', () => {
  it('a kennel pup arrives small, stays home from fights, and grows into its body', () => {
    const pup = kennelPup();
    const small = playerCompanion(pup)!;
    expect(companionAllies(pup, ctx)).toEqual([]);
    const young = daysLater(pup, 15);
    expect(young.journal.entries.some((e) => e.text.includes('grown into its paws'))).toBe(true);
    expect(companionAllies(young, ctx)).toHaveLength(1);
    const grown = daysLater(young, 45);
    expect(playerCompanion(grown)!.stats.strength).toBeGreaterThan(small.stats.strength * 1.4);
    expect(grown.journal.entries.some((e) => e.text.includes('It has the body'))).toBe(true);
  });

  it('a hungry pup grows more slowly', () => {
    const pup = kennelPup();
    const fed = playerCompanion(daysLater(pup, 10))!.grownDays;
    const starved = playerCompanion(daysLater(pup, 10, false))!.grownDays;
    expect(starved).toBeLessThan(fed);
  });

  it('its body has a ceiling no training passes, and drills its skills, not its body', () => {
    const state = withAllStats(withHound(newGame()), 30);
    expect(blockerFor(state, { type: 'trainCompanion', stat: 'strength' }, ctx)).toMatch(/time/);
    expect(blockerFor(state, { type: 'trainCompanion', stat: 'taijutsu' }, ctx)).toBeNull();
    const grown = daysLater(state, 60);
    const hound = playerCompanion(grown)!;
    expect(hound.stats.strength).toBeLessThan(9 * 1.05 * 1.2 + 0.01);
  });

  it('a weak owner still teaches: the handler rule ignores your own grades', () => {
    const state = withHound(newGame());
    const weak = withAllStats(state, 2);
    const before = playerCompanion(weak)!.stats.taijutsu;
    const after = playerCompanion(act(weak, { type: 'trainCompanion', stat: 'taijutsu' }))!;
    expect(after.stats.taijutsu).toBeGreaterThan(before);
  });

  it('training warms the bond once a day only', () => {
    const state = withHound(newGame({}), { bond: 20 });
    const once = act(state, { type: 'trainCompanion', stat: 'taijutsu' });
    const rested = {
      ...once,
      character: { ...once.character, vitals: { ...once.character.vitals, energy: 100 } },
    };
    const twice = act(rested, { type: 'trainCompanion', stat: 'taijutsu' });
    expect(playerCompanion(once)!.bond).toBeGreaterThan(20);
    expect(playerCompanion(twice)!.bond).toBe(playerCompanion(once)!.bond);
  });

  it('kept on scraps alone, the bond slowly drifts', () => {
    const state = withHound(newGame(), { bond: 40 });
    const later = daysLater(state, 8);
    expect(playerCompanion(later)!.bond).toBeLessThan(40);
  });
});
