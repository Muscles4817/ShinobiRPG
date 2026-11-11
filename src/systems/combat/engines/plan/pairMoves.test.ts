import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique, RangeBand } from '../../contract';
import { aftermath } from './blast';
import { distanceBetween, joinedBeside, pairKey } from './distance';
import { knock } from './lingering';
import { movesFor } from './pairMoves';
import { initialFighters, type PlanFighter, type Round } from './state';
import { step } from './steps';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 20,
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

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  const base = { id, name: id, attributes, health: 100, maxHealth: 100, chakra: 60 };
  return { ...base, maxChakra: 60, techniques: [], ...overrides };
}

/** The hero and a friend against a swordsman in front and a caster behind, all at `range`. */
function field(range: RangeBand, pairs: Readonly<Record<string, RangeBand>> = {}): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [setup('friend')],
    enemies: [setup('sword', { row: 'front' }), setup('caster', { row: 'back' })],
    canFlee: true,
  });
  return { number: 1, fighters, range, distances: pairs, lines: [], seen: {}, intents: {} };
}

const who = (round: Round, id: string): PlanFighter => round.fighters.find((f) => f.id === id)!;
const at = (round: Round, a: string, b: string) => distanceBetween(round, a, b);

describe('movement per foe', () => {
  it('a step in on one foe leaves the other where they stood', () => {
    const round = field('mid');
    const moved = [...Array(30).keys()]
      .map((seed) =>
        step(
          round,
          { actor: who(round, 'hero'), target: who(round, 'sword'), rng: createRng(seed + 1) },
          'in',
        ),
      )
      .find((r) => at(r, 'hero', 'sword') === 'close');
    expect(moved).toBeDefined();
    expect(at(moved!, 'hero', 'caster')).toBe('mid');
    expect(at(moved!, 'friend', 'sword')).toBe('mid');
  });

  it('going in on a guarded back-row foe brings the front row near too', () => {
    const round = field('far');
    const moves = movesFor(round, who(round, 'hero'), who(round, 'caster'), 'mid');
    expect(moves.map((m) => m.b).sort()).toEqual(['caster', 'sword']);
  });

  it('drawing back gets clear of every foe nearer than where it goes', () => {
    const round = field('mid', { [pairKey('hero', 'sword')]: 'close' });
    const moves = movesFor(round, who(round, 'hero'), who(round, 'sword'), 'mid');
    expect(moves.map((m) => m.b)).toEqual(['sword']);
  });

  it('a step in on a foe someone is already fighting up close is sure', () => {
    const round = field('mid', { [pairKey('friend', 'sword')]: 'close' });
    for (let seed = 1; seed <= 20; seed++) {
      const turn = { actor: who(round, 'hero'), target: who(round, 'sword'), rng: createRng(seed) };
      expect(at(step(round, turn, 'in'), 'hero', 'sword')).toBe('close');
    }
  });

  it('a throw moves only the thrower and the one thrown', () => {
    const round = field('close');
    const shove: CombatTechnique = {
      id: 'shove',
      name: 'Shove',
      discipline: 'taijutsu',
      effects: [{ verb: 'knock', power: 6, to: 'far' }],
      chakraCost: 0,
    };
    const [effect] = shove.effects;
    if (effect?.verb !== 'knock') throw new Error('a knock');
    const aim = { actor: who(round, 'hero'), target: who(round, 'sword') };
    const after = knock(round, aim, { technique: shove, effect });
    expect(at(after, 'hero', 'sword')).toBe('far');
    expect(at(after, 'hero', 'caster')).toBe('close');
    expect(at(after, 'friend', 'sword')).toBe('close');
  });

  it('a wide blast throws back whom it caught; a vast one everyone', () => {
    const round = field('close');
    const blast = (size: 'wide' | 'vast'): CombatTechnique => ({
      id: size,
      name: size,
      discipline: 'ninjutsu',
      effects: [{ verb: 'area', power: 10, size }],
      chakraCost: 8,
    });
    const turn = { actor: who(round, 'hero'), target: undefined, rng: createRng(1) };
    const wide = aftermath(round, turn, { t: blast('wide'), caught: [who(round, 'sword')] });
    expect(at(wide, 'hero', 'sword')).toBe('mid');
    expect(at(wide, 'hero', 'caster')).toBe('close');
    const vast = aftermath(round, turn, { t: blast('vast'), caught: [who(round, 'sword')] });
    expect(at(vast, 'friend', 'caster')).toBe('far');
  });

  it('a body that joins beside another stands where they stand', () => {
    const round = field('mid', { [pairKey('hero', 'sword')]: 'close' });
    const joined = { ...round, ...joinedBeside(round, ['toad'], who(round, 'hero')) };
    expect(at(joined, 'toad', 'sword')).toBe('close');
    expect(at(joined, 'toad', 'caster')).toBe('mid');
  });
});
