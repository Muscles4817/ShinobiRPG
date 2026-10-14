import { act, ctx, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { characterModifiers } from './profile';
import type { GameState } from './state';
import { kitchenView } from './views/kitchen';

function stocked(pantry: Record<string, number>, slot = 0): GameState {
  const state = newGame();
  return {
    ...state,
    time: { ...state.time, slot },
    inventory: { ...state.inventory, pantry },
  };
}

describe('snacks', () => {
  it('sit beside the meal: a snack never replaces it', () => {
    const fed = act(stocked({ rice: 3, 'red-beans': 1 }), {
      type: 'cook',
      recipeId: 'rice-ball-bento',
    });
    const snacked = act(fed, { type: 'cook', recipeId: 'bean-dumplings' });
    expect(snacked.character.meal).toBe('rice-ball-bento');
    expect(snacked.character.snack?.recipeId).toBe('bean-dumplings');
    expect(kitchenView(snacked, ctx).snack?.name).toBe('Sweet Bean Dumplings');
  });

  it('work through the next stretch of the day, then wear off', () => {
    const snacked = act(stocked({ 'tea-leaves': 1, 'pickled-plums': 1 }), {
      type: 'cook',
      recipeId: 'plum-tea',
    });
    // Cooked as usual it is plain: 0.6 of its 15% sharper willpower.
    expect(characterModifiers(snacked.character, ctx).checks.willpower).toBeCloseTo(1.09);
    const later = act(snacked, { type: 'train', trainingId: 'post-kicks' });
    expect(later.character.snack).toBeUndefined();
    expect(characterModifiers(later.character, ctx).checks.willpower).toBe(1);
  });

  it('are not dinner for a guest', () => {
    const evening = stocked({ rice: 4, 'red-beans': 4 }, 2);
    const friendly = {
      ...evening,
      people: {
        ...evening.people,
        bonds: { ...evening.people.bonds, kaen: { points: 12, lastTalkDay: null, heard: [] } },
      },
    };
    expect(
      blockerFor(
        friendly,
        { type: 'hostDinner', recipeId: 'bean-dumplings', guestId: 'kaen' },
        ctx,
      ),
    ).toBe('Guests come round for a meal, not a snack.');
  });
});
