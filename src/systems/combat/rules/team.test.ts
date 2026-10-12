import { elementCombo } from './elements';
import { coverChance, FINISHER_BONUS, finisherScale } from './team';

const quick = (speed: number) => ({ attributes: { speed } });

describe('team rules', () => {
  it('a quicker cover gets in front more often, within bounds', () => {
    expect(coverChance(quick(10), quick(5))).toBeGreaterThan(coverChance(quick(5), quick(10)));
    expect(coverChance(quick(100), quick(0))).toBeLessThan(1);
    expect(coverChance(quick(0), quick(100))).toBeGreaterThan(0);
  });

  it('a foe left open or held takes a finisher harder', () => {
    expect(finisherScale({ open: true })).toBe(FINISHER_BONUS);
    expect(finisherScale({ open: false })).toBe(1);
  });

  it('element combos work in either order and only for pairs that feed each other', () => {
    expect(elementCombo('wind', 'fire')).toEqual(elementCombo('fire', 'wind'));
    expect(elementCombo('water', 'lightning')).not.toBeNull();
    expect(elementCombo('fire', 'fire')).toBeNull();
    expect(elementCombo('fire', undefined)).toBeNull();
  });
});
