import type { CombatantSetup, CombatTechnique } from '../../../contract';
import { initialFighters } from '../state';
import { identityOf, identityProblems } from './identity';

/** Identities are derived from body, kit and traits, and a setup may set them (`identity.ts`). */

const attributes: CombatantSetup['attributes'] = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 20,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const punch: CombatTechnique = {
  id: 'punch',
  name: 'Punch',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 0,
};
const veil: CombatTechnique = {
  id: 'veil',
  name: 'Veil',
  discipline: 'genjutsu',
  effects: [{ verb: 'conceal', power: 10 }],
  chakraCost: 8,
};

function fighter(extra: Partial<CombatantSetup>) {
  const setup: CombatantSetup = {
    id: 'x',
    name: 'x',
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 50,
    maxChakra: 50,
    techniques: [],
    ...extra,
  };
  const [f] = initialFighters({ player: setup, allies: [], enemies: [], canFlee: false });
  return f!;
}

describe('a fighting identity', () => {
  it('reads a brawler as aggressive and close, an illusionist as indirect', () => {
    const brawler = identityOf(fighter({ techniques: [punch], traits: ['brawler'] }));
    const trickster = identityOf(fighter({ techniques: [veil], traits: ['illusionist'] }));
    expect(brawler.range).toBe('close');
    expect(brawler.aggression).toBeGreaterThan(trickster.aggression);
    expect(trickster.deception).toBeGreaterThan(brawler.deception);
    expect(trickster.philosophy.outwit).toBeGreaterThan(brawler.philosophy.outwit);
  });

  it('reads a coward as careful', () => {
    const coward = identityOf(fighter({ techniques: [punch], traits: ['coward'] }));
    const plain = identityOf(fighter({ techniques: [punch] }));
    expect(coward.risk).toBeLessThan(plain.risk);
    expect(coward.philosophy.outlast).toBeGreaterThan(plain.philosophy.outlast);
  });

  it('keeps what a setup sets outright, and still holds together', () => {
    const f = fighter({
      techniques: [punch],
      fighting: { aggression: 0.1, philosophy: { protect: 3 } },
    });
    const set = identityOf(f);
    expect(set.aggression).toBe(0.1);
    expect(set.philosophy.protect).toBeGreaterThan(0.5);
    expect(identityProblems(f, set)).toEqual([]);
  });

  it('says when a set range is one the kit cannot attack from', () => {
    const f = fighter({ techniques: [punch], traits: ['brawler'], fighting: { range: 'far' } });
    expect(identityProblems(f, identityOf(f))).toContain("can't attack from far");
  });
});
