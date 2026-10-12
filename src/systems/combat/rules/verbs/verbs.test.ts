import type { CombatAttributes, CombatTechnique } from '../../contract';
import { resistChance, bodyFrom } from '../body';
import {
  driveOf,
  effectsOf,
  hasVerb,
  isHarmful,
  landingUse,
  primaryEffect,
  resistOf,
  upgradeTechnique,
  VERB_PROFILES,
} from '.';

const attributes: CombatAttributes = {
  strength: 1,
  speed: 2,
  stamina: 3,
  chakraControl: 4,
  intellect: 5,
  perception: 6,
  willpower: 7,
  taijutsu: 8,
  ninjutsu: 9,
  genjutsu: 10,
  kenjutsu: 11,
  fuuinjutsu: 12,
};
const fighter = { attributes };

const mirage: CombatTechnique = {
  id: 'mirage',
  name: 'Mirage',
  discipline: 'genjutsu',
  effects: [{ verb: 'daze', power: 12 }],
  chakraCost: 5,
};
const crush: CombatTechnique = {
  id: 'crush',
  name: 'Crush',
  discipline: 'taijutsu',
  effects: [
    { verb: 'damage', power: 10 },
    { verb: 'daze', power: 6 },
  ],
  chakraCost: 6,
};
const mend: CombatTechnique = {
  id: 'mend',
  name: 'Mend',
  discipline: 'ninjutsu',
  effects: [{ verb: 'heal', power: 10 }],
  chakraCost: 6,
};

describe('verbs', () => {
  it('every verb has a profile, and only heal is aimed at the user', () => {
    expect(Object.entries(VERB_PROFILES).map(([verb, p]) => [verb, p.aim])).toEqual([
      ['damage', 'foe'],
      ['daze', 'foe'],
      ['seal', 'foe'],
      ['heal', 'self'],
    ]);
  });

  it('a technique is driven by its art and seen coming by the matching guard', () => {
    const daze = { technique: mirage, effect: primaryEffect(mirage) };
    expect(driveOf(fighter, daze)).toBe(attributes.genjutsu);
    expect(resistOf(fighter, daze)).toBe(attributes.willpower);
    const blow = { technique: crush, effect: primaryEffect(crush) };
    expect(driveOf(fighter, blow)).toBe(attributes.taijutsu);
    expect(resistOf(fighter, blow)).toBe(attributes.perception);
  });

  it('healing grows with ninjutsu and nothing resists it', () => {
    const heal = { technique: mend, effect: primaryEffect(mend) };
    expect(driveOf(fighter, heal)).toBe(attributes.ninjutsu);
    expect(resistOf(fighter, heal)).toBe(0);
  });

  it('a technique can override the stats that drive and resist an effect', () => {
    const effect = {
      verb: 'damage' as const,
      power: 10,
      scaling: { drive: ['strength', 'speed'] as const, resist: ['stamina'] as const },
    };
    const use = { technique: { ...crush, effects: [effect] }, effect };
    expect(driveOf(fighter, use)).toBe((attributes.strength + attributes.speed) / 2);
    expect(resistOf(fighter, use)).toBe(attributes.stamina);
  });

  it('reads which effects a technique has, and which one it lands with', () => {
    expect(hasVerb(crush, 'daze')).toBe(true);
    expect(effectsOf(crush, 'daze')).toEqual([{ verb: 'daze', power: 6 }]);
    expect(isHarmful(crush)).toBe(true);
    expect(isHarmful(mend)).toBe(false);
    expect(landingUse(mend)).toBeNull();
    expect(landingUse(crush)?.effect).toEqual({ verb: 'damage', power: 10 });
  });

  it('nobody can see a self-aimed technique coming', () => {
    const body = bodyFrom(
      {
        ...fighter,
        id: 'a',
        name: 'A',
        health: 1,
        maxHealth: 1,
        chakra: 1,
        maxChakra: 1,
        techniques: [],
      },
      'player',
    );
    expect(resistChance(body, body, mend)).toBe(0);
    expect(resistChance(body, body, mirage)).toBeGreaterThan(0);
  });

  it('reads a technique saved before effect lists as a one-effect list', () => {
    const saved = {
      id: 'old',
      name: 'Old',
      discipline: 'genjutsu',
      effect: 'stun',
      power: 9,
      chakraCost: 4,
    };
    expect(upgradeTechnique(saved as never)).toEqual({
      id: 'old',
      name: 'Old',
      discipline: 'genjutsu',
      effects: [{ verb: 'daze', power: 9 }],
      chakraCost: 4,
    });
    expect(upgradeTechnique(mirage)).toBe(mirage);
  });
});
