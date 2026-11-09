import type { CombatAttributes, CombatTechnique } from '../contract';
import {
  confuseChance,
  CONFUSION_TURNS,
  confusionTurns,
  dispelChance,
  INSIGHT_SEARCH,
  INSIGHT_SEARCH_MAX,
  rehidesNow,
  searchChance,
  shakeOffChance,
  startsHidden,
} from './conditions';
import {
  attackKindOf,
  canAttackFrom,
  homeBand,
  kitDamageScale,
  namesReach,
  packScale,
  shouldFlee,
} from './kit';

const attributes = (over: Partial<CombatAttributes> = {}): CombatAttributes => ({
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
  ...over,
});

const seal: CombatTechnique = {
  id: 'seal',
  name: 'Seal',
  discipline: 'fuuinjutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 5,
};

describe('kits', () => {
  it('archers fight from afar, brawlers up close', () => {
    expect(canAttackFrom({ traits: ['archer'] }, 'close')).toBe(false);
    expect(canAttackFrom({ traits: ['archer'] }, 'far')).toBe(true);
    expect(canAttackFrom({ traits: ['brawler'] }, 'mid')).toBe(false);
    expect(homeBand({ traits: ['archer'], techniques: [] })).toBe('far');
    expect(homeBand({ traits: ['brawler'], techniques: [] })).toBe('close');
  });

  it('armour blunts blows and blades; spirits shrug them off but fear seals', () => {
    expect(kitDamageScale({ traits: ['armoured'] }, 'blow')).toBe(0.6);
    expect(kitDamageScale({ traits: ['armoured'] }, 'jutsu')).toBe(1);
    expect(kitDamageScale({ traits: ['spirit'] }, attackKindOf(null, true))).toBe(0.35);
    expect(kitDamageScale({ traits: ['spirit'] }, attackKindOf(seal))).toBe(1.3);
  });

  it('packs grow stronger together; cowards run when hurt', () => {
    const wolf = (id: string, health = 10) => ({
      id,
      side: 'enemy',
      health,
      traits: ['pack' as const],
    });
    expect(packScale(wolf('a'), [wolf('a'), wolf('b'), wolf('c', 0)])).toBeCloseTo(1.15);
    expect(shouldFlee({ traits: ['coward'], health: 5, maxHealth: 50 })).toBe(true);
    expect(shouldFlee({ traits: [], health: 5, maxHealth: 50 })).toBe(false);
  });
});

describe('hidden and confused', () => {
  const illusionist = { attributes: attributes({ genjutsu: 9 }), traits: ['illusionist' as const] };

  it('illusionists start hidden and slip away again every few rounds', () => {
    expect(startsHidden(illusionist)).toBe(true);
    expect(rehidesNow(illusionist, 3)).toBe(true);
    expect(rehidesNow(illusionist, 2)).toBe(false);
  });

  it('a technique that names its reach strikes from there, whatever the kit', () => {
    const archer = { traits: ['archer' as const] };
    expect(canAttackFrom(archer, 'close')).toBe(false);
    expect(namesReach({ reach: ['close', 'mid'] }, 'close')).toBe(true);
    expect(namesReach({ reach: ['mid', 'far'] }, 'close')).toBe(false);
    expect(namesReach({}, 'close')).toBe(false);
  });

  it('sharp senses find them; insight mostly does; only eyes that see everything always do', () => {
    const plain = { attributes: attributes(), perks: [] };
    const sharp = { attributes: attributes({ perception: 14, intellect: 10 }), perks: [] };
    expect(searchChance(sharp, illusionist)).toBeGreaterThan(searchChance(plain, illusionist));
    const insight = { ...plain, perks: ['insight' as const] };
    expect(searchChance(insight, illusionist)).toBe(INSIGHT_SEARCH);
    expect(searchChance(insight, { ...illusionist, exposure: 5 })).toBe(INSIGHT_SEARCH_MAX);
    expect(searchChance({ ...plain, perks: ['all-seeing'] }, illusionist)).toBe(1);
  });

  it('every glimpse since they hid brings seekers nearer, by Search or by Dispel', () => {
    const plain = { attributes: attributes(), perks: [] };
    const glimpsed = { ...illusionist, exposure: 2 };
    expect(searchChance(plain, glimpsed)).toBeGreaterThan(searchChance(plain, illusionist));
    expect(dispelChance(plain, glimpsed)).toBeGreaterThan(dispelChance(plain, illusionist));
  });

  it('will breaks illusions and confusion', () => {
    const strong = { attributes: attributes({ willpower: 12, chakraControl: 12 }), perks: [] };
    const weak = { attributes: attributes({ willpower: 2, chakraControl: 2 }), perks: [] };
    expect(dispelChance(strong, illusionist)).toBeGreaterThan(dispelChance(weak, illusionist));
    expect(confuseChance(illusionist, weak)).toBeGreaterThan(confuseChance(illusionist, strong));
    expect(shakeOffChance(strong)).toBeGreaterThan(shakeOffChance(weak));
  });

  it('chakra control breaks an illusion and cuts confusion short', () => {
    const control = { attributes: attributes({ chakraControl: 14 }), perks: [] };
    const will = { attributes: attributes({ willpower: 14 }), perks: [] };
    expect(dispelChance(control, illusionist)).toBeGreaterThan(dispelChance(will, illusionist));
    expect(confusionTurns(illusionist, control)).toBeLessThan(CONFUSION_TURNS);
    expect(confusionTurns(illusionist, will)).toBe(CONFUSION_TURNS);
  });
});
