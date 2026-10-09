import { act, ctx, newGame } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { blockerFor } from './dispatch';
import { deserialize } from './persistence/save';
import { trainingScale } from './profile';
import type { GameState } from './state';
import { kitchenView } from './views/kitchen';
import { loadoutView } from './views/shops';

const rich = (state: GameState = newGame()): GameState => ({ ...state, wallet: { ryo: 2000 } });

function stocked(state: GameState, ids: string[]): GameState {
  return ids.reduce((s, ingredientId) => act(s, { type: 'buyIngredient', ingredientId }), state);
}

describe('gear', () => {
  it('buying gear costs ryo and goes straight on when the slot is free', () => {
    const state = rich();
    const bought = act(state, { type: 'buyGear', gearId: 'lantern-steel-tanto' });
    expect(bought.wallet.ryo).toBe(2000 - 180);
    expect(bought.inventory.equipped.weapon).toBe('lantern-steel-tanto');
    expect(blockerFor(bought, { type: 'buyGear', gearId: 'lantern-steel-tanto' }, ctx)).toBe(
      'You already own this.',
    );
  });

  it('a second weapon waits in the chest until you swap', () => {
    let state = act(rich(), { type: 'buyGear', gearId: 'lantern-steel-tanto' });
    state = act(state, { type: 'buyGear', gearId: 'wrapped-knuckles' });
    expect(state.inventory.equipped.weapon).toBe('lantern-steel-tanto');
    state = act(state, { type: 'equipGear', gearId: 'wrapped-knuckles' });
    expect(state.inventory.equipped.weapon).toBe('wrapped-knuckles');
    const weapon = loadoutView(state, ctx).slots.find((s) => s.slot === 'weapon')!;
    expect(weapon.spares.map((g) => g.id)).toEqual(['lantern-steel-tanto']);
    expect(act(state, { type: 'unequipGear', slot: 'weapon' }).inventory.equipped).toEqual({});
  });

  it('gear adds to your stats in fights, not your trained stats', () => {
    const state = act(rich(), { type: 'buyGear', gearId: 'kurogane-katana' });
    const fighter = playerCombatant(state, ctx);
    expect(fighter.attributes.kenjutsu).toBe(state.character.stats.kenjutsu + 3);
    expect(state.character.stats.kenjutsu).toBe(newGame().character.stats.kenjutsu);
  });

  it('refuses what you cannot afford', () => {
    const poor = { ...newGame(), wallet: { ryo: 10 } };
    expect(blockerFor(poor, { type: 'buyGear', gearId: 'flak-vest' }, ctx)).toBe(
      'You can’t afford it (260 ryo).',
    );
  });
});

describe('cooking', () => {
  it('ingredients from the grocer cook into a meal with a buff for the day', () => {
    const state = stocked(rich(), ['river-fish', 'rice', 'vegetables']);
    expect(state.inventory.pantry).toEqual({ 'river-fish': 1, rice: 1, vegetables: 1 });
    const hungry = {
      ...state,
      character: { ...state.character, vitals: { ...state.character.vitals, satiety: 10 } },
    };
    const cooked = act(hungry, { type: 'cook', recipeId: 'grilled-fish-set' });
    expect(cooked.inventory.pantry).toEqual({});
    expect(cooked.character.vitals.satiety).toBeGreaterThan(60);
    expect(cooked.character.meal).toBe('grilled-fish-set');
    const before = trainingScale(state.character, ctx).strength ?? 1;
    expect(trainingScale(cooked.character, ctx).strength).toBeCloseTo(before * 1.1);
    expect(kitchenView(cooked, ctx).meal?.name).toBe('Grilled Fish Set');
  });

  it('says what is missing and where to get it', () => {
    expect(blockerFor(newGame(), { type: 'cook', recipeId: 'miso-soup' }, ctx)).toBe(
      'Needs Miso, Vegetables. The grocer sells them.',
    );
  });

  it('the meal wears off when the day ends', () => {
    const state = stocked(rich(), ['rice', 'rice']);
    const cooked = act(state, { type: 'cook', recipeId: 'rice-ball-bento' });
    const slept = act({ ...cooked, time: { ...cooked.time, slot: 3 } }, { type: 'sleep' });
    expect(slept.character.meal).toBeNull();
  });
});

describe('saves', () => {
  it('a version 7 save gets an empty inventory and no meal', () => {
    const { inventory: _inventory, ...v7 } = newGame();
    const { meal: _meal, ...character } = v7.character;
    const loaded = deserialize(JSON.stringify({ version: 7, state: { ...v7, character } }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.inventory).toEqual({ gear: [], equipped: {}, pantry: {} });
    expect(loaded.value.character.meal).toBeNull();
  });
});
