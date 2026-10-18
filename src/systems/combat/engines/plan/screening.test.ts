import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { splitNarration } from '../../rules/narration';
import { cloneStepBonus, drawFireChance, type Clones } from '../../rules/verbs';
import { drawnByClones } from './screening';
import { initialFighters, type PlanFighter, type Round } from './state';

/** Clones running ahead of a charge draw the holder's fire. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 10,
  intellect: 20,
  perception: 10,
  willpower: 10,
  taijutsu: 20,
  ninjutsu: 30,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const storm: CombatTechnique = {
  id: 'storm',
  name: 'Storm',
  discipline: 'ninjutsu',
  effects: [{ verb: 'area', power: 18, size: 'wide' }],
  chakraCost: 10,
};
const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 18 }],
  chakraCost: 10,
};

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
  };
}

const clones = (count: number, strikes = true): Clones => ({
  techniqueId: 'clone',
  count,
  skill: 30,
  strikes,
});

function round(): Round {
  const fighters = initialFighters({
    player: setup('runner'),
    allies: [setup('friend')],
    enemies: [setup('holder')],
    canFlee: true,
  }).map((f): PlanFighter => (f.id === 'friend' ? { ...f, clones: clones(3) } : f));
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
}

function screen(technique: CombatTechnique): Round[] {
  return Array.from({ length: 40 }, (_, i) => {
    const r = round();
    const [runner, , holder] = r.fighters;
    const card = { kind: 'jutsu' as const, technique };
    return drawnByClones(r, { holder: holder!, closer: runner!, card, rng: createRng(i + 1) });
  }).filter((r): r is Round => r !== null);
}

describe('clones screening a charge', () => {
  it('a teammate’s clones may draw the holder’s shot, told as the holder’s', () => {
    const drawn = screen(bolt);
    expect(drawn.length).toBeGreaterThan(0);
    expect(drawn.length).toBeLessThan(40);
    const line = splitNarration(drawn[0]!.lines.at(-1)!);
    expect(line.text).toMatch(/Bolt tears into friend’s clones, and runner is through/);
    expect(line.actorId).toBe('holder');
  });

  it('a single shot bursts one clone; an area bursts them all', () => {
    const friend = (r: Round) => r.fighters.find((f) => f.id === 'friend')!;
    expect(friend(screen(bolt)[0]!).clones?.count).toBe(2);
    expect(friend(screen(storm)[0]!).clones?.count).toBe(0);
  });

  it('illusions draw fire less often than solid clones', () => {
    expect(drawFireChance(clones(3, false), 10, false)).toBeLessThan(
      drawFireChance(clones(3), 10, false),
    );
  });

  it('clones crowding round their maker make a step harder to cut off, up to a point', () => {
    expect(cloneStepBonus({})).toBe(0);
    expect(cloneStepBonus({ clones: clones(1) })).toBeGreaterThan(0);
    expect(cloneStepBonus({ clones: clones(5) })).toBe(cloneStepBonus({ clones: clones(3) }));
  });
});
