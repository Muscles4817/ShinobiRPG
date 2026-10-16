import type { CombatAttributes, CombatTechnique } from '../contract';
import type { CombatGear } from '../gearContract';
import { bladeInHand, counterSkill, handsFull, reachLead, REACH_LEAD } from './blades';
import { counterChance } from './defence';

const BASE: CombatAttributes = {
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

const slash: CombatTechnique = {
  id: 'slash',
  name: 'Slash',
  discipline: 'kenjutsu',
  needs: { weapon: 'blade' },
  chakraCost: 4,
  effects: [{ verb: 'damage', power: 10 }],
};

const blade: CombatGear = { held: { name: 'Tanto', shape: 'blade', rank: 'D' } };

interface Fighter {
  readonly attributes: CombatAttributes;
  readonly gear?: CombatGear;
  readonly techniques: readonly CombatTechnique[];
}

function fighter(over: Partial<CombatAttributes> = {}, kit: Partial<Fighter> = {}): Fighter {
  return { attributes: { ...BASE, ...over }, techniques: [], ...kit };
}

const swordsman = fighter({ kenjutsu: 15 }, { gear: blade });

describe('a blade in hand', () => {
  it('is the one equipped, or for a foe without known gear, a blade art they know', () => {
    expect(bladeInHand(swordsman)).toBe(true);
    expect(bladeInHand(fighter({}, { gear: {} }))).toBe(false);
    expect(bladeInHand(fighter({}, { techniques: [slash] }))).toBe(true);
    expect(bladeInHand(fighter({}, { gear: {}, techniques: [slash] }))).toBe(false);
  });
});

describe('reach', () => {
  it('a drawn blade acts first up close, and only up close', () => {
    expect(reachLead(swordsman, [fighter()], 'close')).toBe(REACH_LEAD);
    expect(reachLead(swordsman, [fighter()], 'mid')).toBe(0);
    expect(reachLead(fighter(), [swordsman], 'close')).toBe(0);
  });

  it('is taken away by hands well clear of the blade, or by a better blade', () => {
    expect(reachLead(swordsman, [fighter({ taijutsu: 20 })], 'close')).toBe(0);
    expect(reachLead(swordsman, [fighter({ taijutsu: 16 })], 'close')).toBe(REACH_LEAD);
    const master = fighter({ kenjutsu: 20 }, { gear: blade });
    expect(reachLead(swordsman, [master], 'close')).toBe(0);
    expect(reachLead(master, [swordsman], 'close')).toBe(REACH_LEAD);
  });
});

describe('a swing is a commitment', () => {
  it('a cut by an unskilled hand is countered more readily than a skilled one', () => {
    const answer = counterSkill(fighter());
    expect(counterChance({ attack: 5, answer })).toBeGreaterThan(
      counterChance({ attack: 15, answer }),
    );
  });

  it('a blade in hand answers with kenjutsu where it is the better skill', () => {
    expect(counterSkill(swordsman)).toBe(15);
    expect(counterSkill(fighter({ kenjutsu: 15 }))).toBe(10);
  });
});

describe('hands full', () => {
  it('signs around a drawn blade, short of far, are made with hands full', () => {
    expect(handsFull(swordsman, 'ninjutsu', 'close')).toBe(true);
    expect(handsFull(swordsman, 'genjutsu', 'mid')).toBe(true);
    expect(handsFull(swordsman, 'ninjutsu', 'far')).toBe(false);
    expect(handsFull(swordsman, 'kenjutsu', 'close')).toBe(false);
    expect(handsFull(fighter(), 'ninjutsu', 'close')).toBe(false);
  });
});
