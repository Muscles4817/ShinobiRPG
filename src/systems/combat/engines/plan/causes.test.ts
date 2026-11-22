import { told } from '@/test/fightLines';
import type { CombatantSetup } from '../../contract';
import { avoidOdds, type Incoming } from './avoid';
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
  return { number: 1, fighters, range: 'close', story: [], seen: {}, intents: {} };
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

  // Bug #16: the cause was worked out again after the roll, eyes that see it coming first, so a
  // seer slipping a blow on a ready Dodge was told as foreseen. It comes from the roll's parts.
  it('names the part of the roll that did most, not the first gift the defender has', () => {
    const seer = round({ perks: ['foresight'] });
    const dodging = {
      ...seer,
      fighters: seer.fighters.map((f) =>
        f.id === 'hero' ? { ...f, reactions: { close: 'dodge', mid: 'dodge', far: 'dodge' } } : f,
      ),
    };
    expect(slipCause(seer, blow(seer))).toBe('foresaw');
    expect(slipCause(dodging, blow(dodging))).toBe('dodge-ready');
  });

  it('a ready Dodge is left to the Dodged stamp', () => {
    expect(slipCauseBeside('dodge-ready', true)).toBeNull();
    expect(slipCauseBeside('dodge-ready', false)).toBe('dodge-ready');
  });
});

describe('why the surest slips were slipped', () => {
  const change = (r: Round, id: string, over: Partial<PlanFighter>): Round => ({
    ...r,
    fighters: r.fighters.map((f) => (f.id === id ? { ...f, ...over } : f)),
  });
  const dodging = { reactions: { close: 'dodge', mid: 'dodge', far: 'dodge' } } as const;

  // At the ceiling, taking one part away changes nothing; the cause is read before it.
  it('names a cause even when the odds are at their ceiling', () => {
    const quick = { ...attributes, speed: 40, perception: 40, intellect: 40 };
    const r = change(round({ attributes: quick }), 'hero', dodging);
    const slow = blow(r, { form: 'technique', skill: 4, accuracy: 'wild' });
    expect(avoidOdds(r, slow)).toBeCloseTo(0.75);
    expect(slipCause(r, slow)).not.toBe('slipped');
  });

  it('a swift body’s instinct, with no Dodge ready, is its quickness', () => {
    const r = round({ traits: ['swift'] });
    expect(slipCause(r, blow(r))).toBe('quicker');
  });

  it('a mind braced for an illusion was ready for it', () => {
    const r = change(round(), 'hero', { committed: 'brace' });
    const illusion = blow(r, { form: 'technique', discipline: 'genjutsu' });
    expect(slipCause(r, illusion)).toBe('ready-for-it');
  });

  it('an attacker blinded by dust couldn’t see to aim; a small body is hard to hit', () => {
    const r = change(round(), 'foe', { blinded: { blinding: 3, exchanges: 2 } });
    expect(slipCause(r, blow(r))).toBe('blinded');
    const small = round({ size: 'small' });
    expect(slipCause(small, blow(small))).toBe('small-target');
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

  it('rides on the line, with whom it is about, as the event says it', () => {
    expect(told(withCause('They slip it.', 'read-it', 'foe'))).toMatchObject({
      text: 'They slip it.',
      cause: { cause: 'read-it', kind: 'slipped', subject: 'foe' },
    });
    expect(withCause('They slip it.', null, 'foe')).toBe('They slip it.');
  });
});
