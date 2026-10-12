import { createRng } from '@/core';

import type { CombatantSetup, CombatSetup, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { plannedPlay } from './priority';
import { react, type Blow } from './react';
import { resolveExchange } from './round';
import {
  decode,
  encode,
  initialFighters,
  plainSlots,
  type Loadout,
  type PlanFighter,
  type PlanState,
  type Round,
  type Slot,
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

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 60,
    maxHealth: 60,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const mend: CombatTechnique = {
  id: 'mend',
  name: 'Mend',
  discipline: 'ninjutsu',
  effects: [{ verb: 'heal', power: 10 }],
  chakraCost: 4,
};

const NO_CARDS: Loadout = { close: [], mid: [], far: [] };
const STRIKE: Blow = { raw: 5, what: 'strike', dodgeable: false, physical: true, kind: 'blow' };

function setup(overrides: Partial<CombatSetup> = {}): CombatSetup {
  return {
    player: fighter('hero'),
    allies: [],
    enemies: [fighter('wall', { traits: ['armoured'] }), fighter('archer', { traits: ['archer'] })],
    canFlee: true,
    ...overrides,
  };
}

const rowsOf = (fighters: readonly PlanFighter[]) =>
  Object.fromEntries(fighters.map((f) => [f.id, f.row]));

function withSlots(f: PlanFighter, band: keyof Loadout, slots: Slot[]): PlanFighter {
  return { ...f, loadout: { ...NO_CARDS, [band]: slots } };
}

function roundOf(fighters: PlanFighter[], range: Round['range'], intents = {}): Round {
  return { number: 1, fighters, range, lines: [], seen: {}, intents };
}

function hurt(f: PlanFighter, health: number): PlanFighter {
  return { ...f, health };
}

describe('plan & watch rows: placement', () => {
  it('places fighters by kit, and a side of one in front', () => {
    const healer = fighter('medic', { techniques: [mend] });
    const fighters = initialFighters(setup({ player: fighter('hero'), allies: [healer] }));
    expect(rowsOf(fighters)).toEqual({
      hero: 'front',
      medic: 'back',
      wall: 'front',
      archer: 'back',
    });
    const alone = initialFighters(setup({ player: fighter('hero', { traits: ['archer'] }) }));
    expect(rowsOf(alone).hero).toBe('front');
  });

  it("honours a setup's row, unless no one would stand in front", () => {
    const allies = [fighter('ally')];
    const back = initialFighters(setup({ player: fighter('hero', { row: 'back' }), allies }));
    expect(rowsOf(back)).toMatchObject({ hero: 'back', ally: 'front' });
    const archers = [fighter('a', { traits: ['archer'] }), fighter('b', { traits: ['archer'] })];
    expect(rowsOf(initialFighters(setup({ enemies: archers })))).toMatchObject({
      a: 'front',
      b: 'front',
    });
  });
});

describe('plan & watch rows: reach', () => {
  const [hero, wall, archer] = initialFighters(setup());
  const strikes = withSlots(hero!, 'close', plainSlots(['strike']));
  const throws = withSlots(hero!, 'mid', plainSlots(['throw']));

  it('blows up close only reach the front row while it stands', () => {
    const field = [strikes, hurt(wall!, 50), hurt(archer!, 10)];
    expect(plannedPlay(strikes, roundOf(field, 'close')).target?.id).toBe('wall');
  });

  it('the back row is exposed once the front falls', () => {
    const field = [strikes, hurt(wall!, 0), hurt(archer!, 50)];
    expect(plannedPlay(strikes, roundOf(field, 'close')).target?.id).toBe('archer');
  });

  it('kunai still reach the back row', () => {
    const field = [throws, hurt(wall!, 50), hurt(archer!, 10)];
    expect(plannedPlay(throws, roundOf(field, 'mid')).target?.id).toBe('archer');
  });

  it('a slot aimed only at a foe out of reach is passed over', () => {
    const finisher = withSlots(hero!, 'close', [
      { card: 'strike', when: 'foe-dazed' },
      { card: 'guard' },
    ]);
    const field = [finisher, wall!, { ...archer!, stunned: 1 }];
    const play = plannedPlay(finisher, roundOf(field, 'close'));
    expect(play.target?.id).toBe('wall');
  });

  it("foes' blows never reach a screened back row", () => {
    const fighters = initialFighters(
      setup({
        player: fighter('hero', { health: 500, maxHealth: 500 }),
        allies: [fighter('medic', { techniques: [mend] })],
        enemies: [fighter('brute', { traits: ['brawler'] })],
      }),
    ).map((f) => (f.id === 'brute' ? withSlots(f, 'close', plainSlots(['strike'])) : f));
    for (let seed = 1; seed <= 20; seed++) {
      const state = decode(createPlanEngine().start(setup(), createRng(seed)));
      const start: PlanState = { ...state, phase: 'fight', fighters, range: 'close', intents: {} };
      const after = resolveExchange(start, createRng(seed));
      expect(after.fighters.find((f) => f.id === 'medic')?.health).toBe(60);
    }
  });

  it('a counter cannot reach an attacker behind their front row', () => {
    const [me, front, back] = initialFighters(
      setup({ enemies: [fighter('wall'), fighter('lancer', { traits: ['archer'] })] }),
    );
    const countering = withSlots(me!, 'close', plainSlots(['counter']));
    const counters = (attacker: PlanFighter, field: PlanFighter[]) =>
      Array.from({ length: 40 }, (_, seed) => {
        const hit = { attacker, target: countering, blow: STRIKE, rng: createRng(seed + 1) };
        const round = react(roundOf(field, 'close'), hit);
        return round.fighters.find((f) => f.id === attacker.id)!.health < attacker.health;
      }).filter(Boolean).length;
    expect(counters(back!, [countering, front!, back!])).toBe(0);
    expect(counters(front!, [countering, front!, back!])).toBeGreaterThan(0);
  });
});

describe('plan & watch rows: threatening my back row', () => {
  const [hero, medic, brute, archer] = initialFighters(
    setup({
      allies: [fighter('medic', { techniques: [mend] })],
      enemies: [fighter('brute'), fighter('archer', { traits: ['archer'] })],
    }),
  );
  const aimed = withSlots(hero!, 'mid', [{ card: 'throw', target: 'threat' }]);
  const intents = { brute: 'strike', archer: 'throw' };

  it('aims at the foe whose attack can reach our back row', () => {
    const field = [aimed, medic!, hurt(brute!, 10), archer!];
    expect(plannedPlay(aimed, roundOf(field, 'mid', intents)).target?.id).toBe('archer');
  });

  it('with no one at our back, aims at any foe about to attack', () => {
    const field = [aimed, hurt(medic!, 0), hurt(brute!, 10), archer!];
    expect(plannedPlay(aimed, roundOf(field, 'mid', intents)).target?.id).toBe('brute');
  });
});

describe('plan & watch rows: view and saves', () => {
  const engine = createPlanEngine();

  it('shows each fighter’s row, and who is screened', () => {
    const view = engine.view(engine.start(setup(), createRng(1)));
    const archer = view.combatants.find((c) => c.id === 'archer');
    expect(archer?.row).toBe('back');
    expect(archer?.statuses).toContain('Screened');
    expect(view.combatants.find((c) => c.id === 'wall')?.row).toBe('front');
  });

  it('places fighters from fights saved before rows', () => {
    const state = decode(engine.start(setup(), createRng(1)));
    const old = { ...state, fighters: state.fighters.map(({ row: _row, ...f }) => f) };
    const view = engine.view(encode(old as unknown as PlanState));
    expect(view.combatants.map((c) => c.row)).toEqual(['front', 'front', 'back']);
  });
});
