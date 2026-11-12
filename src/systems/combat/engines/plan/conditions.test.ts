import type { CombatantSetup, CombatTechnique } from '../../contract';
import { FEW_TECHNIQUES, offeredConditions, whenHolds } from './conditions';
import { initialFighters, SLOT_CONDITIONS, type PlanFighter, type Round } from './state';

/** When a slot may play: one registry, offered as the kit calls for (audit P2.2). */

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

const tech = (id: string, verb: 'damage' | 'pin' | 'conceal' | 'clone'): CombatTechnique => ({
  id,
  name: id,
  discipline: 'ninjutsu',
  effects: [{ verb, power: 10 }],
  chakraCost: 5,
});

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

function round(change: (f: PlanFighter) => PlanFighter = (f) => f): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [setup('mate')],
    enemies: [setup('foe')],
    canFlee: false,
  }).map(change);
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const hero = (r: Round) => r.fighters.find((f) => f.isPlayer)!;

describe('conditions', () => {
  it('a foe held, or open, gives the slot that foe to aim at', () => {
    const pinned = round((f) => (f.id === 'foe' ? { ...f, pinned: 2 } : f));
    expect(whenHolds(hero(pinned), pinned, { when: 'foe-held' })?.map((f) => f.id)).toEqual([
      'foe',
    ]);
    expect(whenHolds(hero(pinned), pinned, { when: 'foe-open' })?.map((f) => f.id)).toEqual([
      'foe',
    ]);
    const free = round();
    expect(whenHolds(hero(free), free, { when: 'foe-held' })).toBeNull();
  });

  it('a teammate held, the first exchange, and being hidden hold of you and your side', () => {
    const mateHeld = round((f) => (f.id === 'mate' ? { ...f, pinned: 2 } : f));
    expect(whenHolds(hero(mateHeld), mateHeld, { when: 'ally-held' })).not.toBeNull();
    const opening = { ...round(), opening: true };
    expect(whenHolds(hero(opening), opening, { when: 'first-exchange' })).not.toBeNull();
    expect(whenHolds(hero(round()), round(), { when: 'self-hidden' })).toBeNull();
  });
});

describe('offering conditions', () => {
  const kit = (techniques: CombatTechnique[], team = false) => ({
    self: { ...hero(round()), techniques },
    team,
  });

  it('a kit of a few techniques sees only the plainest', () => {
    const few = Array.from({ length: FEW_TECHNIQUES }, (_, i) => tech(`t${i}`, 'damage'));
    expect(offeredConditions(SLOT_CONDITIONS, kit(few))).toEqual([
      'foe-dazed',
      'foe-readying',
      'low-health',
    ]);
  });

  it('a bigger kit sees what it can use: holds for a binder, clones for a cloner', () => {
    const base = [tech('a', 'damage'), tech('b', 'damage'), tech('c', 'damage')];
    const binder = offeredConditions(SLOT_CONDITIONS, kit([...base, tech('bind', 'pin')]));
    expect(binder).toContain('foe-held');
    expect(binder).not.toContain('bodies-out');
    const cloner = offeredConditions(SLOT_CONDITIONS, kit([...base, tech('copy', 'clone')], true));
    expect(cloner).toContain('bodies-out');
    expect(cloner).toContain('ally-held');
    expect(cloner).not.toContain('foe-held');
  });
});
