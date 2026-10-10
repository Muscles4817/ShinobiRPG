import { createRng } from '@/core';

import type { CombatantSetup, CombatItem, CombatItemEffect, CombatTrait } from '../../contract';
import { cardsFor, defaultLoadout } from './cards';
import { chooseCard } from './choose';
import { createPlanEngine } from './engine';
import { rememberedLoadout } from './memory';
import { useTool } from './pouch';
import { resolveExchange } from './round';
import {
  decode,
  encode,
  initialFighters,
  type Loadout,
  type PlanFighter,
  type PlanState,
  type Round,
} from './state';

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

function tool(effect: CombatItemEffect, count = 2): CombatItem {
  return { id: effect, name: `${effect} tool`, effect, count };
}

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

/** A hero with a pouch and the given mid-range cards, against one foe. */
function pair(
  items: CombatItem[],
  mid: string[],
  { foeTraits = [], hero = {} }: { foeTraits?: CombatTrait[]; hero?: Partial<CombatantSetup> } = {},
): PlanFighter[] {
  const loadout: Loadout = { close: [], mid, far: [] };
  const [h, foe] = initialFighters({
    player: fighter('hero', { items, ...hero }),
    allies: [],
    enemies: [fighter('foe', { traits: foeTraits })],
    canFlee: true,
  });
  return [{ ...h!, loadout }, foe!];
}

function stateOf(fighters: PlanFighter[], exchange = 0): PlanState {
  return {
    phase: 'fight',
    round: 1,
    bout: 1,
    exchange,
    fighters,
    range: 'mid',
    seen: {},
    log: [],
    result: null,
    canFlee: true,
  };
}

function roundOf(fighters: PlanFighter[]): Round {
  return { number: 1, fighters, range: 'mid', lines: [], seen: {} };
}

const heroOf = (s: Pick<PlanState, 'fighters'>) => s.fighters.find((f) => f.id === 'hero')!;
const foeOf = (s: Pick<PlanState, 'fighters'>) => s.fighters.find((f) => f.id === 'foe')!;

describe('plan & watch tools: cards', () => {
  it('offers each carried tool as a card at every distance, never in a default plan', () => {
    const [hero] = pair([tool('heal'), tool('blast', 0)], []);
    for (const band of ['close', 'mid', 'far'] as const) {
      expect(cardsFor(hero!, band).filter((c) => c.kind === 'item')).toHaveLength(2);
    }
    const defaults = defaultLoadout(hero!);
    expect(
      Object.values(defaults)
        .flat()
        .filter((id) => id.startsWith('item:')),
    ).toEqual([]);
  });

  it('shows tools at the card table with how many are left', () => {
    const engine = createPlanEngine();
    const state = engine.start(
      {
        player: fighter('hero', { items: [tool('heal'), tool('smoke', 0)] }),
        allies: [],
        enemies: [fighter('foe')],
        canFlee: true,
        plan: { close: [], mid: [], far: [] },
      },
      createRng(1),
    );
    const options = engine.view(state).options;
    const salve = options.find((o) => o.id === 'slot:mid:item:heal');
    expect(salve).toMatchObject({
      kind: 'plan',
      label: 'heal tool',
      detail: '×2 · Restore health',
    });
    expect(salve?.disabledReason).toBeUndefined();
    const smoke = options.find((o) => o.id === 'slot:far:item:smoke');
    expect(smoke?.disabledReason).toBe('No smoke tool left.');
    const slotted = engine.act(state, { optionId: 'slot:mid:item:heal' }, createRng(1));
    if (!slotted.ok) throw new Error(slotted.error);
    expect(decode(slotted.value).fighters[0]?.loadout.mid).toContain('item:heal');
  });

  it('keeps remembered tools you have none of, so they play again once restocked', () => {
    const [hero] = pair([], []);
    const plan = { close: [], mid: ['item:smoke', 'throw'], far: [] };
    expect(rememberedLoadout(plan, hero!)).toEqual(plan);
    const engine = createPlanEngine();
    const state = engine.start(
      { player: fighter('hero'), allies: [], enemies: [fighter('foe')], canFlee: true, plan },
      createRng(1),
    );
    const empty = engine.view(state).options.find((o) => o.id === 'slot:mid:item:smoke');
    expect(empty).toMatchObject({ label: 'Empty pouch', selected: true });
    expect(engine.act(state, { optionId: 'slot:mid:item:smoke' }, createRng(1)).ok).toBe(true);
  });
});

describe('plan & watch tools: when they are played', () => {
  const rng = createRng(1);

  it('salves and pills only when running low', () => {
    const [hero, foe] = pair([tool('heal'), tool('chakra')], ['item:heal', 'item:chakra']);
    const moment = { band: 'mid' as const, foe };
    expect(
      chooseCard({ ...hero!, loadout: { ...hero!.loadout, mid: ['item:heal'] } }, moment, rng).kind,
    ).not.toBe('item');
    const hurt = { ...hero!, health: 20 };
    expect(chooseCard(hurt, moment, rng)).toMatchObject({ kind: 'item', item: { id: 'heal' } });
    const drained = { ...hero!, chakra: 5 };
    expect(chooseCard(drained, moment, rng)).toMatchObject({
      kind: 'item',
      item: { id: 'chakra' },
    });
  });

  it('a flash only when someone hides, a charm only when confused, smoke to open', () => {
    const [hero, foe] = pair([tool('flash'), tool('clarity'), tool('smoke')], ['item:flash']);
    const moment = { band: 'mid' as const, foe };
    expect(chooseCard(hero!, moment, rng).kind).not.toBe('item');
    expect(chooseCard(hero!, { ...moment, hiddenFoe: true }, rng).kind).toBe('item');
    const charm = { ...hero!, loadout: { ...hero!.loadout, mid: ['item:clarity'] } };
    expect(chooseCard(charm, moment, rng).kind).not.toBe('item');
    expect(chooseCard({ ...charm, confused: 2 }, moment, rng).kind).toBe('item');
    const smoke = { ...hero!, loadout: { ...hero!.loadout, mid: ['item:smoke'] } };
    expect(chooseCard(smoke, moment, rng).kind).not.toBe('item');
    expect(chooseCard(smoke, { ...moment, opening: true }, rng).kind).toBe('item');
  });

  it('a salve played in an exchange restores health and is spent', () => {
    const [hero, foe] = pair([tool('heal')], ['item:heal'], { hero: { health: 10 } });
    const next = resolveExchange(stateOf([hero!, { ...foe!, health: 1, maxHealth: 1 }]), rng);
    const after = heroOf(next);
    expect(after.items[0]?.count).toBe(1);
    expect(next.log.some((l) => l.includes('presses salve'))).toBe(true);
    expect(after.health).toBeGreaterThan(10);
  });

  it('tools never misfire from confusion', () => {
    const [hero, foe] = pair([tool('blast')], ['item:blast'], {
      hero: { attributes: { ...attributes, speed: 30 } },
    });
    for (let seed = 1; seed <= 10; seed++) {
      const confused = { ...hero!, confused: 3 };
      const next = resolveExchange(stateOf([confused, foe!]), createRng(seed));
      expect(next.log.some((l) => l.includes('goes wide'))).toBe(false);
      expect(heroOf(next).items[0]?.count).toBe(1);
    }
  });
});

describe('plan & watch tools: smoke and flash', () => {
  const fast = { attributes: { ...attributes, speed: 30 } };

  it('smoke hides you; enemies lose sight of you; your next attack gives you away', () => {
    const [hero, foe] = pair([tool('smoke')], ['item:smoke', 'throw'], { hero: fast });
    const first = resolveExchange(stateOf([hero!, foe!]), createRng(3));
    expect(heroOf(first).hidden).toBe(true);
    expect(heroOf(first).health).toBe(50);
    expect(first.log).toContain('foe loses sight of you.');
    const second = resolveExchange(first, createRng(4));
    expect(second.log.some((l) => l.includes('hero') && l.includes('kunai'))).toBe(true);
    expect(heroOf(second).hidden).toBe(false);
    expect(heroOf(second).items[0]?.count).toBe(1);
  });

  it('the view shows a smoke-hidden player as Hidden', () => {
    const [hero, foe] = pair([], []);
    const engine = createPlanEngine();
    const view = engine.view(encode(stateOf([{ ...hero!, hidden: true }, foe!])));
    expect(view.combatants[0]?.statuses).toContain('Hidden');
  });

  it('a flash reveals a hidden illusionist', () => {
    const [hero, foe] = pair([tool('flash')], [], { foeTraits: ['illusionist'] });
    expect(foe!.hidden).toBe(true);
    const lit = useTool(
      roundOf([hero!, foe!]),
      { actor: hero!, target: undefined, rng: createRng(1) },
      hero!.items[0]!,
    );
    expect(foeOf(lit).hidden).toBe(false);
    expect(heroOf(lit).items[0]?.count).toBe(1);
  });
});

describe('plan & watch tools: explosive tags', () => {
  it('a blast is an attack that needs a target in sight, and is not spent without one', () => {
    const [hero, foe] = pair([tool('blast')], ['item:blast'], { foeTraits: ['illusionist'] });
    const next = resolveExchange(stateOf([hero!, foe!]), createRng(1));
    expect(next.log).toContain("hero can't find a target.");
    expect(heroOf(next).items[0]?.count).toBe(2);
  });

  it('cuts through armour as well as it hurts an unarmoured foe', () => {
    const damageTo = (traits: CombatTrait[]): number => {
      const [hero, foe] = pair([tool('blast')], [], { foeTraits: traits });
      const turn = { actor: hero!, target: foe!, rng: createRng(5) };
      return 50 - foeOf(useTool(roundOf([hero!, foe!]), turn, hero!.items[0]!)).health;
    };
    expect(damageTo(['armoured'])).toBeGreaterThan(0);
    expect(damageTo(['armoured'])).toBe(damageTo([]));
  });

  it('a blast that downs the last foe wins the fight', () => {
    const [hero, foe] = pair([tool('blast')], ['item:blast']);
    const next = resolveExchange(stateOf([hero!, { ...foe!, health: 1 }]), createRng(1));
    expect(next.result).toBe('victory');
    expect(heroOf(next).items[0]?.count).toBe(1);
  });
});

describe('plan & watch tools: outcome and saves', () => {
  it('the outcome reports the tools left', () => {
    const [hero, foe] = pair([tool('heal', 1), tool('smoke', 3)], []);
    const engine = createPlanEngine();
    const outcome = engine.outcome(encode(stateOf([hero!, { ...foe!, health: 0 }])));
    expect(outcome?.items).toEqual({ heal: 1, smoke: 3 });
  });

  it('a fight saved before tools has an empty pouch and still plays', () => {
    const fighters = pair([], []).map(({ items: _i, ...f }) => f);
    // An old save's fighters lack items; that is exactly what this test feeds in.
    const old = encode(stateOf(fighters as PlanFighter[]));
    const engine = createPlanEngine();
    expect(engine.view(old).combatants).toHaveLength(2);
    const next = engine.act(old, { optionId: 'next' }, createRng(2));
    if (!next.ok) throw new Error(next.error);
    expect(decode(next.value).fighters[0]?.items).toEqual([]);
  });
});
