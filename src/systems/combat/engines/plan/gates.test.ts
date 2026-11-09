import type { CombatantSetup, CombatTechnique } from '../../contract';
import { maxBreath } from '../../rules/breath';
import { canOpen, openStep } from '../../rules/verbs';
import { playable } from './cards';
import { defaultLoadout } from './defaults';
import { afterEmpowers, empowerSelf } from './empower';
import { climbOrder } from './climbing';
import { prepInstinct, prepStatuses } from './prep';
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

function opener(id: string, step: number): CombatTechnique {
  return {
    id,
    name: id,
    discipline: 'taijutsu',
    effects: [
      {
        verb: 'empower',
        power: 10,
        boosts: ['strength', 'speed'],
        opens: { ladder: 'gates', step },
      },
    ],
    chakraCost: 8,
  };
}
const life = opener('life', 3);
const wonder = opener('wonder', 7);
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
const withGuy = (r: Round, change: Partial<PlanFighter>): Round => ({
  ...r,
  fighters: r.fighters.map((f) => (f.id === 'guy' ? { ...f, ...change } : f)),
});

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

  it('winds its user each exchange it is open, more for a deeper gate', () => {
    const third = empowerSelf(round(), guy(round()), use(life));
    const winded = afterEmpowers(third, 2);
    const full = maxBreath(guy(third).attributes);
    expect(guy(winded).breath).toBeLessThan(full);
    const seventh = empowerSelf(third, guy(third), use(wonder));
    expect(guy(afterEmpowers(seventh, 2)).breath).toBeLessThan(guy(winded).breath ?? full);
    expect(guy(afterEmpowers(seventh, 2)).health).toBeLessThan(100);
  });

  it('gives out once the wind is gone: the gates shut, and the body is spent for the fight', () => {
    const r = round();
    const third = empowerSelf(r, guy(r), use(life));
    const out = withGuy(third, { breath: 1 });
    const after = afterEmpowers(out, 2);
    expect(guy(after).empowered).toBeUndefined();
    expect(guy(after).stunned).toBeGreaterThan(0);
    expect(guy(after).attributes.stamina).toBeLessThan(attributes.stamina);
    expect(guy(after).attributes.speed).toBe(attributes.speed);
    expect(after.lines.join(' ')).toMatch(/gates slam shut/);
    expect(canOpen(guy(after), life)).toBe(false);
  });

  it('collapses its user when the seventh gate shuts: out of the fight', () => {
    const r = round();
    const third = empowerSelf(r, guy(r), use(life));
    const seventh = empowerSelf(third, guy(third), use(wonder));
    const after = afterEmpowers(withGuy(seventh, { health: 25 }), 2);
    expect(guy(after).health).toBe(0);
    expect(guy(after).fellAt).toBe(after.number);
    expect(after.lines.join(' ')).toMatch(/body gives out under/);
  });

  it('a fighter the game plays slots no openings: the kit climbs a band at a time', () => {
    const [g] = round().fighters;
    const ai = { ...g!, isPlayer: false };
    const close = defaultLoadout(ai, round().fighters).close.map((s) => s.card);
    expect(close).toContain('jutsu:tiger');
    expect(close).not.toEqual(expect.arrayContaining(['jutsu:life']));
    expect(climbOrder(g!.techniques).map((t) => t.id)).toEqual(['life', 'wonder']);
  });

  it('the player’s plan slots the openings it would climb, never the last gate', () => {
    const [g] = round().fighters;
    const close = defaultLoadout(g!, round().fighters).close.map((s) => s.card);
    expect(close).toEqual(expect.arrayContaining(['jutsu:life', 'jutsu:wonder']));
    expect(close).not.toContain('jutsu:death');
  });

  it('climbs the next gate by instinct once the fight calls for it', () => {
    const r = round();
    const moment = { band: 'close' as const, foe: r.fighters[1], fighters: r.fighters };
    expect(prepInstinct(guy(r), [], moment)).toBeUndefined();
    const hurt = withGuy(r, { health: 40 });
    const card = prepInstinct(guy(hurt), [], { ...moment, fighters: hurt.fighters });
    expect(card?.kind === 'jutsu' && card.technique.id).toBe('life');
  });
});
