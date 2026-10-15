import { createRng } from '@/core';

import type { CombatantSetup, CombatEngine, CombatState, CombatTechnique } from '../../contract';
import { cardsFor, reactionsFor, slotLimit, type Card } from './cards';
import { defaultLoadout, defaultReadiness } from './defaults';
import { chooseCard } from './choose';
import { createPlanEngine, ROUND_EXCHANGES } from './engine';
import { plannedPlay } from './priority';
import { decode, encode, initialFighters, plainSlots, type PlanFighter, type Round } from './state';

const PROMPT =
  'Round 1: pick up to 2 actions for each distance, higher first, and the defence you keep ready there.';

/** An exchange about to be played at a distance, for asking what a fighter plays. */
function roundAt(fighters: PlanFighter[], range: Round['range']): Round {
  return { number: 1, fighters, range, lines: [], seen: {}, intents: {} };
}

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
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const daze: CombatTechnique = {
  id: 'daze',
  name: 'Daze',
  discipline: 'genjutsu',
  effects: [{ verb: 'daze', power: 12 }],
  chakraCost: 4,
};
const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 6,
};

function bodies(player = fighter('hero', { techniques: [daze, blast] })): PlanFighter[] {
  return initialFighters({ player, allies: [], enemies: [fighter('bandit')], canFlee: true });
}

function act(engine: CombatEngine, state: CombatState, optionId: string, seed = 2): CombatState {
  const next = engine.act(state, { optionId }, createRng(seed));
  if (!next.ok) throw new Error(next.error);
  return next.value;
}

describe('plan & watch cards', () => {
  it('each distance offers the actions that reach it; defences are chosen apart', () => {
    const [hero] = bodies();
    const ids = (cards: readonly Card[]) =>
      cards.map((c) => (c.kind === 'jutsu' ? c.technique.id : c.kind));
    expect(ids(cardsFor(hero!, 'close'))).toEqual(['search', 'dispel', 'daze']);
    expect(ids(cardsFor(hero!, 'far'))).toEqual(['search', 'dispel', 'daze', 'blast']);
    expect(ids(reactionsFor(hero!, 'close'))).toEqual(['guard', 'dodge', 'counter']);
    expect(ids(reactionsFor(hero!, 'far'))).toEqual(['guard', 'dodge']);
  });

  it('a sharper mind holds more actions: two at grade E up to five from B', () => {
    const at = (intellect: number) => slotLimit({ attributes: { ...attributes, intellect } });
    expect([at(5), at(8), at(13), at(20), at(40)]).toEqual([2, 3, 4, 5, 5]);
  });

  it('the default plan walks a brawler in and keeps a jutsu user at range', () => {
    const [brawler, bandit] = bodies(fighter('hero', { traits: ['brawler'] }));
    const walking = { ...brawler!, ...defaultReadiness(brawler!) };
    expect(walking.keepAt).toBe('close');
    expect(plannedPlay(walking, roundAt([walking, bandit!], 'far')).card).toEqual({
      kind: 'step',
      direction: 'in',
    });
    const [caster, foe] = bodies();
    const plan = defaultLoadout(caster!);
    // Two actions at grade E: the best attack leads and the daze follows it.
    expect(plan.mid).toEqual([
      { card: 'jutsu:blast' },
      { card: 'jutsu:daze', when: 'foe-readying' },
    ]);
    const ready = { ...caster!, loadout: plan, ...defaultReadiness(caster!) };
    expect(ready.keepAt).toBeUndefined();
    expect(plannedPlay(ready, roundAt([ready, foe!], 'close')).card).toEqual({
      kind: 'step',
      direction: 'back',
    });
  });

  it('every distance keeps a defence ready, and brings a Search against a foe that hides', () => {
    const [hero, shade] = initialFighters({
      player: fighter('hero', { techniques: [daze, blast] }),
      allies: [],
      enemies: [fighter('shade', { traits: ['illusionist'] })],
      canFlee: false,
    });
    expect(defaultReadiness(hero!).reactions).toEqual({
      close: 'guard',
      mid: 'guard',
      far: 'guard',
    });
    const plan = defaultLoadout(hero!, [hero!, shade!]);
    for (const band of ['close', 'mid', 'far'] as const) {
      expect(plan[band][0]).toEqual({ card: 'search', when: 'foe-hidden' });
    }
  });

  it('a plain fighter closes in for full blows, and heals only when badly hurt', () => {
    const [plain] = bodies(fighter('hero'));
    expect(defaultLoadout(plain!).far).toEqual([]);
    expect(defaultReadiness(plain!).keepAt).toBe('close');
    const mend: CombatTechnique = {
      ...blast,
      id: 'mend',
      name: 'Mend',
      effects: [{ verb: 'heal', power: 16 }],
    };
    const [healer] = bodies(fighter('hero', { techniques: [mend] }));
    expect(defaultLoadout(healer!).close[0]).toEqual({ card: 'jutsu:mend', when: 'low-health' });
  });

  it('dazes a fresh foe and punishes a dazed one', () => {
    const [hero, bandit] = bodies();
    const slotted = {
      ...hero!,
      loadout: { close: [], mid: plainSlots(['jutsu:daze', 'jutsu:blast']), far: [] },
    };
    const dazed = chooseCard(
      slotted,
      { band: 'mid', foe: { ...bandit!, stunned: 1 } },
      createRng(1),
    );
    expect(dazed).toMatchObject({ kind: 'jutsu', technique: { id: 'blast' } });
  });

  it('improvises a basic blow when nothing slotted can be played', () => {
    const [hero, bandit] = bodies(fighter('hero'));
    const empty = { ...hero!, loadout: { close: [], mid: [], far: [] } };
    expect(chooseCard(empty, { band: 'close', foe: bandit }, createRng(1))).toEqual({
      kind: 'strike',
    });
  });
});

describe('plan & watch engine', () => {
  const engine = createPlanEngine();
  const start = (player = fighter('hero', { techniques: [daze, blast] })) =>
    engine.start({ player, allies: [], enemies: [fighter('bandit')], canFlee: true }, createRng(1));

  it('opens at the card table with cards grouped by distance', () => {
    const view = engine.view(start());
    expect(view.prompt).toBe(PROMPT);
    const groups = new Set(view.options.filter((o) => o.kind === 'plan').map((o) => o.group));
    expect([...groups]).toEqual(['Close', 'Mid', 'Far']);
  });

  it('cards toggle in and out, and full slots say so', () => {
    // Against a bandit with no jutsu, the plan holds no daze: slotting it fills both slots.
    const state = act(engine, start(), 'slot:mid:jutsu:daze');
    const option = (s: CombatState, id: string) => engine.view(s).options.find((o) => o.id === id);
    expect(option(state, 'slot:mid:search')?.disabledReason).toBe(
      'Slots full. Take a card out first.',
    );
    const first = decode(state).fighters[0]!.loadout.mid[0]?.card;
    const freed = act(engine, state, `slot:mid:${first}`);
    expect(option(freed, `slot:mid:${first}`)?.selected).toBe(false);
    const swapped = act(engine, freed, 'slot:mid:search');
    expect(decode(swapped).fighters[0]!.loadout.mid).toContainEqual({ card: 'search' });
  });

  it('each distance picks its defence and where you fight, without a slot', () => {
    const state = start();
    const option = (s: CombatState, id: string) => engine.view(s).options.find((o) => o.id === id);
    expect(option(state, 'ready:close:guard')?.selected).toBe(true);
    expect(option(state, 'ready:close:counter')?.setting).toBe('Defence');
    const countering = act(engine, state, 'ready:close:counter');
    expect(decode(countering).fighters[0]!.reactions?.close).toBe('counter');
    expect(option(state, 'keep:mid:any')?.selected).toBe(true);
    const ranged = act(engine, countering, 'keep:mid:far');
    expect(decode(ranged).fighters[0]!.keepAt).toBe('far');
    expect(decode(act(engine, ranged, 'keep:close:any')).fighters[0]!.keepAt).toBeUndefined();
  });

  it('a round plays out, then you can re-plan', () => {
    let state = act(engine, start(), 'begin');
    expect(engine.view(state).options.map((o) => o.id)).toEqual(['next', 'round', 'flee']);
    state = act(engine, state, 'round');
    const plan = decode(state);
    expect(plan.result ?? plan.phase).toBe('loadout');
    expect(plan.round).toBe(1 + ROUND_EXCHANGES);
    expect(Object.keys(plan.seen)).toContain('bandit');
  });

  it('shows the round the player plans by, not the exchange count', () => {
    let state = act(engine, start(), 'begin');
    state = act(engine, state, 'next');
    expect(engine.view(state).round).toBe(1);
    state = act(engine, state, 'round');
    expect(decode(state).result ?? engine.view(state).round).toBe(2);
  });

  it('a much stronger fighter wins over a few rounds', () => {
    const strong = fighter('hero', { attributes: { ...attributes, strength: 40, speed: 20 } });
    let state = start(strong);
    for (let i = 0; i < 20 && !engine.outcome(state); i++) {
      state = act(engine, act(engine, state, 'begin', i), 'round', i + 7);
    }
    expect(engine.outcome(state)?.result).toBe('victory');
  });

  it('insight shows an enemy’s cards for the current distance', () => {
    const seer = fighter('hero', { perks: ['insight'] });
    const armed = engine.start(
      {
        player: seer,
        allies: [],
        enemies: [fighter('bandit', { techniques: [blast] })],
        canFlee: true,
      },
      createRng(1),
    );
    const bandit = engine.view(armed).combatants.find((c) => c.id === 'bandit');
    expect(bandit?.intent).toMatch(/\. Mid cards: Blast/);
  });

  it('a fight saved under the old single-tactic plan resumes at the card table', () => {
    const fighters = bodies().map(({ loadout: _loadout, ...f }) => ({ ...f, guarding: false }));
    const legacy = encode({
      phase: 'fight',
      tactic: 'rush',
      round: 3,
      fighters,
      range: 'mid',
      trumpUsed: false,
      log: ['Old fight.'],
      result: null,
      canFlee: true,
    } as never);
    const view = engine.view(legacy);
    expect(view.prompt).toBe(PROMPT);
    expect(engine.act(legacy, { optionId: 'begin' }, createRng(1)).ok).toBe(true);
  });

  it('a fight saved before effect lists reads each technique as its old effect', () => {
    const state = decode(start());
    const old = { id: 'daze', name: 'Daze', discipline: 'genjutsu', effect: 'stun', power: 12 };
    const fighters = state.fighters.map((f) => ({ ...f, techniques: [{ ...old, chakraCost: 4 }] }));
    const resumed = encode({ ...state, fighters } as never);
    const hero = decode(act(engine, resumed, 'begin')).fighters.find((f) => f.id === 'hero');
    expect(hero?.techniques).toEqual([{ ...daze }]);
  });

  it('starts from the plan you had last time, cleaned up, and hands it back at the end', () => {
    const begin = (plan: unknown, player = fighter('hero', { techniques: [daze, blast] })) =>
      engine.start(
        { player, allies: [], enemies: [fighter('bandit')], canFlee: true, plan },
        createRng(1),
      );
    const broken = decode(begin({ close: ['counter'], mid: ['dodge'], far: 'nonsense' }));
    const hero = broken.fighters[0]!;
    expect(hero.loadout.close).toEqual(defaultLoadout(hero, broken.fighters).close);
    // A plan saved before readiness: its first defence at each distance becomes its reaction,
    // and plain blows and techniques no longer known drop out.
    const old = decode(
      begin({ close: ['counter', 'jutsu:gone', 'strike'], mid: ['dodge', 'jutsu:blast'], far: [] }),
    ).fighters[0]!;
    expect(old.loadout).toEqual({ close: [], mid: plainSlots(['jutsu:blast']), far: [] });
    expect(old.reactions).toEqual({ close: 'counter', mid: 'dodge', far: 'guard' });
    const plan = {
      loadout: { close: [], mid: plainSlots(['jutsu:blast']), far: [] },
      reactions: { close: 'dodge', mid: 'guard', far: 'guard' },
      keepAt: 'mid',
    };
    const kept = begin(plan);
    expect(decode(kept).fighters[0]).toMatchObject(plan);
    const fled = act(engine, kept, 'flee', 5);
    const outcome = engine.outcome(fled);
    if (outcome) expect(outcome.plan).toEqual(plan);
  });

  it('rejects state from another engine', () => {
    expect(() => engine.view({ engineId: 'other', data: {} })).toThrow();
  });
});
