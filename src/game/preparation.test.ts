import { act, ctx, newGame, postEverything, veteran } from '@/test/gameFixtures';

import { afterPouch, playerCombatant } from './combatants';
import { blockerFor } from './dispatch';
import { companionCombatant } from './people/companions';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';
import { gearShopView, loadoutView } from './views/shops';

const rich = (state: GameState = newGame()): GameState => ({ ...state, wallet: { ryo: 2000 } });
const FORGE = 'kurogane-forge';

function atHall(state: GameState): GameState {
  return { ...state, time: { ...state.time, slot: 0 } };
}

describe('fight tools', () => {
  it('are sold by the piece at the forge, up to a full pouch', () => {
    let state = rich();
    const tray = gearShopView(state, ctx, FORGE)!.tools;
    expect(tray.map((t) => t.id)).toContain('smoke-bomb');
    for (let i = 0; i < 5; i++) state = act(state, { type: 'buyTool', toolId: 'smoke-bomb' });
    expect(state.inventory.tools['smoke-bomb']).toBe(5);
    expect(state.wallet.ryo).toBe(2000 - 5 * 30);
    expect(blockerFor(state, { type: 'buyTool', toolId: 'smoke-bomb' }, ctx)).toBe(
      'Your pouch holds 5 of those.',
    );
    expect(loadoutView(state, ctx).pouch).toMatchObject([{ id: 'smoke-bomb', count: 5 }]);
  });

  it('come along into every fight, and what a fight uses up leaves the pouch', () => {
    const state = act(act(rich(), { type: 'buyTool', toolId: 'wound-salve' }), {
      type: 'buyTool',
      toolId: 'flash-tag',
    });
    expect(playerCombatant(state, ctx).items).toEqual([
      { id: 'wound-salve', name: 'Wound salve', effect: 'heal', count: 1 },
      { id: 'flash-tag', name: 'Flash tag', effect: 'flash', count: 1 },
    ]);
    const after = afterPouch(state, {
      result: 'victory',
      rounds: 3,
      player: { health: 10, chakra: 10 },
      items: { 'wound-salve': 0, 'flash-tag': 1 },
    });
    expect(after.inventory.tools).toEqual({ 'flash-tag': 1 });
  });
});

describe('mission intel', () => {
  const escort = (state: GameState) =>
    missionBoardView(state, ctx)!.notices.find((n) => n.id === 'tea-merchant-escort')!;

  it('the notice only says how tough a job looks until you buy the report', () => {
    const state = atHall(rich(postEverything(veteran(newGame()))));
    const before = escort(state).opposition!;
    expect(before.foes).toBeNull();
    expect(before.intel?.fee).toBe(20);
    const known = act(state, { type: 'buyIntel', missionId: 'tea-merchant-escort' });
    expect(known.wallet.ryo).toBe(2000 - 20);
    const after = escort(known).opposition!;
    expect(after.intel).toBeNull();
    expect(after.foes?.map((f) => f.name)).toEqual(['Bandit Thug', 'Bandit Archer']);
    expect(after.foes?.[1]?.traits.map((t) => t.label)).toContain('Archer');
    expect(blockerFor(known, { type: 'buyIntel', missionId: 'tea-merchant-escort' }, ctx)).toBe(
      'You already know who you’ll face.',
    );
  });

  it('there is nothing to learn about a job without a fight', () => {
    const state = atHall(rich(postEverything(veteran(newGame()))));
    expect(blockerFor(state, { type: 'buyIntel', missionId: 'lantern-keepers-cat' }, ctx)).toBe(
      'No fighting is expected on this job.',
    );
  });
});

describe('genin fight to their specialty', () => {
  it('a genjutsu specialist hides in illusions, a taijutsu one brawls', () => {
    const state = newGame();
    const genin = ctx.content.people.all.filter((p) => p.role === 'genin');
    const traitsOf = (specialty: string) =>
      genin
        .filter((p) => p.specialty === specialty)
        .map((p) => companionCombatant(p, state, ctx, 'Genin').traits);
    expect(traitsOf('genjutsu')[0]).toEqual(['illusionist']);
    expect(traitsOf('taijutsu')[0]).toEqual(['brawler']);
  });
});

describe('saves', () => {
  it('a version 11 save has an empty pouch and no intel', () => {
    const state = newGame();
    const { tools: _tools, ...inventory } = state.inventory;
    const { intel: _intel, ...board } = state.board;
    const v11 = { ...state, inventory, board };
    const loaded = deserialize(JSON.stringify({ version: 11, state: v11 }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.inventory.tools).toEqual({});
    expect(loaded.value.board.intel).toEqual([]);
  });
});
