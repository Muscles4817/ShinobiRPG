import { createRng } from '@/core';

import type { CombatantSetup, CombatEngine, CombatState, CombatTechnique } from '../../contract';
import { createPlanEngine } from './engine';
import { rememberedLoadout } from './memory';
import { plannedPlay } from './priority';
import {
  decode,
  encode,
  initialFighters,
  plainSlots,
  type Loadout,
  type PlanFighter,
  type PlanState,
  type Round,
  type Slot,
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

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 60,
    maxHealth: 60,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const technique = (id: string, effect: CombatTechnique['effect']): CombatTechnique => ({
  id,
  name: id,
  discipline: 'ninjutsu',
  effect,
  chakraCost: 6,
  power: 16,
});
const blast = technique('blast', 'damage');
const daze = technique('daze', 'stun');
const mend = technique('mend', 'heal');

/** A hero (with blast, daze and mend) against foes, with these mid-range slots. */
function table(mid: readonly Slot[], foes = [fighter('foe')]): PlanFighter[] {
  const [hero, ...rest] = initialFighters({
    player: fighter('hero', { techniques: [blast, daze, mend] }),
    allies: [],
    enemies: foes,
    canFlee: true,
  });
  return [{ ...hero!, loadout: { close: [], mid, far: [] } }, ...rest];
}

function roundOf(fighters: PlanFighter[], intents: Round['intents'] = {}): Round {
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents };
}

function played(fighters: PlanFighter[], intents: Round['intents'] = {}) {
  const play = plannedPlay(fighters[0]!, roundOf(fighters, intents));
  const card = play.card.kind === 'jutsu' ? play.card.technique.id : play.card.kind;
  return { card, target: play.target?.id };
}

function hurt(f: PlanFighter, health: number): PlanFighter {
  return { ...f, health };
}

describe('plan & watch priorities: order', () => {
  it('plays the first slot that is ready', () => {
    expect(played(table(plainSlots(['throw', 'jutsu:blast']))).card).toBe('throw');
    expect(played(table(plainSlots(['jutsu:blast', 'throw']))).card).toBe('blast');
  });

  it('skips a slot it cannot play and moves down the list', () => {
    const [hero, foe] = table(plainSlots(['jutsu:blast', 'throw']));
    expect(played([{ ...hero!, chakra: 2 }, foe!]).card).toBe('throw');
    expect(played([{ ...hero!, sealed: 1 }, foe!]).card).toBe('throw');
  });

  it('never plays a defence, a needless heal or a search with no one hidden', () => {
    const slots = plainSlots(['guard', 'jutsu:mend', 'search', 'dispel', 'throw']);
    expect(played(table(slots)).card).toBe('throw');
  });

  it('improvises when no slot qualifies', () => {
    expect(played(table([{ card: 'jutsu:blast', when: 'foe-dazed' }])).card).toBe('throw');
    expect(played(table(plainSlots(['guard']))).card).toBe('throw');
    expect(played(table([])).card).toBe('throw');
  });
});

describe('plan & watch priorities: conditions', () => {
  const finisher: Slot[] = [{ card: 'jutsu:blast', when: 'foe-dazed' }, { card: 'jutsu:daze' }];

  it('a finisher waits for a dazed or sealed foe', () => {
    const [hero, foe] = table(finisher);
    expect(played([hero!, foe!]).card).toBe('daze');
    expect(played([hero!, { ...foe!, stunned: 1 }]).card).toBe('blast');
    expect(played([hero!, { ...foe!, sealed: 2 }]).card).toBe('blast');
  });

  it('goes for the foe its condition is about', () => {
    const [hero, a, b] = table(finisher, [fighter('a'), fighter('b')]);
    const dazedB = { ...hurt(b!, 60), stunned: 1 };
    expect(played([hero!, hurt(a!, 10), dazedB])).toEqual({ card: 'blast', target: 'b' });
  });

  it('heals only below a third of health', () => {
    const [hero, foe] = table([{ card: 'jutsu:mend', when: 'low-health' }, { card: 'throw' }]);
    expect(played([hurt(hero!, 25), foe!]).card).toBe('throw');
    expect(played([hurt(hero!, 19), foe!]).card).toBe('mend');
  });

  it('plays a low-chakra card only when chakra is below a quarter', () => {
    const [hero, foe] = table([{ card: 'dodge' }, { card: 'step-back', when: 'low-chakra' }]);
    expect(played([hero!, foe!]).card).toBe('throw');
    expect(played([{ ...hero!, chakra: 7 }, foe!]).card).toBe('step');
  });

  it('answers a foe readying a jutsu', () => {
    const fighters = table(
      [{ card: 'jutsu:daze', when: 'foe-readying' }, { card: 'throw' }],
      [fighter('foe', { techniques: [blast] })],
    );
    expect(played(fighters, { foe: 'throw' }).card).toBe('throw');
    expect(played(fighters, { foe: 'jutsu:blast' }).card).toBe('daze');
  });

  it('searches only while a foe is hidden', () => {
    const [hero, foe] = table([{ card: 'search', when: 'foe-hidden' }, { card: 'throw' }]);
    expect(played([hero!, foe!]).card).toBe('throw');
    expect(played([hero!, { ...foe!, hidden: true }]).card).toBe('search');
  });
});

describe('plan & watch priorities: targets', () => {
  const foes = () => table([], [fighter('a'), fighter('b', { techniques: [blast] })]);

  it('aims at the weakest by default, or the strongest when told', () => {
    const [hero, a, b] = foes();
    const two = (slot: Slot) => [{ ...hero!, loadout: { ...hero!.loadout, mid: [slot] } }];
    const field = [hurt(a!, 50), hurt(b!, 20)];
    expect(played([...two({ card: 'throw' }), ...field]).target).toBe('b');
    expect(played([...two({ card: 'throw', target: 'strongest' }), ...field]).target).toBe('a');
    expect(played([...two({ card: 'throw', target: 'marked' }), ...field]).target).toBe('b');
  });

  it('aims at the foe about to attack, else the weakest', () => {
    const [hero, a, b] = foes();
    const armed = {
      ...hero!,
      loadout: { ...hero!.loadout, mid: [{ card: 'throw', target: 'threat' as const }] },
    };
    const field = [hurt(a!, 50), hurt(b!, 20)];
    expect(played([armed, ...field], { a: 'throw', b: 'step-back' }).target).toBe('a');
    expect(played([armed, ...field], {}).target).toBe('b');
  });
});

describe('plan & watch priorities: memory', () => {
  const [hero] = table([]);

  it('reads plans saved as card ids, and plans with conditions', () => {
    const old = { close: ['strike'], mid: ['jutsu:blast', 'throw'], far: [] };
    expect(rememberedLoadout(old, hero!)).toEqual({
      close: [{ card: 'strike' }],
      mid: [{ card: 'jutsu:blast' }, { card: 'throw' }],
      far: [],
    });
    const plan: Loadout = {
      close: [],
      mid: [{ card: 'jutsu:blast', when: 'foe-dazed', target: 'threat' }, { card: 'throw' }],
      far: [],
    };
    expect(rememberedLoadout(plan, hero!)).toEqual(plan);
  });

  it('drops entries it cannot read and forgets unknown conditions', () => {
    const messy = {
      close: [7, null, { card: 'strike', when: 'full-moon', target: 'nearest' }],
      mid: ['throw', { when: 'foe-dazed' }, 'throw'],
      far: [],
    };
    expect(rememberedLoadout(messy, hero!)).toEqual({
      close: [{ card: 'strike' }],
      mid: [{ card: 'throw' }],
      far: [],
    });
    expect(rememberedLoadout({ close: [], mid: 'throw', far: [] }, hero!)).toBeNull();
    expect(rememberedLoadout(3, hero!)).toBeNull();
  });
});

describe('plan & watch priorities: the engine', () => {
  const engine = createPlanEngine();
  const setup = {
    player: fighter('hero', { techniques: [blast, daze] }),
    allies: [],
    enemies: [fighter('foe')],
    canFlee: true,
  };

  function act(state: CombatState, optionId: string): CombatState {
    const next = engine.act(state, { optionId }, createRng(4));
    if (!next.ok) throw new Error(next.error);
    return next.value;
  }

  const midOf = (state: CombatState) => decode(state).fighters[0]!.loadout.mid;

  it('reorders slots and sets when and whom each plays', () => {
    const plan = { close: [], mid: ['throw', 'jutsu:blast'], far: [] };
    const start = engine.start({ ...setup, plan }, createRng(1));
    const options = engine.view(start).options;
    const blastEntry = options.find((o) => o.id === 'slot:mid:jutsu:blast');
    expect(blastEntry).toMatchObject({ rank: 1, selected: true });
    const settings = options.filter((o) => o.adjusts === 'slot:mid:jutsu:blast');
    expect(new Set(settings.map((o) => o.setting))).toEqual(new Set(['Order', 'When', 'Target']));
    const raised = act(start, 'raise:mid:jutsu:blast');
    expect(midOf(raised).map((s) => s.card)).toEqual(['jutsu:blast', 'throw']);
    const timed = act(
      act(raised, 'when:mid:foe-dazed:jutsu:blast'),
      'aim:mid:strongest:jutsu:blast',
    );
    expect(midOf(timed)[0]).toEqual({
      card: 'jutsu:blast',
      when: 'foe-dazed',
      target: 'strongest',
    });
    const chosen = engine.view(timed).options.filter((o) => o.adjusts && o.selected);
    expect(chosen.map((o) => o.label)).toContain('Foe dazed or sealed');
    const reset = act(timed, 'when:mid:always:jutsu:blast');
    expect(midOf(reset)[0]).toEqual({ card: 'jutsu:blast', target: 'strongest' });
  });

  it('offers no timing for defences, and no target for footwork', () => {
    const plan = { close: [], mid: ['dodge', 'step-in'], far: [] };
    const options = engine.view(engine.start({ ...setup, plan }, createRng(1))).options;
    const of = (id: string) => options.filter((o) => o.adjusts === `slot:mid:${id}`);
    expect(of('dodge').some((o) => o.setting === 'When')).toBe(false);
    expect(of('step-in').some((o) => o.setting === 'Target')).toBe(false);
    expect(of('step-in').some((o) => o.setting === 'When')).toBe(true);
  });

  it('hands the plan back with its conditions, for the next fight', () => {
    const begun = act(
      engine.start({ ...setup, plan: { close: [], mid: ['jutsu:blast'], far: [] } }, createRng(1)),
      'when:mid:low-chakra:jutsu:blast',
    );
    const fled = engine.act(act(begun, 'begin'), { optionId: 'flee' }, createRng(1));
    if (!fled.ok) throw new Error(fled.error);
    const plan = engine.outcome(fled.value)?.plan;
    if (plan)
      expect(rememberedLoadout(plan, decode(begun).fighters[0]!)?.mid).toEqual(midOf(begun));
  });

  it('carries on a fight saved with card ids for slots', () => {
    const state = decode(engine.start(setup, createRng(1)));
    const old = {
      ...state,
      fighters: state.fighters.map((f) => ({
        ...f,
        loadout: { close: ['strike'], mid: ['throw'], far: [] },
      })),
    };
    // A save from before slots had conditions; that old shape is what this test feeds in.
    const saved = encode(old as unknown as PlanState);
    expect(midOf(saved)).toEqual(['throw']);
    const begun = act(saved, 'begin');
    expect(midOf(begun)).toEqual([{ card: 'throw' }]);
    expect(engine.view(act(begun, 'next')).log.length).toBeGreaterThan(0);
  });

  it('plays the same fight for the same seed', () => {
    const whole = (seed: number) => {
      let state = engine.start(setup, createRng(seed));
      const rng = createRng(seed);
      for (let i = 0; i < 40 && !engine.outcome(state); i++) {
        const id = engine.view(state).options.some((o) => o.id === 'begin') ? 'begin' : 'next';
        const next: ReturnType<CombatEngine['act']> = engine.act(state, { optionId: id }, rng);
        if (!next.ok) throw new Error(next.error);
        state = next.value;
      }
      return engine.view(state).log;
    };
    expect(whole(9)).toEqual(whole(9));
  });
});
