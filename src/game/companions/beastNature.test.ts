import { ctx, newGame, withHound } from '@/test/gameFixtures';

import { companionSheet } from '../views/companionCare';
import { companionAllies } from './combatant';

/** A companion of a chakra beast's line fights with its beast's nature. */
describe('a beast companion’s nature', () => {
  it('rides into the fight with it, as the beast’s own', () => {
    const kite = withHound(newGame(), { kindId: 'thunder-kite-chick', name: 'Raikō' });
    expect(companionAllies(kite, ctx)[0]?.nature).toBe('lightning');
  });

  it('is nothing for a plain hound', () => {
    expect(companionAllies(withHound(newGame()), ctx)[0]?.nature).toBeUndefined();
  });

  it('shows on its sheet, and a plain hound’s shows none', () => {
    const kite = withHound(newGame(), { kindId: 'thunder-kite-chick', name: 'Raikō' });
    expect(companionSheet(kite, ctx)?.nature).toBe('Lightning nature');
    expect(companionSheet(withHound(newGame()), ctx)?.nature).toBeNull();
  });
});
