import { createStats } from '@/systems/stats';
import { act, ctx, fightOut, newGame, withAllStats } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { weaponsKnown } from './views/gearWords';
import { DRILL_MASTERY, graduationMastery, masteryWord, practised } from './weaponMastery';

describe('weapon mastery', () => {
  it('every graduate knows kunai and shuriken best, and a blade student knows blades too', () => {
    const plain = graduationMastery(createStats(5));
    expect(plain.throwing).toBeGreaterThan(plain['light-blade'] ?? 0);
    expect(plain.sword).toBeUndefined();
    const blade = graduationMastery(createStats(5, { kenjutsu: 5 }));
    expect(blade.sword).toBeGreaterThan(0);
  });

  it('closes part of the gap to mastery each time, so the first sessions count most', () => {
    const once = practised({}, 'staff', 0.1);
    const twice = practised(once, 'staff', 0.1);
    expect(once.staff).toBeCloseTo(0.1);
    expect((twice.staff ?? 0) - (once.staff ?? 0)).toBeLessThan(once.staff ?? 0);
    expect(practised({ staff: 1 }, 'staff', 0.5).staff).toBe(1);
  });

  it('is read in words, never as a number', () => {
    expect(masteryWord(0)).toBe('never held one');
    expect(masteryWord(0.2)).toBe('practised');
    expect(masteryWord(0.5)).toBe('seasoned');
    expect(masteryWord(0.9)).toBe('masterful');
    expect(weaponsKnown({ throwing: 0.5, sword: 0.2 })).toBe(
      'Throwing steel seasoned, Sword practised',
    );
    expect(weaponsKnown(undefined)).toBeNull();
  });

  it('a new game rides into its fights knowing its weapons', () => {
    const state = newGame();
    expect(state.character.weaponMastery?.throwing).toBeGreaterThan(0);
    expect(playerCombatant(state, ctx).gear?.mastery).toEqual(state.character.weaponMastery);
  });

  it('target practice works the thrown weapon, plain kunai when none is carried', () => {
    const before = newGame();
    const after = act(before, { type: 'train', trainingId: 'target-practice' });
    const was = before.character.weaponMastery?.throwing ?? 0;
    expect(after.character.weaponMastery?.throwing).toBeCloseTo(was + (1 - was) * DRILL_MASTERY);
  });

  it('a drill that works the hand does nothing for an empty one', () => {
    const before = newGame();
    const after = act(before, { type: 'train', trainingId: 'blade-forms' });
    expect(after.character.weaponMastery).toEqual(before.character.weaponMastery);
  });

  it('a fight teaches a little of the weapons carried into it', () => {
    const start = act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' });
    const over = fightOut(start);
    const was = start.character.weaponMastery?.throwing ?? 0;
    expect(over.character.weaponMastery?.throwing).toBeGreaterThan(was);
  });

  it('a save from before mastery keeps none, and stays at home with every weapon', () => {
    const { weaponMastery: _, ...character } = newGame().character;
    const old = { ...newGame(), character };
    const after = act(old, { type: 'train', trainingId: 'target-practice' });
    expect(after.character.weaponMastery).toBeUndefined();
    expect(playerCombatant(old, ctx).gear?.mastery).toBeUndefined();
  });
});
