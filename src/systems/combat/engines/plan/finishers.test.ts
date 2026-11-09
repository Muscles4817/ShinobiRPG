import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { chooseCard } from './choose';
import { plannedPlay } from './priority';
import { initialFighters, plainSlots, type Loadout, type PlanFighter, type Round } from './state';

/** A finisher that needs an opening waits for an open foe, and goes for one. */

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

const peacock: CombatTechnique = {
  id: 'peacock',
  name: 'Peacock',
  discipline: 'taijutsu',
  reach: ['close'],
  needsTarget: 'open',
  effects: [{ verb: 'damage', power: 30, hits: 5 }],
  chakraCost: 10,
};

const NO_CARDS: Loadout = { close: [], mid: [], far: [] };

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

function round(dazed: readonly string[] = []): Round {
  const fighters = initialFighters({
    player: setup('guy', { techniques: [peacock] }),
    allies: [],
    enemies: [setup('foe1'), setup('foe2')],
    canFlee: true,
  }).map((f): PlanFighter => {
    const loadout = { ...NO_CARDS, close: plainSlots(['jutsu:peacock', 'strike']) };
    const withPlan = f.id === 'guy' ? { ...f, loadout } : f;
    return dazed.includes(f.id) ? { ...withPlan, stunned: 1 } : withPlan;
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const guy = (r: Round) => r.fighters.find((f) => f.id === 'guy')!;
const isPeacock = (card: { kind: string; technique?: { id: string } }) =>
  card.kind === 'jutsu' && card.technique?.id === 'peacock';

describe('finishers that need an opening', () => {
  it('a plan passes over the finisher while every foe stands ready', () => {
    const r = round();
    expect(isPeacock(plannedPlay(guy(r), r).card)).toBe(false);
  });

  it('a plan plays it on the foe who is open, not the one standing ready', () => {
    const r = round(['foe2']);
    const play = plannedPlay(guy(r), r);
    expect(isPeacock(play.card)).toBe(true);
    expect(play.target?.id).toBe('foe2');
  });

  it('instinct holds it back until someone is open', () => {
    const calm = round();
    const moment = { band: 'close' as const, foe: calm.fighters[1], fighters: calm.fighters };
    expect(isPeacock(chooseCard(guy(calm), moment, createRng(1)))).toBe(false);
    const open = round(['foe1']);
    const now = { band: 'close' as const, foe: open.fighters[1], fighters: open.fighters };
    expect(isPeacock(chooseCard(guy(open), now, createRng(1)))).toBe(true);
  });
});
