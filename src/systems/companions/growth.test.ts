import {
  bodyCeiling,
  bodyValue,
  genesFrom,
  growingDay,
  lifeStage,
  maturity,
  oldEnoughToFight,
} from './growth';

describe('growing up', () => {
  it('grows fast at first and eases into its adult body', () => {
    const newborn = bodyValue('strength', 10, 1, 0);
    const half = bodyValue('strength', 10, 1, 0.5);
    const grown = bodyValue('strength', 10, 1, 1);
    expect(newborn).toBeCloseTo(4);
    expect(grown).toBeCloseTo(10);
    expect(half - newborn).toBeGreaterThan(grown - half);
  });

  it('grows most of its senses alone; the rest is scent work', () => {
    expect(bodyValue('perception', 10, 1, 1)).toBeLessThan(10);
  });

  it('never passes its ceiling, a dog’s well below a bear’s', () => {
    expect(bodyCeiling(9, 1)).toBeLessThan(bodyCeiling(22, 1));
    expect(bodyCeiling(10, 1)).toBeCloseTo(12);
  });

  it('a kennel line never falls below its kind; a stray may', () => {
    expect(genesFrom(0, 'bred')).toBe(1);
    expect(genesFrom(0, 'stray')).toBeLessThan(1);
    expect(genesFrom(1, 'wild')).toBeGreaterThan(1);
  });

  it('a hungry day grows half, a starving one not at all', () => {
    expect(growingDay('fed')).toBe(1);
    expect(growingDay('hungry')).toBe(0.5);
    expect(growingDay('starving')).toBe(0);
  });

  it('a pup is too young to fight; young and grown come along', () => {
    expect(lifeStage(maturity(5, 56))).toBe('pup');
    expect(lifeStage(maturity(30, 56))).toBe('young');
    expect(lifeStage(maturity(80, 56))).toBe('grown');
    expect(oldEnoughToFight('pup')).toBe(false);
    expect(oldEnoughToFight('young')).toBe(true);
  });
});
