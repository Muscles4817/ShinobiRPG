import type { CombatantSetup, CombatTechnique } from '../../contract';
import { spendsReserve } from './pacing';
import { plannedPlay } from './priority';
import { initialFighters, plainSlots, type PlanFighter, type Round } from './state';
import { bestTarget, targetWorth } from './targeting';

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

const finisher: CombatTechnique = {
  id: 'finisher',
  name: 'Finisher',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 24 }],
  chakraCost: 10,
};
const jab: CombatTechnique = {
  ...finisher,
  id: 'jab',
  name: 'Jab',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 6,
};

/** The bandit against these on your side. */
function against(allies: CombatantSetup[], bandit: Partial<CombatantSetup> = {}): PlanFighter[] {
  return initialFighters({
    player: setup('hero'),
    allies,
    enemies: [setup('bandit', bandit)],
    canFlee: true,
  });
}

const find = (fighters: readonly PlanFighter[], id: string) => fighters.find((f) => f.id === id)!;

describe('targeting', () => {
  it('goes for the foe who hurts most for how soon they would fall', () => {
    const glass = setup('glass', { attributes: { ...attributes, ninjutsu: 30, stamina: 4 } });
    const wall = setup('wall', { attributes: { ...attributes, stamina: 30, taijutsu: 4 } });
    const fighters = against([glass, wall]);
    const bandit = find(fighters, 'bandit');
    expect(targetWorth(bandit, find(fighters, 'glass'))).toBeGreaterThan(
      targetWorth(bandit, find(fighters, 'wall')),
    );
    const sides = fighters.filter((f) => f.side === 'player');
    expect(bestTarget(bandit, sides)?.id).toBe('glass');
  });

  it('a hurt foe is worth more than the same foe at full health', () => {
    const fighters = against([setup('ally')]);
    const bandit = find(fighters, 'bandit');
    const ally = find(fighters, 'ally');
    expect(targetWorth(bandit, { ...ally, health: 30 })).toBeGreaterThan(targetWorth(bandit, ally));
  });

  it('your own plan without a target rule still goes for the weakest', () => {
    const glass = setup('glass', { attributes: { ...attributes, ninjutsu: 30 }, health: 100 });
    const fighters = initialFighters({
      player: setup('hero', { techniques: [jab] }),
      allies: [],
      enemies: [glass, setup('hurt', { health: 50 })],
      canFlee: true,
    }).map((f) =>
      f.isPlayer ? { ...f, loadout: { close: plainSlots(['jutsu:jab']), mid: [], far: [] } } : f,
    );
    const round: Round = { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
    expect(plannedPlay(find(fighters, 'hero'), round).target?.id).toBe('hurt');
  });
});

describe('chakra pacing', () => {
  const card = (technique: CombatTechnique) => ({ kind: 'jutsu' as const, technique });
  // Moulded with chakra: a body move spends breath and never eats into it (`rules/breath.ts`).
  const big = { ...finisher, discipline: 'ninjutsu' as const };
  const small = { ...jab, discipline: 'ninjutsu' as const };

  // With this chakra control, the jab costs 5 and the finisher 8.
  it('keeps enough chakra for the finisher', () => {
    const bandit = find(against([], { techniques: [big, small], chakra: 12 }), 'bandit');
    expect(spendsReserve(bandit, card(small))).toBe(true);
    expect(spendsReserve(bandit, card(big))).toBe(false);
    expect(spendsReserve({ ...bandit, chakra: 13 }, card(small))).toBe(false);
    expect(spendsReserve(bandit, card(jab))).toBe(false);
  });

  it('spends freely in the last ditch, with a dull mind, or as the player', () => {
    const bandit = find(against([], { techniques: [big, small], chakra: 12 }), 'bandit');
    expect(spendsReserve({ ...bandit, health: 10 }, card(small))).toBe(false);
    const dull = { ...bandit, attributes: { ...attributes, intellect: 4 } };
    expect(spendsReserve(dull, card(small))).toBe(false);
    expect(spendsReserve({ ...bandit, isPlayer: true }, card(small))).toBe(false);
  });
});
