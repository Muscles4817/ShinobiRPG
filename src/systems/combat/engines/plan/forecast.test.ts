import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { plainSlots } from './state';

/** The plan screen's forecast: what each slot would do if the round began now (audit P1.6). */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 20,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const tech = (id: string, extra: Partial<CombatTechnique>): CombatTechnique => ({
  id,
  name: id,
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 5,
  ...extra,
});
const finisher = tech('finisher', { reach: ['close'], needsTarget: 'open' });
const blast = tech('blast', { discipline: 'ninjutsu', reach: ['far'] });
const kick = tech('kick', { reach: ['close'] });

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...overrides,
  };
}

describe('the forecast', () => {
  it('says which slot would play first, and why the ones above it would not', () => {
    const engine = createPlanEngine();
    const close = plainSlots(['jutsu:finisher', 'jutsu:blast', 'jutsu:kick']);
    const plan = { loadout: { close, mid: [], far: [] } };
    const hero = setup('hero', { techniques: [finisher, blast, kick] });
    const state = engine.start(
      { player: hero, allies: [], enemies: [setup('foe')], canFlee: false, plan },
      createRng(1),
    );
    const said = (card: string) =>
      engine.view(state).options.find((o) => o.id === `slot:close:${card}`)?.forecast;
    expect(said('jutsu:finisher')).toBe('No foe it could aim at yet.');
    expect(said('jutsu:kick')).toBe('Would play first if the round began here now.');
  });

  it('is read without a roll: the fight is the same after it as before', () => {
    const engine = createPlanEngine();
    const state = engine.start(
      { player: setup('hero'), allies: [], enemies: [setup('foe')], canFlee: false },
      createRng(2),
    );
    const before = JSON.stringify(state);
    engine.view(state);
    expect(JSON.stringify(state)).toBe(before);
  });
});
