import { combine, describeSpec, NEUTRAL, studyMultiplier } from './modifiers';

describe('modifiers', () => {
  it('is neutral with no sources', () => {
    expect(combine([])).toEqual(NEUTRAL);
  });

  it('multiplies sources together', () => {
    const mods = combine([
      { growth: { strength: 1.2 }, hungerRate: 1.5 },
      { training: 1.1, studyDiscipline: { ninjutsu: 0.5 } },
      { growth: { strength: 0.5 } },
    ]);
    expect(mods.growth.strength).toBeCloseTo(1.2 * 1.1 * 0.5);
    expect(mods.growth.speed).toBeCloseTo(1.1);
    expect(mods.hungerRate).toBe(1.5);
    expect(mods.studyDiscipline.ninjutsu).toBe(0.5);
  });

  it('combines discipline and element for study speed', () => {
    const mods = combine([{ studyDiscipline: { ninjutsu: 2 }, studyElement: { fire: 1.5 } }]);
    expect(studyMultiplier(mods, 'ninjutsu', 'fire')).toBe(3);
    expect(studyMultiplier(mods, 'ninjutsu')).toBe(2);
  });

  it('describes effects for players', () => {
    expect(describeSpec({ studyElement: { fire: 1.3 }, hungerRate: 1.6 })).toEqual([
      { label: 'Fire techniques learned 30% faster', tone: 'gain' },
      { label: 'Get hungry 60% faster', tone: 'cost' },
    ]);
  });
});
