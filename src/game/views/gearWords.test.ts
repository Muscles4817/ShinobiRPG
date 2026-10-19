import type { GearDef } from '@/content';

import { gearChips, gearKindLabel } from './gearWords';

const piece = (over: Partial<Extract<GearDef, { kind: 'weapon' }>>): GearDef => ({
  id: 'piece',
  name: 'Piece',
  description: 'A piece.',
  cost: 100,
  icon: 'sword',
  rank: 'D',
  kind: 'weapon',
  weaponClass: 'sword',
  ...over,
});

const labels = (def: GearDef) => gearChips(def, 10).map((c) => c.label);

describe('gear in words', () => {
  it('names a weapon by its class', () => {
    expect(gearKindLabel(piece({ weaponClass: 'polearm' }))).toBe('Polearm');
    expect(gearKindLabel(piece({ weaponClass: 'fan' }))).toBe('War fan');
  });

  it('says how a weapon handles: quick, slow, a guard, a long reach', () => {
    expect(labels(piece({ weaponClass: 'light-blade' }))).toContain('Very quick in the hand');
    expect(labels(piece({ weaponClass: 'greatsword' }))).toContain('Slow in the hand');
    expect(labels(piece({ weaponClass: 'staff' })).some((l) => l.startsWith('Guards'))).toBe(true);
    expect(labels(piece({ weaponClass: 'polearm' }))).toContain('Strikes at mid range');
    expect(labels(piece({ weaponClass: 'sword' }))).not.toContain('Strikes at mid range');
  });

  it('a weapon that is also a focus says what it sharpens', () => {
    const fan = piece({ weaponClass: 'fan', boosts: { discipline: 'ninjutsu' } });
    expect(labels(fan).some((l) => l.startsWith('Ninjutsu'))).toBe(true);
  });

  it('several blades say they strike as a flurry', () => {
    expect(labels(piece({ blades: 2 })).some((l) => l.includes('flurry'))).toBe(true);
    expect(labels(piece({})).some((l) => l.includes('flurry'))).toBe(false);
  });
});
