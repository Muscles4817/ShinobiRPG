import { createRng } from '@/core';

import type { CombatantSetup } from '../../contract';
import { createPlanEngine } from './engine';
import { decode, encode, initialFighters, type PlanState } from './state';
import { quietAfter, recovered, STALEMATE_AFTER, TIRE_AFTER } from './tiring';

/** Fights end: quiet rounds tire both sides, and too many call it a stalemate. */

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
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...overrides,
  };
}

function table(overrides: Partial<PlanState> = {}): PlanState {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('foe')],
    canFlee: false,
  });
  return {
    phase: 'fight',
    round: 4,
    bout: 1,
    exchange: 4,
    fighters,
    range: 'close',
    seen: {},
    intents: {},
    log: [],
    result: null,
    canFlee: false,
    ...overrides,
  };
}

describe('quiet rounds', () => {
  it('count a round that barely hurts anyone, and start again when one hurts', () => {
    const quiet = table({ roundHealth: 205, quietRounds: 1 });
    expect(quietAfter(quiet).quietRounds).toBe(2);
    const hurt = table({ roundHealth: 230, quietRounds: 2 });
    expect(quietAfter(hurt).quietRounds).toBe(0);
  });

  it('a fight saved before the count begins it at the next round', () => {
    expect(quietAfter(table()).quietRounds).toBe(0);
    expect(quietAfter(table()).roundHealth).toBe(200);
  });

  it(`call a stalemate after ${STALEMATE_AFTER} in a row`, () => {
    const almost = table({ roundHealth: 200, quietRounds: STALEMATE_AFTER - 1 });
    expect(quietAfter(almost).result).toBe('stalemate');
    expect(quietAfter(table({ roundHealth: 200, quietRounds: 1 })).result).toBeNull();
  });
});

describe('tiring', () => {
  it(`after ${TIRE_AFTER} quiet rounds both sides tire for good: nothing comes back`, () => {
    const hero = { ...table().fighters[0]!, chakra: 30, breath: 10 };
    expect(recovered(hero, {}).chakra).toBeGreaterThan(30);
    const nearly = table({ roundHealth: 200, quietRounds: TIRE_AFTER - 1 });
    const after = quietAfter(nearly);
    expect(after.tired).toBe(true);
    expect(recovered(hero, after)).toEqual({});
    expect(quietAfter(table({ roundHealth: 260, tired: true })).tired).toBe(true);
  });
});

/** A body that can take anything and hurt no one: no skill in any art, all toughness and will. */
const wall = Object.fromEntries(Object.keys(attributes).map((k) => [k, 1])) as typeof attributes;
const unhurtable = { ...wall, stamina: 60, willpower: 60 };

describe('a fight saved before the count', () => {
  it('plays on, counting from the next round', () => {
    const engine = createPlanEngine();
    const rng = createRng(2);
    const started = engine.start(
      { player: setup('hero'), allies: [], enemies: [setup('foe')], canFlee: false, watch: true },
      rng,
    );
    const { quietRounds: _q, roundHealth: _h, tired: _t, ...old } = decode(started);
    let state = encode(old);
    for (let i = 0; i < 8 && !engine.outcome(state); i++) {
      const next = engine.act(state, { optionId: 'next' }, rng);
      if (!next.ok) throw new Error(next.error);
      state = next.value;
    }
    expect(decode(state).roundHealth).toBeDefined();
  });
});

describe('a fight neither side can win', () => {
  it('ends within a bound, however it ends', () => {
    const engine = createPlanEngine();
    const rng = createRng(1);
    const deep = { attributes: unhurtable };
    let state = engine.start(
      {
        player: setup('hero', deep),
        allies: [],
        enemies: [setup('foe', deep)],
        canFlee: false,
        watch: true,
      },
      rng,
    );
    const bound = (STALEMATE_AFTER + 4) * 4;
    for (let i = 0; i < bound && !engine.outcome(state); i++) {
      const next = engine.act(state, { optionId: 'next' }, rng);
      if (!next.ok) throw new Error(next.error);
      state = next.value;
    }
    expect(engine.outcome(state)).not.toBeNull();
    expect(decode(state).result).not.toBeNull();
  });
});
