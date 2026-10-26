import type { CombatantSetup, CombatTechnique } from '../../contract';
import { splitNarration } from '../../rules/narration';
import { plannedPlay } from './priority';
import { staged } from './staging';
import { initialFighters, plainSlots, type PlanFighter, type Round } from './state';

/** The player's plan is theirs: a turn that played something they never slotted says why. */

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

const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  reach: ['close', 'mid', 'far'],
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 4,
};

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [bolt],
    ...over,
  };
}

function round(hero: Partial<PlanFighter>, foe: Partial<PlanFighter> = {}): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  }).map((f) => (f.id === 'hero' ? { ...f, ...hero } : { ...f, ...foe }));
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const hero = (r: Round) => r.fighters.find((f) => f.id === 'hero')!;
const empty = { close: [], mid: [], far: [] };

describe('a turn off the player’s plan', () => {
  it('a slotted play is the plan’s own', () => {
    const r = round({ loadout: { close: plainSlots(['jutsu:bolt']), mid: [], far: [] } });
    expect(plannedPlay(hero(r), r).offPlan).toBeUndefined();
  });

  it('with nothing slotted that fits, the blow is improvised', () => {
    const r = round({ loadout: empty });
    expect(plannedPlay(hero(r), r).offPlan).toBe('improvised');
  });

  it('with no one in sight and someone hidden, the look around is off the plan too', () => {
    const r = round({ loadout: empty }, { hidden: true });
    expect(plannedPlay(hero(r), r).offPlan).toBe('looking');
  });

  it('the screen is told on the turn’s first line, and only then', () => {
    const before = round({ loadout: empty });
    const after = { ...before, lines: ['You swing.', 'It lands.'], offPlan: 'improvised' as const };
    const [first, second] = staged(before, after, 'hero').lines.map(splitNarration);
    expect(first?.offPlan).toBe('improvised');
    expect(second?.offPlan).toBeUndefined();
    expect(staged(before, after, 'hero')).not.toHaveProperty('offPlan');
  });
});
