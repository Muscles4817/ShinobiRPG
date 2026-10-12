import type { CombatTechnique } from '../../contract';
import { BREAK_TOUGHNESS, brokenScale, confuseTurns, MAX_CONFUSION_TURNS, toughnessKept } from '.';

const haze: CombatTechnique = {
  id: 'haze',
  name: 'Haze',
  discipline: 'genjutsu',
  effects: [{ verb: 'confuse', power: 8 }],
  chakraCost: 6,
};
const confuse = (power: number) => ({
  technique: haze,
  effect: { verb: 'confuse' as const, power },
});

describe('confuse and break', () => {
  it('a confusion holds longer when stronger, shorter against a mind that breaks illusions', () => {
    expect(confuseTurns(10, confuse(8), 10)).toBe(1);
    expect(confuseTurns(10, confuse(12), 10)).toBe(2);
    expect(confuseTurns(26, confuse(12), 10)).toBe(MAX_CONFUSION_TURNS);
    expect(confuseTurns(10, confuse(12), 26)).toBe(1);
  });

  it('a break meets only part of the toughness; other effects all of it', () => {
    const smash = { technique: haze, effect: { verb: 'break' as const, power: 10 } };
    const hit = { technique: haze, effect: { verb: 'damage' as const, power: 10 } };
    expect(toughnessKept(smash)).toBe(1 - BREAK_TOUGHNESS);
    expect(toughnessKept(hit)).toBe(1);
  });

  it('a break cuts what a kit shrugs off, never a weakness', () => {
    expect(brokenScale(0.5)).toBeGreaterThan(0.5);
    expect(brokenScale(0.5)).toBeLessThan(1);
    expect(brokenScale(1.5)).toBe(1.5);
    expect(brokenScale(1)).toBe(1);
  });
});
