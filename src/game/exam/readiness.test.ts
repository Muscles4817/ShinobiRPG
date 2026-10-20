import { createStats } from '@/systems/stats';

import { fighterTypeOf } from './fighterTypes';
import { readinessFocus, readinessGap } from './readiness';

/** A genin's stats: the academy line, with what they have worked at. */
const genin = (marks: Parameters<typeof createStats>[1]) => createStats(5, marks);

describe('kinds of fighter', () => {
  it('reads the kind a stat line fits best', () => {
    expect(fighterTypeOf(genin({ taijutsu: 10, speed: 9, perception: 8 })).id).toBe('brawler');
    expect(fighterTypeOf(genin({ kenjutsu: 10, speed: 9, perception: 8 })).id).toBe(
      'weapons-fighter',
    );
    // The weapon art with sharp eyes: a thrower who keeps the fight at range.
    expect(fighterTypeOf(genin({ kenjutsu: 10, speed: 10, perception: 12 })).id).toBe('marksman');
    expect(fighterTypeOf(genin({ genjutsu: 10, chakraControl: 8, intellect: 8 })).id).toBe(
      'illusionist',
    );
    expect(fighterTypeOf(genin({ perception: 12, chakraControl: 8, genjutsu: 5 })).id).toBe(
      'sensor',
    );
    expect(fighterTypeOf(genin({ chakraControl: 10, ninjutsu: 9, strength: 9 })).id).toBe(
      'battle-medic',
    );
    expect(fighterTypeOf(genin({ taijutsu: 9, ninjutsu: 9, speed: 9 })).id).toBe('close-caster');
  });

  it('reads all-rounders, tacticians, Gentle Fist strikers, binders and swarmers', () => {
    // Two arts and control, with the legs to choose the distance.
    const rounded = genin({ ninjutsu: 9, genjutsu: 9, chakraControl: 9, perception: 9 });
    expect(fighterTypeOf(rounded).id).toBe('all-rounder');
    // The same two arts with the wits instead of the legs.
    const thinker = genin({ ninjutsu: 9, genjutsu: 9, chakraControl: 9, intellect: 12 });
    expect(fighterTypeOf(thinker).id).toBe('tactician');
    expect(fighterTypeOf(genin({ taijutsu: 9, chakraControl: 9, perception: 9 })).id).toBe(
      'precision-striker',
    );
    expect(fighterTypeOf(genin({ ninjutsu: 9, intellect: 12, chakraControl: 9 })).id).toBe(
      'binder',
    );
    expect(fighterTypeOf(genin({ ninjutsu: 9, reserves: 12, stamina: 12 })).id).toBe('swarmer');
  });
});

describe('a specialist sensei', () => {
  it('wants every need of the kind at chūnin level, the way in as much as the art', () => {
    // C taijutsu, but too slow and blind to get in close, and no ninjutsu to do it instead.
    const slow = genin({ taijutsu: 10, speed: 2, perception: 2 });
    expect(readinessGap(slow, 'specialist')).toMatch(/to get in close safely at chūnin level/);
    // The same art with the body to close: ready.
    expect(readinessGap(genin({ taijutsu: 10, speed: 9, perception: 9 }), 'specialist')).toBeNull();
    // Or ninjutsu to close with instead of raw speed.
    expect(readinessGap(genin({ taijutsu: 10, ninjutsu: 9 }), 'specialist')).toBeNull();
  });

  it('judges a genin by the kind they suit, and steers them to what it lacks', () => {
    const illusionist = genin({ genjutsu: 10, chakraControl: 9, intellect: 3 });
    expect(readinessGap(illusionist, 'specialist')).toMatch(/wits.*as an illusionist/);
    expect(readinessFocus(illusionist)).toBe('intellect');
    // Ready: nothing to steer towards.
    expect(readinessFocus(genin({ genjutsu: 10, chakraControl: 9, intellect: 9 }))).toBeNull();
    // While the art itself is short, the sensei works it their own way.
    expect(readinessFocus(genin({ genjutsu: 6, chakraControl: 9, intellect: 3 }))).toBeNull();
  });

  it('never counts a sharp mind or a fast body alone', () => {
    expect(
      readinessGap(genin({ intellect: 30, speed: 25, strength: 20 }), 'specialist'),
    ).not.toBeNull();
  });
});

describe('a rounded sensei', () => {
  it('wants a skill at chūnin level and breadth across the rest', () => {
    expect(readinessGap(createStats(12), 'rounded')).toMatch(/chūnin level/);
    expect(readinessGap(genin({ taijutsu: 9 }), 'rounded')).toMatch(/4 skills at D/);
    const broad = genin({ taijutsu: 9, ninjutsu: 4, chakraControl: 4, kenjutsu: 4 });
    expect(readinessGap(broad, 'rounded')).toBeNull();
  });
});
