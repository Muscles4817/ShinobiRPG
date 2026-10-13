import { act, ctx, newGame } from '@/test/gameFixtures';

import { cueAfter } from './cues';
import { dispatch } from './dispatch';
import type { GameState } from './state';
import { animationSetting } from './views/settings';

/** The state with one person's bond set to `points`. */
function withBond(state: GameState, personId: string, points: number): GameState {
  const bond = { points, lastTalkDay: null, heard: [] };
  return {
    ...state,
    people: { ...state.people, bonds: { ...state.people.bonds, [personId]: bond } },
  };
}

describe('action cues', () => {
  it('play for everyday actions while animations are on', () => {
    const state = newGame();
    const cue = (action: Parameters<typeof cueAfter>[0]) => cueAfter(action, state, state);
    expect(cue({ type: 'sleep' })).toBe('sleep');
    expect(cue({ type: 'eat', foodId: 'any' })).toBe('eat');
    expect(cue({ type: 'treat' })).toBe('heal');
    expect(cue({ type: 'buyTool', toolId: 'any' })).toBe('coins');
    expect(cue({ type: 'equipGear', gearId: 'any' })).toBe('gear');
    expect(cue({ type: 'buyRound' })).toBe('toast');
    expect(cue({ type: 'followSight' })).toBe('sight');
    expect(cue({ type: 'travel', locationId: 'any' })).toBeNull();
  });

  it('mark a bond reaching a new stage over the action’s own cue', () => {
    const before = withBond(newGame(), 'kaen', 28);
    const friends = withBond(before, 'kaen', 31);
    const closer = withBond(before, 'kaen', 29);
    expect(cueAfter({ type: 'hostDinner', recipeId: 'r', guestId: 'kaen' }, before, friends)).toBe(
      'bond',
    );
    expect(cueAfter({ type: 'hostDinner', recipeId: 'r', guestId: 'kaen' }, before, closer)).toBe(
      'cook',
    );
    expect(cueAfter({ type: 'talk', personId: 'kaen' }, before, closer)).toBeNull();
  });

  it('stay still once the player turns animations off, and come back on', () => {
    const off = act(newGame(), { type: 'setAnimations', on: false });
    expect(off.settings.animations).toBe(false);
    expect(cueAfter({ type: 'sleep' }, off, off)).toBeNull();
    expect(animationSetting(off, ctx)).toMatchObject({
      on: false,
      action: { type: 'setAnimations', on: true },
      blocker: null,
    });
    expect(act(off, { type: 'setAnimations', on: true }).settings.animations).toBe(true);
  });

  it('refuses to set animations to what they already are', () => {
    const result = dispatch(newGame(), { type: 'setAnimations', on: true }, ctx);
    expect(result).toEqual({ ok: false, error: 'Animations are already on.' });
  });
});
