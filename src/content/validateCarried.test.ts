import { ORIGINAL_PACK } from './packs/original';
import type { CarriedKit } from './types';
import { validateFoesCarried } from './validateCarried';

/** What foes carry: real gear, a piece per slot, real tools by the piece, mastery 0 to 1. */

function withSamurai(carries: CarriedKit) {
  const enemies = ORIGINAL_PACK.enemies.map((e) => (e.id === 'samurai' ? { ...e, carries } : e));
  return validateFoesCarried({ ...ORIGINAL_PACK, enemies });
}

describe('what foes carry', () => {
  it('passes the shipped pack', () => {
    expect(validateFoesCarried(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports unknown gear, two pieces in a slot, unknown or uncounted tools, and bad mastery', () => {
    expect(
      withSamurai({
        gearIds: ['ghost-blade', 'forge-wakizashi', 'kurogane-katana'],
        tools: { 'smoke-bomb': 0, 'moon-rock': 1 },
        weaponMastery: { sword: 2 },
      }),
    ).toEqual([
      'enemy "samurai" wears unknown gear "ghost-blade"',
      'enemy "samurai" wears two pieces in the weapon slot',
      'enemy "samurai" carries 0 of "smoke-bomb"',
      'enemy "samurai" carries unknown tool "moon-rock"',
      'enemy "samurai" knows "sword" at 2, not 0 to 1',
    ]);
  });
});
