import { buffAt } from '@/systems/cooking';
import { combine } from '@/systems/modifiers';
import { STAT_IDS } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS } from '@/systems/techniques';
import { contextForPack } from '@/game';

/**
 * FOOD STAYS A SEASONING
 *
 * A meal (or a snack) cooked as well as it can be cooked helps, but never so much that eating
 * well matters more than training: every dish in every pack, at fine quality, keeps each effect
 * inside these ceilings. Retune a dish, not the ceiling, when this fails.
 */

/** No dish makes a stat grow, or an art learned, more than this much faster. */
const MAX_GROWTH = 1.4;
const MAX_STUDY = 1.4;
/** Hard work never costs less than this share of its energy. */
const MIN_ENERGY_COST = 0.75;
const MAX_SLEEP_HEALING = 1.45;
const MAX_BOND_GAIN = 1.4;
const MAX_CHECKS = 1.25;
const MAX_INJURY_NIGHTS = 1;
const MIN_HUNGER_RATE = 0.6;

describe.each(['original', 'naruto'])('food in the %s pack', (packId) => {
  const ctx = contextForPack(packId)!;

  it.each(ctx.content.recipes.all.map((r) => [r.id, r] as const))(
    '%s at its finest stays inside the ceilings',
    (_id, recipe) => {
      const mods = combine([buffAt(recipe.buff, 'fine')]);
      for (const stat of STAT_IDS) {
        expect(mods.growth[stat]).toBeLessThanOrEqual(MAX_GROWTH);
        expect(mods.checks[stat]).toBeLessThanOrEqual(MAX_CHECKS);
      }
      for (const d of DISCIPLINES) expect(mods.studyDiscipline[d]).toBeLessThanOrEqual(MAX_STUDY);
      for (const e of ELEMENTS) expect(mods.studyElement[e]).toBeLessThanOrEqual(MAX_STUDY);
      expect(mods.energyCost).toBeGreaterThanOrEqual(MIN_ENERGY_COST);
      expect(mods.sleepHealing).toBeLessThanOrEqual(MAX_SLEEP_HEALING);
      expect(mods.bondGain).toBeLessThanOrEqual(MAX_BOND_GAIN);
      expect(mods.injuryNights).toBeLessThanOrEqual(MAX_INJURY_NIGHTS);
      expect(mods.hungerRate).toBeGreaterThanOrEqual(MIN_HUNGER_RATE);
    },
  );
});
