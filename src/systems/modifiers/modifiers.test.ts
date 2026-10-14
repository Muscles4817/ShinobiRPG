import { STAT_IDS } from '@/systems/stats';
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
  it('describes a boost to every discipline as one line', () => {
    const all = { taijutsu: 1.1, ninjutsu: 1.1, genjutsu: 1.1, kenjutsu: 1.1, fuuinjutsu: 1.1 };
    expect(describeSpec({ studyDiscipline: all }).map((l) => l.label)).toEqual([
      'All techniques learned 10% faster',
    ]);
  });

  it('adds up limit shifts from every source, and says which way they go', () => {
    const mods = combine([
      { limitBonus: { speed: 6, strength: -6 } },
      { limitBonus: { speed: 3 } },
    ]);
    expect(mods.limitBonus.speed).toBe(9);
    expect(mods.limitBonus.strength).toBe(-6);
    expect(mods.limitBonus.stamina).toBe(0);
    expect(describeSpec({ limitBonus: { speed: 6, strength: -6 } })).toEqual([
      { label: 'Speed can go further', tone: 'gain' },
      { label: 'Strength tops out sooner', tone: 'cost' },
    ]);
  });

  it('collects hard-work floors from every source', () => {
    const floor = { floor: 0.4, throughGrade: 'B' } as const;
    const lower = { floor: 0.2, throughGrade: 'C' } as const;
    const mods = combine([
      { soloEfficiencyFloor: { taijutsu: floor } },
      { soloEfficiencyFloor: { taijutsu: lower, speed: floor } },
    ]);
    expect(mods.soloFloors.taijutsu).toEqual([floor, lower]);
    expect(mods.soloFloors.speed).toEqual([floor]);
    expect(mods.soloFloors.ninjutsu).toBeUndefined();
  });

  it('says when a floor holds up every stat, and when it only helps a little', () => {
    const weak = { floor: 0.2, throughGrade: 'C' } as const;
    const everyStat = Object.fromEntries(STAT_IDS.map((id) => [id, weak]));
    expect(describeSpec({ soloEfficiencyFloor: everyStat })).toEqual([
      {
        label: 'Training alone pays off a little longer up to grade C in every stat',
        tone: 'gain',
      },
    ]);
  });

  it('describes a hard-work floor as one line per grade', () => {
    const floor = { floor: 0.4, throughGrade: 'B' } as const;
    expect(describeSpec({ soloEfficiencyFloor: { strength: floor, taijutsu: floor } })).toEqual([
      {
        label: 'Training alone keeps paying off up to grade B in Strength and Taijutsu',
        tone: 'gain',
      },
    ]);
  });

  it('combines a day of food: energy, sleep, bonds and checks multiply, injury nights add', () => {
    const mods = combine([
      { energyCost: 0.9, sleepHealing: 1.2, injuryNights: 1, bondGain: 1.25 },
      { energyCost: 0.9, injuryNights: 1, checks: { perception: 1.15 } },
    ]);
    expect(mods.energyCost).toBeCloseTo(0.81);
    expect(mods.sleepHealing).toBeCloseTo(1.2);
    expect(mods.injuryNights).toBe(2);
    expect(mods.bondGain).toBeCloseTo(1.25);
    expect(mods.checks.perception).toBeCloseTo(1.15);
    expect(mods.checks.speed).toBe(1);
  });

  it('describes the effects of a day of food in words', () => {
    const lines = describeSpec({
      energyCost: 0.85,
      sleepHealing: 1.3,
      injuryNights: 1,
      bondGain: 1.25,
      checks: { perception: 1.15 },
    });
    expect(lines.map((l) => l.label)).toEqual([
      'Hard work tires you 15% less',
      'Sleep heals 30% more',
      "Tonight's sleep heals injuries a day sooner",
      'Time with people counts 25% more',
      'Perception in job checks 15% sharper',
    ]);
    expect(lines.every((l) => l.tone === 'gain')).toBe(true);
  });
});
