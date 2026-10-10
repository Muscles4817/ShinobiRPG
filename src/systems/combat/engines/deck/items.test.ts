import { createRng } from '@/core';

import type {
  CombatantSetup,
  CombatItem,
  CombatItemEffect,
  CombatState,
  CombatTrait,
} from '../../contract';
import { createDeckEngine } from './engine';
import { decode, encode, playerOf, type DeckFighter, type DeckState } from './state';

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

const tool = (effect: CombatItemEffect, count = 2, id: string = effect): CombatItem => ({
  id,
  name: `${effect} tool`,
  effect,
  count,
});

const UNSEEN = "You can't see them. Search or Dispel.";

describe('deck fight tools', () => {
  const engine = createDeckEngine();
  const hero = (items: CombatItem[], over: Partial<CombatantSetup> = {}) =>
    fighter('hero', { items, ...over });
  const start = (player: CombatantSetup, enemies = [fighter('bandit')]) =>
    engine.start({ player, allies: [], enemies, canFlee: true }, createRng(1));
  const mutate = (state: CombatState, change: (d: DeckState) => DeckState) =>
    encode(change(decode(state)));
  const patchFighter = (state: CombatState, id: string, change: Partial<DeckFighter>) =>
    mutate(state, (d) => ({
      ...d,
      fighters: d.fighters.map((f) => (f.id === id ? { ...f, ...change } : f)),
    }));
  const act = (state: CombatState, optionId: string, targetId?: string, seed = 2) => {
    const next = engine.act(
      state,
      { optionId, ...(targetId ? { targetId } : {}) },
      createRng(seed),
    );
    if (!next.ok) throw new Error(next.error);
    return next.value;
  };
  const option = (state: CombatState, id: string) =>
    engine.view(state).options.find((o) => o.id === id);
  const enemy = (state: CombatState, id: string) =>
    decode(state).fighters.find((f) => f.id === id)!;
  const attacking = (state: CombatState) =>
    mutate(state, (d) => ({
      ...d,
      range: 'close',
      intents: Object.fromEntries(
        Object.keys(d.intents).map((id) => [id, { kind: 'attack' as const, estimate: 5 }]),
      ),
    }));

  it('offers each carried tool as a one-action item move, saying why not', () => {
    const items = [tool('smoke'), tool('heal', 1), tool('blast', 1, 'pouch:tag'), tool('flash', 0)];
    const state = start(hero(items));
    const tools = engine.view(state).options.filter((o) => o.kind === 'item');
    expect(tools.map((o) => o.id)).toEqual(['item:smoke', 'item:heal', 'item:pouch:tag']);
    expect(tools[0]).toMatchObject({ detail: '×2 · Vanish until you attack', cost: 1 });
    expect(tools[0]?.disabledReason).toBeUndefined();
    expect(tools[1]?.disabledReason).toBe('You are unhurt.');
    expect(tools[2]).toMatchObject({ detail: '×1 · Seal blast · through armour', targeted: true });
    const tired = mutate(state, (d) => ({ ...d, points: 0 }));
    expect(option(tired, 'item:smoke')?.disabledReason).toBe('Not enough actions');
    const blind = start(hero(items), [fighter('ghost', { traits: ['illusionist'] })]);
    expect(option(blind, 'item:pouch:tag')?.disabledReason).toBe(UNSEEN);
  });

  it('pills and salves restore, spend one and cost an action', () => {
    const hurt = patchFighter(start(hero([tool('heal'), tool('chakra')])), 'hero', {
      health: 10,
      chakra: 0,
    });
    const healed = decode(act(hurt, 'item:heal'));
    expect(playerOf(healed).health).toBe(40);
    expect(playerOf(healed).items.find((i) => i.id === 'heal')?.count).toBe(1);
    expect(healed.points).toBe(2);
    const fed = decode(act(encode(healed), 'item:chakra'));
    expect(playerOf(fed).chakra).toBe(25);
    expect(fed.points).toBe(1);
  });

  it('a confused player never fumbles a tool', () => {
    const muddled = patchFighter(start(hero([tool('clarity')])), 'hero', { confused: 2 });
    for (let seed = 0; seed < 10; seed++) {
      expect(playerOf(decode(act(muddled, 'item:clarity', undefined, seed))).confused).toBe(0);
    }
  });

  it('smoke hides you: enemies lose sight, and your next attack reveals you', () => {
    const smoked = act(start(hero([tool('smoke')])), 'item:smoke');
    expect(playerOf(decode(smoked)).hidden).toBe(true);
    expect(engine.view(smoked).combatants[0]?.statuses).toContain('Hidden');
    const after = decode(act(attacking(smoked), 'end'));
    expect(playerOf(after).health).toBe(50);
    expect(after.log).toContain('bandit loses sight of you.');
    expect(playerOf(after).hidden).toBe(true);

    const withKunai = mutate(encode(after), (d) => ({
      ...d,
      range: 'close',
      hand: [{ uid: 'k', kind: 'strike' }],
    }));
    const thrown = decode(act(withKunai, 'card:k', 'bandit'));
    expect(playerOf(thrown).hidden).toBe(false);
  });

  it('a hidden player hits harder', () => {
    const base = mutate(start(hero([])), (d) => ({ ...d, hand: [{ uid: 'k', kind: 'kunai' }] }));
    const hiddenHit =
      50 - enemy(act(patchFighter(base, 'hero', { hidden: true }), 'card:k'), 'bandit').health;
    const plainHit = 50 - enemy(act(base, 'card:k'), 'bandit').health;
    expect(hiddenHit).toBeGreaterThan(plainHit);
  });

  it('enemies turn on a teammate they can see while you are hidden', () => {
    const state = engine.start(
      {
        player: hero([tool('smoke')]),
        allies: [fighter('ally')],
        enemies: [fighter('bandit')],
        canFlee: true,
      },
      createRng(1),
    );
    const smoked = attacking(act(state, 'item:smoke'));
    const after = decode(act(smoked, 'end'));
    expect(playerOf(after).health).toBe(50);
    expect(after.log).not.toContain('bandit loses sight of you.');
    expect(after.log.some((l) => l.startsWith('bandit hits ally'))).toBe(true);
  });

  it('a flash reveals a hidden illusionist', () => {
    const state = start(hero([tool('flash')]), [fighter('ghost', { traits: ['illusionist'] })]);
    expect(enemy(state, 'ghost').hidden).toBe(true);
    expect(enemy(act(state, 'item:flash'), 'ghost').hidden).toBe(false);
  });

  it('a blast refuses hidden targets and goes through armour', () => {
    const foes = [fighter('ghost', { traits: ['illusionist'] }), fighter('bandit')];
    const state = start(hero([tool('blast')]), foes);
    const refused = engine.act(state, { optionId: 'item:blast', targetId: 'ghost' }, createRng(2));
    expect(refused).toMatchObject({ ok: false, error: UNSEEN });

    const blastAt = (traits: CombatTrait[]) => {
      const fight = start(hero([tool('blast')]), [fighter('foe', { traits })]);
      return 50 - enemy(act(fight, 'item:blast', 'foe'), 'foe').health;
    };
    expect(blastAt(['armoured'])).toBe(blastAt([]));
    expect(blastAt([])).toBeGreaterThan(0);
  });

  it('a blast can finish a fight, and the outcome reports the tools left', () => {
    const state = patchFighter(start(hero([tool('blast'), tool('heal', 3)])), 'bandit', {
      health: 1,
    });
    const won = act(state, 'item:blast', 'bandit');
    expect(engine.outcome(won)).toMatchObject({ result: 'victory', items: { blast: 1, heal: 3 } });
  });

  it('a blast that badly hurts a coward sends them running', () => {
    const coward = fighter('coward', { traits: ['coward'], health: 18, maxHealth: 50 });
    const after = decode(act(start(hero([tool('blast')]), [coward]), 'item:blast', 'coward'));
    expect(after.log.at(-1)).toBe('coward flees!');
    expect(after.result).toBe('victory');
  });
});
