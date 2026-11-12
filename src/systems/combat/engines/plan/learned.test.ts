import type { CombatantSetup, CombatTechnique } from '../../contract';
import { splitNarration } from '../../rules/narration';
import { adaptLines, learnedLine } from './learned';
import { initialFighters, type PlanFighter, type PlanState } from './state';

/** What a foe has learned of you, said where you can use it (audit P1.4). */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 16,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const kick: CombatTechnique = {
  id: 'kick',
  name: 'Gale Kick',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 0,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
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

function fight(foe: Partial<CombatantSetup> = {}, overrides: Partial<PlanState> = {}): PlanState {
  const fighters = initialFighters({
    player: setup('hero', { techniques: [kick] }),
    allies: [],
    enemies: [setup('Goro', foe)],
    canFlee: false,
  }).map((f): PlanFighter => (f.isPlayer ? { ...f, uses: { kick: 5 } } : f));
  return {
    phase: 'loadout',
    round: 5,
    bout: 2,
    exchange: 0,
    fighters,
    range: 'close',
    seen: {},
    intents: {},
    log: [],
    result: null,
    canFlee: false,
    ...overrides,
  };
}

const foeOf = (s: PlanState) => s.fighters.find((f) => f.id === 'Goro')!;

describe('what a foe has learned of you', () => {
  it('the defences it has seen you keep, and a move a sharp mind reads from use', () => {
    const reads = { hero: { defences: { close: 'guard' as const }, attacks: {} } };
    const state = fight({}, { reads });
    expect(learnedLine(state, foeOf(state))).toBe(
      'Has seen your Guard up close. Has your Gale Kick read.',
    );
  });

  it('a dull mind reads no move from use; nothing seen, nothing said', () => {
    const dull = fight({ attributes: { ...attributes, intellect: 3 } });
    expect(learnedLine(dull, foeOf(dull))).toBeUndefined();
  });
});

describe('a foe changing its defence between rounds', () => {
  const was = (s: PlanState) => foeOf(s);
  const now = (s: PlanState): PlanFighter => ({
    ...foeOf(s),
    reactions: { close: 'dodge', mid: null, far: null },
  });

  it('says what changed to eyes as sharp as its own', () => {
    const s = fight();
    const hero = s.fighters.find((f) => f.isPlayer)!;
    const before = { ...was(s), reactions: { close: 'guard', mid: null, far: null } };
    const [line] = adaptLines([before], [now(s)], hero);
    expect(splitNarration(line!).text).toBe(
      'Goro has seen enough of you, and keeps a Dodge ready up close now.',
    );
  });

  it('only that it changed, to duller eyes', () => {
    const s = fight({ attributes: { ...attributes, perception: 20 } });
    const hero = s.fighters.find((f) => f.isPlayer)!;
    const before = { ...was(s), reactions: { close: 'guard', mid: null, far: null } };
    expect(adaptLines([before], [now(s)], hero)[0]).toMatch(/shifts their stance/);
  });
});
