import { createRng } from '@/core';

import { hitsOn } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { chooseCard } from './choose';
import { cloneFollowUp } from './clones';
import { afterEmpowers } from './empower';
import { createPlanEngine } from './engine';
import { useJutsu } from './jutsu';
import { plannedPlay } from './priority';
import { react } from './react';
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
import { springTraps } from './traps';
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

const surge: CombatTechnique = {
  id: 'surge',
  name: 'Surge',
  discipline: 'taijutsu',
  effects: [
    {
      verb: 'empower',
      power: 12,
      boosts: ['strength', 'taijutsu'],
      healthPerExchange: 6,
      afterCost: { kind: 'exhaustion', days: 1 },
    },
  ],
  chakraCost: 8,
};
const shades: CombatTechnique = {
  id: 'shades',
  name: 'Shades',
  discipline: 'ninjutsu',
  effects: [{ verb: 'clone', power: 10, strikes: true }],
  chakraCost: 12,
};
const snare: CombatTechnique = {
  id: 'snare',
  name: 'Snare',
  discipline: 'fuuinjutsu',
  effects: [{ verb: 'trap', power: 12, dazes: true }],
  chakraCost: 8,
};
const sweep: CombatTechnique = {
  id: 'sweep',
  name: 'Sweep',
  discipline: 'ninjutsu',
  effects: [{ verb: 'area', power: 10 }],
  chakraCost: 6,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 80,
    maxHealth: 80,
    chakra: 60,
    maxChakra: 60,
    techniques: [surge, shades, snare, sweep],
    ...overrides,
  };
}

const NO_CARDS: Loadout = { close: [], mid: [], far: [] };

function roundOf(hero: Partial<CombatantSetup> = {}, foe: Partial<CombatantSetup> = {}): Round {
  const fighters = initialFighters({
    player: setup('hero', hero),
    allies: [],
    enemies: [setup('foe', { techniques: [], ...foe })],
    canFlee: true,
  }).map((f) => ({ ...f, loadout: NO_CARDS }));
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
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
  };
}

function cast(round: Round, t: CombatTechnique): Round {
  const actor = fighterIn(round, 'hero')!;
  return useJutsu(round, { actor, target: fighterIn(round, 'foe'), rng: createRng(1) }, t);
}

function edit(round: Round, id: string, change: Partial<PlanFighter>): Round {
  return { ...round, fighters: round.fighters.map((f) => (f.id === id ? { ...f, ...change } : f)) };
}

const hero = (round: Round) => fighterIn(round, 'hero')!;
const foe = (round: Round) => fighterIn(round, 'foe')!;

/** Runs `act` with each seed in turn until the narration matches. */
function until(wanted: RegExp, act: (seed: number) => Round): Round {
  for (let seed = 1; seed < 300; seed++) {
    const after = act(seed);
    if (after.lines.some((l) => wanted.test(l))) return after;
  }
  throw new Error(`no seed narrates ${wanted.source}`);
}

/** The log as the player reads it: the sentences, without the screen's markers. */
const said = (log: readonly string[]) => log.map((line) => splitNarration(line).text);

describe('plan & watch verbs: empower', () => {
  it('raises the boosted stats at once, takes its price each exchange, then ends', () => {
    const empowered = cast(roundOf(), surge);
    expect(hero(empowered).attributes.strength).toBeGreaterThan(10);
    expect(hero(empowered).attributes.speed).toBe(10);
    const paid = afterEmpowers(empowered, 1);
    expect(hero(paid).health).toBeLessThan(80);
    expect(paid.lines.some((l) => l.includes('The strain tells'))).toBe(true);
    const until = hero(empowered).empowered!.until;
    const over = afterEmpowers(paid, until);
    expect(hero(over).empowered).toBeUndefined();
    expect(hero(over).attributes).toEqual(attributes);
  });

  it('is not stacked, and the plan passes over it while it holds', () => {
    const empowered = cast(roundOf(), surge);
    const again = cast(empowered, surge);
    expect(hero(again).attributes).toEqual(hero(empowered).attributes);
    const planned = edit(empowered, 'hero', {
      loadout: { ...NO_CARDS, close: plainSlots(['jutsu:surge', 'strike']) },
    });
    expect(plannedPlay(hero(planned), planned).card.kind).toBe('strike');
  });

  it('leaves its after-fight cost in the outcome', () => {
    const empowered = cast(roundOf(), surge);
    const won = { ...stateOf(empowered), result: 'victory' as const };
    const outcome = createPlanEngine().outcome(encode(won));
    expect(outcome?.costs).toEqual([
      { techniqueId: 'surge', techniqueName: 'Surge', cost: { kind: 'exhaustion', days: 1 } },
    ]);
  });

  it('shows on the fight screen', () => {
    const view = createPlanEngine().view(encode(stateOf(cast(roundOf(), surge))));
    expect(view.combatants.find((c) => c.id === 'hero')?.statuses).toContain('Empowered');
  });
});

describe('plan & watch verbs: clone', () => {
  const blow = { raw: 30, what: 'strike', dodgeable: false, physical: true, kind: 'blow' } as const;
  const strikeHero = (round: Round, seed: number) =>
    react(round, { attacker: foe(round), target: hero(round), blow, rng: createRng(seed) });

  it('sets clones beside the user, as many as their reserves allow, shown as a status', () => {
    const cloned = cast(roundOf(), shades);
    expect(hero(cloned).clones?.count).toBe(2);
    const view = createPlanEngine().view(encode(stateOf(cloned)));
    expect(view.combatants.find((c) => c.id === 'hero')?.statuses).toContain('Clones ×2');
  });

  it('a clone may take a single-target hit instead of its maker, and bursts', () => {
    const cloned = cast(roundOf(), shades);
    const after = until(/strikes a clone of hero/, (seed) => strikeHero(cloned, seed));
    expect(hero(after).health).toBe(80);
    expect(hero(after).clones?.count).toBe(1);
  });

  it('an area hit bursts every clone and still reaches the maker', () => {
    const round = edit(roundOf(), 'foe', {
      clones: { techniqueId: 'shades', count: 3, skill: 10, strikes: false },
    });
    const after = until(hitsOn('foe', 'Sweep'), (seed) =>
      useJutsu(round, { actor: hero(round), target: foe(round), rng: createRng(seed) }, sweep),
    );
    expect(foe(after).clones?.count).toBe(0);
    expect(foe(after).health).toBeLessThan(80);
  });

  it('solid clones throw a weak blow of their own when their maker attacks', () => {
    const cloned = cast(roundOf(), shades);
    const after = until(hitsOn('foe', "hero's clone"), (seed) =>
      cloneFollowUp(
        cloned,
        { actor: hero(cloned), target: foe(cloned), rng: createRng(seed) },
        { kind: 'strike' },
      ),
    );
    expect(foe(after).health).toBeLessThan(80);
  });

  it('a foe who knows a clone technique makes clones on instinct', () => {
    const round = roundOf({}, { techniques: [shades] });
    const self = { ...foe(round), loadout: { ...NO_CARDS, close: plainSlots(['jutsu:shades']) } };
    const moment = { band: 'close' as const, foe: hero(round) };
    expect(chooseCard(self, moment, createRng(1))).toEqual({ kind: 'jutsu', technique: shades });
  });
});

describe('plan & watch verbs: trap', () => {
  it('is set at the distance the fight stands at, shown as a status', () => {
    const set = cast(roundOf(), snare);
    expect(hero(set).trap?.band).toBe('close');
    const view = createPlanEngine().view(encode(stateOf(set)));
    expect(view.combatants.find((c) => c.id === 'hero')?.statuses).toContain('Trap at close range');
  });

  it('springs on the first foe there from the next exchange, hurting and dazing them', () => {
    const set = cast(roundOf(), snare);
    expect(springTraps(set, 'foe', createRng(1), false)).toEqual(set);
    const next = { ...set, number: 2 };
    const sprung = until(hitsOn('foe', "hero's trap"), (seed) =>
      springTraps(next, 'foe', createRng(seed), false),
    );
    expect(foe(sprung).health).toBeLessThan(80);
    expect(foe(sprung).stunned).toBe(1);
    expect(hero(sprung).trap).toBeUndefined();
  });

  it('springs at once on a foe who moves the fight into it', () => {
    const set = { ...cast(roundOf(), snare), range: 'close' as const };
    const sprung = until(hitsOn('foe', "hero's trap"), (seed) =>
      springTraps(set, 'foe', createRng(seed), true),
    );
    expect(foe(sprung).health).toBeLessThan(80);
  });

  it('sharp eyes may spot it and step around', () => {
    const set = { ...cast(roundOf({}, { attributes: { ...attributes, perception: 40 } }), snare) };
    const next = { ...set, number: 2 };
    const spotted = until(/spots hero's trap/, (seed) =>
      springTraps(next, 'foe', createRng(seed), false),
    );
    expect(foe(spotted).health).toBe(80);
    expect(hero(spotted).trap).toBeUndefined();
  });

  it('in a fight: set in one exchange, it goes off under the foe in the next', () => {
    const round = edit(roundOf(), 'hero', {
      loadout: { ...NO_CARDS, close: plainSlots(['jutsu:snare', 'guard']) },
    });
    const rng = createRng(4);
    const first = resolveExchange(stateOf(round), rng);
    expect(said(first.log)).toContain('hero sets a trap at close range.');
    const second = resolveExchange(first, rng);
    const fresh = second.log.slice(first.log.length);
    expect(
      fresh.some((l) => hitsOn('foe', "hero's trap").test(l) || l.includes("spots hero's trap")),
    ).toBe(true);
  });
});
