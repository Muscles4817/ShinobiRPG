import { createRng } from '@/core';

import type { CombatantSetup, CombatEngine, CombatState, CombatTechnique } from '../../contract';
import { cardsFor, defaultLoadout, slotLimit } from './cards';
import { chooseCard } from './choose';
import { createPlanEngine, ROUND_EXCHANGES } from './engine';
import { decode, encode, initialFighters, type PlanFighter } from './state';

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

function bodies(player = fighter('hero', { techniques: [daze, blast] })): PlanFighter[] {
  return initialFighters({ player, allies: [], enemies: [fighter('bandit')], canFlee: true });
}

function act(engine: CombatEngine, state: CombatState, optionId: string, seed = 2): CombatState {
  const next = engine.act(state, { optionId }, createRng(seed));
  if (!next.ok) throw new Error(next.error);
  return next.value;
}

describe('plan & watch cards', () => {
  it('each distance offers what reaches it, plus footwork and defences', () => {
    const [hero] = bodies();
    const ids = (band: 'close' | 'mid' | 'far') =>
      cardsFor(hero!, band).map((c) => (c.kind === 'jutsu' ? c.technique.id : c.kind));
    expect(ids('close')).toEqual(['strike', 'step', 'guard', 'dodge', 'counter', 'daze']);
    expect(ids('far')).toEqual(['throw', 'step', 'guard', 'dodge', 'daze', 'blast']);
  });

  it('a sharp mind gets an extra slot', () => {
    expect(slotLimit({ attributes })).toBe(3);
    expect(slotLimit({ attributes: { ...attributes, intellect: 12 } })).toBe(4);
  });

  it('the default plan walks a brawler in and keeps a jutsu user at range', () => {
    const [brawler] = bodies(fighter('hero'));
    expect(defaultLoadout(brawler!).far[0]).toBe('step-in');
    const [caster] = bodies();
    const plan = defaultLoadout(caster!);
    expect(plan.close[0]).toBe('step-back');
    expect(plan.mid).toContain('jutsu:blast');
  });

  it('dazes a fresh foe and punishes a dazed one', () => {
    const [hero, bandit] = bodies();
    const slotted = {
      ...hero!,
      loadout: { close: [], mid: ['jutsu:daze', 'jutsu:blast'], far: [] },
    };
    const dazed = chooseCard(
      slotted,
      { band: 'mid', foe: { ...bandit!, stunned: 1 } },
      createRng(1),
    );
    expect(dazed).toMatchObject({ kind: 'jutsu', technique: { id: 'blast' } });
  });

  it('improvises a basic blow when nothing slotted can be played', () => {
    const [hero, bandit] = bodies();
    const guardOnly = { ...hero!, loadout: { close: ['guard'], mid: [], far: [] } };
    expect(chooseCard(guardOnly, { band: 'close', foe: bandit }, createRng(1))).toEqual({
      kind: 'strike',
    });
  });
});

describe('plan & watch engine', () => {
  const engine = createPlanEngine();
  const start = (player = fighter('hero', { techniques: [daze, blast] })) =>
    engine.start({ player, allies: [], enemies: [fighter('bandit')], canFlee: true }, createRng(1));

  it('opens at the card table with cards grouped by distance', () => {
    const view = engine.view(start());
    expect(view.prompt).toBe('Round 1: pick up to 3 cards for each distance.');
    const groups = new Set(view.options.filter((o) => o.kind === 'plan').map((o) => o.group));
    expect([...groups]).toEqual(['Close', 'Mid', 'Far']);
  });

  it('cards toggle in and out, and full slots say so', () => {
    const state = start();
    const option = (s: CombatState, id: string) => engine.view(s).options.find((o) => o.id === id);
    expect(option(state, 'slot:close:dodge')?.disabledReason).toBe(
      'Slots full. Take a card out first.',
    );
    const [first] = decode(state).fighters[0]!.loadout.close;
    const freed = act(engine, state, `slot:close:${first}`);
    expect(option(freed, `slot:close:${first}`)?.selected).toBe(false);
    const swapped = act(engine, freed, 'slot:close:dodge');
    expect(decode(swapped).fighters[0]!.loadout.close).toContain('dodge');
  });

  it('a round plays out, then you can re-plan', () => {
    let state = act(engine, start(), 'begin');
    expect(engine.view(state).options.map((o) => o.id)).toEqual(['next', 'round', 'flee']);
    state = act(engine, state, 'round');
    const plan = decode(state);
    expect(plan.result ?? plan.phase).toBe('loadout');
    expect(plan.round).toBe(1 + ROUND_EXCHANGES);
    expect(Object.keys(plan.seen)).toContain('bandit');
  });

  it('a much stronger fighter wins over a few rounds', () => {
    const strong = fighter('hero', { attributes: { ...attributes, strength: 40, speed: 20 } });
    let state = start(strong);
    for (let i = 0; i < 20 && !engine.outcome(state); i++) {
      state = act(engine, act(engine, state, 'begin', i), 'round', i + 7);
    }
    expect(engine.outcome(state)?.result).toBe('victory');
  });

  it('insight shows an enemy’s cards for the current distance', () => {
    const seer = fighter('hero', { perks: ['insight'] });
    const bandit = engine.view(start(seer)).combatants.find((c) => c.id === 'bandit');
    expect(bandit?.intent).toMatch(/^Mid cards: /);
  });

  it('a fight saved under the old single-tactic plan resumes at the card table', () => {
    const fighters = bodies().map(({ loadout: _loadout, ...f }) => ({ ...f, guarding: false }));
    const legacy = encode({
      phase: 'fight',
      tactic: 'rush',
      round: 3,
      fighters,
      range: 'mid',
      trumpUsed: false,
      log: ['Old fight.'],
      result: null,
      canFlee: true,
    } as never);
    const view = engine.view(legacy);
    expect(view.prompt).toBe('Round 1: pick up to 3 cards for each distance.');
    expect(engine.act(legacy, { optionId: 'begin' }, createRng(1)).ok).toBe(true);
  });

  it('starts from the plan you had last time, cleaned up, and hands it back at the end', () => {
    const plan = { close: ['counter', 'jutsu:gone', 'strike'], mid: ['dodge'], far: 'nonsense' };
    const state = engine.start(
      {
        player: fighter('hero', { techniques: [daze, blast] }),
        allies: [],
        enemies: [fighter('bandit')],
        canFlee: true,
        plan,
      },
      createRng(1),
    );
    const hero = decode(state).fighters[0]!;
    expect(hero.loadout.close).toEqual(defaultLoadout(hero).close);
    const kept = engine.start(
      {
        player: fighter('hero'),
        allies: [],
        enemies: [fighter('bandit')],
        canFlee: true,
        plan: { close: ['counter', 'jutsu:gone', 'strike'], mid: ['dodge'], far: [] },
      },
      createRng(1),
    );
    expect(decode(kept).fighters[0]!.loadout).toEqual({
      close: ['counter', 'strike'],
      mid: ['dodge'],
      far: [],
    });
    const fled = act(engine, kept, 'flee', 5);
    const outcome = engine.outcome(fled);
    if (outcome) expect(outcome.plan).toEqual(decode(kept).fighters[0]!.loadout);
  });

  it('rejects state from another engine', () => {
    expect(() => engine.view({ engineId: 'other', data: {} })).toThrow();
  });
});
