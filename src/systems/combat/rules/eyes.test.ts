import type { CombatAttributes, CombatTechnique } from '../contract';
import {
  BLIND_SPOT_CHANCE,
  BLIND_SPOT_FROM_ROUND,
  blindSpotChance,
  canCopy,
  foreseen,
  MAX_COPIES,
  POINTS_SEEN_RESIST,
  pointsSeenScale,
  seesTheRealBody,
} from './eyes';

const attributes = (ninjutsu: number): CombatAttributes => ({
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
});

const bullet: CombatTechnique = {
  id: 'bullet',
  name: 'Bullet',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 10,
};

const copier = {
  perks: ['insight', 'mimicry'] as const,
  attributes: attributes(30),
  techniques: [],
};
const user = { attributes: attributes(40) };

describe('eyes', () => {
  it('foresight makes a chance likelier, never past its ceiling; without it nothing changes', () => {
    const scale = { scale: 1.5, ceiling: 0.7 };
    expect(foreseen(0.4, { perks: ['foresight'] }, scale)).toBeCloseTo(0.6);
    expect(foreseen(0.6, { perks: ['foresight'] }, scale)).toBe(0.7);
    expect(foreseen(0.4, { perks: ['insight'] }, scale)).toBe(0.4);
  });

  it('mimicry copies a technique its own art could carry', () => {
    expect(canCopy(copier, user, bullet)).toBe(true);
    expect(canCopy({ ...copier, attributes: attributes(20) }, user, bullet)).toBe(false);
    expect(canCopy({ ...copier, perks: ['insight'] }, user, bullet)).toBe(false);
  });

  it('never copies a clan art, a trump, a nature it lacks, one it knows, or past the limit', () => {
    expect(canCopy(copier, user, { ...bullet, clan: 'hyuga' })).toBe(false);
    expect(canCopy(copier, user, { ...bullet, oncePerFight: true })).toBe(false);
    expect(canCopy(copier, user, { ...bullet, needs: { nature: 'fire' } })).toBe(false);
    expect(
      canCopy({ ...copier, nature: 'fire' }, user, { ...bullet, needs: { nature: 'fire' } }),
    ).toBe(true);
    expect(canCopy({ ...copier, techniques: [bullet] }, user, bullet)).toBe(false);
    const full = { ...copier, copied: Array.from({ length: MAX_COPIES }, (_, i) => `t${i}`) };
    expect(canCopy(full, user, bullet)).toBe(false);
  });

  it('never copies what is worked through something carried: sand or insects', () => {
    expect(canCopy(copier, user, { ...bullet, dustCost: 20 })).toBe(false);
    expect(canCopy(copier, user, { ...bullet, dustDraw: 20 })).toBe(false);
    expect(canCopy(copier, user, { ...bullet, swarmCost: 20 })).toBe(false);
  });
});

/** The Byakugan (`all-seeing`): the real body, the chakra points, and the one blind spot. */
describe('all-seeing eyes', () => {
  const seer = { perks: ['all-seeing' as const] };
  const plain = { perks: [] };
  const mind = (intellect: number) => ({ attributes: { ...attributes(10), intellect } });

  it('see the real body among clones', () => {
    expect(seesTheRealBody(seer)).toBe(true);
    expect(seesTheRealBody(plain)).toBe(false);
  });

  it('close the chakra points more surely, for seals and drains only', () => {
    expect(pointsSeenScale(seer, 'seal')).toBe(POINTS_SEEN_RESIST);
    expect(pointsSeenScale(seer, 'drain')).toBe(POINTS_SEEN_RESIST);
    expect(pointsSeenScale(seer, 'pin')).toBe(1);
    expect(pointsSeenScale(plain, 'seal')).toBe(1);
  });

  it('have one blind spot, found only by a sharp foe once the fight has gone on', () => {
    expect(blindSpotChance(seer, mind(30), BLIND_SPOT_FROM_ROUND)).toBe(BLIND_SPOT_CHANCE);
    expect(blindSpotChance(seer, mind(30), 1)).toBe(0);
    expect(blindSpotChance(seer, mind(10), BLIND_SPOT_FROM_ROUND)).toBe(0);
    expect(blindSpotChance(plain, mind(30), BLIND_SPOT_FROM_ROUND)).toBe(0);
  });
});
