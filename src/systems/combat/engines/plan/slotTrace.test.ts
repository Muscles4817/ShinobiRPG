import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { traceNote, traceTurn, withTraceNotes } from './slotTrace';
import { decode, encode, initialFighters, plainSlots, type PlanFighter, type Round } from './state';

/** The slot trace (audit P1.2): which slot played each turn, and why the ones above passed. */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 20,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const finisher: CombatTechnique = {
  id: 'finisher',
  name: 'Finisher',
  discipline: 'taijutsu',
  reach: ['close'],
  needsTarget: 'open',
  effects: [{ verb: 'damage', power: 30 }],
  chakraCost: 8,
};
const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  reach: ['far'],
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 5,
};

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

const PLAN = ['jutsu:finisher', 'jutsu:blast', 'strike'];

function round(): Round {
  const fighters = initialFighters({
    player: setup('hero', { techniques: [finisher, blast] }),
    allies: [],
    enemies: [setup('foe')],
    canFlee: false,
  }).map((f): PlanFighter =>
    f.isPlayer ? { ...f, loadout: { close: plainSlots(PLAN), mid: [], far: [] } } : f,
  );
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

describe('a turn traced', () => {
  it('names the slot that played and why each slot above it passed', () => {
    const r = round();
    const hero = r.fighters.find((f) => f.isPlayer)!;
    expect(traceTurn(hero, r, 'strike')).toEqual([
      { card: 'jutsu:finisher', verdict: 'no-target' },
      { card: 'jutsu:blast', verdict: 'out-of-reach' },
      { card: 'strike', verdict: 'played' },
    ]);
  });

  it('says when something else came first', () => {
    const r = round();
    const hero = r.fighters.find((f) => f.isPlayer)!;
    expect(traceTurn(hero, r, 'step-back').at(-1)).toEqual({
      card: 'strike',
      verdict: 'preempted',
    });
  });
});

describe('the round’s trace on the plan screen', () => {
  it('notes each slot with how it fared, and starts afresh with the next round', () => {
    const engine = createPlanEngine();
    const rng = createRng(3);
    const hero = setup('hero', { techniques: [finisher, blast] });
    const plan = { loadout: { close: plainSlots(PLAN), mid: [], far: [] } };
    let state = engine.start(
      { player: hero, allies: [], enemies: [setup('foe')], canFlee: false, plan },
      rng,
    );
    const act = (id: string) => {
      const next = engine.act(state, { optionId: id }, rng);
      if (!next.ok) throw new Error(next.error);
      state = next.value;
    };
    act('begin');
    while (decode(state).phase === 'fight' && !engine.outcome(state)) act('next');
    const trace = decode(state).slotTrace?.close;
    expect(trace?.['jutsu:finisher']?.passed).toBeDefined();
    const note = engine.view(state).options.find((o) => o.id === 'slot:close:jutsu:finisher')?.note;
    expect(note).toMatch(/^Never played\. Passed over .*no foe it could aim at/);
    act('begin');
    expect(decode(state).slotTrace).toBeUndefined();
    expect(encode(decode(state))).toBeDefined();
  });
});

describe('notes on the table', () => {
  it('a slot no turn looked at, at a distance fought at, was never reached', () => {
    const slot = (card: string) => ({
      id: `slot:close:${card}`,
      label: card,
      detail: '',
      kind: 'plan' as const,
      selected: true,
    });
    const trace = { close: { 'jutsu:blast': { played: 4 } } };
    const [played, below] = withTraceNotes([slot('jutsu:blast'), slot('search')], trace);
    expect(played?.note).toBe('Played four times.');
    expect(below?.note).toMatch(/^Never reached/);
    expect(withTraceNotes([slot('search')], undefined)[0]?.note).toBeUndefined();
  });
});

describe('the note', () => {
  it('reads in words', () => {
    expect(traceNote({ played: 3, passed: { condition: 1 } })).toBe(
      'Played three times. Passed over once: its condition didn’t hold.',
    );
    expect(traceNote({ played: 2 })).toBe('Played twice.');
    expect(traceNote(undefined)).toBeUndefined();
  });
});
