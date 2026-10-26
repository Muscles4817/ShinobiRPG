import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { raiseField } from '../../rules/verbs';
import { intendedCard, intentLine, keepsTo } from './intent';
import {
  decode,
  encode,
  initialFighters,
  plainSlots,
  type PlanFighter,
  type PlanState,
  type Round,
} from './state';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 5,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 6,
};

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 50,
    maxHealth: 50,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const engine = createPlanEngine();
/** A hero who only guards, so nothing they do moves the fight before the foe's turn. */
const GUARD_ONLY = { close: ['guard'], mid: ['guard'], far: ['guard'] };

function start(hero: Partial<CombatantSetup> = {}, foe: Partial<CombatantSetup> = {}): PlanState {
  const setup = {
    player: fighter('hero', hero),
    allies: [],
    enemies: [fighter('bandit', foe)],
    canFlee: true,
    plan: GUARD_ONLY,
  };
  return decode(engine.start(setup, createRng(3)));
}

function step(state: PlanState, optionId: string, seed: number): PlanState {
  const next = engine.act(encode(state), { optionId }, createRng(seed));
  if (!next.ok) throw new Error(next.error);
  return decode(next.value);
}

const banditOf = (s: PlanState) => s.fighters.find((f) => f.id === 'bandit')!;
const intentOf = (s: PlanState, hero: Partial<CombatantSetup> = {}) =>
  engine
    .view(encode({ ...s, fighters: s.fighters.map((f) => (f.isPlayer ? { ...f, ...hero } : f)) }))
    .combatants.find((c) => c.id === 'bandit')?.intent;

describe('plan & watch telegraphs', () => {
  it('a foe announces its opening move at the card table, then plays it', () => {
    for (let seed = 1; seed <= 10; seed++) {
      // A hero who fights from here, so the range holds and the foe's move still fits.
      const state = start({ techniques: [blast] }, { techniques: [blast] });
      const announced = state.intents.bandit;
      expect(announced).toBeDefined();
      const fought = step(step(state, 'begin', seed), 'next', seed);
      expect(fought.seen.bandit).toEqual([announced]);
      expect(fought.intents.bandit).toBeDefined();
    }
  });

  it('shows the move on the fight screen; sharp eyes or insight name the jutsu', () => {
    const state = { ...start({}, { techniques: [blast] }), intents: { bandit: 'jutsu:blast' } };
    const dull = { attributes: { ...attributes, perception: 4 } };
    expect(intentOf(state, dull)).toBe('Readying a technique');
    expect(intentOf(state)).toBe('Readying Blast');
    expect(intentOf(state, { ...dull, perks: ['insight'] })).toMatch(
      /^Readying Blast\. Mid cards: /,
    );
  });

  it('a hidden foe gives nothing away without insight', () => {
    const base = start();
    const state = {
      ...base,
      intents: { bandit: 'strike' },
      fighters: base.fighters.map((f) => (f.isPlayer ? f : { ...f, hidden: true })),
    };
    expect(intentLine(state, banditOf(state), false)).toBeUndefined();
    expect(intentLine(state, banditOf(state), true)).toMatch(/^Coming in to strike/);
  });

  it('a move the fight has outgrown is dropped for a fresh choice', () => {
    const bandit = { ...banditOf(start({}, { techniques: [blast] })) };
    expect(intendedCard(bandit, { bandit: 'strike' }, 'close')).toEqual({ kind: 'strike' });
    expect(intendedCard(bandit, { bandit: 'strike' }, 'far')).toBeUndefined();
    expect(intendedCard({ ...bandit, chakra: 0 }, { bandit: 'jutsu:blast' }, 'mid')).toBe(
      undefined,
    );
  });

  it('a fight saved before telegraphs resumes and starts announcing', () => {
    const { intents: _intents, ...old } = start();
    const saved = { engineId: 'plan-v1', data: old };
    expect(engine.view(saved).combatants).toHaveLength(2);
    const next = engine.act(saved, { optionId: 'begin' }, createRng(1));
    if (!next.ok) throw new Error(next.error);
    const fought = engine.act(next.value, { optionId: 'next' }, createRng(1));
    if (!fought.ok) throw new Error(fought.error);
    expect(decode(fought.value).intents.bandit).toBeDefined();
  });
});

describe('keeping to what was announced', () => {
  const fog: CombatTechnique = {
    id: 'fog',
    name: 'Fog',
    discipline: 'ninjutsu',
    effects: [{ verb: 'field', field: 'mist', power: 10 }],
    chakraCost: 6,
  };
  const card = (technique: CombatTechnique) => ({ kind: 'jutsu', technique }) as const;

  /** A foe with fog and a blast slotted at mid, and the mist (if any) on `side`. */
  function moment(intellect: number, side?: 'player' | 'enemy'): [PlanFighter, Round] {
    const fighters = initialFighters({
      player: fighter('hero'),
      allies: [],
      enemies: [
        fighter('bandit', { attributes: { ...attributes, intellect }, techniques: [fog, blast] }),
      ],
      canFlee: true,
    }).map((f) =>
      f.id === 'bandit'
        ? { ...f, loadout: { close: [], mid: plainSlots(['jutsu:fog', 'jutsu:blast']), far: [] } }
        : f,
    );
    const mist = side ? { field: raiseField({ id: 'mist', side, potency: 10, power: 10 }, 1) } : {};
    const round: Round = {
      number: 1,
      fighters,
      range: 'mid',
      lines: [],
      seen: {},
      intents: {},
      ...mist,
    };
    return [fighters.find((f) => f.id === 'bandit')!, round];
  }

  it('plays an attack it announced', () => {
    const [foe, round] = moment(30);
    expect(keepsTo(foe, card(blast), round)).toBe(true);
  });

  it('thinks again when its own mist is already up', () => {
    const [foe, round] = moment(30, 'enemy');
    expect(keepsTo(foe, card(fog), round)).toBe(false);
  });

  it('a mind that reads the fight takes back a field the other side has just taken', () => {
    const [sharp, taken] = moment(30, 'player');
    expect(keepsTo(sharp, card(blast), taken)).toBe(false);
    expect(keepsTo(sharp, card(fog), taken)).toBe(true);
    const [dull, alsoTaken] = moment(2, 'player');
    expect(keepsTo(dull, card(blast), alsoTaken)).toBe(true);
  });
});
