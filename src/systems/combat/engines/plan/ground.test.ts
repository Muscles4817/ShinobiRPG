import { createRng } from '@/core';

import type { CombatGround, CombatantSetup, CombatTechnique } from '../../contract';
import { spots } from '@/test/fightLines';

import { createPlanEngine } from './engine';
import { useJutsu } from './jutsu';
import { search } from './senses';
import { step } from './steps';
import { decode, initialFighters, type Round } from './state';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 20,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 20,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const wave: CombatTechnique = {
  id: 'wave',
  name: 'Wave',
  discipline: 'ninjutsu',
  effects: [{ verb: 'area', power: 14, size: 'wide' }],
  chakraCost: 6,
  reach: ['close', 'mid', 'far'],
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

function on(
  ground: CombatGround,
  range: Round['range'] = 'mid',
  hero: Partial<CombatantSetup> = {},
): Round {
  const fighters = initialFighters({
    player: setup('hero', hero),
    allies: [setup('friend')],
    enemies: [setup('bandit')],
    canFlee: true,
  });
  return { number: 1, fighters, range, lines: [], seen: {}, intents: {}, ground };
}

const SEEDS = 200;

describe('the ground in a fight', () => {
  it('in a room, nobody backs away to far range: there is a wall', () => {
    const [hero, , bandit] = on('room').fighters;
    const after = step(on('room'), { actor: hero!, target: bandit, rng: createRng(1) }, 'back');
    expect(after.range).toBe('mid');
    expect(after.lines.join(' ')).toMatch(/wall behind them/);
  });

  it('in a room, a wide technique catches your own side, softer', () => {
    const round = on('room', 'close');
    const [hero, , bandit] = round.fighters;
    const casts = Array.from({ length: 40 }, (_, i) =>
      useJutsu(round, { actor: hero!, target: bandit, rng: createRng(i + 1) }, wave),
    );
    const caught = casts.filter(
      (r) => (r.fighters.find((f) => f.id === 'friend')?.health ?? 100) < 100,
    );
    expect(caught.length).toBeGreaterThan(0);
    // And the blast can't throw anyone further than the walls allow.
    for (const r of casts) expect(r.range).not.toBe('far');
    const open = useJutsu(
      on('arena', 'close'),
      { actor: hero!, target: bandit, rng: createRng(3) },
      wave,
    );
    expect(open.fighters.find((f) => f.id === 'friend')?.health).toBe(100);
  });

  it('on a lake, stepping is harder for anyone who can’t stand on water', () => {
    const steps = (perks: CombatantSetup['perks']) => {
      let moved = 0;
      for (let seed = 1; seed <= SEEDS; seed++) {
        const round = on('lake', 'far', { perks: perks ?? [] });
        const [hero, , bandit] = round.fighters;
        const after = step(round, { actor: hero!, target: bandit, rng: createRng(seed) }, 'back');
        if (after.range !== round.range) moved++;
      }
      return moved;
    };
    const atMid = (perks: CombatantSetup['perks']) => {
      let moved = 0;
      for (let seed = 1; seed <= SEEDS; seed++) {
        const round = on('lake', 'mid', { perks: perks ?? [] });
        const [hero, , bandit] = round.fighters;
        const after = step(round, { actor: hero!, target: bandit, rng: createRng(seed) }, 'back');
        if (after.range === 'far') moved++;
      }
      return moved;
    };
    expect(steps([])).toBe(0); // Already as far as it goes.
    expect(atMid(['water-walking'])).toBeGreaterThan(atMid([]) * 1.5);
  });

  it('in a forest, someone hiding is harder to find', () => {
    const found = (ground: CombatGround) => {
      let hits = 0;
      for (let seed = 1; seed <= SEEDS; seed++) {
        const round = on(ground);
        const hidden = {
          ...round,
          fighters: round.fighters.map((f) => (f.id === 'bandit' ? { ...f, hidden: true } : f)),
        };
        const hero = hidden.fighters[0]!;
        const after = search(hidden, { actor: hero, target: undefined, rng: createRng(seed) });
        if (after.lines.some((l) => spots('hero', 'bandit').test(l))) hits++;
      }
      return hits;
    };
    expect(found('forest')).toBeLessThan(found('arena'));
  });

  it('a fight in a room never starts at far range, and its opening names the ground', () => {
    const engine = createPlanEngine();
    const state = decode(
      engine.start(
        {
          player: setup('hero'),
          allies: [],
          enemies: [setup('bandit')],
          canFlee: true,
          ground: 'room',
          opening: { range: 'far' },
        },
        createRng(1),
      ),
    );
    expect(state.range).toBe('mid');
    expect(state.ground).toBe('room');
    expect(state.log.join(' ')).toMatch(/Four walls/);
  });
});
