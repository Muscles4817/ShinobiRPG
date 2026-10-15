import { elementMultiplier, matchup, OWN_NATURE_BONUS } from './elements';

describe('the elemental cycle', () => {
  it('each element overpowers the next, and is overpowered by the one before', () => {
    expect(matchup('water', 'fire')).toBe('strong');
    expect(matchup('fire', 'water')).toBe('weak');
    expect(matchup('fire', 'wind')).toBe('strong');
    expect(matchup('fire', 'earth')).toBe('even');
    expect(matchup('fire', undefined)).toBe('even');
  });

  it('a nature strengthens its own techniques and nothing else; it never shields', () => {
    expect(elementMultiplier({ element: 'fire' }, 'fire')).toBe(OWN_NATURE_BONUS);
    expect(elementMultiplier({ element: 'fire' }, 'water')).toBe(1);
    expect(elementMultiplier({}, 'fire')).toBe(1);
  });
});
