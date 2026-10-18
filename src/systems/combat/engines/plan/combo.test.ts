import { createRng, type Rng } from '@/core';

import { castsLine } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { FINISHER_BONUS } from '../../rules/team';
import { createPlanEngine } from './engine';
import { useJutsu } from './jutsu';
import { plannedPlay } from './priority';
import { resolveExchange } from './round';
import { decode, initialFighters, type PlanFighter, type Round } from './state';
import { splitNarration } from '../../rules/narration';

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

function jutsu(id: string, extra: Partial<CombatTechnique> = {}): CombatTechnique {
  return {
    id,
    name: id[0]!.toUpperCase() + id.slice(1),
    discipline: 'ninjutsu',
    effects: [{ verb: 'damage', power: 12 }],
    chakraCost: 5,
    ...extra,
  };
}

const gust = jutsu('gust', { element: 'wind' });
const flame = jutsu('flame', { element: 'fire' });
const stone = jutsu('stone', { element: 'earth' });
const snare = jutsu('snare', { combo: { partnerTechniqueId: 'fall' } });
const fall = jutsu('fall', { combo: { partnerTechniqueId: 'snare' } });

/** No one sees anything coming or dodges, and every roll is the middle one. */
const steady: Rng = { ...createRng(1), next: () => 0.5, chance: () => false };

function roundWith(hero: Partial<CombatantSetup>, kiba: Partial<CombatantSetup>): Round {
  const fighters = initialFighters({
    player: fighter('hero', hero),
    allies: [fighter('kiba', kiba)],
    enemies: [fighter('bandit')],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
}

function who(round: Round, id: string): PlanFighter {
  const found = round.fighters.find((f) => f.id === id);
  if (!found) throw new Error(`no ${id}`);
  return found;
}

function cast(round: Round, by: string, t: CombatTechnique): Round {
  return useJutsu(round, { actor: who(round, by), target: who(round, 'bandit'), rng: steady }, t);
}

const lost = (before: Round, after: Round) =>
  who(before, 'bandit').health - who(after, 'bandit').health;

/** The log as the player reads it: the sentences, without the screen's markers. */
const said = (log: readonly string[]) => log.map((line) => splitNarration(line).text);

describe('plan & watch combos: elements', () => {
  it('wind then fire on one foe in one exchange: the fire lands harder', () => {
    const start = roundWith({ techniques: [gust] }, { techniques: [flame] });
    const alone = cast(start, 'kiba', flame);
    const fanned = cast(start, 'hero', gust);
    const combo = cast(fanned, 'kiba', flame);
    expect(combo.lines).toContain('The wind feeds the flames.');
    expect(lost(fanned, combo)).toBeGreaterThan(lost(start, alone));
  });

  it('elements that don’t feed each other, or the same fighter twice, make no combo', () => {
    const start = roundWith({ techniques: [gust, flame] }, { techniques: [stone] });
    const twice = cast(cast(start, 'hero', gust), 'hero', flame);
    expect(twice.lines).not.toContain('The wind feeds the flames.');
    const apart = cast(cast(start, 'hero', gust), 'kiba', stone);
    expect(apart.lines.some((l) => l.includes('!') && l.includes('feeds'))).toBe(false);
  });
});

describe('plan & watch combos: set-up and payoff', () => {
  it('a dazed or sealed foe takes a finisher harder', () => {
    const start = roundWith({ techniques: [flame] }, {});
    const open = (round: Round, change: Partial<PlanFighter>): Round => ({
      ...round,
      fighters: round.fighters.map((f) => (f.id === 'bandit' ? { ...f, ...change } : f)),
    });
    const plain = lost(start, cast(start, 'hero', flame));
    const dazed = open(start, { openUntil: 2 });
    const sealed = open(start, { sealed: 2 });
    expect(lost(dazed, cast(dazed, 'hero', flame))).toBeCloseTo(plain * FINISHER_BONUS, -1);
    expect(lost(sealed, cast(sealed, 'hero', flame))).toBeGreaterThan(plain);
  });
});

describe('plan & watch combos: combination techniques', () => {
  it('plays only beside a teammate who knows the partner and is free to join', () => {
    const slots = { close: [], mid: [{ card: 'jutsu:snare' }], far: [] };
    const start = roundWith({ techniques: [snare] }, { techniques: [fall] });
    const ready = { ...who(start, 'hero'), loadout: slots };
    expect(plannedPlay(ready, start).card).toMatchObject({ kind: 'jutsu' });
    const dazed: Round = {
      ...start,
      fighters: start.fighters.map((f) => (f.id === 'kiba' ? { ...f, stunned: 1 } : f)),
    };
    expect(plannedPlay(ready, dazed).card.kind).not.toBe('jutsu');
    const alone = roundWith({ techniques: [snare] }, {});
    expect(plannedPlay({ ...who(alone, 'hero'), loadout: slots }, alone).card.kind).not.toBe(
      'jutsu',
    );
  });

  it('both halves go off together, harder, and the partner pays and gives their turn', () => {
    const start = roundWith({ techniques: [snare] }, { techniques: [fall] });
    const both = cast(start, 'hero', snare);
    expect(both.lines.join(' ')).toContain('Hero and kiba combine Snare and Fall.');
    expect(both.lines.some((l) => castsLine(l, 'kiba', 'Fall'))).toBe(true);
    expect(who(both, 'kiba').joined).toBe(true);
    expect(who(both, 'kiba').chakra).toBeLessThan(30);
    const single = cast(roundWith({ techniques: [flame] }, {}), 'hero', flame);
    expect(lost(start, both)).toBeGreaterThan(2 * lost(start, single));
  });

  it('a partner who joined loses their next turn to it', () => {
    const engine = createPlanEngine();
    const state = decode(
      engine.start(
        {
          player: fighter('hero'),
          allies: [fighter('kiba')],
          enemies: [fighter('bandit')],
          canFlee: true,
        },
        createRng(1),
      ),
    );
    const joined = {
      ...state,
      phase: 'fight' as const,
      fighters: state.fighters.map((f) => (f.id === 'kiba' ? { ...f, joined: true } : f)),
    };
    const after = resolveExchange(joined, createRng(3));
    expect(said(after.log)).toContain('Kiba gathers themself after the combination.');
    expect(after.fighters.find((f) => f.id === 'kiba')?.joined).toBe(false);
  });
});

describe('plan & watch: what each fighter used', () => {
  it('the outcome reports every fighter’s techniques and chakra spent', () => {
    const engine = createPlanEngine();
    const rng = createRng(4);
    const strong = { ...attributes, ninjutsu: 20, speed: 20 };
    const hero = fighter('hero', {
      attributes: strong,
      techniques: [flame],
      chakra: 60,
      maxChakra: 60,
    });
    let state = engine.start(
      {
        player: hero,
        allies: [],
        enemies: [fighter('bandit', { health: 20, maxHealth: 20 })],
        canFlee: false,
        plan: { close: ['jutsu:flame'], mid: ['jutsu:flame'], far: ['jutsu:flame'] },
      },
      rng,
    );
    for (let i = 0; i < 40 && !engine.outcome(state); i++) {
      const atTable = engine.view(state).options.some((o) => o.id === 'begin');
      const next = engine.act(state, { optionId: atTable ? 'begin' : 'next' }, rng);
      if (next.ok) state = next.value;
    }
    const used = engine.outcome(state)?.used;
    expect(used?.hero?.techniqueIds).toEqual(['flame']);
    expect(used?.hero?.chakraSpent).toBeGreaterThan(0);
    expect(used?.bandit).toMatchObject({ techniqueIds: [], chakraSpent: 0 });
  });

  it('counts plain strikes as blows and steps as footwork, but not kunai', () => {
    const engine = createPlanEngine();
    const rng = createRng(4);
    let state = engine.start(
      {
        player: fighter('hero', { attributes: { ...attributes, strength: 20, speed: 20 } }),
        allies: [],
        enemies: [fighter('bandit', { health: 30, maxHealth: 30 })],
        canFlee: false,
        plan: { close: ['strike'], mid: ['step-in'], far: ['step-in'] },
        opening: { range: 'far' },
      },
      rng,
    );
    for (let i = 0; i < 60 && !engine.outcome(state); i++) {
      const atTable = engine.view(state).options.some((o) => o.id === 'begin');
      const next = engine.act(state, { optionId: atTable ? 'begin' : 'next' }, rng);
      if (next.ok) state = next.value;
    }
    const hero = engine.outcome(state)?.used?.hero;
    expect(hero?.blows).toBeGreaterThan(0);
    expect(hero?.footwork).toBeGreaterThan(0);
  });
});
