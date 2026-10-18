import { ORIGINAL_PACK } from './packs/original';
import { validateRecipes } from './validateRecipes';
import type { ContentPack, RecipeDef } from './types';

const withRecipe = (id: string, patch: Partial<RecipeDef>): ContentPack => ({
  ...ORIGINAL_PACK,
  recipes: ORIGINAL_PACK.recipes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
});

describe('recipe validation', () => {
  it('passes the shipped pack', () => {
    expect(validateRecipes(ORIGINAL_PACK)).toEqual([]);
  });

  it('rejects a recipe nobody teaches', () => {
    const pack = {
      ...ORIGINAL_PACK,
      cookbooks: ORIGINAL_PACK.cookbooks.map((b) => ({
        ...b,
        recipeIds: b.recipeIds.filter((id) => id !== 'tofu-congee'),
      })),
    };
    expect(validateRecipes(pack)).toEqual(['recipe "tofu-congee" can’t be learned anywhere']);
  });

  it('rejects a starter above rank E, and a book teaching a dish that does not exist', () => {
    expect(validateRecipes(withRecipe('miso-soup', { rank: 'D' }))).toContain(
      'starter recipe "miso-soup" must be rank E',
    );
    const pack = {
      ...ORIGINAL_PACK,
      cookbooks: [{ ...ORIGINAL_PACK.cookbooks[0]!, recipeIds: ['phoenix-egg'] }],
    };
    expect(validateRecipes(pack)).toContain(
      'cookbook "everyday-kitchen" teaches unknown recipe "phoenix-egg"',
    );
  });

  it('rejects a recipe taking any fish of a kind the pack has none of', () => {
    const pack = {
      ...ORIGINAL_PACK,
      ingredients: ORIGINAL_PACK.ingredients.map((i) =>
        i.family === 'white' ? { ...i, family: 'oily' as const } : i,
      ),
    };
    expect(validateRecipes(pack)).toContain('recipe "sashimi-plate" takes white fish, and none is');
  });
});
