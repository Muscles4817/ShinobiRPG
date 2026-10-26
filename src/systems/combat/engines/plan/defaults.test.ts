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

describe('plan & watch default plan: actions only', () => {
  it('slots techniques, never plain blows, footwork or defences', () => {
    const mid = cards(hero([bolt('bolt', 14), bolt('spark', 10)]), 'mid');
    expect(mid).toEqual(['jutsu:bolt', 'jutsu:spark']);
  });

  it('keeps its best attack when a small plan fills with emergencies', () => {
    const mend: CombatTechnique = { ...bolt('mend', 0), effects: [{ verb: 'heal', power: 12 }] };
    const sense: CombatTechnique = { ...bolt('sense', 0), effects: [{ verb: 'sense', power: 10 }] };
    // Two slots at intellect E: heal and sense would fill them, but the attack stays.
    const mid = cards(hero([mend, sense, bolt('bolt', 14)]), 'mid');
    expect(mid).toHaveLength(2);
    expect(mid).toContain('jutsu:bolt');
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

describe('plan & watch default plan: attacks by what they are worth', () => {
  it('leads with the art the fighter is good at, not the most power on paper', () => {
    const dread: CombatTechnique = { ...bolt('dread', 14), discipline: 'genjutsu' };
    const caster = table([bolt('breath', 18), dread], {
      attributes: { ...attributes, genjutsu: 30, ninjutsu: 3 },
    })[0]!;
    expect(cards(caster, 'mid')[0]).toBe('jutsu:dread');
  });
});
