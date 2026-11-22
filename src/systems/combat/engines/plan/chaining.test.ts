import { atHealth } from '@/test/planFighters';
import { createRng } from '@/core';
import { castsLine, chainBreaks, linksLine, linesOf } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { chainsOf, followThrough, opened } from './chaining';
import { initialFighters, type Round } from './state';

const attributes = {
  strength: 14,
  speed: 14,
  stamina: 14,
  chakraControl: 5,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 16,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};
const sweep: CombatTechnique = {
  id: 'sweep',
  name: 'Sweep',
  discipline: 'taijutsu',
  effects: [
    { verb: 'damage', power: 6 },
    { verb: 'daze', power: 8 },
  ],
  chakraCost: 4,
};
const heel: CombatTechnique = {
  ...sweep,
  id: 'heel',
  name: 'Heel',
  effects: [{ verb: 'damage', power: 18 }],
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
    techniques: [sweep, heel],
    ...overrides,
  };
}

function roundOf(hero: Partial<CombatantSetup> = {}): Round {
  const fighters = initialFighters({
    player: setup('hero', hero),
    allies: [],
    enemies: [setup('foe', { techniques: [] })],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', story: [], seen: {}, intents: {} };
}

function turnIn(round: Round) {
  return { actor: round.fighters[0]!, target: round.fighters[1], rng: createRng(4) };
}

describe('chains in a fight', () => {
  it('are kept from the moves that set a foe up, and only at taijutsu C', () => {
    expect(chainsOf(roundOf().fighters[0]!).map((c) => c.map((t) => t.id))).toEqual([
      ['sweep', 'heel'],
    ]);
    const novice = roundOf({ attributes: { ...attributes, taijutsu: 8 } }).fighters[0]!;
    expect(chainsOf(novice)).toEqual([]);
  });

  it('open on a planned strike when the chain beats one move', () => {
    const round = roundOf();
    const open = opened(round, turnIn(round), { kind: 'strike' }, { kind: 'strike' });
    expect(open.card).toMatchObject({ kind: 'jutsu', technique: { id: 'sweep' } });
    expect(open.follow.map((t) => t.id)).toEqual(['heel']);
  });

  it('follow through while the last link landed', () => {
    const before = roundOf();
    const hurt = { ...before, fighters: atHealth(before.fighters, 'foe', 90) };
    const after = followThrough(before, hurt, turnIn(before), [heel]);
    expect(after.fighters[0]!.uses?.heel).toBe(1);
  });

  it('tell a link as carried on from the last, not as a fresh start', () => {
    const before = roundOf();
    const hurt = { ...before, fighters: atHealth(before.fighters, 'foe', 90) };
    const lines = linesOf(followThrough(before, hurt, turnIn(before), [heel]).story);
    expect(lines.some((l) => linksLine(l, 'hero', 'Heel'))).toBe(true);
    expect(lines.some((l) => castsLine(l, 'hero', 'Heel'))).toBe(false);
  });

  it('break off when the last link missed, or its thrower was hurt in answer', () => {
    const before = roundOf();
    const missed = followThrough(before, before, turnIn(before), [heel]);
    expect(chainBreaks('missed').test(linesOf(missed.story).at(-1)!)).toBe(true);
    const countered = {
      ...before,
      fighters: atHealth(atHealth(before.fighters, 'foe', 90), 'hero', 80),
    };
    const broke = linesOf(followThrough(before, countered, turnIn(before), [heel]).story).at(-1);
    expect(chainBreaks('countered').test(broke!)).toBe(true);
  });

  it('break off out of reach once a knock leaves the next move nothing to hit', () => {
    const before = roundOf();
    const knocked = {
      ...before,
      range: 'far' as const,
      fighters: atHealth(before.fighters, 'foe', 90),
    };
    const after = followThrough(before, knocked, turnIn(before), [heel]);
    expect(chainBreaks('out-of-reach').test(linesOf(after.story).at(-1)!)).toBe(true);
  });
});
