import { DEFAULT_CONTENT_SOURCE } from './db';
import { validateContent } from './validate';

describe('game content', () => {
  it('is internally consistent', () => {
    expect(validateContent(DEFAULT_CONTENT_SOURCE)).toEqual([]);
  });

  it('detects broken references and duplicates', () => {
    const broken = {
      ...DEFAULT_CONTENT_SOURCE,
      foods: [...DEFAULT_CONTENT_SOURCE.foods, DEFAULT_CONTENT_SOURCE.foods[0]!],
      academyTechniques: ['does-not-exist'],
    };
    const problems = validateContent(broken);
    expect(problems).toContain('duplicate food id "rice-ball"');
    expect(problems).toContain('academyTechniques references unknown technique "does-not-exist"');
  });

  it('has at least one mission available to a fresh genin', () => {
    expect(DEFAULT_CONTENT_SOURCE.missions.some((m) => m.minMissionsCompleted === 0)).toBe(true);
  });
});
