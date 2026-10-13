import { act, ctx, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import type { GameState } from './state';
import { marketView } from './views/market';
import { tavernView } from './views/tavern';

const AFTERNOON = 1;
const EVENING = 2;
const SPRING_DAY = 10;
const AUTUMN_DAY = 60;
const WINTER_DAY = 90;

const at = (day: number, slot = AFTERNOON): GameState => {
  const state = newGame({ wallet: { ryo: 500 } });
  return { ...state, time: { day, slot }, board: { ...state.board, refreshedDay: day } };
};

const cart = (state: GameState) =>
  marketView(state, ctx)!.stalls.find((s) => s.name === 'The Four Seasons Cart')!;

describe('seasonal food', () => {
  it('the seasonal cart changes its menu with the season', () => {
    const spring = cart(at(SPRING_DAY)).items.map((i) => i.id);
    const autumn = cart(at(AUTUMN_DAY)).items.map((i) => i.id);
    expect(spring).toContain('bamboo-shoot-rice');
    expect(spring).not.toContain('salt-grilled-saury');
    expect(autumn).toContain('salt-grilled-saury');
    expect(autumn).not.toContain('bamboo-shoot-rice');
  });

  it('stamps a seasonal dish with its seasons, and leaves year-round food plain', () => {
    const items = marketView(at(WINTER_DAY), ctx)!.stalls.flatMap((s) => s.items);
    expect(items.find((i) => i.id === 'stone-roasted-sweet-potato')?.season).toBe(
      'Autumn and Winter only',
    );
    expect(items.find((i) => i.id === 'rice-ball')?.season).toBeNull();
  });

  it('can be eaten in season but not out of it', () => {
    const autumn = act(at(AUTUMN_DAY), { type: 'eat', foodId: 'roasted-chestnuts' });
    expect(autumn.wallet.ryo).toBeLessThan(500);
    expect(blockerFor(at(SPRING_DAY), { type: 'eat', foodId: 'roasted-chestnuts' }, ctx)).toBe(
      'That isn’t sold here.',
    );
  });

  it('the grocer only has seasonal produce in its season', () => {
    const grocer = (state: GameState) =>
      marketView(state, ctx)!
        .stalls.flatMap((s) => s.ingredients)
        .map((i) => i.id);
    expect(grocer(at(WINTER_DAY))).toContain('winter-radish');
    expect(grocer(at(SPRING_DAY))).not.toContain('winter-radish');
    expect(grocer(at(SPRING_DAY))).toContain('rice');
    expect(
      blockerFor(at(SPRING_DAY), { type: 'buyIngredient', ingredientId: 'chestnuts' }, ctx),
    ).toBe('That isn’t sold here.');
  });

  it('the izakaya menu follows the season too', () => {
    const menu = (day: number) => tavernView(at(day, EVENING), ctx)!.menu.map((i) => i.id);
    expect(menu(WINTER_DAY)).toContain('hot-yuzu-tea');
    expect(menu(AUTUMN_DAY)).not.toContain('hot-yuzu-tea');
    expect(menu(AUTUMN_DAY)).toContain('night-oden');
  });

  it('a seasonal ingredient kept in the pantry still cooks after its season', () => {
    const bought = act(at(AUTUMN_DAY), { type: 'buyIngredient', ingredientId: 'chestnuts' });
    const stocked = act(bought, { type: 'buyIngredient', ingredientId: 'rice' });
    const winter = { ...stocked, time: { day: WINTER_DAY, slot: AFTERNOON } };
    const cooked = act(winter, { type: 'cook', recipeId: 'chestnut-rice' });
    expect(cooked.character.meal).toBe('chestnut-rice');
  });
});
