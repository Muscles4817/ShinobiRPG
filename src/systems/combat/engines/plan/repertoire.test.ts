import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { maxBreath } from '../../rules/breath';
import { defaultLoadout } from './defaults';
import { defaultRepertoire, repertoireOf, styled } from './repertoire';
import { initialFighters, type PlanFighter, type Round } from './state';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 12,
  chakraControl: 5,
  intellect: 8,
  perception: 8,
  willpower: 8,
  taijutsu: 14,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

const move = (id: string, power: number, more: Partial<CombatTechnique> = {}): CombatTechnique => ({
  id,
  name: id,
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power }],
  chakraCost: 4,
  ...more,
});
const jab = move('jab', 8, { chakraCost: 2 });
const heavy = move('heavy', 20, { chakraCost: 8 });
const flurry = move('flurry', 16, { effects: [{ verb: 'damage', power: 16, hits: 4 }] });
const breaker = move('breaker', 14, { effects: [{ verb: 'break', power: 14 }] });
const gale = move('gale', 18, { element: 'wind' });

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [jab, heavy, flurry, breaker],
    ...overrides,
  };
}

function roundOf(hero: Partial<CombatantSetup> = {}, foe: Partial<CombatantSetup> = {}): Round {
  const fighters = initialFighters({
    player: setup('hero', hero),
    allies: [],
    enemies: [setup('foe', { techniques: [], ...foe })],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

function strikeOf(round: Round, actor = round.fighters[0]!): string {
  const turn = { actor, target: round.fighters[1], rng: createRng(1) };
  const card = styled(round, turn, { kind: 'strike' });
  return card.kind === 'jutsu' ? card.technique.id : card.kind;
}

describe('a repertoire', () => {
  it('keeps a move of each kind first, as many as the taijutsu grade holds', () => {
    // Taijutsu 14 is C: four moves.
    expect(defaultRepertoire(setupFighter())).toEqual(['heavy', 'flurry', 'breaker', 'jab']);
    const novice = setupFighter({ attributes: { ...attributes, taijutsu: 5 } });
    expect(defaultRepertoire(novice)).toEqual(['heavy', 'flurry']);
  });

  it('holds only body moves the fighter knows, as they chose them', () => {
    const chosen = setupFighter({ techniques: [jab, heavy, gale], repertoire: ['jab', 'gale'] });
    expect(repertoireOf(chosen).map((t) => t.id)).toEqual(['jab']);
  });

  it('turns a planned strike into the hardest move for a novice', () => {
    const dull = { attributes: { ...attributes, taijutsu: 5, intellect: 4 } };
    expect(strikeOf(roundOf(dull))).toBe('heavy');
  });

  it('reads a seen Guard and picks what gets past it', () => {
    const round = roundOf();
    const reads = { foe: { defences: { close: 'guard' as const }, attacks: {} } };
    expect(strikeOf({ ...round, reads })).toBe('flurry');
  });

  it('changes up a move it has leaned on, before a foe who reads the fight reads it', () => {
    const sharp = { attributes: { ...attributes, intellect: 14 } };
    const round = roundOf(sharp, sharp);
    const leaned = {
      ...round.fighters[0]!,
      streak: { card: 'jutsu:heavy', turns: 3 },
      uses: { heavy: 4 },
    };
    expect(strikeOf(round)).toBe('heavy');
    expect(strikeOf(round, leaned)).not.toBe('heavy');
  });

  it('saves its breath for a cheap move when winded', () => {
    const round = roundOf({ techniques: [jab, heavy] });
    const winded = { ...round.fighters[0]!, breath: Math.round(maxBreath(attributes) / 4) };
    expect(strikeOf(round)).toBe('heavy');
    expect(strikeOf(round, winded)).toBe('jab');
  });

  it('leaves the strike alone with a weapon in hand, or with no moves', () => {
    const sword = { weaponClass: 'sword' as const, name: 'Sword', rank: 'D' as const };
    expect(strikeOf(roundOf({ gear: { held: sword } }))).toBe('strike');
    expect(strikeOf(roundOf({ techniques: [] }))).toBe('strike');
  });

  it('takes one slot in a default plan, in place of the moves it plays', () => {
    const close = defaultLoadout(setupFighter()).close.map((s) => s.card);
    expect(close).toContain('strike');
    expect(close).not.toContain('jutsu:heavy');
  });
});

function setupFighter(overrides: Partial<CombatantSetup> = {}): PlanFighter {
  const [f] = initialFighters({
    player: setup('hero', overrides),
    allies: [],
    enemies: [],
    canFlee: true,
  });
  return f!;
}
