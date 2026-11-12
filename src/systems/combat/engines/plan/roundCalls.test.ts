import { createRng } from '@/core';

import type { CombatantSetup } from '../../contract';
import { createPlanEngine } from './engine';
import { calledBack, callOwn, ownCallsLeft } from './roundCalls';
import { decode, encode, initialFighters, type PlanState } from './state';

/** Mid-round calls (audit P2.1): the round stops at the card table when something calls for it. */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

function mid(overrides: Partial<PlanState> = {}): PlanState {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  return {
    phase: 'fight',
    round: 2,
    bout: 1,
    exchange: 2,
    fighters,
    range: 'close',
    seen: {},
    intents: {},
    log: [],
    result: null,
    canFlee: true,
    ...overrides,
  };
}

const hurt = (s: PlanState): PlanState => ({
  ...s,
  fighters: s.fighters.map((f) => (f.isPlayer ? { ...f, health: 20 } : f)),
});

describe('a call stops the round', () => {
  it('when your health falls under a third: once a fight', () => {
    const before = mid();
    const stopped = calledBack(before, hurt(before));
    expect(stopped.phase).toBe('loadout');
    expect(stopped.called).toBe('hurt');
    expect(stopped.exchange).toBe(2);
    const again = calledBack(before, { ...hurt(before), calls: stopped.calls! });
    expect(again.phase).toBe('fight');
  });

  it('when a new body joins their side', () => {
    const before = mid();
    const extra = { ...before.fighters[1]!, id: 'summoned-toad' };
    const after = { ...before, fighters: [...before.fighters, extra] };
    expect(calledBack(before, after).called).toBe('summoned');
  });

  it('never in a fight that is only watched, or once the round is over', () => {
    const before = mid({ watching: true });
    expect(calledBack(before, hurt(before)).phase).toBe('fight');
    const ended = mid({ exchange: 0, phase: 'loadout' });
    expect(calledBack(ended, hurt(ended)).called).toBeUndefined();
  });
});

describe('a call of your own', () => {
  it('stops the round, and playing on finishes it', () => {
    const engine = createPlanEngine();
    const rng = createRng(4);
    let state = encode(mid());
    const view = engine.view(state);
    expect(view.options.some((o) => o.id === 'halt')).toBe(true);
    const halted = engine.act(state, { optionId: 'halt' }, rng);
    if (!halted.ok) throw new Error(halted.error);
    state = halted.value;
    expect(engine.view(state).called).toBe('You stopped to think.');
    expect(engine.view(state).options.find((o) => o.id === 'begin')?.label).toBe('Play on');
    const resumed = engine.act(state, { optionId: 'begin' }, rng);
    if (!resumed.ok) throw new Error(resumed.error);
    expect(decode(resumed.value)).toMatchObject({ phase: 'fight', exchange: 2 });
    expect(decode(resumed.value).called).toBeUndefined();
  });

  it('are few, by intellect', () => {
    const state = mid();
    expect(ownCallsLeft(state)).toBe(1);
    expect(ownCallsLeft(callOwn(state))).toBe(0);
  });
});
