import type { PlainVerb, TechniqueEffect } from '@/systems/techniques';

import type { CombatAttributes, CombatTechnique } from '../../contract';
import { bodyFrom } from '../body';
import { resistChance } from '../defence';
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
  it('every verb has a profile, aimed at a foe or at the user', () => {
    expect(Object.entries(VERB_PROFILES).map(([verb, p]) => [verb, p.aim])).toEqual([
      ['damage', 'foe'],
      ['daze', 'foe'],
      ['seal', 'foe'],
      ['heal', 'self'],
      ['area', 'foe'],
      ['confuse', 'foe'],
      ['conceal', 'self'],
      ['sense', 'self'],
      ['break', 'foe'],
      ['field', 'self'],
      ['move', 'self'],
      ['substitute', 'self'],
      ['empower', 'self'],
      ['clone', 'self'],
      ['trap', 'self'],
      ['knock', 'foe'],
      ['pin', 'foe'],
      ['drain', 'foe'],
      ['afflict', 'foe'],
      ['counter', 'self'],
    ]);
  });

  it('each new verb scales by the stats its role names', () => {
    const use = (verb: PlainVerb) => {
      const effect: TechniqueEffect = { verb, power: 10 };
      return { technique: { ...crush, effects: [effect] }, effect };
    };
    expect(driveOf(fighter, use('confuse'))).toBe(attributes.genjutsu);
    expect(resistOf(fighter, use('confuse'))).toBe(attributes.willpower);
    expect(driveOf(fighter, use('conceal'))).toBe(attributes.genjutsu);
    expect(driveOf(fighter, use('sense'))).toBe((attributes.perception + attributes.ninjutsu) / 2);
    expect(driveOf(fighter, use('break'))).toBe(attributes.strength);
    expect(driveOf(fighter, use('area'))).toBe(attributes.taijutsu);
  });

  it('a technique is driven by its art; a daze takes hold against poise, a blow meets the guard', () => {
    const daze = { technique: mirage, effect: primaryEffect(mirage) };
    expect(driveOf(fighter, daze)).toBe(attributes.genjutsu);
    expect(resistOf(fighter, daze)).toBe(attributes.willpower);
    const knockout = {
      technique: { ...mirage, discipline: 'taijutsu' as const },
      effect: daze.effect,
    };
    expect(resistOf(fighter, knockout)).toBe(attributes.stamina);
    const blow = { technique: crush, effect: primaryEffect(crush) };
    expect(driveOf(fighter, blow)).toBe(attributes.taijutsu);
    expect(resistOf(fighter, blow)).toBe(attributes.perception);
  });

  it('a hold is broken by what fights its art: will, chakra control or strength', () => {
    const bind = (discipline: CombatTechnique['discipline']) => {
      const effect = { verb: 'pin' as const, power: 10 };
      return resistOf(fighter, { technique: { ...crush, discipline, effects: [effect] }, effect });
    };
    expect(bind('genjutsu')).toBe(attributes.willpower);
    expect(bind('ninjutsu')).toBe(attributes.chakraControl);
    expect(bind('fuuinjutsu')).toBe(attributes.chakraControl);
    expect(bind('taijutsu')).toBe(attributes.strength);
  });

  it('healing grows with ninjutsu and chakra control, and nothing resists it', () => {
    const heal = { technique: mend, effect: primaryEffect(mend) };
    expect(driveOf(fighter, heal)).toBe((attributes.ninjutsu + attributes.chakraControl) / 2);
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
