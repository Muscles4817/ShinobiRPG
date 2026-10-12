import { createRng, type Rng } from '@/core';

import type { CombatantSetup, CombatSetup, CombatTechnique } from '../../contract';
import { findCard } from './cards';
import { createPlanEngine } from './engine';
import { plannedPlay } from './priority';
import { decode, encode, type PlanFighter, type PlanState, type Round } from './state';
import { intercept, stanceLoadout } from './team';

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

const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 5,
};
const glare: CombatTechnique = {
  id: 'glare',
  name: 'Glare',
  discipline: 'genjutsu',
  effects: [{ verb: 'daze', power: 8 }],
  chakraCost: 5,
};

const engine = createPlanEngine();

function setup(overrides: Partial<CombatSetup> = {}): CombatSetup {
  return {
    player: fighter('hero'),
    allies: [fighter('kiba', { techniques: [bolt, glare], orders: {} })],
    enemies: [fighter('bandit'), fighter('boss', { health: 90, maxHealth: 90 })],
    canFlee: true,
    ...overrides,
  };
}

function started(overrides: Partial<CombatSetup> = {}): PlanState {
  return decode(engine.start(setup(overrides), createRng(1)));
}

function ally(state: PlanState, id = 'kiba'): PlanFighter {
  const found = state.fighters.find((f) => f.id === id);
  if (!found) throw new Error(`no ${id}`);
  return found;
}

function choose(state: PlanState, optionId: string): PlanState {
  const next = engine.act(encode(state), { optionId }, createRng(2));
  if (!next.ok) throw new Error(next.error);
  return decode(next.value);
}

const always: Rng = { ...createRng(1), chance: () => true };

describe('plan & watch team: stances', () => {
  it('a teammate takes the stance the setup gives, else one from their kit', () => {
    const given = started({ allies: [fighter('kiba', { stance: { kind: 'hold' } })] });
    expect(ally(given).stance).toEqual({ kind: 'hold' });
    const plain = started({ allies: [fighter('kiba')] });
    expect(ally(plain).stance).toEqual({ kind: 'press' });
    const trickster = started({ allies: [fighter('kiba', { traits: ['illusionist'] })] });
    expect(ally(trickster).stance).toEqual({ kind: 'support' });
  });

  it('shapes their cards: pressing aims at the mark, covering guards, support dazes first', () => {
    const kiba = ally(started());
    const fighters = [kiba];
    const press = stanceLoadout(kiba, { kind: 'press' }, fighters);
    expect(press.mid.find((s) => s.card === 'jutsu:bolt')?.target).toBe('marked');
    const cover = stanceLoadout(kiba, { kind: 'cover', covers: 'hero' }, fighters);
    expect(cover.close.map((s) => s.card)).toContain('guard');
    const support = stanceLoadout(kiba, { kind: 'support' }, fighters);
    expect(support.mid[0]).toEqual({ card: 'jutsu:glare' });
  });

  it('a supporting teammate dazes a fresh foe, and attacks once every foe is held', () => {
    const state = started({ allies: [fighter('kiba', { techniques: [bolt, glare] })] });
    const kiba = { ...ally(state), stance: { kind: 'support' } as const };
    const support = { ...kiba, loadout: stanceLoadout(kiba, kiba.stance, state.fighters) };
    const fighters = state.fighters.map((f) => (f.id === 'kiba' ? support : f));
    const round: Round = { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
    expect(plannedPlay(support, round).card).toEqual(findCard(support, 'jutsu:glare'));
    const held = fighters.map((f) => (f.side === 'enemy' ? { ...f, stunned: 1, openUntil: 2 } : f));
    expect(plannedPlay(support, { ...round, fighters: held }).card).toEqual(
      findCard(support, 'jutsu:bolt'),
    );
  });

  it('shows each teammate’s stance on the fight screen', () => {
    const view = engine.view(engine.start(setup(), createRng(1)));
    expect(view.combatants.find((c) => c.id === 'kiba')?.statuses).toContain('Pressing');
  });
});

describe('plan & watch team: orders', () => {
  it('a teammate who takes orders gets a new stance, and the cards that go with it', () => {
    const state = started();
    const option = engine.view(encode(state)).options.find((o) => o.id === 'stance:kiba|support');
    expect(option).toMatchObject({ kind: 'order', group: 'kiba', setting: 'Stance' });
    const after = choose(state, 'stance:kiba|support');
    expect(ally(after).stance).toEqual({ kind: 'support' });
    expect(ally(after).loadout.mid[0]).toEqual({ card: 'jutsu:glare' });
    const cover = choose(state, 'stance:kiba|cover|hero');
    expect(ally(cover).stance).toEqual({ kind: 'cover', covers: 'hero' });
  });

  it('what a teammate won’t take from you is shown, disabled, saying why', () => {
    const orders = { stanceLocked: 'kiba won’t take orders yet.', cardsLocked: 'Not yet.' };
    const state = started({ allies: [fighter('kiba', { orders })] });
    const options = engine.view(encode(state)).options;
    const stances = options.filter((o) => o.setting === 'Stance');
    expect(stances.length).toBeGreaterThan(0);
    expect(stances.every((o) => o.disabledReason === orders.stanceLocked)).toBe(true);
    expect(options.find((o) => o.id === 'cards:kiba')?.disabledReason).toBe('Not yet.');
    expect(options.some((o) => o.owner === 'kiba')).toBe(false);
    expect(engine.act(encode(state), { optionId: 'stance:kiba|hold' }, createRng(1)).ok).toBe(
      false,
    );
  });

  it('a teammate who trusts you lets you set their cards', () => {
    const state = started();
    const theirs = engine.view(encode(state)).options.filter((o) => o.owner === 'kiba');
    expect(theirs.length).toBeGreaterThan(0);
    const slotted = theirs.find((o) => o.id === 'for:kiba|slot:close:strike');
    expect(slotted).toBeDefined();
    const before = ally(state).loadout.close.some((s) => s.card === 'strike');
    const after = choose(state, 'for:kiba|slot:close:strike');
    expect(ally(after).loadout.close.some((s) => s.card === 'strike')).toBe(!before);
  });
});

describe('plan & watch team: the mark', () => {
  it('is set between rounds; marked slots and pressing teammates go for it', () => {
    const marked = choose(started(), 'mark:boss');
    expect(marked.mark).toBe('boss');
    const view = engine.view(encode(marked));
    expect(view.combatants.find((c) => c.id === 'boss')?.statuses).toContain('Marked');
    const kiba = ally(marked);
    const round: Round = {
      number: 1,
      fighters: [...marked.fighters],
      range: 'mid',
      lines: [],
      seen: {},
      intents: {},
    };
    expect(plannedPlay(kiba, { ...round, mark: 'boss' }).target?.id).toBe('boss');
    expect(plannedPlay(kiba, round).target?.id).toBe('bandit');
    expect(choose(marked, 'mark:none').mark).toBeUndefined();
  });

  it('isn’t offered in a duel', () => {
    const state = started({ allies: [], enemies: [fighter('bandit')] });
    expect(engine.view(encode(state)).options.some((o) => o.id.startsWith('mark:'))).toBe(false);
  });
});

describe('plan & watch team: cover', () => {
  function covering(stance: CombatSetup['allies'][number]['stance']): Round {
    const state = started({ allies: [fighter('kiba', { ...(stance ? { stance } : {}) })] });
    return {
      number: 1,
      fighters: [...state.fighters],
      range: 'close',
      lines: [],
      seen: {},
      intents: {},
    };
  }
  const bandit = (round: Round) => round.fighters.find((f) => f.id === 'bandit')!;
  const hero = (round: Round) => round.fighters.find((f) => f.id === 'hero')!;

  it('a cover steps in front of a single attack aimed at the one they cover', () => {
    const round = covering({ kind: 'cover', covers: 'hero' });
    const turn = { actor: bandit(round), target: hero(round), rng: always };
    const aim = intercept(round, turn, { kind: 'strike' });
    expect(aim.target?.id).toBe('kiba');
    expect(aim.round.lines).toContain('kiba steps in front of you.');
  });

  it('but not for anyone else, nor for an area technique', () => {
    const pressing = covering({ kind: 'press' });
    const turn = { actor: bandit(pressing), target: hero(pressing), rng: always };
    expect(intercept(pressing, turn, { kind: 'strike' }).target?.id).toBe('hero');
    const round = covering({ kind: 'cover', covers: 'hero' });
    const wave: CombatTechnique = { ...bolt, effects: [{ verb: 'area', power: 8 }] };
    const area = intercept(
      round,
      { ...turn, actor: bandit(round) },
      { kind: 'jutsu', technique: wave },
    );
    expect(area.target?.id).toBe('hero');
  });
});
