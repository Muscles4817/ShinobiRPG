import type { CombatTechnique } from '../../contract';
import { CLONE_RULES, cloneKindFor, cloneUpkeep, kindOf } from './cloneKinds';

const base: CombatTechnique = {
  id: 'clones',
  name: 'Clones',
  discipline: 'ninjutsu',
  chakraCost: 6,
  effects: [{ verb: 'clone', power: 10, strikes: true }],
};

const madeBy = (t: CombatTechnique) => {
  const [effect] = t.effects;
  if (effect?.verb !== 'clone') throw new Error('not a clone technique');
  return cloneKindFor({ technique: t, effect });
};

describe('kinds of clone', () => {
  it('follow the technique: illusions unless solid, then its element, else shadow clones', () => {
    expect(madeBy({ ...base, effects: [{ verb: 'clone', power: 6 }] })).toBe('illusion');
    expect(madeBy(base)).toBe('shadow');
    expect(madeBy({ ...base, element: 'earth' })).toBe('earth');
    expect(madeBy({ ...base, element: 'water' })).toBe('water');
  });

  it('a technique may name its kind outright', () => {
    const fire: CombatTechnique = {
      ...base,
      effects: [{ verb: 'clone', power: 10, strikes: true, kind: 'fire' }],
    };
    expect(madeBy(fire)).toBe('fire');
  });

  it('clones from before kinds are solid shadows or illusions', () => {
    expect(kindOf({ strikes: true })).toBe('shadow');
    expect(kindOf({ strikes: false })).toBe('illusion');
  });

  it('cost what they are worth: shadows dearest, fire and illusions free to keep up', () => {
    const upkeep = (kind: keyof typeof CLONE_RULES) =>
      cloneUpkeep({ kind, strikes: true, count: 4 });
    expect(upkeep('shadow')).toBeGreaterThan(upkeep('earth'));
    expect(upkeep('earth')).toBeGreaterThan(upkeep('water'));
    expect(upkeep('fire')).toBe(0);
    expect(cloneUpkeep({ kind: 'illusion', strikes: false, count: 4 })).toBe(0);
  });

  it('shadow clones strike hardest; illusions not at all', () => {
    expect(CLONE_RULES.shadow.blow).toBeGreaterThan(CLONE_RULES.earth.blow);
    expect(CLONE_RULES.illusion.blow).toBe(0);
  });

  it('each kind has its trick: earth stands and rebuilds, lightning shocks, wind screens', () => {
    expect(CLONE_RULES.earth.sturdy).toBeGreaterThan(0);
    expect(CLONE_RULES.earth.rebuilds).toBe(true);
    expect(CLONE_RULES.lightning.shock).toBeGreaterThan(0);
    expect(CLONE_RULES.wind.screen).toBeGreaterThan(CLONE_RULES.water.screen);
  });
});
