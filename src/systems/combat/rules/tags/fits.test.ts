import type { CombatTechnique } from '../../contract';
import { catchScale } from './catches';
import { canLift, LIFT_ONE_UP, unmetNeed } from './fits';

/** A technique works only on a target it fits, and its harm follows how much of a body it catches. */

const body = (over: Partial<Parameters<typeof canLift>[0]> = {}) => ({
  id: 'b',
  attributes: { strength: 10 },
  maxChakra: 50,
  ...over,
});

const grapple: CombatTechnique = {
  id: 'grapple',
  name: 'Throw',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 0,
  tags: { delivery: ['grapple'], needs: ['liftable'] },
};

const look: CombatTechnique = {
  id: 'look',
  name: 'Look',
  discipline: 'genjutsu',
  effects: [{ verb: 'daze', power: 10 }],
  chakraCost: 0,
  tags: { delivery: ['eye-contact'], needs: ['mind', 'meets-eyes'] },
};

describe('what a target must be', () => {
  it('lifts a body your size, a bigger one only with the strength for it', () => {
    expect(canLift(body(), body())).toBe(true);
    expect(canLift(body(), body({ size: 'large' }))).toBe(false);
    expect(canLift(body({ attributes: { strength: LIFT_ONE_UP } }), body({ size: 'large' }))).toBe(
      true,
    );
    expect(canLift(body({ attributes: { strength: LIFT_ONE_UP } }), body({ size: 'huge' }))).toBe(
      false,
    );
  });

  it('reads a body as big as it is now: one grown huge is too big to throw', () => {
    const grown = body({ empowered: { grows: 2 } });
    const moment = { user: body(), target: grown, band: 'close' as const };
    expect(unmetNeed(grapple, moment)).toBe('liftable');
  });

  it('meets the eyes only up close, and never a puppet', () => {
    expect(unmetNeed(look, { user: body(), target: body(), band: 'close' })).toBeNull();
    expect(unmetNeed(look, { user: body(), target: body(), band: 'mid' })).toBe('meets-eyes');
    const puppet = body({ puppet: true });
    expect(unmetNeed(look, { user: body(), target: puppet, band: 'close' })).toBe('mind');
  });

  it('lets a move that follows another close only on someone the user holds', () => {
    const burial: CombatTechnique = { ...grapple, tags: { execution: { follows: 'coffin' } } };
    const target = body({ id: 'foe' });
    expect(unmetNeed(burial, { user: body(), target, band: 'mid' })).toBe('follows');
    const holding = body({ holding: 'foe' });
    expect(unmetNeed(burial, { user: holding, target, band: 'mid' })).toBeNull();
  });
});

describe('how much of a body it catches', () => {
  it('a point strike barely hurts a giant; a whole-body blow hurts it more', () => {
    expect(catchScale('point', 'huge')).toBeLessThan(1);
    expect(catchScale('whole', 'huge')).toBeGreaterThan(1);
    expect(catchScale('point', 'human')).toBe(1);
  });
});
