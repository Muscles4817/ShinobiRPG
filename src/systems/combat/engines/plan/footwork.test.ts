import { createRng } from '@/core';

import { castsLine, SWAPS } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { raiseField } from '../../rules/verbs';
import { cardsFor, playable, reactionsFor } from './cards';
import { createPlanEngine } from './engine';
import { moveDestination, substitutionsReady } from './footwork';
import { defaultReactions } from './readiness';
import { footworkTowards, makingFor } from './stepping';
import { useJutsu } from './jutsu';
import { react, type Blow } from './react';
import { resolveExchange } from './round';
import {
  encode,
  fighterIn,
  initialFighters,
  plainSlots,
  type Loadout,
  type PlanFighter,
  type PlanState,
  type Round,
} from './state';
import { splitNarration } from '../../rules/narration';

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

function technique(
  id: string,
  effects: CombatTechnique['effects'],
  discipline: CombatTechnique['discipline'] = 'ninjutsu',
): CombatTechnique {
  return { id, name: id, discipline, effects, chakraCost: 5 };
}

const fog = technique('fog', [{ verb: 'field', field: 'mist', power: 10 }]);
const flicker = technique('flicker', [{ verb: 'move', power: 8 }]);
const swap = technique('swap', [{ verb: 'substitute', power: 6 }]);
const punch = technique('punch', [{ verb: 'damage', power: 12 }], 'taijutsu');

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [fog, flicker, swap, punch],
    ...overrides,
  };
}

function roundOf(foe: Partial<CombatantSetup> = {}, range: Round['range'] = 'close'): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('foe', { techniques: [], ...foe })],
    canFlee: true,
  });
  return { number: 1, fighters, range, lines: [], seen: {}, intents: {} };
}

function stateOf(round: Round): PlanState {
  return {
    phase: 'fight',
    round: round.number,
    bout: 1,
    exchange: 1,
    fighters: round.fighters,
    range: round.range,
    seen: {},
    intents: {},
    log: [],
    result: null,
    canFlee: true,
    ...(round.field ? { field: round.field } : {}),
  };
}

function withCards(round: Round, id: string, cards: Loadout): Round {
  return {
    ...round,
    fighters: round.fighters.map((f) => (f.id === id ? { ...f, loadout: cards } : f)),
  };
}

const hero = (round: Round): PlanFighter => fighterIn(round, 'hero')!;
const foeOf = (round: Round): PlanFighter => fighterIn(round, 'foe')!;
const blow = (raw = 30, discipline?: Blow['discipline']): Blow => ({
  raw,
  what: 'strike',
  dodgeable: discipline !== 'genjutsu',
  physical: true,
  kind: 'blow',
  ...(discipline ? { discipline } : {}),
});

/** The log as the player reads it: the sentences, without the screen's markers. */
const said = (log: readonly string[]) => log.map((line) => splitNarration(line).text);

describe('plan & watch verbs: field', () => {
  it('raises a field over the fight that blinds the other side', () => {
    const round = roundOf();
    const after = useJutsu(
      round,
      { actor: hero(round), target: undefined, rng: createRng(1) },
      fog,
    );
    expect(after.field).toMatchObject({ id: 'mist', side: 'player' });
    expect(after.lines).toContain('A thick mist rolls across the field.');
    const view = createPlanEngine().view(encode(stateOf(after)));
    expect(view.meters).toEqual([{ id: 'field', label: 'Your mist', value: 4, max: 4 }]);
    expect(view.combatants.find((c) => c.id === 'foe')?.statuses).toContain('Blinded');
    expect(view.combatants.find((c) => c.id === 'hero')?.statuses).not.toContain('Blinded');
  });

  it('lets its side strike the blinded as if from hiding', () => {
    const round = roundOf();
    const field = raiseField({ id: 'mist', side: 'player', potency: 12 }, 1);
    const hit = (r: Round) => {
      const after = react(r, {
        attacker: hero(r),
        target: foeOf(r),
        blow: blow(),
        rng: createRng(3),
      });
      return 100 - foeOf(after).health;
    };
    expect(hit({ ...round, field })).toBeGreaterThan(hit(round));
    const sharp = roundOf({ attributes: { ...attributes, perception: 20 } });
    expect(hit({ ...sharp, field })).toBe(hit(sharp));
  });

  it('sends some of the blinded side’s attacks wide, then fades', () => {
    const foeCards: Loadout = { close: plainSlots(['strike']), mid: [], far: [] };
    const start = withCards(roundOf(), 'foe', foeCards);
    // Both can take a beating, so the fight outlasts the mist.
    const fighters = start.fighters.map((f) => ({
      ...f,
      attributes: { ...f.attributes, stamina: 80 },
    }));
    const field = raiseField({ id: 'mist', side: 'player', potency: 12 }, 1);
    const fought = [1, 2, 3, 4, 5].map((seed) => {
      let state = stateOf({ ...start, fighters, field });
      const rng = createRng(seed);
      for (let i = 0; i < 4 && !state.result; i++) state = resolveExchange(state, rng);
      return state;
    });
    const lines = fought.flatMap((s) => s.log);
    expect(
      lines.filter((l) => l.startsWith('Foe strikes at a shape in the mist')).length,
    ).toBeGreaterThan(0);
    expect(lines.some((l) => l.startsWith('Hero strikes at a shape'))).toBe(false);
    for (const state of fought) {
      expect(state.log).toContain('The mist thins and lifts.');
      expect(state.field).toBeUndefined();
    }
  });

  it('is raised once by a plan, not again while it holds', () => {
    const cards: Loadout = { close: plainSlots(['jutsu:fog', 'strike']), mid: [], far: [] };
    let state = stateOf(withCards(roundOf(), 'hero', cards));
    const rng = createRng(2);
    for (let i = 0; i < 3 && !state.result; i++) state = resolveExchange(state, rng);
    expect(said(state.log).filter((l) => castsLine(l, 'hero', 'fog'))).toHaveLength(1);
  });

  it('can be in place when the fight opens', () => {
    const engine = createPlanEngine();
    const state = engine.start(
      {
        player: setup('hero'),
        allies: [],
        enemies: [setup('foe')],
        canFlee: true,
        opening: { field: { id: 'mist', side: 'enemy', potency: 15 } },
      },
      createRng(1),
    );
    const view = engine.view(state);
    expect(view.log).toContain('A thick mist rolls across the field.');
    expect(view.meters?.[0]?.label).toBe('Their mist');
    expect(view.combatants.find((c) => c.id === 'hero')?.statuses).toContain('Blinded');
  });
});

describe('plan & watch verbs: move', () => {
  it('takes its user straight to where they fight best, uncontested', () => {
    const round = roundOf({ attributes: { ...attributes, speed: 40 } }, 'far');
    for (let seed = 1; seed < 20; seed++) {
      const turn = { actor: hero(round), target: foeOf(round), rng: createRng(seed) };
      expect(useJutsu(round, turn, flicker).range).toBe('close');
    }
  });

  it('goes to the distance it names', () => {
    const away = technique('away', [{ verb: 'move', power: 8, to: 'far' }]);
    const round = roundOf();
    const turn = { actor: hero(round), target: undefined, rng: createRng(1) };
    expect(useJutsu(round, turn, away).range).toBe('far');
  });

  it('is footwork, never slotted: the way to where you fight, and not played once there', () => {
    const round = roundOf({}, 'far');
    const flickering = hero(round);
    expect(
      cardsFor(flickering, 'far').some((c) => c.kind === 'jutsu' && c.technique === flicker),
    ).toBe(false);
    const home = moveDestination(flickering, flicker)!;
    expect(footworkTowards(flickering, 'far', home)).toEqual({
      kind: 'jutsu',
      technique: flicker,
    });
    expect(makingFor({ ...flickering, keepAt: home }, home)).toBeNull();
  });
});

describe('plan & watch verbs: substitute', () => {
  const ready: Loadout = { close: plainSlots(['jutsu:swap']), mid: [], far: [] };

  it('is a defence: it reacts on its own and is never played on a turn', () => {
    const round = roundOf();
    const card = reactionsFor(hero(round), 'close').find(
      (c) => c.kind === 'jutsu' && c.technique === swap,
    );
    expect(card && playable(hero(round), card)).toBe(false);
    expect(cardsFor(hero(round), 'close')).not.toContainEqual(card);
    expect(defaultReactions(hero(round)).close).toBe('jutsu:swap');
  });

  it('swaps out of the first hit each round that would land, for chakra', () => {
    const round = withCards(roundOf(), 'hero', ready);
    const hit = (r: Round) =>
      react(r, { attacker: foeOf(r), target: hero(r), blow: blow(), rng: createRng(2) });
    const first = hit(round);
    expect(hero(first).health).toBe(100);
    expect(hero(first).chakra).toBeLessThan(60);
    expect(first.lines.some((l) => SWAPS.test(l))).toBe(true);
    const second = hit({ ...first, number: 2 });
    expect(hero(second).health).toBeLessThan(100);
    const nextRound = { ...second, fighters: substitutionsReady(second.fighters) };
    expect(hero(hit(nextRound)).health).toBe(hero(second).health);
  });

  it('never swaps out of an illusion, nor without the chakra', () => {
    const round = withCards(roundOf(), 'hero', ready);
    const illusion = react(round, {
      attacker: foeOf(round),
      target: hero(round),
      blow: blow(30, 'genjutsu'),
      rng: createRng(2),
    });
    expect(hero(illusion).health).toBeLessThan(100);
    const drained = {
      ...round,
      fighters: round.fighters.map((f) => (f.isPlayer ? { ...f, chakra: 0 } : f)),
    };
    const blowLands = react(drained, {
      attacker: foeOf(drained),
      target: hero(drained),
      blow: blow(),
      rng: createRng(2),
    });
    expect(hero(blowLands).health).toBeLessThan(100);
  });
});
