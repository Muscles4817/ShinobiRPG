import type { CombatantSetup, CombatTechnique } from '../../contract';
import { defaultLoadout } from './defaults';
import { initialFighters, type PlanFighter } from './state';

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

function table(techniques: readonly CombatTechnique[], hero: Partial<CombatantSetup> = {}) {
  const setup = (id: string, own: readonly CombatTechnique[]): CombatantSetup => ({
    id,
    name: id,
    attributes,
    health: 50,
    maxHealth: 50,
    chakra: 30,
    maxChakra: 30,
    techniques: own,
  });
  return initialFighters({
    player: { ...setup('hero', techniques), ...hero },
    allies: [],
    enemies: [{ ...setup('foe', []), traits: ['illusionist'] }],
    canFlee: true,
  });
}

function hero(techniques: readonly CombatTechnique[]): PlanFighter {
  return table(techniques)[0]!;
}

const bolt = (id: string, power: number): CombatTechnique => ({
  id,
  name: id,
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power }],
  chakraCost: 6,
});

const cards = (f: PlanFighter, band: 'close' | 'mid' | 'far') =>
  defaultLoadout(f)[band].map((s) => s.card);

describe('plan & watch default plan: plain blows', () => {
  it('fills in with a plain throw when only one jutsu reaches', () => {
    expect(cards(hero([bolt('bolt', 14)]), 'mid')).toContain('throw');
  });

  it('slots a second jutsu instead of a plain throw', () => {
    const mid = cards(hero([bolt('bolt', 14), bolt('spark', 10)]), 'mid');
    expect(mid).toEqual(expect.arrayContaining(['jutsu:bolt', 'jutsu:spark']));
    expect(mid).not.toContain('throw');
  });
});

describe('plan & watch default plan: finding hidden foes', () => {
  it('brings a Search against an illusionist, unless insight already sees them', () => {
    const plain = table([bolt('bolt', 14)]);
    expect(defaultLoadout(plain[0]!, plain).mid.map((s) => s.card)).toContain('search');
    const eyes = table([bolt('bolt', 14)], { perks: ['insight'] });
    expect(defaultLoadout(eyes[0]!, eyes).mid.map((s) => s.card)).not.toContain('search');
  });
});
