import { act, ctx, formTeam, freshGame, lastEntry, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import type { GameState } from './state';
import { kitchenView } from './views/kitchen';

function withPantry(state: GameState, pantry: Record<string, number>): GameState {
  return { ...state, inventory: { ...state.inventory, pantry } };
}

const FISH = { 'river-fish': 1, rice: 1, vegetables: 1 };

describe('cooking at the stove', () => {
  it('every beat right makes a fine dish; misses are told which way they went', () => {
    const state = withPantry(newGame(), FISH);
    const fine = act(state, {
      type: 'cook',
      recipeId: 'grilled-fish-set',
      steps: { cut: 'chunky', heat: 'fierce', finish: 'early' },
    });
    expect(fine.character.mealQuality).toBe('fine');
    expect(lastEntry(fine)?.chips?.[0]).toEqual({ label: 'Fine', tone: 'gain' });

    const rough = act(state, {
      type: 'cook',
      recipeId: 'grilled-fish-set',
      steps: { cut: 'chunky', heat: 'gentle', finish: 'late' },
    });
    expect(rough.character.mealQuality).toBe('plain');
    expect(lastEntry(rough)?.text).toContain('The fire was too low for it.');
    expect(lastEntry(rough)?.text).toContain('You left it on too long.');
  });

  it('a burnt dish fills you a little and does nothing else', () => {
    const state = { ...withPantry(newGame(), FISH), cooking: { ...newGame().cooking, xp: 0 } };
    const burnt = act(state, {
      type: 'cook',
      recipeId: 'grilled-fish-set',
      steps: { cut: 'whole', heat: 'gentle', finish: 'late' },
    });
    expect(burnt.character.mealQuality).toBe('burnt');
    expect(lastEntry(burnt)?.tone).toBe('warning');
    expect(lastEntry(burnt)?.chips).toContainEqual({ label: 'Hunger −33', tone: 'gain' });
  });

  it('cooking as usual is plain until the dish is mastered', () => {
    const state = withPantry(newGame(), FISH);
    expect(act(state, { type: 'cook', recipeId: 'grilled-fish-set' }).character.mealQuality).toBe(
      'plain',
    );
    const mastered = { ...state, cooking: { ...state.cooking, known: { 'grilled-fish-set': 15 } } };
    expect(
      act(mastered, { type: 'cook', recipeId: 'grilled-fish-set' }).character.mealQuality,
    ).toBe('good');
  });

  it('practice shows you the steps', () => {
    const state = newGame();
    const card = (times: number) =>
      kitchenView({ ...state, cooking: { ...state.cooking, known: { 'miso-soup': times } } }, ctx)
        .recipes[0];
    expect(card(0)).toMatchObject({ method: 'Boiled', hint: null, knownSteps: {} });
    expect(card(5)?.hint).toBe('You know it: steady fire.');
    expect(card(15)?.knownSteps).toEqual({ cut: 'fine', heat: 'steady', finish: 'on-time' });
  });
});

describe('experimenting', () => {
  const beginner = () => formTeam(freshGame());

  it('the right set of ingredients teaches an unknown dish, and you eat it', () => {
    const state = withPantry(beginner(), { rice: 1, tofu: 1 });
    const after = act(state, { type: 'experiment', ingredientIds: ['tofu', 'rice'] });
    expect(after.cooking.known['tofu-congee']).toBe(1);
    expect(after.character.meal).toBe('tofu-congee');
    expect(lastEntry(after)?.heading).toBe('You worked out Tofu Congee');
  });

  it('with too little for the full dish, you learn it and eat what you made', () => {
    const state = withPantry(beginner(), { rice: 1, eggs: 1 });
    const after = act(state, { type: 'experiment', ingredientIds: ['rice', 'eggs'] });
    expect(after.cooking.known['rolled-omelette']).toBe(0);
    expect(after.character.meal).toBeNull();
    expect(after.inventory.pantry).toEqual({});
  });

  it('anything else fills you and hints at how close it came', () => {
    const state = withPantry(beginner(), { miso: 1, tofu: 1, cucumbers: 1 });
    const after = act(state, { type: 'experiment', ingredientIds: ['miso', 'tofu', 'cucumbers'] });
    expect(lastEntry(after)?.text).toBe('Some of it belongs together. Some of it really doesn’t.');
    expect(Object.keys(after.cooking.known)).toHaveLength(3);
  });

  it('needs two to four different things you have', () => {
    const state = withPantry(beginner(), { rice: 2 });
    expect(blockerFor(state, { type: 'experiment', ingredientIds: ['rice'] }, ctx)).toBe(
      'Put at least two things together.',
    );
    expect(blockerFor(state, { type: 'experiment', ingredientIds: ['rice', 'rice'] }, ctx)).toBe(
      'Each ingredient goes in once.',
    );
    expect(blockerFor(state, { type: 'experiment', ingredientIds: ['rice', 'tofu'] }, ctx)).toBe(
      'You don’t have all of that in the pantry.',
    );
  });
});
