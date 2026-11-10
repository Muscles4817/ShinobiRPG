import {
  afterFight,
  craftAfterSession,
  isBroken,
  MEND_BASE,
  MEND_RYO_WHOLE,
  mendCost,
  mended,
  mendShare,
  NO_WORKSHOP,
  ownsFrame,
  withPuppet,
} from './workshop';

/** Puppets between fights: owned, hurt and broken in fights, mended at a bench by craft. */

const doll = withPuppet(NO_WORKSHOP, 'doll', 'Workshop Doll');

describe('owning puppets', () => {
  it('gives a puppet whole, and never a frame you already own twice', () => {
    expect(doll.puppets).toEqual([{ frameId: 'doll', name: 'Workshop Doll', condition: 1 }]);
    expect(withPuppet(doll, 'doll', 'Again')).toBe(doll);
    expect(ownsFrame(doll, 'doll')).toBe(true);
    expect(ownsFrame(doll, 'crow')).toBe(false);
  });

  it('brings each called puppet home as whole as it ended the fight; beaten is broken', () => {
    expect(afterFight(doll, { doll: 0.4 }).puppets[0]?.condition).toBe(0.4);
    const beaten = afterFight(doll, { doll: 0 }).puppets[0]!;
    expect(isBroken(beaten)).toBe(true);
    expect(afterFight(doll, { other: 0 })).toEqual(doll);
  });
});

describe('mending at the bench', () => {
  it('mends more a session the better the craft, never past whole', () => {
    expect(mendShare(0)).toBe(MEND_BASE);
    expect(mendShare(30)).toBeGreaterThan(mendShare(10));
    const broken = afterFight(doll, { doll: 0 });
    expect(mended(broken, 'doll').puppets[0]?.condition).toBe(MEND_BASE);
    const nearly = afterFight(doll, { doll: 0.9 });
    expect(mended(nearly, 'doll').puppets[0]?.condition).toBe(1);
  });

  it('costs materials for what it mends, more for a bigger puppet', () => {
    const broken = afterFight(doll, { doll: 0 }).puppets[0]!;
    expect(mendCost(broken, 1, 0)).toBe(Math.ceil(MEND_RYO_WHOLE * MEND_BASE));
    expect(mendCost(broken, 2, 0)).toBeGreaterThan(mendCost(broken, 1, 0));
    const scratched = afterFight(doll, { doll: 0.95 }).puppets[0]!;
    expect(mendCost(scratched, 1, 0)).toBeLessThan(mendCost(broken, 1, 0));
  });

  it('teaches craft, a beginner most', () => {
    expect(mended(doll, 'doll').craft).toBeGreaterThan(0);
    expect(craftAfterSession(40) - 40).toBeLessThan(craftAfterSession(0));
  });
});
