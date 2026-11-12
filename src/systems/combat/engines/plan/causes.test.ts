import type { CombatantSetup } from '../../contract';
import { splitNarration } from '../../rules/narration';
import type { Incoming } from './avoid';
import { holdCause, slipCause, slipCauseBeside, stepCause, withCause } from './causes';
import { initialFighters, type PlanFighter, type Round } from './state';

/** Why an attack was slipped, a hold didn't take or a step failed (audit P1.1). */

const attributes = {
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

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

function round(hero: Partial<CombatantSetup> = {}, foe: Partial<CombatantSetup> = {}): Round {
  const fighters = initialFighters({
    player: setup('hero', hero),
    allies: [],
    enemies: [setup('foe', foe)],
    canFlee: false,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const of = (r: Round, id: string): PlanFighter => r.fighters.find((f) => f.id === id)!;

function blow(r: Round, overrides: Partial<Incoming> = {}): Incoming {
  return { form: 'blow', attacker: of(r, 'foe'), target: of(r, 'hero'), skill: 10, ...overrides };
}

describe('why an attack was slipped', () => {
  it('names the plainest reason first', () => {
    const r = round({ perks: ['foresight'] });
    expect(slipCause(r, blow(r))).toBe('foresaw');
    const plain = round();
    expect(slipCause(plain, blow(plain, { familiar: 1.3 }))).toBe('familiar');
    expect(slipCause(plain, blow(plain, { accuracy: 'wild' }))).toBe('wild');
  });

  it('a body quicker than the attack, else a read, else luck', () => {
    const quick = round({ attributes: { ...attributes, speed: 30, perception: 30 } });
    expect(slipCause(quick, blow(quick))).toBe('quicker');
    const reader = round({ attributes: { ...attributes, perception: 30, intellect: 30 } });
    const tech = (r: Round) => blow(r, { form: 'technique', skill: 30 });
    expect(slipCause(reader, tech(reader))).toBe('read-it');
    const dull = round({ attributes: { ...attributes, perception: 2, intellect: 2 } });
    expect(slipCause(dull, tech(dull))).toBe('slipped');
  });

  it('a ready Dodge is left to the Dodged stamp', () => {
    expect(slipCauseBeside('dodge-ready', true)).toBeNull();
    expect(slipCauseBeside('dodge-ready', false)).toBe('dodge-ready');
  });
});

describe('holds and steps', () => {
  it('a Brace, or the target’s own resist', () => {
    expect(holdCause(true)).toBe('braced');
    expect(holdCause(false)).toBe('resisted');
  });

  it('a quicker foe outpaces a step; an even one cuts it off', () => {
    const r = round({}, { attributes: { ...attributes, speed: 20 } });
    expect(stepCause(of(r, 'hero'), of(r, 'foe'))).toBe('outpaced');
    expect(stepCause(of(r, 'foe'), of(r, 'hero'))).toBe('cut-off');
  });

  it('rides on the line as a marker the screen reads back', () => {
    expect(splitNarration(withCause('They slip it.', 'read-it'))).toMatchObject({
      text: 'They slip it.',
      cause: 'read-it',
    });
    expect(withCause('They slip it.', null)).toBe('They slip it.');
  });
});
