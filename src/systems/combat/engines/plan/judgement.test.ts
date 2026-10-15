import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { betweenRounds } from './adapt';
import { adaptsAfter, beatsWeight, planAdherence, readsInTheMoment } from './judgement';
import { plannedPlay } from './priority';
import { rollIntents } from './intent';
import { initialFighters, plainSlots, type PlanFighter, type Reads, type Round } from './state';

const base = {
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
const mind = (intellect: number) => ({ attributes: { ...base, intellect } });
const dull = mind(4);
const sharp = mind(33);

const jab: CombatTechnique = {
  id: 'jab',
  name: 'Jab',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 2,
};
const barrage: CombatTechnique = {
  ...jab,
  id: 'barrage',
  name: 'Barrage',
  effects: [{ verb: 'damage', power: 12, hits: 3 }],
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes: base,
    health: 80,
    maxHealth: 80,
    chakra: 40,
    maxChakra: 40,
    techniques: [],
    ...overrides,
  };
}

function bandit(intellect: number): PlanFighter[] {
  return initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('bandit', { techniques: [jab, barrage], attributes: { ...base, intellect } })],
    canFlee: true,
  }).map((f) =>
    f.id === 'bandit'
      ? {
          ...f,
          loadout: { close: plainSlots(['jutsu:jab', 'jutsu:barrage']), mid: [], far: [] },
          reactions: { close: 'guard', mid: 'guard', far: 'guard' },
        }
      : f,
  );
}

const guarding: Reads = { hero: { defences: { close: 'guard' }, attacks: {} } };

describe('judgement by intellect', () => {
  it('a sharper mind keeps to its plan more, leans harder on a read and learns faster', () => {
    expect(planAdherence(sharp)).toBeGreaterThan(planAdherence(dull));
    expect(beatsWeight(sharp)).toBeGreaterThan(beatsWeight(dull));
    expect(adaptsAfter(sharp)).toBeLessThan(adaptsAfter(dull));
    expect(readsInTheMoment(sharp)).toBe(true);
    expect(readsInTheMoment(dull)).toBe(false);
  });

  it('only a mind that reads in the moment turns a seen Guard into a flurry', () => {
    const play = (intellect: number) => {
      const fighters = bandit(intellect);
      const round: Round = {
        number: 1,
        fighters,
        range: 'close',
        lines: [],
        seen: {},
        intents: {},
        reads: guarding,
      };
      const { card } = plannedPlay(fighters[1]!, round);
      return card.kind === 'jutsu' ? card.technique.id : card.kind;
    };
    expect(play(4)).toBe('jab');
    expect(play(16)).toBe('barrage');
  });

  it('a dull mind needs more of your fighting before it changes its defence', () => {
    const reads: Reads = { hero: { defences: {}, attacks: { break: 3 } } };
    const after = (intellect: number) =>
      betweenRounds(bandit(intellect), reads).find((f) => f.id === 'bandit')?.reactions?.close;
    expect(after(16)).toBe('dodge');
    expect(after(4)).toBe('guard');
  });

  it('a sharper foe telegraphs its plan more often', () => {
    const planned = (intellect: number) => {
      const fighters = bandit(intellect);
      const table = { fighters, range: 'close' as const, exchange: 1, round: 1 };
      let jabs = 0;
      for (let seed = 1; seed <= 400; seed++) {
        if (rollIntents(table, createRng(seed)).bandit === 'jutsu:jab') jabs++;
      }
      return jabs;
    };
    expect(planned(33)).toBeGreaterThan(planned(4));
  });
});
