import { act, ctx, lastEntry, newGame } from '@/test/gameFixtures';

import { mealProvisions, playerCombatant } from './combatants';
import { yourCheckValue } from './missionRoles';
import { warmed } from './people/warmth';
import type { GameState } from './state';

/** Having eaten this recipe today. */
function fed(recipeId: string | null, state: GameState = newGame()): GameState {
  return { ...state, character: { ...state.character, meal: recipeId } };
}

function withVitals(state: GameState, vitals: Partial<GameState['character']['vitals']>) {
  return {
    ...state,
    character: { ...state.character, vitals: { ...state.character.vitals, ...vitals } },
  };
}

const EVENING = 3;

describe('what a meal does for the rest of the day', () => {
  it('a tireless meal makes hard work cost less energy', () => {
    const drill = (state: GameState) =>
      state.character.vitals.energy -
      act(state, { type: 'train', trainingId: 'post-kicks' }).character.vitals.energy;
    const plain = drill(fed(null));
    expect(drill(fed('egg-over-rice'))).toBe(Math.round(plain * 0.9));
    expect(drill(fed('egg-over-rice'))).toBeLessThan(plain);
  });

  it('a restful meal heals more overnight', () => {
    const night = (meal: string | null) => {
      const tired = withVitals(fed(meal), { health: 10 });
      const evening = { ...tired, time: { ...tired.time, slot: EVENING } };
      return act(evening, { type: 'sleep' }).character.vitals.health;
    };
    expect(night('chestnut-rice') - 10).toBe(Math.round((night(null) - 10) * 1.3));
  });

  it('a healing meal brings every injury a day closer, never sooner than tomorrow', () => {
    const night = (meal: string | null) => {
      const state = fed(meal);
      const hurt = {
        ...state,
        time: { ...state.time, slot: EVENING },
        character: {
          ...state.character,
          injuries: [
            { injuryId: 'cracked-ribs', until: state.time.day + 3 },
            { injuryId: 'cracked-ribs', until: state.time.day + 1 },
          ],
        },
      };
      return act(hurt, { type: 'sleep' }).character.injuries.map((i) => i.until);
    };
    const day = newGame().time.day;
    expect(night(null)).toEqual([day + 3]);
    expect(night('radish-stew')).toEqual([day + 2]);
  });

  it('a convivial meal makes good time with people count for more, never a falling-out', () => {
    expect(warmed(fed('rolled-omelette'), ctx, 6)).toBe(8);
    expect(warmed(fed('rolled-omelette'), ctx, -6)).toBe(-6);
    expect(warmed(fed(null), ctx, 6)).toBe(6);
  });

  it('a sharp-eyed meal sharpens your own stat in job checks', () => {
    const state = fed('hunters-skewers');
    const perception = state.character.stats.perception;
    expect(yourCheckValue(state, ctx, 'perception')).toBeCloseTo(perception * 1.15);
    expect(yourCheckValue(state, ctx, 'willpower')).toBe(state.character.stats.willpower);
  });
});

describe('what a meal does as you eat it', () => {
  it('a broth gives back health, and says so', () => {
    const state = withVitals(newGame(), { health: 40 });
    const stocked = {
      ...state,
      inventory: { ...state.inventory, pantry: { 'river-fish': 1, vegetables: 1 } },
    };
    // Cooked as usual, a dish you haven't mastered is plain: 0.6 of its health.
    const cooked = act(stocked, { type: 'cook', recipeId: 'fish-bone-broth' });
    expect(cooked.character.vitals.health).toBe(52);
    expect(lastEntry(cooked)?.chips).toContainEqual({ label: 'Health +12', tone: 'gain' });
  });
});

describe('what a meal brings into a fight', () => {
  it('a well-cooked dish brings its provision; a plain one does not', () => {
    const good = fed('tofu-congee');
    expect(mealProvisions(good, ctx)).toEqual(['fortified']);
    expect(playerCombatant(good, ctx).provisions).toEqual(['fortified']);
    const plain = { ...good, character: { ...good.character, mealQuality: 'plain' as const } };
    expect(mealProvisions(plain, ctx)).toEqual([]);
    expect(mealProvisions(fed('miso-soup'), ctx)).toEqual([]);
  });
});
