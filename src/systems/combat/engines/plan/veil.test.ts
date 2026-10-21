import { createRng } from '@/core';

import type { CombatantSetup } from '../../contract';
import { avoidCeiling, SEEING_AVOID_MAX } from '../../rules/avoidance';
import { EYE_UPKEEP } from '../../rules/veil';
import { chooseCard } from './choose';
import { kitCards } from './cards';
import { plannedPlay } from './priority';
import { initialFighters, type PlanFighter, type Round } from './state';
import { reveal, revealWorth, veilsAfter } from './veil';

/** An eye kept covered: no use until uncovered, a drain while open, and worth it against a match. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 30,
  perception: 30,
  willpower: 20,
  taijutsu: 25,
  ninjutsu: 30,
  genjutsu: 20,
  kenjutsu: 10,
  fuuinjutsu: 10,
};
const weak = {
  ...attributes,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 2,
  speed: 8,
  strength: 8,
  perception: 5,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 100,
    maxChakra: 100,
    techniques: [],
    ...overrides,
  };
}

function round(foe: Partial<CombatantSetup> = {}): Round {
  const fighters = initialFighters({
    player: setup('kakashi', { perks: ['insight'], veiled: ['foresight', 'mimicry'] }),
    allies: [],
    enemies: [setup('foe', foe)],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const eyed = (r: Round): PlanFighter => r.fighters.find((f) => f.id === 'kakashi')!;
const foeOf = (r: Round): PlanFighter => r.fighters.find((f) => f.id === 'foe')!;

describe('a veiled eye', () => {
  it('is no use until uncovered: then its perks are in play', () => {
    const r = round();
    expect(eyed(r).perks).not.toContain('foresight');
    expect(kitCards(eyed(r), 'close').some((c) => c.kind === 'reveal')).toBe(true);
    const open = reveal(r, { actor: eyed(r), target: undefined, rng: createRng(1) });
    expect(eyed(open).perks).toEqual(expect.arrayContaining(['insight', 'foresight', 'mimicry']));
    expect(kitCards(eyed(open), 'close').some((c) => c.kind === 'reveal')).toBe(false);
  });

  it('drains chakra each exchange it is open, and closes when its owner can’t pay', () => {
    const r = round();
    const open = reveal(r, { actor: eyed(r), target: undefined, rng: createRng(1) });
    const paid = veilsAfter(open);
    expect(eyed(paid).chakra).toBe(100 - EYE_UPKEEP);
    const dry = {
      ...open,
      fighters: open.fighters.map((f) => (f.id === 'kakashi' ? { ...f, chakra: 1 } : f)),
    };
    const shut = veilsAfter(dry);
    expect(eyed(shut).perks).not.toContain('foresight');
    expect(eyed(shut).veiled).toEqual(['foresight', 'mimicry']);
    expect(shut.lines.join(' ')).toMatch(/eye closes again/);
  });

  it('is uncovered against a match or an illusionist, kept covered against a foe it outclasses', () => {
    const even = round();
    expect(revealWorth(eyed(even), { foes: [foeOf(even)] })).toBe(true);
    expect(plannedPlay(eyed(even), even).card.kind).toBe('reveal');
    const moment = { band: 'close' as const, foe: foeOf(even), fighters: even.fighters };
    expect(chooseCard(eyed(even), moment, createRng(1)).kind).toBe('reveal');
    const easy = round({ attributes: weak });
    expect(revealWorth(eyed(easy), { foes: [foeOf(easy)] })).toBe(false);
    const caster = round({ attributes: { ...weak, genjutsu: 12 } });
    expect(revealWorth(eyed(caster), { foes: [foeOf(caster)] })).toBe(true);
  });

  it('sees well enough to slip more than anyone else can', () => {
    expect(avoidCeiling(false, true)).toBe(SEEING_AVOID_MAX);
    expect(avoidCeiling(false, true)).toBeGreaterThan(avoidCeiling(false));
    expect(avoidCeiling(true, true)).toBeGreaterThan(avoidCeiling(true));
  });
});
