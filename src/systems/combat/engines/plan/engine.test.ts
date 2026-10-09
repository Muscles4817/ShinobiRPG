import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { decode, initialFighters } from './state';
import { decideByPlan, execution, tacticById } from './tactics';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 5,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 50,
    maxHealth: 50,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const daze: CombatTechnique = {
  id: 'daze',
  name: 'Daze',
  discipline: 'genjutsu',
  effect: 'stun',
  chakraCost: 4,
  power: 12,
};
const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  effect: 'damage',
  chakraCost: 6,
  power: 16,
};

describe('plan & watch tactics', () => {
  const [player, enemy] = initialFighters({
    player: fighter('hero', { techniques: [daze, blast] }),
    allies: [],
    enemies: [fighter('bandit')],
    canFlee: true,
  });

  it('rush closes the distance first', () => {
    const deed = decideByPlan(player!, tacticById('rush').rules, {
      range: 'mid',
      goal: 'close',
      foe: enemy,
    });
    expect(deed).toEqual({ kind: 'move', to: 'close' });
  });

  it('trickster dazes a fresh foe, then hits a dazed one hard', () => {
    const rules = tacticById('trickster').rules;
    const fresh = decideByPlan(player!, rules, { range: 'mid', goal: 'mid', foe: enemy });
    expect(fresh).toMatchObject({ kind: 'technique', technique: { id: 'daze' } });
    const dazed = decideByPlan(player!, rules, {
      range: 'mid',
      goal: 'mid',
      foe: { ...enemy!, stunned: 1 },
    });
    expect(dazed).toMatchObject({ kind: 'technique', technique: { id: 'blast' } });
  });

  it('falls back to a basic attack that reaches', () => {
    const plain = { ...player!, techniques: [] };
    expect(
      decideByPlan(plain, tacticById('technician').rules, {
        range: 'far',
        goal: 'far',
        foe: enemy,
      }),
    ).toEqual({ kind: 'throw' });
  });

  it('intellect and insight make you stick to the plan', () => {
    const smart = { ...player!, attributes: { ...attributes, intellect: 12 } };
    expect(execution(smart)).toBeGreaterThan(execution(player!));
    expect(execution({ ...player!, perks: ['insight'] })).toBeGreaterThan(execution(player!));
  });
});

describe('plan & watch engine', () => {
  const engine = createPlanEngine();
  const start = (player = fighter('hero')) =>
    engine.start({ player, allies: [], enemies: [fighter('bandit')], canFlee: true }, createRng(1));

  it('opens by asking for a tactic', () => {
    const view = engine.view(start());
    expect(view.prompt).toBe('Choose your tactic.');
    expect(view.options.map((o) => o.kind)).toEqual(['plan', 'plan', 'plan', 'plan']);
  });

  it('a chosen plan plays out to the end', () => {
    const strong = fighter('hero', { attributes: { ...attributes, strength: 40, speed: 20 } });
    const planned = engine.act(start(strong), { optionId: 'tactic:rush' }, createRng(2));
    if (!planned.ok) throw new Error(planned.error);
    const done = engine.act(planned.value, { optionId: 'auto' }, createRng(3));
    if (!done.ok) throw new Error(done.error);
    expect(engine.outcome(done.value)?.result).toBe('victory');
  });

  it('the trump card works once', () => {
    const planned = engine.act(start(), { optionId: 'tactic:patient' }, createRng(2));
    if (!planned.ok) throw new Error(planned.error);
    const trumped = engine.act(planned.value, { optionId: 'trump' }, createRng(3));
    if (!trumped.ok) throw new Error(trumped.error);
    expect(decode(trumped.value).trumpUsed).toBe(true);
    expect(engine.act(trumped.value, { optionId: 'trump' }, createRng(4)).ok).toBe(false);
  });

  it('rejects state from another engine', () => {
    expect(() => engine.view({ engineId: 'other', data: {} })).toThrow();
  });
});
