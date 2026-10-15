import { createRng } from '@/core';
import type { AreaSize } from '@/systems/techniques';

import { GUARDED, SLIPS } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { useJutsu } from './jutsu';
import { initialFighters, type Round } from './state';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 20,
  chakraControl: 10,
  intellect: 10,
  perception: 1,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 20,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const blastOf = (size: AreaSize): CombatTechnique => ({
  id: `blast-${size}`,
  name: `Blast ${size}`,
  discipline: 'ninjutsu',
  effects: [{ verb: 'area', power: 16, size }],
  chakraCost: 6,
  reach: ['close', 'mid', 'far'],
});

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

/** The bandit keeps this defence ready at every distance, a step away from the hero. */
function facing(kept: string, bandit: Partial<CombatantSetup> = {}): Round {
  const reactions = { close: kept, mid: kept, far: kept };
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('bandit', bandit)],
    canFlee: true,
  }).map((f) => (f.id === 'bandit' ? { ...f, reactions } : f));
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

function cast(round: Round, size: AreaSize, seed: number): Round {
  const [hero, bandit] = round.fighters;
  return useJutsu(round, { actor: hero!, target: bandit, rng: createRng(seed) }, blastOf(size));
}

const SEEDS = 60;

describe('area techniques in a fight', () => {
  it('a plain Guard blunts a small one, not a wide one', () => {
    const guardedAt = (size: AreaSize) =>
      Array.from({ length: SEEDS }, (_, i) => cast(facing('guard'), size, i + 1)).filter((r) =>
        r.lines.some((l) => GUARDED.test(l)),
      ).length;
    expect(guardedAt('small')).toBeGreaterThan(0);
    expect(guardedAt('wide')).toBe(0);
  });

  it('nobody outruns a vast one, however quick', () => {
    const nimble = { attributes: { ...attributes, speed: 60 }, traits: ['swift' as const] };
    for (let seed = 1; seed <= SEEDS; seed++) {
      const after = cast(facing('dodge', nimble), 'vast', seed);
      expect(after.lines.join(' ')).not.toMatch(SLIPS);
    }
  });

  it('a wide blast throws the fight apart; a vast one to far, under dust', () => {
    expect(cast(facing('guard'), 'small', 1).range).toBe('close');
    expect(cast(facing('guard'), 'wide', 1).range).toBe('mid');
    const vast = cast(facing('guard'), 'vast', 1);
    expect(vast.range).toBe('far');
    expect(vast.field?.id).toBe('dust');
  });
});
