import type { CombatantSetup, CombatTechnique } from '../../contract';
import { openStep } from '../../rules/verbs';
import { playable } from './cards';
import { defaultLoadout } from './defaults';
import { afterEmpowers, empowerSelf } from './empower';
import { prepStatuses } from './prep';
import { initialFighters, type PlanFighter, type Round } from './state';

/** The Eight Gates in a planned fight: climbed, gating their arts, and giving out. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 10,
  intellect: 30,
  perception: 10,
  willpower: 10,
  taijutsu: 25,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

function opener(id: string, step: number, price = 4): CombatTechnique {
  return {
    id,
    name: id,
    discipline: 'taijutsu',
    effects: [
      {
        verb: 'empower',
        power: 10,
        boosts: ['strength', 'speed'],
        healthPerExchange: price,
        opens: { ladder: 'gates', step },
      },
    ],
    chakraCost: 8,
  };
}
const life = opener('life', 3);
const wonder = opener('wonder', 7, 30);
const death = opener('death', 8);
const tiger: CombatTechnique = {
  id: 'tiger',
  name: 'Tiger',
  discipline: 'taijutsu',
  reach: ['close', 'mid', 'far'],
  needsOpen: { ladder: 'gates', step: 7 },
  effects: [{ verb: 'break', power: 30 }],
  chakraCost: 20,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 40,
    maxChakra: 80,
    techniques: [],
    ...overrides,
  };
}

function round(): Round {
  const fighters = initialFighters({
    player: setup('guy', { techniques: [life, wonder, death, tiger] }),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const use = (t: CombatTechnique) => ({ technique: t, effect: t.effects[0] as never });
const guy = (r: Round): PlanFighter => r.fighters.find((f) => f.id === 'guy')!;

describe('the gates', () => {
  it('climbs from the third to the seventh, each opening a surge of chakra', () => {
    const third = empowerSelf(round(), guy(round()), use(life));
    expect(openStep(guy(third), 'gates')).toBe(3);
    expect(guy(third).chakra).toBeGreaterThan(40);
    expect(prepStatuses(guy(third))).toContain('Third gate open');
    const seventh = empowerSelf(third, guy(third), use(wonder));
    expect(openStep(guy(seventh), 'gates')).toBe(7);
    expect(seventh.lines.at(-1)).toMatch(/forces open the seventh gate/);
  });

  it('keeps a gate art shut until its gate is open', () => {
    const r = round();
    const card = { kind: 'jutsu' as const, technique: tiger };
    expect(playable(guy(r), card)).toBe(false);
    const third = empowerSelf(r, guy(r), use(life));
    const seventh = empowerSelf(third, guy(third), use(wonder));
    expect(playable(guy(seventh), card)).toBe(true);
  });

  it('gives out once the price wears the body down: the gates shut and they reel', () => {
    const r = round();
    const third = empowerSelf(r, guy(r), use(life));
    const seventh = empowerSelf(third, guy(third), use(wonder));
    const worn = {
      ...seventh,
      fighters: seventh.fighters.map((f) => (f.id === 'guy' ? { ...f, health: 30 } : f)),
    };
    const after = afterEmpowers(worn, 2);
    expect(guy(after).empowered).toBeUndefined();
    expect(guy(after).stunned).toBeGreaterThan(0);
    expect(guy(after).attributes).toEqual(attributes);
    expect(after.lines.join(' ')).toMatch(/gates slam shut/);
  });

  it('a default plan climbs the gates in two openings and never reaches for the last by itself', () => {
    const [g] = round().fighters;
    const close = defaultLoadout(g!, round().fighters).close.map((s) => s.card);
    expect(close).toEqual(expect.arrayContaining(['jutsu:life', 'jutsu:wonder']));
    expect(close).not.toContain('jutsu:death');
    expect(close.indexOf('jutsu:life')).toBeLessThan(close.indexOf('jutsu:wonder'));
  });
});
