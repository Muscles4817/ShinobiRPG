import {
  cookedOnce,
  cookingGrade,
  gradeProgress,
  learnRecipes,
  masteryOf,
  NO_COOKING,
  timesCooked,
  withinReach,
  xpFor,
} from './cooking';

describe('cooking grade', () => {
  it('rises from E with experience', () => {
    expect(cookingGrade(0)).toBe('E');
    expect(cookingGrade(11)).toBe('E');
    expect(cookingGrade(12)).toBe('D');
    expect(cookingGrade(600)).toBe('S');
    expect(gradeProgress(6)).toBeCloseTo(0.5);
    expect(gradeProgress(9999)).toBe(1);
  });

  it('reaches one rank above, never two', () => {
    expect(withinReach('E', 'D')).toBe(true);
    expect(withinReach('E', 'C')).toBe(false);
    expect(withinReach('B', 'E')).toBe(true);
  });
});

describe('recipes', () => {
  it('are learned once and never reset', () => {
    const learned = learnRecipes(NO_COOKING, ['miso-soup']);
    const cooked = cookedOnce(learned, 'miso-soup', 'E');
    expect(learnRecipes(cooked, ['miso-soup'])).toBe(cooked);
    expect(timesCooked(cooked, 'miso-soup')).toBe(1);
  });

  it('grow from new to practised to mastered, and teach less once mastered', () => {
    expect(masteryOf(0)).toBe('new');
    expect(masteryOf(5)).toBe('practised');
    expect(masteryOf(15)).toBe('mastered');
    expect(xpFor('C', 0)).toBe(3);
    expect(xpFor('C', 15)).toBe(2);
    expect(xpFor('E', 15)).toBe(1);
  });

  it('cooking adds experience by rank', () => {
    const cooked = cookedOnce(learnRecipes(NO_COOKING, ['stew']), 'stew', 'D');
    expect(cooked.xp).toBe(2);
  });
});
