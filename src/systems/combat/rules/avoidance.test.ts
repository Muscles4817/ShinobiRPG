import type { CombatAttributes, CombatTechnique } from '../contract';
import {
  AVOID_MAX,
  avoidChance,
  avoidRating,
  conditionResist,
  readRating,
  readScale,
  tellRating,
  type AvoidRoll,
} from './avoidance';

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

const at = (over: Partial<CombatAttributes> = {}) => ({ attributes: { ...BASE, ...over } });

/** Equals, a technique, no Dodge ready. */
const even: AvoidRoll = { form: 'technique', rating: 10, arrival: 10, read: 1, dodging: false };

const pin = (discipline: CombatTechnique['discipline']) => {
  const effect = { verb: 'pin' as const, power: 10 };
  const technique: CombatTechnique = {
    id: 'p',
    name: 'P',
    discipline,
    chakraCost: 4,
    effects: [effect],
  };
  return { technique, effect };
};

describe('avoiding an attack', () => {
  it('equals slip about three techniques in ten, more with a Dodge ready', () => {
    expect(avoidChance(even)).toBeCloseTo(0.3);
    expect(avoidChance({ ...even, dodging: true })).toBeGreaterThan(avoidChance(even));
  });

  it('a plain blow gives less away than a technique, but anyone slips some', () => {
    const blow = avoidChance({ ...even, form: 'blow' });
    expect(blow).toBeGreaterThan(0);
    expect(blow).toBeLessThan(avoidChance(even));
    expect(avoidChance({ ...even, form: 'blow', dodging: true })).toBeGreaterThan(blow);
  });

  it('the faster the defender against how fast it arrives, the likelier the slip', () => {
    expect(avoidChance({ ...even, rating: 20 })).toBeGreaterThan(avoidChance(even));
    expect(avoidChance({ ...even, arrival: 20 })).toBeLessThan(avoidChance(even));
  });

  it('reads the gap, so equals stand the same at every grade', () => {
    expect(avoidChance({ ...even, rating: 5, arrival: 5 })).toBeCloseTo(
      avoidChance({ ...even, rating: 40, arrival: 40 }),
    );
  });

  it('sure techniques are slipped less, wild ones more', () => {
    const sure = avoidChance({ ...even, accuracy: 'sure' });
    const wild = avoidChance({ ...even, accuracy: 'wild' });
    expect(sure).toBeLessThan(avoidChance(even));
    expect(wild).toBeGreaterThan(avoidChance(even));
  });

  it('a wide area is hard to get clear of, a vast one impossible', () => {
    expect(avoidChance({ ...even, areaSize: 'wide' })).toBeCloseTo(avoidChance(even) / 2);
    expect(avoidChance({ ...even, dodging: true, areaSize: 'vast' })).toBe(0);
  });

  it('however sharp the defender, some attacks land', () => {
    const best = { ...even, rating: 100, dodging: true, read: 2, bonus: 0.5 };
    expect(avoidChance(best)).toBeLessThanOrEqual(AVOID_MAX);
  });

  it('speed slips most attacks; a genjutsu is noticed, by will above all', () => {
    expect(avoidRating(at({ speed: 20 }))).toBeGreaterThan(avoidRating(at()));
    expect(avoidRating(at({ speed: 20 }), 'genjutsu')).toBe(avoidRating(at(), 'genjutsu'));
    expect(avoidRating(at({ willpower: 20 }), 'genjutsu')).toBeGreaterThan(
      avoidRating(at({ perception: 20 }), 'genjutsu'),
    );
  });

  it('eyes and wits read an attack; a technique is read more easily than a fist', () => {
    const sharp = readRating(at({ perception: 20, intellect: 20 }));
    const tell = tellRating(at(), 10);
    expect(readScale(sharp, tell, 'technique')).toBeGreaterThan(readScale(sharp, tell, 'blow'));
    expect(readScale(sharp, tell, 'blow')).toBeGreaterThan(1);
    expect(readScale(readRating(at()), tell, 'technique')).toBe(1);
  });
});

describe('a condition taking hold', () => {
  it('a hold is shaken off more often by what breaks a hold of its art', () => {
    const caster = at();
    expect(conditionResist(caster, at({ strength: 20 }), pin('taijutsu'))).toBeGreaterThan(
      conditionResist(caster, at(), pin('taijutsu')),
    );
    expect(conditionResist(caster, at({ strength: 20 }), pin('ninjutsu'))).toBe(
      conditionResist(caster, at(), pin('ninjutsu')),
    );
    expect(conditionResist(caster, at({ chakraControl: 20 }), pin('ninjutsu'))).toBeGreaterThan(
      conditionResist(caster, at(), pin('ninjutsu')),
    );
  });

  it('never certain either way', () => {
    const weak = conditionResist(at({ taijutsu: 40 }), at({ strength: 1 }), pin('taijutsu'));
    const strong = conditionResist(at({ taijutsu: 1 }), at({ strength: 40 }), pin('taijutsu'));
    expect(weak).toBeGreaterThan(0);
    expect(strong).toBeLessThan(0.5);
  });
});

describe('reading and pace against committed evasion', () => {
  const evading = { ...even, form: 'blow' as const, evading: true };

  it('a clear read saves Evade for the dangerous attack; a blind one spreads it', () => {
    const clear = { ...evading, read: 1.4 };
    const blind = { ...evading, read: 0.75 };
    const big = avoidChance({ ...clear, threat: 0.5 });
    const small = avoidChance({ ...clear, threat: 0.1 });
    expect(big).toBeGreaterThan(small * 1.5);
    // Blind, the big one and the small one meet the same evasion.
    expect(avoidChance({ ...blind, threat: 0.5 })).toBeCloseTo(
      avoidChance({ ...blind, threat: 0.1 }),
    );
    expect(big).toBeGreaterThan(avoidChance({ ...blind, threat: 0.5 }));
  });

  it('an attacker about twice as fast as the defender’s rating can’t be slipped, Evade or not', () => {
    expect(avoidChance({ ...evading, threat: 0.5, paceSpeed: 22 })).toBe(0);
    expect(avoidChance({ ...evading, threat: 0.5, paceSpeed: 15 })).toBeGreaterThan(0);
    expect(avoidChance({ ...evading, threat: 0.5, paceSpeed: 10 })).toBeCloseTo(
      avoidChance({ ...evading, threat: 0.5 }),
    );
  });

  it('eyes that see it coming read every attack clearly and keep up a little longer', () => {
    const blind = { ...evading, read: 0.75, seesAll: true };
    expect(avoidChance({ ...blind, threat: 0.5 })).toBeGreaterThan(
      avoidChance({ ...blind, threat: 0.1 }),
    );
    expect(avoidChance({ ...evading, threat: 0.5, paceSpeed: 21 })).toBe(0);
    expect(avoidChance({ ...evading, seesAll: true, threat: 0.5, paceSpeed: 21 })).toBeGreaterThan(
      0,
    );
    expect(avoidChance({ ...evading, seesAll: true, threat: 0.5, paceSpeed: 30 })).toBe(0);
  });
});
