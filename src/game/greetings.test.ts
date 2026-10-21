import { CONTENT_PACKS } from '@/content';
import { newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { greetingNotes, townMarkup, townPrice, townWarmth } from './greetings';
import { warmed } from './people/warmth';
import type { GameState } from './state';
import { marketPrice } from './village';

/** How a town greets you: what it holds against you, in its prices and its people's warmth. */

const naruto = CONTENT_PACKS.find((p) => p.id === 'naruto');
const describeFan = naruto ? describe : describe.skip;
const CONTRACT = { contractId: 'toads', standing: 0, signedDay: 0 };

describeFan('town greetings', () => {
  const ctx = createGameContext(naruto!);
  const home = newGame({}, ctx);
  const inSand = (over: Partial<GameState> = {}) =>
    newGame({ locationId: 'sunagakure', ...over }, ctx);
  const sandFolk = ctx.content.people.require('suna-kiyose');
  const leafFolk = ctx.content.people.require('kakashi');

  it('holds nothing against you at home', () => {
    expect(townMarkup(home, ctx)).toBe(1);
    expect(greetingNotes(home, ctx)).toEqual([]);
    expect(townWarmth(home, ctx, leafFolk)).toBe(1);
  });

  it('charges someone from the Leaf more in the Sand, and says why', () => {
    const state = inSand();
    expect(townMarkup(state, ctx)).toBe(1.5);
    expect(townPrice(100, state, ctx)).toBe(150);
    expect(townPrice(0, state, ctx)).toBe(0);
    expect(marketPrice(100, state, ctx)).toBe(150);
    const notes = greetingNotes(state, ctx);
    expect(notes).toHaveLength(1);
    expect(notes[0]?.line).toMatch(/Sakumo Hatake/);
    expect(notes[0]?.chips).toEqual(['Prices +50%', 'Warms to you slowly']);
  });

  it('stacks a summoning contract on top of where you come from', () => {
    const state = inSand({ contract: CONTRACT });
    expect(townMarkup(state, ctx)).toBe(2.25);
    expect(greetingNotes(state, ctx)).toHaveLength(2);
    const landing = newGame({ locationId: 'kagero-landing', contract: CONTRACT }, ctx);
    expect(townMarkup(landing, ctx)).toBe(1.25);
    expect(townMarkup({ ...landing, contract: null }, ctx)).toBe(1);
  });

  it('makes the Sand’s people slow to warm to you, wherever you meet them', () => {
    expect(townWarmth(home, ctx, sandFolk)).toBe(0.5);
    expect(townWarmth(home, ctx, leafFolk)).toBe(1);
    const plain = warmed(home, ctx, 20);
    expect(warmed(home, ctx, 20, sandFolk)).toBeLessThanOrEqual(Math.ceil(plain / 2));
    expect(warmed(home, ctx, -5, sandFolk)).toBe(-5);
  });

  it('bills a room at the Sand’s inn at the foreigner’s price', () => {
    const before = inSand({ wallet: { ryo: 500 } });
    const slept = dispatch(before, { type: 'takeRoom' }, ctx);
    if (!slept.ok) throw new Error(slept.error);
    const room = ctx.content.locations.require('sunagakure').places.find((p) => p.kind === 'inn');
    const cost = room?.kind === 'inn' ? room.roomCost : 0;
    expect(before.wallet.ryo - slept.value.wallet.ryo).toBe(Math.round(cost * 1.5));
  });
});
