import { bondWith } from '@/systems/bonds';
import { cookingGrade, GRADE_XP } from '@/systems/cooking';
import { act, ctx, formTeam, freshGame, lastEntry, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { handedOver } from './missionRewards';
import type { GameState } from './state';
import { cookbookView } from './views/cookbook';
import { kitchenView } from './views/kitchen';
import { marketView } from './views/market';
import { personSheet } from './views/people';

/** A new genin, knowing only what everyone knows, with ryo to spend. */
function beginner(): GameState {
  return { ...formTeam(freshGame()), wallet: { ryo: 1000 } };
}

const STARTERS = ['rice-ball-bento', 'egg-over-rice', 'miso-soup'];

describe('learning recipes', () => {
  it('a new genin knows only the starters; the rest are sealed with where to learn them', () => {
    const state = beginner();
    expect(Object.keys(state.cooking.known).sort()).toEqual([...STARTERS].sort());
    expect(kitchenView(state, ctx).recipes.map((r) => r.id)).toEqual(STARTERS);
    const book = cookbookView(state, ctx);
    expect(book.grade).toBe('E');
    const pot = book.sealed.find((r) => r.id === 'spicy-hot-pot');
    expect(pot?.hints).toEqual(['Tsune teaches it once you are friends']);
    const fish = book.sealed.find((r) => r.id === 'grilled-fish-set');
    expect(fish?.hints).toEqual(['In The Everyday Kitchen, sold at Sato’s Grocery']);
    const skewers = book.sealed.find((r) => r.id === 'hunters-skewers');
    expect(skewers?.hints).toContain('A client’s thanks for “Escort the Tea Merchant”');
  });

  it('you can’t cook what you haven’t learned', () => {
    expect(blockerFor(beginner(), { type: 'cook', recipeId: 'grilled-fish-set' }, ctx)).toBe(
      'You haven’t learned this recipe.',
    );
  });

  it('a cookbook from the grocer teaches every dish in it, once', () => {
    const state = beginner();
    const shelf = marketView(state, ctx)?.stalls.flatMap((s) => s.cookbooks) ?? [];
    expect(shelf.map((b) => b.id)).toEqual([
      'everyday-kitchen',
      'year-of-rice',
      'food-for-the-road',
    ]);
    const bought = act(state, { type: 'buyCookbook', cookbookId: 'everyday-kitchen' });
    expect(bought.wallet.ryo).toBe(1000 - 60);
    expect(bought.cooking.known['fish-bone-broth']).toBe(0);
    expect(lastEntry(bought)?.chips).toContainEqual({
      label: 'Learned Grilled Fish Set',
      tone: 'gain',
    });
    expect(blockerFor(bought, { type: 'buyCookbook', cookbookId: 'everyday-kitchen' }, ctx)).toBe(
      'You already know every recipe in it.',
    );
  });

  it('Tsune teaches her dishes in order, once you are close enough', () => {
    const stranger = beginner();
    expect(personSheet(stranger, ctx, 'tsune')?.recipe).toMatchObject({
      name: 'Rolled Omelette Box',
      blocker: 'Tsune will show you once you are acquaintances.',
    });
    const friendly = {
      ...stranger,
      people: { ...stranger.people, bonds: { ...stranger.people.bonds, tsune: bondWith(12) } },
    };
    const taught = act(friendly, { type: 'learnRecipe', personId: 'tsune' });
    expect(taught.cooking.known['rolled-omelette']).toBe(0);
    expect(taught.time.slot).toBe(friendly.time.slot + 1);
    expect(personSheet(taught, ctx, 'tsune')?.recipe).toMatchObject({
      name: 'Spicy Hot Pot',
      blocker: 'Tsune will show you once you are friends.',
    });
  });

  it('a client can hand over a recipe, never one you already know', () => {
    const job = ctx.content.missions.require('tea-merchant-escort');
    const gifts = handedOver(beginner(), ctx, job);
    expect(gifts.cooking.known['hunters-skewers']).toBe(0);
    expect(gifts.report.recipe).toBe('Hunter’s Skewers');
    expect(handedOver(newGame(), ctx, job).report.recipe).toBeUndefined();
  });
});

describe('cooking as a skill', () => {
  it('every dish adds experience; the grade rises and says so', () => {
    const state = {
      ...beginner(),
      cooking: { ...beginner().cooking, xp: GRADE_XP.D - 1 },
      inventory: { ...beginner().inventory, pantry: { rice: 2 } },
    };
    const cooked = act(state, { type: 'cook', recipeId: 'rice-ball-bento' });
    expect(cookingGrade(cooked.cooking.xp)).toBe('D');
    expect(cooked.cooking.known['rice-ball-bento']).toBe(1);
    expect(lastEntry(cooked)?.chips).toContainEqual({ label: 'Cooking grade D', tone: 'gain' });
  });

  it('a dish two ranks above your grade is beyond you', () => {
    const state = newGame({ cooking: { ...newGame().cooking, xp: 0 } });
    expect(blockerFor(state, { type: 'cook', recipeId: 'spicy-hot-pot' }, ctx)).toBe(
      'A rank C dish is beyond a grade E cook. Cook simpler dishes first.',
    );
  });

  it('practice shows on the recipe card', () => {
    const state = newGame();
    const practised = { ...state, cooking: { ...state.cooking, known: { 'miso-soup': 6 } } };
    expect(kitchenView(practised, ctx).recipes[0]).toMatchObject({ mastery: 'Practised' });
  });
});
