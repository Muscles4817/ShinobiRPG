import { createRng } from '@/core';

import type { CombatantSetup, CombatState, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { rememberedPlan } from './memory';
import { planOf } from './planning';
import { decode, playerOf } from './state';

/** Who plans your round: your list, plan then edit, orders (`whoPlans.ts`, `drafting.ts`). */

const jab: CombatTechnique = {
  id: 'jab',
  name: 'Jab',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 0,
};
const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  reach: ['mid', 'far'],
  effects: [{ verb: 'damage', power: 18 }],
  chakraCost: 10,
};

function fighter(id: string, techniques: CombatTechnique[]): CombatantSetup {
  const v = 20;
  return {
    id,
    name: id,
    attributes: {
      strength: v,
      speed: v,
      stamina: v,
      chakraControl: v,
      intellect: v,
      perception: v,
      willpower: v,
      taijutsu: v,
      ninjutsu: v,
      genjutsu: 10,
      kenjutsu: 10,
      fuuinjutsu: 10,
    },
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques,
  };
}

const engine = createPlanEngine();
const rng = createRng(1);
const start = (plan?: unknown) =>
  engine.start(
    {
      player: fighter('player', [jab, bolt]),
      allies: [],
      enemies: [fighter('foe', [jab])],
      canFlee: false,
      ...(plan ? { plan } : {}),
    },
    rng,
  );

function act(state: CombatState, optionId: string): CombatState {
  const next = engine.act(state, { optionId }, rng);
  if (!next.ok) throw new Error(next.error);
  return next.value;
}

const player = (state: CombatState) => playerOf(decode(state));
const option = (state: CombatState, id: string) =>
  engine.view(state).options.find((o) => o.id === id);
const slots = (state: CombatState) =>
  Object.values(player(state).loadout).reduce((n, s) => n + s.length, 0);

describe('who plans your round', () => {
  it('starts at your list, with the mind ready to fill empty slots on asking', () => {
    const s = start();
    expect(option(s, 'who:list')?.selected).toBe(true);
    const emptied = act(s, 'slot:mid:jutsu:bolt');
    const before = slots(emptied);
    const asked = act(emptied, 'ask-plan');
    expect(slots(asked)).toBeGreaterThan(before);
    expect(player(asked).planning).toBeUndefined();
  });

  it('moving up from your list keeps every slot as yours; handing it back lets the mind draft', () => {
    const s = start();
    const drafting = act(s, 'who:draft');
    const p = player(drafting);
    expect(p.planning).toBe('draft');
    expect(p.owned?.close).toEqual(p.loadout.close.map((x) => x.card));
    const handed = act(drafting, 'handback-all');
    const q = player(handed);
    expect(q.owned).toEqual({});
    expect(Object.keys(q.draftedWhy ?? {}).length).toBeGreaterThan(0);
    const shown = engine.view(handed).options.filter((o) => o.draftedWhy);
    expect(shown.length).toBeGreaterThan(0);
  });

  it('a slot you set while the mind drafts becomes yours, and stays through the next round', () => {
    const handed = act(act(start(), 'who:draft'), 'handback-all');
    const placed = act(handed, 'slot:close:brace');
    expect(player(placed).owned?.close).toContain('brace');
    expect(option(placed, 'slot:close:brace')?.mine).toBe(true);
    expect(option(placed, 'handback:close:brace')).toBeDefined();
    const after = act(placed, 'begin');
    expect(player(after).loadout.close.some((s) => s.card === 'brace')).toBe(true);
  });

  it('orders: what you forbid is never drafted', () => {
    const ordering = act(act(start(), 'who:orders'), 'handback-all');
    expect(option(ordering, 'order:free')?.selected).toBe(true);
    const forbidden = act(ordering, 'forbid:jutsu:bolt');
    const p = player(forbidden);
    expect(p.forbidden).toContain('jutsu:bolt');
    for (const band of ['close', 'mid', 'far'] as const) {
      expect(p.loadout[band].some((s) => s.card === 'jutsu:bolt')).toBe(false);
    }
  });

  it('carries over to the next fight with your plan', () => {
    const set = act(act(act(start(), 'who:orders'), 'order:press'), 'forbid:jutsu:bolt');
    const kept = planOf(player(set));
    const read = rememberedPlan(JSON.parse(JSON.stringify(kept)), player(start()));
    expect(read?.planning).toBe('orders');
    expect(read?.order).toBe('press');
    expect(read?.forbidden).toEqual(['jutsu:bolt']);
    const next = start(kept);
    expect(player(next).planning).toBe('orders');
  });

  it('back to your list adopts everything as yours, with no stamps', () => {
    const back = act(act(act(start(), 'who:draft'), 'handback-all'), 'who:list');
    expect(player(back).planning).toBeUndefined();
    expect(
      engine.view(back).options.some((o) => o.draftedWhy !== undefined || o.mine === true),
    ).toBe(false);
  });
});
