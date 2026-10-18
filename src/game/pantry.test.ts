import { ctx } from '@/test/gameFixtures';

import { dishName, shortFor, takeFor } from './pantry';

/** A pantry and the recipes that take any fish of a kind from it. */

const recipe = (id: string) => ctx.content.recipes.require(id);

describe('taking a recipe from the pantry', () => {
  it('takes the cheapest fish of the kind first, so a rare catch is kept', () => {
    const take = takeFor(ctx, { 'old-catfish': 1, rockfish: 1, rice: 1 }, recipe('sashimi-plate'), {
      servings: 1,
    });
    expect(take).toEqual({
      taken: [
        { id: 'rice', count: 1 },
        { id: 'rockfish', count: 1 },
      ],
      fish: ['Rockfish'],
    });
  });

  it('takes the fish you chose first, and mixes kinds to cover more servings', () => {
    const pantry = { 'old-catfish': 1, rockfish: 1, rice: 2 };
    const chosen = takeFor(ctx, pantry, recipe('sashimi-plate'), {
      servings: 1,
      prefer: ['old-catfish'],
    });
    expect(chosen?.fish).toEqual(['Old Whiskers Catfish']);
    const both = takeFor(ctx, pantry, recipe('sashimi-plate'), { servings: 2 });
    expect(both?.fish).toEqual(['Rockfish', 'Old Whiskers Catfish']);
    expect(takeFor(ctx, pantry, recipe('sashimi-plate'), { servings: 3 })).toBeNull();
  });

  it('sets named ingredients aside before a kind takes from what is left', () => {
    // Salt-Grilled Sweetfish names its fish; Fish Grilled on River Stones takes any freshwater.
    const pantry = { sweetfish: 1, spices: 1 };
    expect(takeFor(ctx, pantry, recipe('salt-grilled-sweetfish'), { servings: 1 })?.taken).toEqual([
      { id: 'sweetfish', count: 1 },
      { id: 'spices', count: 1 },
    ]);
    expect(shortFor(ctx, { spices: 1 }, recipe('stone-grilled-fish'), 1)).toEqual([
      'Any freshwater fish',
    ]);
  });

  it('names the dish for the fish that went in, once each', () => {
    const sashimi = recipe('sashimi-plate');
    expect(dishName(sashimi, [])).toBe('Sashimi Plate');
    expect(dishName(sashimi, ['Rockfish', 'Rockfish', 'Flounder'])).toBe(
      'Sashimi Plate with Rockfish and Flounder',
    );
  });
});
